// Anonymous OCI client for ghcr.io/openotters.
//
// Discovery: ghcr.io's `_catalog` endpoint and GitHub's
// `/orgs/{org}/packages` API both require auth, so neither works
// anonymously. The browseable page at
// `https://github.com/orgs/openotters/packages?type=container` does
// not — it's server-rendered HTML that lists every public package.
// We scrape it (paginated) to discover names, then read per-image
// metadata over OCI Distribution v2.
//
// Per-image reads (tags/list, manifests, blobs) work anonymously
// with a token issued by ghcr.io's public token service. Removal is
// detected at probe time: a name that 404s just stops appearing.
//
// Caching: discovery + per-image details live in module-level caches
// with a 5-minute TTL. The Next.js `revalidate = 300` on the consuming
// pages is the outer layer (across server instances); these in-process
// caches absorb hot bursts within a single instance.

const REGISTRY_HOST = "ghcr.io"
const ORG = "openotters"
const CACHE_TTL_MS = 5 * 60 * 1000
const PROBE_CONCURRENCY = 8

// Packages we don't want to surface on the public docs site even
// though they exist in the org. The website's own container image is
// the obvious case.
const HIDDEN_PACKAGES = new Set(["website"])

// Fallback list used when the scrape fails entirely (network outage,
// GitHub HTML structure change). Kept small and intentional — the
// scrape is the source of truth in the happy path.
const FALLBACK_NAMES = ["runtime", "agents/base", "tools/jq"]

export interface Package {
	name: string
	htmlUrl: string
	updatedAt: string
	tags: string[]
}

export interface PackageGroups {
	agents: Package[]
	binaries: Package[]
	runtime: Package[]
}

interface CacheEntry {
	data: PackageGroups
	fetchedAt: number
}

interface NameCacheEntry {
	names: string[]
	fetchedAt: number
}

// Module-level caches — one per Node instance, survives across
// requests in dev + the long-running prod server. Discovery and per-
// image details have separate caches so refreshing one doesn't
// invalidate the other.
let cache: CacheEntry | null = null
let nameCache: NameCacheEntry | null = null

// discoverPackageNames scrapes the public GitHub packages index for
// the org, paginating until a page returns no new names. Returns the
// full sorted list of `<bucket>/<short-name>` keys, with hidden
// packages filtered out.
//
// HTML scraping is brittle, so callers fall back to FALLBACK_NAMES
// when this throws or returns empty.
async function discoverPackageNames(): Promise<string[]> {
	const seen = new Set<string>()
	const linkRe =
		/href="\/orgs\/openotters\/packages\/container\/package\/([^"]+)"/g

	for (let page = 1; page <= 10; page++) {
		const url = `https://github.com/orgs/${ORG}/packages?type=container&page=${page}`
		const res = await fetch(url, {
			headers: { "User-Agent": "openotters-website" },
			next: { revalidate: CACHE_TTL_MS / 1000 },
		})
		if (!res.ok) break

		const html = await res.text()
		const before = seen.size
		for (const match of html.matchAll(linkRe)) {
			const decoded = decodeURIComponent(match[1])
			if (!HIDDEN_PACKAGES.has(decoded)) {
				seen.add(decoded)
			}
		}
		// If a page added nothing, we've walked off the end.
		if (seen.size === before) break
	}

	return Array.from(seen).sort()
}

async function cachedPackageNames(): Promise<string[]> {
	const now = Date.now()
	if (nameCache && now - nameCache.fetchedAt < CACHE_TTL_MS) {
		return nameCache.names
	}

	let names: string[] = []
	try {
		names = await discoverPackageNames()
	} catch {
		// fall through
	}
	if (names.length === 0) names = FALLBACK_NAMES
	nameCache = { names, fetchedAt: now }
	return names
}

function tokenUrl(repo: string): string {
	return `https://${REGISTRY_HOST}/token?service=${REGISTRY_HOST}&scope=repository:${repo}:pull`
}

function tagsUrl(repo: string): string {
	return `https://${REGISTRY_HOST}/v2/${repo}/tags/list`
}

function htmlUrlFor(name: string): string {
	return `https://github.com/orgs/${ORG}/packages/container/package/${encodeURIComponent(name)}`
}

async function ghcrAnonToken(repo: string): Promise<string | null> {
	try {
		const res = await fetch(tokenUrl(repo), {
			next: { revalidate: CACHE_TTL_MS / 1000 },
		})
		if (!res.ok) return null
		const json = (await res.json()) as { token?: string }
		return json.token ?? null
	} catch {
		return null
	}
}

// probe verifies the repo exists and returns its tag list. A null
// return means the repo isn't there (404, network error, parse
// error) — the caller drops it from the listing.
async function probe(name: string): Promise<Package | null> {
	const repo = `${ORG}/${name}`
	const token = await ghcrAnonToken(repo)
	if (!token) return null

	try {
		const res = await fetch(tagsUrl(repo), {
			headers: { Authorization: `Bearer ${token}` },
			next: { revalidate: CACHE_TTL_MS / 1000 },
		})
		if (!res.ok) return null
		const json = (await res.json()) as { tags?: string[] }
		return {
			name,
			htmlUrl: htmlUrlFor(name),
			updatedAt: "",
			tags: json.tags ?? [],
		}
	} catch {
		return null
	}
}

// probeAll runs `probe` over a name list with bounded concurrency so a
// full refresh doesn't open ~60 sockets to ghcr.io at once.
async function probeAll(names: readonly string[]): Promise<Package[]> {
	const out: Package[] = []
	let cursor = 0

	async function worker() {
		while (cursor < names.length) {
			const idx = cursor++
			const pkg = await probe(names[idx])
			if (pkg) out.push(pkg)
		}
	}

	await Promise.all(
		Array.from({ length: PROBE_CONCURRENCY }, () => worker()),
	)
	return out
}

// classify groups a list of full names by their bucket prefix. Names
// without a "<bucket>/" prefix (just "runtime", today) land in
// `runtime`. Anything else without a known prefix is dropped, which
// is what we want for any new top-level package GitHub starts
// surfacing that doesn't fit the agents/tools/runtime model.
function classify(names: readonly string[]): {
	runtime: string[]
	agents: string[]
	binaries: string[]
} {
	const out = { runtime: [] as string[], agents: [] as string[], binaries: [] as string[] }
	for (const n of names) {
		if (n.startsWith("agents/")) out.agents.push(n)
		else if (n.startsWith("tools/")) out.binaries.push(n)
		else if (n === "runtime") out.runtime.push(n)
	}
	return out
}

// listImageDetails returns rich per-image data for every published
// package, grouped by bucket. Heavier than listPackages (manifest +
// config blob per item) but shares the Next.js fetch cache and the
// module-level details cache, so the cost is paid once per 5-minute
// window across both list and detail pages.
export interface ImageDetailsGroups {
	runtime: ImageDetails[]
	agents: ImageDetails[]
	binaries: ImageDetails[]
}

export async function listImageDetails(): Promise<ImageDetailsGroups> {
	const names = await cachedPackageNames()
	const buckets = classify(names)

	const fetchBucket = async (bucketNames: string[]) => {
		const out: ImageDetails[] = []
		let cursor = 0
		async function worker() {
			while (cursor < bucketNames.length) {
				const idx = cursor++
				const d = await getImageDetails(bucketNames[idx])
				if (d) out.push(d)
			}
		}
		await Promise.all(
			Array.from({ length: PROBE_CONCURRENCY }, () => worker()),
		)
		return out
	}

	const [runtime, agents, binaries] = await Promise.all([
		fetchBucket(buckets.runtime),
		fetchBucket(buckets.agents),
		fetchBucket(buckets.binaries),
	])

	const byName = (a: ImageDetails, b: ImageDetails) =>
		a.shortName.localeCompare(b.shortName)
	return {
		runtime: runtime.sort(byName),
		agents: agents.sort(byName),
		binaries: binaries.sort(byName),
	}
}

export async function listPackages(): Promise<PackageGroups> {
	const now = Date.now()
	if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
		return cache.data
	}

	const allNames = await cachedPackageNames()
	const buckets = classify(allNames)

	const [runtime, agents, binaries] = await Promise.all([
		probeAll(buckets.runtime),
		probeAll(buckets.agents),
		probeAll(buckets.binaries),
	])

	const byName = (a: Package, b: Package) => a.name.localeCompare(b.name)
	const data: PackageGroups = {
		runtime: runtime.sort(byName),
		agents: agents.sort(byName),
		binaries: binaries.sort(byName),
	}

	cache = { data, fetchedAt: now }
	return data
}

export function shortName(fullName: string): string {
	const i = fullName.indexOf("/")
	return i === -1 ? fullName : fullName.slice(i + 1)
}

export function imageRef(fullName: string): string {
	return `${REGISTRY_HOST}/${ORG}/${fullName}:latest`
}

// resolveName maps a bucket (e.g. "tools") + short-name (e.g. "jq")
// back to a full repository name ("tools/jq"), validating against the
// discovery scrape. Returns null when the pair isn't in the live set
// — that's how the [name] detail routes 404 cleanly for unknown
// URLs (or for slugs that referred to packages since removed).
export async function resolveName(
	bucket: "tools" | "agents" | "runtime",
	short: string,
): Promise<string | null> {
	const full =
		bucket === "runtime" && short === "runtime" ? "runtime" : `${bucket}/${short}`
	const all = await cachedPackageNames()
	return all.includes(full) ? full : null
}

// listKnownShortNames returns the short-names per bucket from the
// discovery scrape. Used by generateStaticParams on the detail routes
// so build-time prerenders every published package.
export async function listKnownShortNames(
	bucket: "tools" | "agents" | "runtime",
): Promise<string[]> {
	const all = await cachedPackageNames()
	return classify(all)
		[bucket === "tools" ? "binaries" : bucket].map(shortName)
}

// ImageDetails is the rich per-image read used by the detail pages.
// Distinct from Package (the list-level shape): adds annotations,
// USAGE.md content (BINs), and the parsed agent config (agents).
export interface ImageDetails {
	name: string
	shortName: string
	ref: string
	htmlUrl: string
	tags: string[]
	description: string
	source: string
	title: string
	usageMarkdown?: string
	agentConfig?: AgentConfig
}

export interface AgentEnv {
	key: string
	value?: string
	description?: string
}

export interface AgentContext {
	name: string
	description?: string
	content: string
}

export interface AgentBin {
	name: string
	image: string
	description?: string
	usage?: string
}

export interface AgentConfigEntry {
	key: string
	value: string | number | boolean
	description?: string
}

export interface AgentConfig {
	from?: string
	runtime?: string
	model?: string
	name?: string
	envs?: AgentEnv[]
	contexts?: AgentContext[]
	bins?: AgentBin[]
	configs?: AgentConfigEntry[]
	labels?: Record<string, string>
}

interface DetailsCacheEntry {
	data: ImageDetails | null
	fetchedAt: number
}

// One entry per image name. We let null sit in the cache too so 5min
// of 404s don't hammer ghcr.io.
const detailsCache = new Map<string, DetailsCacheEntry>()

interface ImageIndex {
	mediaType?: string
	manifests?: Array<{
		digest: string
		platform?: { architecture?: string; os?: string }
	}>
	annotations?: Record<string, string>
}

interface ImageManifest {
	mediaType?: string
	artifactType?: string
	config?: { mediaType: string; digest: string; size: number }
	layers?: Array<{
		mediaType: string
		digest: string
		size: number
		annotations?: Record<string, string>
	}>
	annotations?: Record<string, string>
}

const ACCEPT_MANIFEST = [
	"application/vnd.oci.image.index.v1+json",
	"application/vnd.oci.image.manifest.v1+json",
	"application/vnd.docker.distribution.manifest.list.v2+json",
	"application/vnd.docker.distribution.manifest.v2+json",
].join(",")

async function fetchManifest(
	repo: string,
	token: string,
	reference: string,
): Promise<ImageManifest | ImageIndex | null> {
	try {
		const res = await fetch(
			`https://${REGISTRY_HOST}/v2/${repo}/manifests/${reference}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					Accept: ACCEPT_MANIFEST,
				},
				next: { revalidate: CACHE_TTL_MS / 1000 },
			},
		)
		if (!res.ok) return null
		return (await res.json()) as ImageManifest | ImageIndex
	} catch {
		return null
	}
}

async function fetchBlobText(
	repo: string,
	token: string,
	digest: string,
): Promise<string | null> {
	try {
		const res = await fetch(
			`https://${REGISTRY_HOST}/v2/${repo}/blobs/${digest}`,
			{
				headers: { Authorization: `Bearer ${token}` },
				next: { revalidate: CACHE_TTL_MS / 1000 },
				redirect: "follow",
			},
		)
		if (!res.ok) return null
		return await res.text()
	} catch {
		return null
	}
}

// pickPlatformManifest unwraps an OCI image index to a single
// platform manifest digest. Prefers linux/amd64 (the architecture
// most folks reading docs care about); falls back to the first
// entry. Returns null when the input wasn't an index.
function pickPlatformManifest(idx: ImageIndex): string | null {
	if (!idx.manifests || idx.manifests.length === 0) return null
	const linuxAmd64 = idx.manifests.find(
		(m) => m.platform?.os === "linux" && m.platform?.architecture === "amd64",
	)
	return (linuxAmd64 ?? idx.manifests[0]).digest
}

// getImageDetails resolves a curated full-name to rich registry data:
// annotations (description / source / title), tag list, USAGE.md
// content for BINs, parsed agent config for agents. Returns null
// when the image isn't reachable.
export async function getImageDetails(
	name: string,
): Promise<ImageDetails | null> {
	const now = Date.now()
	const cached = detailsCache.get(name)
	if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
		return cached.data
	}

	const repo = `${ORG}/${name}`
	const token = await ghcrAnonToken(repo)
	if (!token) {
		detailsCache.set(name, { data: null, fetchedAt: now })
		return null
	}

	// Tag list first — even if the manifest fetch fails we can render
	// a thin detail page with just the tag list.
	let tags: string[] = []
	try {
		const tagsRes = await fetch(tagsUrl(repo), {
			headers: { Authorization: `Bearer ${token}` },
			next: { revalidate: CACHE_TTL_MS / 1000 },
		})
		if (tagsRes.ok) {
			const json = (await tagsRes.json()) as { tags?: string[] }
			tags = json.tags ?? []
		}
	} catch {
		// fall through with empty tag list
	}

	// Fetch latest manifest. May be a single-platform manifest or an
	// index; both paths land at platformManifest below.
	const top = await fetchManifest(repo, token, "latest")
	let platformManifest: ImageManifest | null = null
	let indexAnnotations: Record<string, string> | undefined

	if (top) {
		if ("manifests" in top && top.manifests) {
			indexAnnotations = top.annotations
			const digest = pickPlatformManifest(top)
			if (digest) {
				const sub = await fetchManifest(repo, token, digest)
				if (sub && "config" in sub) platformManifest = sub as ImageManifest
			}
		} else if ("config" in top) {
			platformManifest = top as ImageManifest
		}
	}

	const annotations =
		platformManifest?.annotations ?? indexAnnotations ?? {}

	const description =
		annotations["org.opencontainers.image.description"] ??
		annotations["vnd.openotters.bin.description"] ??
		""
	const source = annotations["org.opencontainers.image.source"] ?? ""
	const title =
		annotations["org.opencontainers.image.title"] ??
		annotations["vnd.openotters.bin.name"] ??
		shortName(name)

	// USAGE.md — the layer ships as text/markdown with title /USAGE.md.
	let usageMarkdown: string | undefined
	const usageLayer = platformManifest?.layers?.find(
		(l) =>
			l.mediaType === "text/markdown" ||
			l.annotations?.["org.opencontainers.image.title"] === "/USAGE.md",
	)
	if (usageLayer) {
		const md = await fetchBlobText(repo, token, usageLayer.digest)
		if (md) usageMarkdown = md
	}

	// Agent config — parsed JSON blob describing the agent's
	// Agentfile fields (from, runtime, model, …).
	let agentConfig: AgentConfig | undefined
	if (
		name.startsWith("agents/") &&
		platformManifest?.config?.mediaType?.includes("openotters.agent.config")
	) {
		const blob = await fetchBlobText(repo, token, platformManifest.config.digest)
		if (blob) {
			try {
				const parsed = JSON.parse(blob) as { agent?: AgentConfig }
				agentConfig = parsed.agent
			} catch {
				// ignore malformed config blob
			}
		}
	}

	const details: ImageDetails = {
		name,
		shortName: shortName(name),
		ref: imageRef(name),
		htmlUrl: htmlUrlFor(name),
		tags,
		description,
		source,
		title,
		usageMarkdown,
		agentConfig,
	}

	detailsCache.set(name, { data: details, fetchedAt: now })
	return details
}

// GitHub Container Registry helpers.
//
// The /orgs/{org}/packages endpoint requires authentication even for public
// packages, so at build time we use GITHUB_TOKEN when available and fall back
// to a baked-in snapshot otherwise. The fallback keeps `next dev` working with
// no secrets and gives us deterministic output if the API is rate-limited.

const ORG = "openotters"
const API = `https://api.github.com/orgs/${ORG}/packages?package_type=container&per_page=100`
const REVALIDATE_SECONDS = 60 * 60 // 1 hour

export interface Package {
	name: string
	htmlUrl: string
	updatedAt: string
}

export interface PackageGroups {
	agents: Package[]
	binaries: Package[]
	runtime: Package[]
}

const FALLBACK_AGENTS: string[] = ["agents/base"]

const FALLBACK_BINARIES: string[] = [
	"tools/base64", "tools/basename", "tools/cat", "tools/chmod", "tools/cp",
	"tools/date", "tools/dirname", "tools/echo", "tools/false", "tools/find",
	"tools/grep", "tools/gzip", "tools/head", "tools/hostname", "tools/id",
	"tools/jina", "tools/jq", "tools/ln", "tools/ls", "tools/mkdir",
	"tools/mktemp", "tools/more", "tools/mv", "tools/ping", "tools/printenv",
	"tools/pwd", "tools/readlink", "tools/realpath", "tools/rm", "tools/rmdir",
	"tools/seq", "tools/sh", "tools/shasum", "tools/sleep", "tools/sort",
	"tools/tail", "tools/tee", "tools/time", "tools/touch", "tools/tr",
	"tools/true", "tools/uname", "tools/uniq", "tools/wc", "tools/wget",
	"tools/which", "tools/xargs", "tools/yes",
]

const FALLBACK_RUNTIME: string[] = ["runtime"]

function asPackage(name: string): Package {
	return {
		name,
		htmlUrl: `https://github.com/orgs/${ORG}/packages/container/package/${encodeURIComponent(name)}`,
		updatedAt: "",
	}
}

function fallbackGroups(): PackageGroups {
	return {
		agents: FALLBACK_AGENTS.map(asPackage),
		binaries: FALLBACK_BINARIES.map(asPackage),
		runtime: FALLBACK_RUNTIME.map(asPackage),
	}
}

export async function listPackages(): Promise<PackageGroups> {
	const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN
	if (!token) {
		return fallbackGroups()
	}

	try {
		const res = await fetch(API, {
			headers: {
				Accept: "application/vnd.github+json",
				Authorization: `Bearer ${token}`,
				"X-GitHub-Api-Version": "2022-11-28",
			},
			next: { revalidate: REVALIDATE_SECONDS },
		})
		if (!res.ok) {
			console.warn(`[ghcr] ${res.status} ${res.statusText} — using fallback`)
			return fallbackGroups()
		}
		const raw = (await res.json()) as Array<{
			name: string
			html_url: string
			updated_at: string
		}>

		const groups: PackageGroups = { agents: [], binaries: [], runtime: [] }
		for (const p of raw) {
			const pkg: Package = {
				name: p.name,
				htmlUrl: p.html_url,
				updatedAt: p.updated_at,
			}
			if (p.name.startsWith("agents/")) groups.agents.push(pkg)
			else if (p.name.startsWith("tools/")) groups.binaries.push(pkg)
			else groups.runtime.push(pkg)
		}
		const byName = (a: Package, b: Package) => a.name.localeCompare(b.name)
		groups.agents.sort(byName)
		groups.binaries.sort(byName)
		groups.runtime.sort(byName)
		return groups
	} catch (err) {
		console.warn(`[ghcr] fetch failed: ${err} — using fallback`)
		return fallbackGroups()
	}
}

export function shortName(fullName: string): string {
	const i = fullName.indexOf("/")
	return i === -1 ? fullName : fullName.slice(i + 1)
}

export function imageRef(fullName: string): string {
	return `ghcr.io/${ORG}/${fullName}:latest`
}

// Fetches the latest Agentspec from the openotters/agentfile repo at build
// time and renders it as HTML. The "latest" version is whichever
// AGENTFILE-v*.md file sorts highest by SemVer (lexicographic on a zero-padded
// scheme would be safer, but for now plain reverse-sort matches the file naming
// convention used in the repo).

import { Marked } from "marked"

const REPO = "openotters/agentfile"
const REVALIDATE_SECONDS = 60 * 60 // 1 hour

interface RepoFile {
	name: string
	type: "file" | "dir" | "symlink" | "submodule"
	html_url: string
	download_url: string | null
}

export interface AgentspecDoc {
	version: string
	source: string
	html: string
	rawUrl: string
	repoUrl: string
	fetchedAt: string
}

const FALLBACK: AgentspecDoc = {
	version: "v1.0.0",
	source:
		"# Agentfile Specification\n\n_The live spec could not be fetched from GitHub. " +
		"Set `GITHUB_TOKEN` (or unblock github.com) to load it._\n\n" +
		"See [github.com/openotters/agentfile](https://github.com/openotters/agentfile).",
	html: "",
	rawUrl: `https://github.com/${REPO}`,
	repoUrl: `https://github.com/${REPO}`,
	fetchedAt: new Date(0).toISOString(),
}

function authHeaders(): Record<string, string> {
	const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN
	const base: Record<string, string> = {
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28",
	}
	if (token) base.Authorization = `Bearer ${token}`
	return base
}

async function listSpecFiles(): Promise<RepoFile[]> {
	const res = await fetch(
		`https://api.github.com/repos/${REPO}/contents/`,
		{
			headers: authHeaders(),
			next: { revalidate: REVALIDATE_SECONDS },
		},
	)
	if (!res.ok) {
		throw new Error(`list contents: ${res.status} ${res.statusText}`)
	}
	const all = (await res.json()) as RepoFile[]
	return all
		.filter((f) => f.type === "file" && /^AGENTFILE-v.*\.md$/.test(f.name))
		.sort((a, b) => b.name.localeCompare(a.name))
}

async function fetchRaw(url: string): Promise<string> {
	const res = await fetch(url, {
		headers: { Accept: "text/plain" },
		next: { revalidate: REVALIDATE_SECONDS },
	})
	if (!res.ok) {
		throw new Error(`fetch raw: ${res.status} ${res.statusText}`)
	}
	return res.text()
}

function versionFromName(name: string): string {
	const m = name.match(/^AGENTFILE-(v[\d.]+)\.md$/)
	return m ? m[1] : name
}

function makeMarked(): Marked {
	return new Marked({
		gfm: true,
		breaks: false,
	})
}

export async function getLatestAgentspec(): Promise<AgentspecDoc> {
	try {
		const files = await listSpecFiles()
		if (files.length === 0 || !files[0].download_url) return FALLBACK
		const file = files[0]
		const source = await fetchRaw(file.download_url as string)
		const html = await makeMarked().parse(stripTOC(source))
		return {
			version: versionFromName(file.name),
			source,
			html: typeof html === "string" ? html : await html,
			rawUrl: file.download_url as string,
			repoUrl: file.html_url,
			fetchedAt: new Date().toISOString(),
		}
	} catch (err) {
		console.warn(`[agentspec] fetch failed: ${err} — using fallback`)
		return FALLBACK
	}
}

// The spec embeds a hand-maintained <!-- TOC --> block that we strip — the
// page renders its own TOC from <h2>/<h3> headings.
function stripTOC(md: string): string {
	return md.replace(/<!-- TOC -->[\s\S]*?<!-- TOC -->/g, "").trim()
}

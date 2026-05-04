import { ExternalLink, FileCode2, Github, RefreshCw } from "lucide-react"
import type { Metadata } from "next"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getLatestAgentspec } from "@/lib/agentspec"

export const metadata: Metadata = {
	title: "Agentspec",
	description:
		"The latest Agentfile specification — fetched live from openotters/agentfile.",
}

export const revalidate = 3600

export default async function AgentspecPage() {
	const spec = await getLatestAgentspec()

	const fetchedLabel =
		spec.fetchedAt === new Date(0).toISOString()
			? "fallback content"
			: `Fetched ${new Date(spec.fetchedAt).toUTCString()}`

	return (
		<div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
			<header className="mb-10">
				<Badge className="mb-4" variant="outline">
					Live from github.com/openotters/agentfile
				</Badge>
				<h1 className="font-bold text-4xl text-foreground tracking-tight sm:text-5xl">
					Agentspec
				</h1>
				<p className="mt-4 max-w-2xl text-lg text-muted-foreground">
					The declarative grammar for OpenOtters agents. This page renders the
					latest <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">AGENTFILE-{spec.version}.md</code>{" "}
					straight from the spec repo, refreshed hourly.
				</p>

				<div className="mt-6 flex flex-wrap items-center gap-3">
					<Badge variant="secondary">
						<FileCode2 className="size-3" /> {spec.version}
					</Badge>
					<Badge variant="outline">
						<RefreshCw className="size-3" /> {fetchedLabel}
					</Badge>
					<Button asChild className="ml-auto" variant="outline">
						<a
							href={spec.repoUrl}
							rel="noopener noreferrer"
							target="_blank">
							<Github className="size-4" /> View on GitHub{" "}
							<ExternalLink className="size-3" />
						</a>
					</Button>
				</div>
			</header>

			{spec.html ? (
				<article
					className="prose-otters"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: trusted source — own GitHub repo
					dangerouslySetInnerHTML={{ __html: spec.html }}
				/>
			) : (
				<pre className="overflow-x-auto rounded-lg border border-border bg-card p-6 font-mono text-sm">
					{spec.source}
				</pre>
			)}
		</div>
	)
}

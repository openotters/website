import { ArrowLeft, ExternalLink, Github } from "lucide-react"
import { marked } from "marked"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CopyCommand } from "@/components/ui/copy-command"
import { TerminalWindow } from "@/components/ui/terminal-window"
import { renderAgentfile } from "@/lib/agentfile"
import type { ImageDetails } from "@/lib/ghcr"

interface RegistryDetailProps {
	bucket: "agents" | "binaries"
	emoji: string
	details: ImageDetails
	pullCommand: string
}

// RegistryDetail is the shared body of the /agents/[name] and
// /binaries/[name] routes. Renders the image's annotations + tag
// list + USAGE.md (when present) + bookkeeping links. Pure server
// component — the markdown is rendered on the server with marked
// and inlined as HTML, no client JS.
export function RegistryDetail({
	bucket,
	emoji,
	details,
	pullCommand,
}: RegistryDetailProps) {
	const usageHtml = details.usageMarkdown
		? marked.parse(details.usageMarkdown, { async: false })
		: null

	const backHref = `/${bucket}`
	const backLabel = bucket === "agents" ? "agents" : "binaries"

	return (
		<div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
			<Link
				className="inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
				href={backHref}>
				<ArrowLeft className="size-4" /> All {backLabel}
			</Link>

			<header className="mt-6 mb-10">
				<div className="flex items-center gap-3">
					<div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-2xl">
						<span aria-hidden="true">{emoji}</span>
					</div>
					<div>
						<h1 className="font-bold text-3xl text-foreground tracking-tight sm:text-4xl">
							{details.shortName}
						</h1>
						<code className="text-muted-foreground text-sm">
							{details.ref}
						</code>
					</div>
				</div>

				{details.description ? (
					<p className="mt-6 max-w-2xl text-lg text-muted-foreground">
						{details.description}
					</p>
				) : null}

				<div className="mt-6 flex flex-col items-start gap-3">
					<CopyCommand command={pullCommand} />
					<div className="flex flex-wrap gap-2">
						{details.source ? (
							<Button asChild variant="outline">
								<a
									href={details.source}
									rel="noopener noreferrer"
									target="_blank">
									<ExternalLink className="size-4" /> Upstream
								</a>
							</Button>
						) : null}
						<Button asChild variant="outline">
							<a
								href={details.htmlUrl}
								rel="noopener noreferrer"
								target="_blank">
								<Github className="size-4" /> Package on GHCR
							</a>
						</Button>
					</div>
				</div>
			</header>

			{details.agentConfig ? (
				<section className="mb-10">
					<h2 className="mb-4 font-semibold text-foreground text-xl">
						Agentfile
					</h2>
					<TerminalWindow className="not-prose" title="Agentfile">
						<pre className="!rounded-none !border-0 !bg-transparent overflow-x-auto whitespace-pre p-5 font-mono text-foreground text-sm leading-relaxed">
							<code className="!bg-transparent !p-0">
								{renderAgentfile(details.agentConfig)}
							</code>
						</pre>
					</TerminalWindow>
				</section>
			) : null}

			{usageHtml ? (
				<section className="mb-10">
					<h2 className="mb-4 font-semibold text-foreground text-xl">
						Usage
					</h2>
					<div
						className="prose-otters"
						// biome-ignore lint/security/noDangerouslySetInnerHtml: USAGE.md is sourced from our own ghcr.io org and rendered server-side via marked.
						dangerouslySetInnerHTML={{ __html: usageHtml }}
					/>
				</section>
			) : null}

			<section>
				<div className="mb-4 flex items-baseline justify-between">
					<h2 className="font-semibold text-foreground text-xl">Tags</h2>
					<span className="text-muted-foreground text-sm">
						{details.tags.length}{" "}
						{details.tags.length === 1 ? "tag" : "tags"}
					</span>
				</div>
				{details.tags.length === 0 ? (
					<p className="text-muted-foreground text-sm">
						No tags available — the image may be private or unpublished.
					</p>
				) : (
					<ul className="flex flex-wrap gap-2">
						{details.tags.map((tag) => (
							<li key={tag}>
								<Badge
									className="font-mono"
									variant={tag === "latest" ? "default" : "outline"}>
									{tag}
								</Badge>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	)
}

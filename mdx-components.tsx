import defaultMdxComponents from "fumadocs-ui/mdx"
import type { MDXComponents } from "mdx/types"

import { Mermaid } from "@/components/mdx/mermaid"
import { TerminalWindow } from "@/components/ui/terminal-window"

// Agentfile is the macOS-window-chrome code block we use for
// Agentfile snippets on the home page. Exposed to MDX so blog
// posts and docs can render snippets with the same visual
// treatment as the marketing surface, no styling drift.
//
// The pre's `!`-prefixed border / radius / background utilities
// override `.prose-otters pre` in app/globals.css — without them
// the prose layer adds a second rounded frame INSIDE the terminal
// window. `not-prose` on the outer div catches everything else
// (block spacing, code background, etc.).
// CodeWindow is the shared body of the macOS-window-chrome blocks we
// render in marketing copy and blog posts. The `!`-prefixed border /
// radius / background utilities on the inner pre / code override
// `.prose-otters pre` and `.prose-otters code` in app/globals.css;
// without them, the prose layer adds a second rounded frame INSIDE
// the window chrome. `not-prose` on the outer div catches everything
// else (block spacing, default code background, etc.).
function CodeWindow({
	title,
	children,
}: {
	title: string
	children: React.ReactNode
}) {
	return (
		<TerminalWindow className="not-prose my-6" title={title}>
			<pre className="!rounded-none !border-0 !bg-transparent !p-5 overflow-x-auto whitespace-pre-wrap break-words font-mono text-foreground text-sm leading-relaxed">
				<code className="!bg-transparent !p-0">{children}</code>
			</pre>
		</TerminalWindow>
	)
}

// Agentfile renders Agentfile snippets with the same chrome the home
// page uses. Title defaults to "Agentfile" so blog posts can wrap
// snippets without naming the file every time.
function Agentfile({
	title = "Agentfile",
	children,
}: {
	title?: string
	children: React.ReactNode
}) {
	return <CodeWindow title={title}>{children}</CodeWindow>
}

// Terminal renders shell snippets in the same chrome — different
// default title so the visual cue ("Terminal" vs "Agentfile") matches
// the content. Override `title` for one-off labels (e.g. "$ ottersd").
function Terminal({
	title = "Terminal",
	children,
}: {
	title?: string
	children: React.ReactNode
}) {
	return <CodeWindow title={title}>{children}</CodeWindow>
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
	return {
		...defaultMdxComponents,
		Agentfile,
		Terminal,
		Mermaid,
		...components,
	}
}

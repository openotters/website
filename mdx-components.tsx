import { highlight } from "fumadocs-core/highlight"
import defaultMdxComponents from "fumadocs-ui/mdx"
import type { MDXComponents } from "mdx/types"

import { Mermaid } from "@/components/mdx/mermaid"
import { TerminalWindow } from "@/components/ui/terminal-window"
import { cn } from "@/lib/utils"

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
async function CodeWindow({
	title,
	lang,
	children,
}: {
	title: string
	lang?: string
	children: React.ReactNode
}) {
	// When a language is supplied, run the content through fumadocs's
	// shiki pipeline so the body inside the window chrome gets the
	// same syntax highlighting that fenced code blocks get elsewhere
	// in the prose. The `pre` component override neutralises the
	// theme's own border / radius / padding so it nests cleanly
	// under the macOS-window header.
	if (lang && typeof children === "string") {
		const highlighted = await highlight(children, {
			lang,
			themes: {
				light: "github-light",
				dark: "github-dark",
			},
			// Emit both light + dark colours as CSS variables so the
			// `.dark .shiki code span` rule in fumadocs's preset can
			// flip the palette with the site theme. Without this,
			// shiki picks a primary theme and bakes its colour inline,
			// which ignores our theme toggle.
			defaultColor: false,
			components: {
				// Preserve the `shiki` class that fumadocs's CSS
				// (`code span { color: var(--shiki-light) }`) keys on
				// for per-token colour, then layer our own utilities
				// to neutralise the theme's border / radius / padding
				// so the highlighted pre nests under the window chrome
				// cleanly.
				pre: ({ className, children: preChildren, ...rest }) => (
					<pre
						{...rest}
						className={cn(
							className,
							"!rounded-none !border-0 !my-0 !bg-transparent !p-5 overflow-x-auto font-mono text-sm leading-relaxed",
						)}>
						{preChildren}
					</pre>
				),
				code: ({ className, children: codeChildren, ...rest }) => (
					<code
						{...rest}
						className={cn(
							className,
							"!bg-transparent !p-0 !text-inherit",
						)}>
						{codeChildren}
					</code>
				),
			},
		})
		return (
			<TerminalWindow className="not-prose my-6" title={title}>
				{highlighted}
			</TerminalWindow>
		)
	}

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
// Pass `lang` to enable shiki syntax highlighting on the body (used
// by blog posts that want a code snippet under the window chrome).
function Terminal({
	title = "Terminal",
	lang,
	children,
}: {
	title?: string
	lang?: string
	children: React.ReactNode
}) {
	return (
		<CodeWindow title={title} lang={lang}>
			{children}
		</CodeWindow>
	)
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

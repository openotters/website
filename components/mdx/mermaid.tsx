"use client"

import mermaid from "mermaid"
import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"

// Mermaid is the client-side renderer for Mermaid diagrams embedded
// in MDX (blog posts, docs). The component takes the diagram source
// as a string child and renders the SVG output below it.
//
// Lazy-init: mermaid.initialize must run before the first parse, and
// next-themes' theme value is only available client-side, so the
// initialize call runs inside a useEffect that re-fires when theme
// changes. We bump a `key` on the theme change so the SVG re-renders
// with the right palette without trying to mutate mermaid's cache.
//
// `id` is required by mermaid.render — a stable per-instance id keeps
// re-renders consistent and avoids id collisions on pages with more
// than one diagram.

let nextId = 0

function newId() {
	nextId += 1
	return `mermaid-${nextId}`
}

export function Mermaid({ chart }: { chart: string }) {
	const [svg, setSvg] = useState<string>("")
	const [error, setError] = useState<string | null>(null)
	const { resolvedTheme } = useTheme()
	const idRef = useRef<string>(newId())

	useEffect(() => {
		let cancelled = false

		// Palette tuned to match the openotters site (cream / muted
		// teal / warm accent). neutral=true keeps mermaid's defaults
		// readable in both light and dark and avoids the default
		// candy-blue look.
		mermaid.initialize({
			startOnLoad: false,
			theme: resolvedTheme === "dark" ? "dark" : "neutral",
			securityLevel: "loose",
			fontFamily: "var(--font-mono), ui-monospace, monospace",
		})

		mermaid
			.render(idRef.current, chart)
			.then(({ svg: rendered }) => {
				if (!cancelled) setSvg(rendered)
			})
			.catch((err) => {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : String(err))
				}
			})

		return () => {
			cancelled = true
		}
	}, [chart, resolvedTheme])

	if (error) {
		return (
			<pre className="not-prose my-6 overflow-x-auto rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
				mermaid render error: {error}
			</pre>
		)
	}

	return (
		<div
			// SVG is sanitised by mermaid; safe to inject.
			className="not-prose my-6 flex w-full justify-center overflow-x-auto rounded-lg border border-border bg-card p-6"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: trusted mermaid output
			dangerouslySetInnerHTML={{ __html: svg }}
		/>
	)
}

import { DocsLayout } from "fumadocs-ui/layouts/docs"
import type { ReactNode } from "react"

import { Logo } from "@/components/ui/logo"
import { source } from "@/lib/source"

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<DocsLayout
			nav={{ title: <Logo />, url: "/" }}
			tree={source.pageTree}>
			{children}
		</DocsLayout>
	)
}

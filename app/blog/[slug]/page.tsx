import Link from "next/link"
import { notFound } from "next/navigation"

import { getMDXComponents } from "@/mdx-components"
import { blogSource } from "@/lib/source"

interface PageProps {
	params: Promise<{ slug: string }>
}

function formatDate(value: string) {
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return value
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	})
}

export default async function BlogPostPage({ params }: PageProps) {
	const { slug } = await params
	const page = blogSource.getPage([slug])
	if (!page) notFound()

	const MDX = page.data.body

	return (
		<article className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-24">
			<Link
				className="font-mono text-muted-foreground text-xs uppercase tracking-wide transition-colors hover:text-foreground"
				href="/blog">
				← Back to blog
			</Link>

			<header className="mt-6 mb-10">
				<time
					className="font-mono text-muted-foreground text-xs uppercase tracking-wide"
					dateTime={page.data.date}>
					{formatDate(page.data.date)}
				</time>
				<h1 className="mt-2 font-bold text-4xl text-foreground tracking-tight sm:text-5xl">
					{page.data.title}
				</h1>
				{page.data.description && (
					<p className="mt-4 text-lg text-muted-foreground">
						{page.data.description}
					</p>
				)}
				{page.data.author && (
					<p className="mt-4 text-muted-foreground text-sm">
						by {page.data.author}
					</p>
				)}
			</header>

			<div className="prose prose-neutral dark:prose-invert max-w-none">
				<MDX components={getMDXComponents()} />
			</div>
		</article>
	)
}

export function generateStaticParams() {
	return blogSource
		.getPages()
		.map((page) => ({ slug: page.slugs[0] }))
		.filter((entry): entry is { slug: string } => Boolean(entry.slug))
}

export async function generateMetadata({ params }: PageProps) {
	const { slug } = await params
	const page = blogSource.getPage([slug])
	if (!page) notFound()

	return {
		title: `${page.data.title} · OpenOtters Blog`,
		description: page.data.description,
	}
}

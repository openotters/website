import Link from "next/link"

import { blogSource } from "@/lib/source"

export const revalidate = 3600

export const metadata = {
	title: "Blog · OpenOtters",
	description: "Release notes, design decisions, and updates from the OpenOtters project.",
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

export default function BlogIndex() {
	const posts = [...blogSource.getPages()].sort((a, b) =>
		(b.data.date ?? "").localeCompare(a.data.date ?? ""),
	)

	return (
		<section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-24">
			<div className="mb-12">
				<h1 className="font-bold text-4xl text-foreground tracking-tight sm:text-5xl">
					Blog
				</h1>
				<p className="mt-4 text-lg text-muted-foreground">
					Release notes, design decisions, and updates from the OpenOtters
					project.
				</p>
			</div>

			{posts.length === 0 ? (
				<p className="text-muted-foreground text-sm">No posts yet.</p>
			) : (
				<ul className="flex flex-col gap-10">
					{posts.map((post) => (
						<li
							className="border-border/60 border-b pb-10 last:border-b-0 last:pb-0"
							key={post.url}>
							<article>
								<time
									className="font-mono text-muted-foreground text-xs uppercase tracking-wide"
									dateTime={post.data.date}>
									{formatDate(post.data.date)}
								</time>
								<h2 className="mt-2 font-semibold text-2xl text-foreground tracking-tight">
									<Link
										className="transition-colors hover:text-primary"
										href={post.url}>
										{post.data.title}
									</Link>
								</h2>
								{post.data.description && (
									<p className="mt-3 text-muted-foreground">
										{post.data.description}
									</p>
								)}
								{post.data.author && (
									<p className="mt-3 text-muted-foreground text-sm">
										by {post.data.author}
									</p>
								)}
							</article>
						</li>
					))}
				</ul>
			)}
		</section>
	)
}

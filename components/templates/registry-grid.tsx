import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { ImageDetails } from "@/lib/ghcr"

interface RegistryGridProps {
	items: ImageDetails[]
	emoji: string
	// detailHrefPrefix is the internal route prefix — e.g. "/binaries"
	// or "/agents". Each card links to `${prefix}/${item.shortName}`.
	detailHrefPrefix: string
}

export function RegistryGrid({
	items,
	emoji,
	detailHrefPrefix,
}: RegistryGridProps) {
	if (items.length === 0) {
		return (
			<p className="text-muted-foreground text-sm">
				Nothing matches the current filter.
			</p>
		)
	}

	return (
		<ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{items.map((item) => (
				<li key={item.name}>
					<Link
						className="block h-full"
						href={`${detailHrefPrefix}/${item.shortName}`}>
						<Card className="group h-full transition-colors hover:border-primary/40">
							<CardContent className="flex h-full flex-col gap-3 p-5">
								<div className="flex items-start gap-3">
									<div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xl">
										<span aria-hidden="true">{emoji}</span>
									</div>
									<div className="min-w-0 flex-1">
										<span className="block truncate font-mono font-semibold text-base text-foreground">
											{item.shortName}
										</span>
										<code className="block truncate text-muted-foreground text-xs">
											{item.ref}
										</code>
									</div>
								</div>

								{item.description ? (
									<p className="line-clamp-3 text-muted-foreground text-sm">
										{item.description}
									</p>
								) : (
									<p className="text-muted-foreground/60 text-sm italic">
										No description set.
									</p>
								)}
							</CardContent>
							<CardFooter className="flex items-center justify-between border-border/60 border-t pt-3 text-muted-foreground text-xs">
								<span>
									{item.tags.length}{" "}
									{item.tags.length === 1 ? "tag" : "tags"}
								</span>
								<span className="inline-flex items-center gap-1 transition-colors group-hover:text-foreground">
									View <ArrowRight className="size-3" />
								</span>
							</CardFooter>
						</Card>
					</Link>
				</li>
			))}
		</ul>
	)
}

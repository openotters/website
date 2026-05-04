import { Copy, ExternalLink } from "lucide-react"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { type Package, imageRef, shortName } from "@/lib/ghcr"

interface RegistryGridProps {
	items: Package[]
	emoji: string
}

export function RegistryGrid({ items, emoji }: RegistryGridProps) {
	if (items.length === 0) {
		return (
			<p className="text-muted-foreground text-sm">
				No packages found in the registry.
			</p>
		)
	}

	return (
		<ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{items.map((item) => (
				<li key={item.name}>
					<a
						className="block h-full"
						href={item.htmlUrl}
						rel="noopener noreferrer"
						target="_blank">
						<Card className="h-full transition-colors hover:border-primary/40">
							<CardContent className="flex flex-col gap-3">
								<div className="flex items-center gap-3">
									<div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-lg">
										<span aria-hidden="true">{emoji}</span>
									</div>
									<span className="truncate font-mono font-semibold text-base text-foreground">
										{shortName(item.name)}
									</span>
									<ExternalLink className="ml-auto size-3.5 text-muted-foreground" />
								</div>
								<code className="truncate text-muted-foreground text-xs">
									{imageRef(item.name)}
								</code>
							</CardContent>
							<CardFooter className="flex items-center justify-between text-muted-foreground text-xs">
								<span>OCI image</span>
								<span className="inline-flex items-center gap-1">
									<Copy className="size-3" /> pull-ready
								</span>
							</CardFooter>
						</Card>
					</a>
				</li>
			))}
		</ul>
	)
}

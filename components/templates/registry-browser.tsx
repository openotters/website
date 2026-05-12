"use client"

import { Search } from "lucide-react"
import { useMemo, useState } from "react"

import { RegistryGrid } from "@/components/templates/registry-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ImageDetails } from "@/lib/ghcr"

type Filter = "all" | "documented"

interface RegistryBrowserProps {
	items: ImageDetails[]
	emoji: string
	detailHrefPrefix: string
	noun: string
}

// RegistryBrowser is the client-side filter / search shell wrapping
// the grid. Server passes the full ImageDetails[] (already in cache);
// this component just narrows what's rendered. No network calls.
export function RegistryBrowser({
	items,
	emoji,
	detailHrefPrefix,
	noun,
}: RegistryBrowserProps) {
	const [query, setQuery] = useState("")
	const [filter, setFilter] = useState<Filter>("all")

	const filtered = useMemo(() => {
		const q = query.toLowerCase().trim()
		return items.filter((item) => {
			if (filter === "documented" && !item.description) return false
			if (!q) return true
			return (
				item.shortName.toLowerCase().includes(q) ||
				item.description.toLowerCase().includes(q)
			)
		})
	}, [items, query, filter])

	const documentedCount = useMemo(
		() => items.filter((i) => i.description).length,
		[items],
	)

	return (
		<div>
			<div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="relative w-full max-w-sm">
					<Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
					<Input
						aria-label={`Search ${noun}`}
						className="pl-9"
						onChange={(e) => setQuery(e.target.value)}
						placeholder={`Search ${noun}…`}
						value={query}
					/>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button
						onClick={() => setFilter("all")}
						size="sm"
						variant={filter === "all" ? "default" : "outline"}>
						All
						<span className="ml-1 text-muted-foreground text-xs">
							{items.length}
						</span>
					</Button>
					<Button
						disabled={documentedCount === 0}
						onClick={() => setFilter("documented")}
						size="sm"
						variant={filter === "documented" ? "default" : "outline"}>
						Documented
						<span className="ml-1 text-muted-foreground text-xs">
							{documentedCount}
						</span>
					</Button>
				</div>
			</div>

			<div className="mb-4 text-muted-foreground text-sm">
				{filtered.length === items.length
					? `${items.length} ${noun}`
					: `${filtered.length} of ${items.length} ${noun}`}
			</div>

			<RegistryGrid
				detailHrefPrefix={detailHrefPrefix}
				emoji={emoji}
				items={filtered}
			/>
		</div>
	)
}

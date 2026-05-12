import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

export function Input({ className, ...props }: ComponentProps<"input">) {
	return (
		<input
			className={cn(
				"flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-foreground text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	)
}

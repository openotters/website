import type { PropsWithChildren } from "react"

import { cn } from "@/lib/utils"

interface TerminalWindowProps {
	title?: string
	className?: string
}

export function TerminalWindow({
	title,
	className,
	children,
}: PropsWithChildren<TerminalWindowProps>) {
	return (
		<div
			className={cn(
				"overflow-hidden rounded-xl border border-border bg-card shadow-lg",
				className,
			)}>
			<div className="flex items-center gap-2 border-border/60 border-b bg-muted/40 px-4 py-2.5">
				<div className="flex items-center gap-1.5">
					<span
						aria-hidden="true"
						className="size-3 rounded-full bg-[#ff5f56]"
					/>
					<span
						aria-hidden="true"
						className="size-3 rounded-full bg-[#ffbd2e]"
					/>
					<span
						aria-hidden="true"
						className="size-3 rounded-full bg-[#27c93f]"
					/>
				</div>
				{title && (
					<span className="flex-1 text-center font-mono text-muted-foreground text-xs tracking-wide">
						{title}
					</span>
				)}
				{title && <span aria-hidden="true" className="w-[42px]" />}
			</div>
			{children}
		</div>
	)
}

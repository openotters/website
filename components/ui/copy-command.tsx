"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"

interface CopyCommandProps {
	command: string
	className?: string
}

export function CopyCommand({ command, className }: CopyCommandProps) {
	const [copied, setCopied] = useState(false)

	const onCopy = async () => {
		try {
			await navigator.clipboard.writeText(command)
			setCopied(true)
			setTimeout(() => setCopied(false), 1500)
		} catch {
			/* clipboard unavailable — silent */
		}
	}

	return (
		<button
			aria-label={copied ? "Copied" : "Copy command"}
			className={cn(
				"group inline-flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 font-mono text-sm shadow-sm transition-all hover:border-primary/40 hover:shadow-md",
				className,
			)}
			onClick={onCopy}
			type="button">
			<span className="select-none text-primary">$</span>
			<span className="text-foreground">{command}</span>
			<span className="ml-2 text-muted-foreground transition-colors group-hover:text-foreground">
				{copied ? <Check className="size-4" /> : <Copy className="size-4" />}
			</span>
		</button>
	)
}

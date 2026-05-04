import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
	return (
		<div className={cn("flex items-center gap-2", className)}>
			<OtterMark className="text-xl leading-none" />
			<span className="font-semibold text-base tracking-tight">openotters</span>
		</div>
	)
}

export function OtterMark({ className }: { className?: string }) {
	return (
		<span aria-hidden="true" className={cn("inline-block", className)} role="img">
			🦦
		</span>
	)
}

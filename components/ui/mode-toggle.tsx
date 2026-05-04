"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

export function ModeToggle() {
	const { theme, setTheme, resolvedTheme } = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => setMounted(true), [])

	const current = mounted ? resolvedTheme ?? theme : "dark"
	const next = current === "dark" ? "light" : "dark"

	return (
		<Button
			aria-label="Toggle theme"
			onClick={() => setTheme(next)}
			size="icon"
			variant="ghost">
			<Sun className="hidden size-4 dark:inline" />
			<Moon className="inline size-4 dark:hidden" />
		</Button>
	)
}

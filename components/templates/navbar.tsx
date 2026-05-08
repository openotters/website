"use client"

import { Github, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { cn } from "@/lib/utils"

const links = [
	{ href: "/agents", label: "Agents" },
	{ href: "/binaries", label: "Binaries" },
	{ href: "/agentspec", label: "Agentspec" },
	{ href: "/docs", label: "Docs" },
	{ href: "/blog", label: "Blog" },
]

export function Navbar() {
	const pathname = usePathname()
	const [open, setOpen] = useState(false)

	return (
		<header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
			<div className="mx-auto flex h-14 w-full max-w-6xl items-center px-4 sm:px-6">
				<Link aria-label="OpenOtters home" className="mr-6" href="/">
					<Logo />
				</Link>

				<nav className="hidden items-center gap-1 md:flex">
					{links.map((link) => (
						<Link
							className={cn(
								"rounded-md px-3 py-1.5 font-medium text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-foreground",
								pathname?.startsWith(link.href) && "text-foreground",
							)}
							href={link.href}
							key={link.href}>
							{link.label}
						</Link>
					))}
				</nav>

				<div className="ml-auto flex items-center gap-1">
					<Button asChild size="icon" variant="ghost">
						<a
							aria-label="OpenOtters on GitHub"
							href="https://github.com/openotters/openotters"
							rel="noopener noreferrer"
							target="_blank">
							<Github className="size-4" />
						</a>
					</Button>
					<ModeToggle />
					<Button
						aria-label="Toggle menu"
						className="md:hidden"
						onClick={() => setOpen((v) => !v)}
						size="icon"
						variant="ghost">
						{open ? <X className="size-4" /> : <Menu className="size-4" />}
					</Button>
				</div>
			</div>

			{open && (
				<nav className="border-border/60 border-t md:hidden">
					<div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
						{links.map((link) => (
							<Link
								className="rounded-md px-3 py-2 font-medium text-muted-foreground text-sm hover:bg-accent hover:text-foreground"
								href={link.href}
								key={link.href}
								onClick={() => setOpen(false)}>
								{link.label}
							</Link>
						))}
					</div>
				</nav>
			)}
		</header>
	)
}

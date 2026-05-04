import { Github } from "lucide-react"
import Link from "next/link"

import { Logo } from "@/components/ui/logo"

const groups: { heading: string; links: { href: string; label: string; external?: boolean }[] }[] = [
	{
		heading: "Product",
		links: [
			{ href: "/agents", label: "Agents" },
			{ href: "/binaries", label: "Binaries" },
			{ href: "/agentspec", label: "Agentspec" },
			{ href: "/docs", label: "Docs" },
		],
	},
	{
		heading: "Resources",
		links: [
			{ href: "/agentspec", label: "Agentspec (latest)" },
			{ href: "/docs/quickstart", label: "Quickstart" },
			{ href: "/docs/cli", label: "CLI reference" },
			{ href: "/docs/runtime", label: "Runtime" },
		],
	},
	{
		heading: "Community",
		links: [
			{
				href: "https://github.com/openotters/openotters",
				label: "GitHub",
				external: true,
			},
			{
				href: "https://github.com/openotters/openotters/issues",
				label: "Issues",
				external: true,
			},
			{
				href: "https://github.com/openotters/openotters/discussions",
				label: "Discussions",
				external: true,
			},
			{
				href: "https://github.com/orgs/openotters/packages",
				label: "Registry",
				external: true,
			},
		],
	},
]

export function Footer() {
	return (
		<footer
			aria-label="OpenOtters website footer"
			className="border-border/60 border-t"
			itemScope
			itemType="https://schema.org/WPFooter">
			<div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-10 px-4 py-12 sm:px-6 md:grid-cols-5">
				<div className="col-span-2">
					<Logo />
					<p className="mt-4 max-w-sm text-muted-foreground text-sm">
						Declarative AI agents — like Docker, but for autonomous agents.
						Write an Agentfile, build an OCI image, and run it.
					</p>
					<a
						aria-label="OpenOtters on GitHub"
						className="mt-4 inline-flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground"
						href="https://github.com/openotters/openotters"
						rel="noopener noreferrer"
						target="_blank">
						<Github className="size-4" />
						<span>github.com/openotters</span>
					</a>
				</div>

				{groups.map((group) => (
					<div key={group.heading}>
						<h3 className="mb-3 font-semibold text-foreground text-sm">
							{group.heading}
						</h3>
						<ul className="flex flex-col gap-2 text-sm">
							{group.links.map((link) =>
								link.external ? (
									<li key={link.href}>
										<a
											className="text-muted-foreground transition-colors hover:text-foreground"
											href={link.href}
											rel="noopener noreferrer"
											target="_blank">
											{link.label}
										</a>
									</li>
								) : (
									<li key={link.href}>
										<Link
											className="text-muted-foreground transition-colors hover:text-foreground"
											href={link.href}>
											{link.label}
										</Link>
									</li>
								),
							)}
						</ul>
					</div>
				))}
			</div>

			<div className="border-border/60 border-t">
				<div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-6 text-muted-foreground text-sm sm:px-6 max-md:flex-col">
					<p>© 2026 OpenOtters · MIT licensed</p>
					<p>
						openotters.io ·{" "}
						<a
							className="hover:text-foreground"
							href="https://github.com/openotters/openotters"
							rel="noopener noreferrer"
							target="_blank">
							source on GitHub
						</a>
					</p>
				</div>
			</div>
		</footer>
	)
}

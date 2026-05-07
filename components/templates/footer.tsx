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
				href: "https://join.slack.com/t/openotters/shared_invite/zt-3xddg51j9-I3sg4dyzt5kFS0A5~k_elQ",
				label: "Slack",
				external: true,
			},
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
			className="flex w-full flex-col"
			itemScope
			itemType="https://schema.org/WPFooter"
			role="contentinfo">
			<div className="mx-auto w-full max-w-6xl border-border border-t border-dashed px-4 py-12 sm:px-6 sm:py-16">
				<div className="grid grid-cols-2 gap-10 md:grid-cols-5">
					<div
						className="col-span-2"
						itemScope
						itemType="https://schema.org/Organization">
						<a
							aria-label="OpenOtters home"
							className="inline-flex"
							href="/"
							itemProp="url">
							<div
								aria-label="OpenOtters"
								className="flex items-center"
								itemScope
								itemType="https://schema.org/Brand"
								role="img">
								<Logo />
							</div>
							<meta content="OpenOtters" itemProp="name" />
						</a>
						<p
							className="mt-4 max-w-sm text-muted-foreground text-sm"
							itemProp="description">
							Declarative AI agents — like Docker, but for autonomous agents.
							Write an Agentfile, build it into an OCI image, and run it.
						</p>
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
			</div>

			<div className="w-full border-border border-t border-dashed">
				<div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-5 px-4 py-6 text-center text-base text-muted-foreground sm:px-6 max-lg:flex-col">
					<p>
						<span aria-label="Copyright 2026">© 2026</span>{" "}
						<a
							aria-label="OpenOtters home"
							className="font-medium text-foreground transition-colors hover:text-primary hover:underline"
							href="/"
							title="OpenOtters — declarative AI agents">
							OpenOtters
						</a>{" "}
						<span aria-label="License">· MIT licensed, forever</span>
					</p>
					<p>
						<span>Built by</span>{" "}
						<a
							aria-label="Merlindorin on GitHub (opens in new tab)"
							className="font-medium text-foreground transition-colors hover:text-primary hover:underline"
							href="https://github.com/merlindorin"
							rel="noopener noreferrer"
							target="_blank"
							title="Merlindorin — software engineer">
							Merlindorin
						</a>{" "}
						<span aria-hidden="true">·</span>{" "}
						<span>See also</span>{" "}
						<a
							aria-label="sshark.app — search public SSH keys (opens in new tab)"
							className="font-medium text-foreground transition-colors hover:text-primary hover:underline"
							href="https://sshark.app"
							rel="noopener noreferrer"
							target="_blank"
							title="sshark.app — search public SSH keys">
							sshark.app
						</a>
					</p>
				</div>
			</div>
		</footer>
	)
}

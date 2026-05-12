import { ArrowRight, Github } from "lucide-react"
import type { Metadata } from "next"

import { RegistryBrowser } from "@/components/templates/registry-browser"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CopyCommand } from "@/components/ui/copy-command"
import { listImageDetails } from "@/lib/ghcr"

export const metadata: Metadata = {
	title: "Binaries",
	description:
		"Containerised tools agents can call as BIN entries. Pull from GHCR.",
}

export const revalidate = 300

export default async function BinariesPage() {
	const { binaries } = await listImageDetails()

	return (
		<div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
			<header className="mb-10">
				<Badge className="mb-4" variant="outline">
					Public registry · ghcr.io/openotters
				</Badge>
				<h1 className="font-bold text-4xl text-foreground tracking-tight sm:text-5xl">
					Binaries
				</h1>
				<p className="mt-4 max-w-2xl text-lg text-muted-foreground">
					Containerised tools agents can call from an Agentfile. Each binary
					ships as a tiny OCI image with the same security model as containers
					— scoped, sandboxed, observable.
				</p>

				<div className="mt-6 flex flex-col items-start gap-3">
					<CopyCommand command='BIN ping ghcr.io/openotters/tools/ping:latest "TCP-port-80 reachability"' />
					<div className="flex flex-wrap gap-2">
						<Button asChild variant="outline">
							<a
								href="https://github.com/orgs/openotters/packages?q=tools&tab=packages"
								rel="noopener noreferrer"
								target="_blank">
								<Github className="size-4" /> View on GitHub
							</a>
						</Button>
						<Button asChild>
							<a href="/agentspec">
								Use in an Agentfile <ArrowRight className="size-4" />
							</a>
						</Button>
					</div>
				</div>
			</header>

			<section>
				<h2 className="mb-6 font-semibold text-foreground text-xl">
					Available binaries
				</h2>
				<RegistryBrowser
					detailHrefPrefix="/binaries"
					emoji="📦"
					items={binaries}
					noun="binaries"
				/>
			</section>
		</div>
	)
}

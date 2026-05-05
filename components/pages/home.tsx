import {
	ArrowRight,
	Box,
	Cpu,
	FileCode2,
	Github,
	Layers,
	Lock,
	MessageSquare,
	Network,
	ShieldCheck,
	Terminal,
	Workflow,
} from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { CopyCommand } from "@/components/ui/copy-command"
import { OtterMark } from "@/components/ui/logo"
import { TerminalWindow } from "@/components/ui/terminal-window"

const AGENTFILE = `FROM scratch
RUNTIME ghcr.io/openotters/runtime:latest
MODEL  anthropic/claude-haiku-4-5-20251001
NAME   pinger

CONTEXT SOUL <<EOF
You are a connectivity probe. Given a host, call the
ping tool and reply "<host>: reachable" or
"<host>: unreachable (<reason>)".
EOF

BIN ping ghcr.io/openotters/tools/ping:latest "TCP-port-80 reachability"`

const FEATURES = [
	{
		icon: FileCode2,
		title: "Declarative",
		body: "Describe agents in an Agentfile — model, tools, memory, prompts. No SDK, no glue code.",
	},
	{
		icon: Box,
		title: "OCI-native",
		body: "Build into OCI images. Push to any registry. Pull and run anywhere with otters run.",
	},
	{
		icon: Workflow,
		title: "Tools as binaries",
		body: "BIN entries are container images that the agent invokes as tools — same security model as containers.",
	},
	{
		icon: Cpu,
		title: "Provider agnostic",
		body: "Anthropic, OpenAI, Ollama, and more. Switch providers without touching agent code.",
	},
	{
		icon: ShieldCheck,
		title: "Locked-down spawn env",
		body: "Agents start with no host secret leakage. Workspaces are scoped, sandboxed, observable.",
	},
	{
		icon: MessageSquare,
		title: "Two surfaces, one agent",
		body: "Talk to the same agent from a TUI in your terminal or a web UI in your browser.",
	},
] as const

const AGENTS = [
	{
		name: "pinger",
		image: "ghcr.io/openotters/agents/pinger",
		desc: "TCP-port-80 reachability probe",
		icon: Network,
	},
	{
		name: "reader",
		image: "ghcr.io/openotters/agents/reader",
		desc: "Fetch a URL via Jina Reader, summarise it",
		icon: Layers,
	},
	{
		name: "meteo",
		image: "ghcr.io/openotters/agents/meteo",
		desc: "Weather lookup using Open-Meteo + jq",
		icon: Cpu,
	},
	{
		name: "greeting",
		image: "ghcr.io/openotters/agents/greeting",
		desc: "Warm replies returned as strict JSON",
		icon: MessageSquare,
	},
] as const

export function Home() {
	return (
		<>
			<Hero />
			<Features />
			<Snippet />
			<Agents />
			<CTA />
		</>
	)
}

function Hero() {
	return (
		<section className="relative overflow-hidden">
			{/* Soft radial glow */}
			<div
				aria-hidden="true"
				className="-translate-x-1/2 -top-40 pointer-events-none absolute left-1/2 h-[640px] w-[1100px] rounded-full bg-primary/15 blur-3xl"
			/>
			<div className="mx-auto max-w-6xl px-4 pt-20 pb-24 text-center sm:px-6 sm:pt-28 sm:pb-32">
				<a
					className="group mb-6 inline-flex items-center gap-2"
					href="https://github.com/openotters/openotters/releases"
					rel="noopener noreferrer"
					target="_blank">
					<Badge className="px-3 py-1.5 font-medium text-xs" variant="secondary">
						Early alpha · v0.x →
					</Badge>
				</a>

				<div className="mx-auto mb-8 flex justify-center">
					<OtterMark className="text-7xl leading-none drop-shadow-[0_0_24px_rgba(255,180,120,0.45)] sm:text-8xl" />
				</div>

				<h1 className="mx-auto max-w-3xl font-bold text-4xl text-foreground tracking-tight sm:text-5xl lg:text-6xl">
					Declarative AI agents,{" "}
					<span className="text-primary">like Docker</span>
				</h1>
				<p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
					Write an{" "}
					<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-base">
						Agentfile
					</code>
					, build it into an OCI image, and run it. Runtime, tools, memory,
					sessions, and persistence are handled for you.{" "}
					<span className="text-foreground">
						No code or SDK required — both stay available when you need to
						extend the runtime.
					</span>
				</p>

				<div className="mt-10 flex flex-col items-center gap-4">
					<CopyCommand command="brew install openotters/tap/otters" />
					<div className="flex flex-wrap items-center justify-center gap-3">
						<Button asChild size="lg">
							<Link href="/docs/quickstart">
								Get started <ArrowRight className="size-4" />
							</Link>
						</Button>
						<Button asChild size="lg" variant="outline">
							<a
								href="https://github.com/openotters/openotters"
								rel="noopener noreferrer"
								target="_blank">
								<Github className="size-4" /> Star on GitHub
							</a>
						</Button>
					</div>
				</div>

				<dl className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-6 text-left">
					<Stat label="MIT" value="License" />
					<div className="border-border/60 border-l pl-6">
						<Stat label="OCI" value="Distribution" />
					</div>
					<div className="border-border/60 border-l pl-6">
						<Stat label="Multi-provider" value="LLMs" />
					</div>
				</dl>
			</div>
		</section>
	)
}

function Stat({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<dt className="font-bold text-2xl text-foreground tracking-tight sm:text-3xl">
				{label}
			</dt>
			<dd className="mt-1 text-muted-foreground text-sm">{value}</dd>
		</div>
	)
}

function Features() {
	return (
		<section className="border-border/60 border-t bg-muted/30">
			<div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="font-bold text-3xl text-foreground tracking-tight sm:text-4xl">
						The container model, for agents
					</h2>
					<p className="mt-4 text-lg text-muted-foreground">
						Familiar primitives, swapped from processes to autonomous workers.
					</p>
				</div>

				<ul className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{FEATURES.map((feature) => (
						<li key={feature.title}>
							<Card className="h-full">
								<CardContent className="flex h-full flex-col gap-3">
									<feature.icon className="size-6 text-primary" />
									<h3 className="font-semibold text-foreground text-lg">
										{feature.title}
									</h3>
									<p className="text-muted-foreground text-sm leading-relaxed">
										{feature.body}
									</p>
								</CardContent>
							</Card>
						</li>
					))}
				</ul>
			</div>
		</section>
	)
}

function Snippet() {
	return (
		<section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
			<div className="grid items-center gap-12 lg:grid-cols-2">
				<div>
					<Badge className="mb-4" variant="outline">
						Build your own agent
					</Badge>
					<h2 className="font-bold text-3xl text-foreground tracking-tight sm:text-4xl">
						An Agentfile is all you need
					</h2>
					<p className="mt-4 text-lg text-muted-foreground">
						Pick a model, give it a soul, and bind tools as containers. The
						runtime handles streaming, memory, sessions, and persistence.
					</p>
					<div className="mt-6 flex flex-wrap gap-3">
						<Button asChild>
							<Link href="/agentspec">
								Read the spec <ArrowRight className="size-4" />
							</Link>
						</Button>
						<Button asChild variant="outline">
							<Link href="/docs/quickstart">
								<Terminal className="size-4" /> Quickstart
							</Link>
						</Button>
					</div>
				</div>

				<div className="relative">
					<div
						aria-hidden="true"
						className="-inset-4 absolute rounded-2xl bg-gradient-to-br from-primary/30 via-primary/5 to-transparent blur-2xl"
					/>
					<TerminalWindow className="relative" title="Agentfile">
						<pre className="overflow-x-auto p-5 font-mono text-foreground text-sm leading-relaxed">
							<code>{AGENTFILE}</code>
						</pre>
					</TerminalWindow>
				</div>
			</div>
		</section>
	)
}

function Agents() {
	return (
		<section className="border-border/60 border-y bg-muted/30">
			<div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
				<div className="flex flex-col items-end justify-between gap-6 md:flex-row">
					<div className="max-w-xl">
						<Badge className="mb-4" variant="outline">
							Public registry
						</Badge>
						<h2 className="font-bold text-3xl text-foreground tracking-tight sm:text-4xl">
							Pull and run, no clone needed
						</h2>
						<p className="mt-4 text-lg text-muted-foreground">
							Demo agents live on GHCR. One command and they&apos;re running in
							your daemon.
						</p>
					</div>
					<Button asChild variant="outline">
						<a
							href="https://github.com/orgs/openotters/packages"
							rel="noopener noreferrer"
							target="_blank">
							Browse the registry <ArrowRight className="size-4" />
						</a>
					</Button>
				</div>

				<ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{AGENTS.map((agent) => (
						<li key={agent.name}>
							<Card className="h-full transition-colors hover:border-primary/40">
								<CardContent className="flex flex-col gap-3">
									<div className="flex items-center gap-3">
										<div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
											<agent.icon className="size-4" />
										</div>
										<span className="font-mono font-semibold text-base text-foreground">
											{agent.name}
										</span>
									</div>
									<p className="text-muted-foreground text-sm">{agent.desc}</p>
								</CardContent>
								<CardFooter className="mt-auto">
									<code className="truncate text-muted-foreground text-xs">
										{agent.image}:latest
									</code>
								</CardFooter>
							</Card>
						</li>
					))}
				</ul>
			</div>
		</section>
	)
}

function CTA() {
	return (
		<section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
			<div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card to-muted/40 px-8 py-16 text-center sm:px-16">
				<div
					aria-hidden="true"
					className="-translate-x-1/2 pointer-events-none absolute top-0 left-1/2 h-64 w-[800px] rounded-full bg-primary/15 blur-3xl"
				/>
				<div className="relative">
					<Lock className="mx-auto mb-4 size-6 text-primary" />
					<h2 className="font-bold text-3xl text-foreground tracking-tight sm:text-4xl">
						Run your first agent in 60 seconds
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
						Install the daemon, pull a demo image, start chatting. No accounts,
						no SaaS round-trip.
					</p>
					<div className="mt-8 flex flex-col items-center gap-3">
						<CopyCommand command="otters run ghcr.io/openotters/agents/pinger:latest --name pinger" />
						<Button asChild className="mt-2" size="lg">
							<Link href="/docs/quickstart">
								Read the quickstart <ArrowRight className="size-4" />
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	)
}

import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { RegistryDetail } from "@/components/templates/registry-detail"
import {
	getImageDetails,
	listKnownShortNames,
	resolveName,
} from "@/lib/ghcr"

export const revalidate = 300
export const dynamicParams = false

interface PageProps {
	params: Promise<{ name: string }>
}

export async function generateStaticParams() {
	const names = await listKnownShortNames("agents")
	return names.map((name) => ({ name }))
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { name } = await params
	const full = await resolveName("agents", name)
	if (!full) return { title: "Not found" }
	const details = await getImageDetails(full)
	return {
		title: details ? `${details.shortName} · Agents` : "Not found",
		description:
			details?.description ??
			`OpenOtters agent image on ghcr.io: ${name}.`,
	}
}

export default async function AgentDetailPage({ params }: PageProps) {
	const { name } = await params
	const full = await resolveName("agents", name)
	if (!full) notFound()
	const details = await getImageDetails(full)
	if (!details) notFound()

	const pullCommand = `otters run ${details.ref} --name ${details.shortName}`

	return (
		<RegistryDetail
			bucket="agents"
			details={details}
			emoji="🦦"
			pullCommand={pullCommand}
		/>
	)
}

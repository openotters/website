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
	const names = await listKnownShortNames("tools")
	return names.map((name) => ({ name }))
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { name } = await params
	const full = await resolveName("tools", name)
	if (!full) return { title: "Not found" }
	const details = await getImageDetails(full)
	return {
		title: details ? `${details.shortName} · Binaries` : "Not found",
		description:
			details?.description ??
			`OpenOtters BIN tool image on ghcr.io: ${name}.`,
	}
}

export default async function BinaryDetailPage({ params }: PageProps) {
	const { name } = await params
	const full = await resolveName("tools", name)
	if (!full) notFound()
	const details = await getImageDetails(full)
	if (!details) notFound()

	const pullCommand = `BIN ${details.shortName} ${details.ref} "${details.description.split(/[.!?]/)[0] || details.shortName}"`

	return (
		<RegistryDetail
			bucket="binaries"
			details={details}
			emoji="📦"
			pullCommand={pullCommand}
		/>
	)
}

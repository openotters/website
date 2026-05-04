import "./globals.css"

import { RootProvider } from "fumadocs-ui/provider/next"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import type React from "react"

import ThemeProvider from "@/components/providers/theme-provider"
import { Footer } from "@/components/templates/footer"
import { Navbar } from "@/components/templates/navbar"

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })
const geistMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-geist-mono",
})

export const metadata: Metadata = {
	metadataBase: new URL("https://openotters.io"),
	title: {
		default: "OpenOtters — Declarative AI agents",
		template: "%s · OpenOtters",
	},
	description:
		"Declarative AI agents — like Docker, but for autonomous agents. Write an Agentfile, build an OCI image, and run it. No code or SDK required; both remain available for advanced runtime extensions.",
	keywords: [
		"AI agents",
		"agentfile",
		"declarative agents",
		"OCI",
		"LLM tools",
		"openotters",
	],
	openGraph: {
		title: "OpenOtters — Declarative AI agents",
		description:
			"Like Docker, but for autonomous agents. Write an Agentfile, build it, run it.",
		url: "https://openotters.io",
		siteName: "OpenOtters",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "OpenOtters — Declarative AI agents",
		description:
			"Like Docker, but for autonomous agents. Write an Agentfile, build it, run it.",
	},
	icons: {
		icon: "/favicon.svg",
	},
}

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html
			className={`${geistSans.variable} ${geistMono.variable}`}
			lang="en"
			suppressHydrationWarning>
			<body className="min-h-screen font-sans antialiased">
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					disableTransitionOnChange
					enableSystem>
					<RootProvider>
						<div className="flex min-h-screen flex-col">
							<Navbar />
							<main className="flex-1">{children}</main>
							<Footer />
						</div>
					</RootProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}

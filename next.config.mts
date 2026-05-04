import { createMDX } from "fumadocs-mdx/next"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	output: "standalone",
	reactStrictMode: true,
	poweredByHeader: false,
}

const withMDX = createMDX({})

export default withMDX(nextConfig)

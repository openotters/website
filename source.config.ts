import { defineConfig, defineDocs } from "fumadocs-mdx/config"
import { pageSchema } from "fumadocs-core/source/schema"
import { z } from "zod"

export const docs = defineDocs({
	dir: "content/docs",
})

export const blog = defineDocs({
	dir: "content/blog",
	docs: {
		schema: pageSchema.extend({
			date: z
				.union([z.string(), z.date()])
				.transform((value) =>
					value instanceof Date
						? value.toISOString().slice(0, 10)
						: value,
				),
			author: z.string().optional(),
		}),
	},
})

export default defineConfig()

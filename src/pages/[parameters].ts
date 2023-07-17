
import type { APIRoute } from "astro"
import { match } from "ts-pattern"
import satori from "satori"
import { z } from "zod"
import { ENV, SUPPORTED_FORMATS } from "../env"
import { Placeholder } from "../components/PlaceholderImage"
import sharp from "sharp"
import { createElement } from "react"

// import inter from "@fontsource/inter/files/inter-latin-500-normal.woff"

// export async function getStaticPaths() {
// 	return []
// }

export const get: APIRoute = async ({params, request}) => {
	const literalResult = literalParametersSchema.safeParse(params.parameters)

	if (!literalResult.success) {
		return new Response(JSON.stringify({
			description: "Invalid parameters",
			issues: literalResult.error.issues,
		}), {
			status: 422
		})
	} else {
		const parameters = literalResult.data
		const dark = new URL(request.url).searchParams.has("dark")

		const svg = await satori(
			createElement(Placeholder, {
				...parameters,
				dark
			}), {
			width: parameters.width * parameters.dpr,
			height: parameters.height * parameters.dpr,
			fonts: [
				{
					name: "Inter",
					// data: Buffer.from(inter),
					// data: await fetch(new URL(inter, request.url)).then(x => x.arrayBuffer()),
					data: await fetch("https://unpkg.com/@fontsource/inter/files/inter-latin-500-normal.woff").then(x => x.arrayBuffer()),
				},
			],
		})

		const image = await match(parameters.format)
			.with("svg", () => svg)
			.otherwise(async format => sharp(Buffer.from(svg)).toFormat(format).toBuffer())

		const mediaType = match(parameters.format)
			.with("avif", () => "image/avif")
			.with("heif", () => "image/heif")
			.with("jpeg", () => "image/jpeg")
			.with("jxl", () => "image/jxl")
			.with("png", () => "image/png")
			.with("svg", () => "image/svg+xml")
			.with("webp", () => "image/jpeg")
			.exhaustive()

		return new Response(image, {
			status: 200,
			headers: {
				"Content-Type": mediaType,
			}
		})
	}
}

const positiveInt = z.coerce.number().int().positive()

export const parametersSchema = z.object({
	width: positiveInt.max(ENV.DIMENSION_MAX),
	height: positiveInt.max(ENV.DIMENSION_MAX),
	dpr: positiveInt.max(ENV.DPR_MAX).default(1),
	format: z.enum(SUPPORTED_FORMATS).default(ENV.FORMAT_DEFAULT),
})

export type Parameters = z.infer<typeof parametersSchema>

const literalParametersRegex =
	/^(?<width>\d+)(?:x?(?<height>\d+))?(?:@(?<dpr>\d+)x)?(?:\.(?<format>\w+))?$/

export const literalParametersSchema = z
	.string()
	.regex(literalParametersRegex)
	.transform((value) => {
		const matches = value.match(literalParametersRegex)

		if (!matches || !matches.groups) {
			return {}
		}

		const { width, height, dpr, format } = matches.groups
		return { width, height: height ?? width, dpr, format }
	})
	.pipe(parametersSchema)

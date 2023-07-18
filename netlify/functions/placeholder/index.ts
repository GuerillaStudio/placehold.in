import { builder, type Handler } from "@netlify/functions";
import { match } from "ts-pattern"
import satori from "satori"
import { z } from "zod"
import { Placeholder } from "./components/PlaceholderImage"
import sharp from "sharp"
import { createElement } from "react"
import fetch from "node-fetch"

const ENV = process.env
const SUPPORTED_FORMATS = JSON.parse(process.env.SUPPORTED_FORMATS)

const handler: Handler = async (event: HandlerEvent) => {

    const request = event
    const params = event.path.substring(1)
	const literalResult = literalParametersSchema.safeParse(params)


	if (!literalResult.success) {
		return {
            statusCode: 422,
            headers: {
				"Content-Type": "application/json",
			},
            body: JSON.stringify({
                description: "Invalid parameters",
                issues: literalResult.error.issues,
            })
		}
	} else {
		const parameters = literalResult.data
		const dark = new URL(request.rawUrl).searchParams.has("dark")

		const svg = await satori(
			Placeholder({
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

		return  {
            body: parameters.format === 'svg' ? image : image.toString("base64"),
			isBase64Encoded: parameters.format !== 'svg',
			statusCode: 200,
			headers: {
				"Content-Type": mediaType,
			}
		}
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


export { handler };

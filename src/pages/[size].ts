import type { APIContext } from "astro"
import fs from "fs/promises"
import { z } from "zod"
import { match } from "ts-pattern"
import satori from "satori"
import sharp from "sharp"
import { env, formats } from "../env"

export async function get(context: APIContext): Promise<Response> {
	const parametersResult = parseParameters(context)

	if (!parametersResult.success) {
		return new Response(
			JSON.stringify({
				description: "Invalid parameters",
				issues: parametersResult.error.issues
			}),
			{
				status: 422,
				headers: {
					"Content-Type": "application/json",
				}
			}
		)
	}

	const parameters = parametersResult.data

	return new Response(
		await generateImage(parameters),
		{
			status: 200,
			headers: {
				"Content-Type": match(parameters.format)
					.with("svg", () => "image/svg+xml")
					.with("png", () => "image/png")
					.with("webp", () => "image/jpeg")
					.with("jpeg", () => "image/jpeg")
					.exhaustive()
			}
		}
	)
}

const commonSchema = z.object({
	width: z.coerce.number().positive().step(1).max(env.WIDTH_MAX),
	height: z.coerce.number().positive().step(1).max(env.HEIGHT_MAX),
	dpr: z.coerce.number().positive().step(1).max(env.DPR_MAX).default(env.DPR_DEFAULT),
	format: z.enum(formats).default(env.FORMAT_DEFAULT),
})

const LITERAL_RE = /^(?<width>\d+)(?:x?(?<height>\d+))?(?:@(?<dpr>\d+))?(?:\.(?<format>\w+))?$/

const literalSchema = z.string()
	.regex(LITERAL_RE)
	.transform((value) => {
		const matches = LITERAL_RE.exec(value)

		if (!matches || !matches.groups) {
			return {}
		}

		const {width, height, dpr, format} = matches.groups
		return { width, height: height ?? width, dpr, format }
	})
	.pipe(commonSchema)

const querySchema = commonSchema.partial()

type Parameters = z.infer<typeof literalSchema> & z.infer<typeof querySchema>

function parseParameters(context: APIContext) {
	const literalResult = literalSchema.safeParse(context.params.size)

	if (literalResult.success === false) {
		return literalResult
	}

	// const queryResult = querySchema.safeParse(
	// 	Object.fromEntries(new URL(context.request.url).searchParams.entries())
	// )

	// if (queryResult.success === false) {
	// 	return queryResult
	// }

	return {
		success: true,
		data: {
			// ...queryResult.data,
			...literalResult.data,
		}
	}
}

async function generateImage(parameters: Parameters) {
	const svg = await satori(
		{
			type: "div",
			props: {
				style: {
					height: "100%",
					width: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: "#dfdfdf",
					fontSize: 32,
					fontWeight: 600,
				},
				children: [
					{
						type: "div",
						props: {
							children: `${parameters.width}x${parameters.height}`
						}
					},
					{
						type: "div",
						props: {
							style: {
								fontSize: 16
							},
							children: `@${parameters.dpr} .${parameters.format}`
						}
					},
				],
			},
		}, {
			width: parameters.width * parameters.dpr,
			height: parameters.height * parameters.dpr,
			fonts: [
				{
					name: "Inter",
					data: await fs.readFile("./public/Inter/static/Inter-Regular.ttf"),
				}
			],
		}
	)

	if (parameters.format === "svg") {
		return svg
	} else {
		return sharp(Buffer.from(svg))
			.toFormat(parameters.format)
			.toBuffer()
	}
}

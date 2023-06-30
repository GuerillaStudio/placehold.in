import type { APIContext } from "astro"
import fs from "fs/promises"
import { z } from "zod"
import satori from "satori"

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

	return new Response(
		await generateImage(parametersResult.data),
		{
			status: 200,
			headers: {
				"Content-Type": "image/svg+xml",
			}
		}
	)
}

const MAX_WIDTH = 3200
const MAX_HEIGHT = 3200

const FORMAT_DEFAULT = "svg"
const FORMAT_LIST = ["svg"] as const

const DPR_DEFAULT = 1
const DPR_MAX = 3

const sizeSchema = z.preprocess(value => {
	const [, width, height] = String(value).match(/^(\d+)(?:x(\d+))?$/)

	return ({
		width,
		height: height ?? width
	})
}, z.object({
	width: z.coerce.number().positive().step(1).max(MAX_WIDTH),
	height: z.coerce.number().positive().step(1).max(MAX_HEIGHT),
}))

const optionsSchema = z.object({
	format: z.enum(FORMAT_LIST).default(FORMAT_DEFAULT),
	dpr: z.coerce.number().positive().step(1).max(DPR_MAX).default(DPR_DEFAULT),
})

type Size = z.infer<typeof sizeSchema>
type Options = z.infer<typeof optionsSchema>

function parseParameters(context: APIContext) {
	const sizeResult = sizeSchema.safeParse(context.params.size)

	if (sizeResult.success === false) {
		return sizeResult
	}

	const optionsResult = optionsSchema.safeParse(
		Object.fromEntries(new URL(context.request.url).searchParams.entries())
	)

	if (optionsResult.success === false) {
		return optionsResult
	}

	return {
		success: true,
		data: {
			size: sizeResult.data,
			options: optionsResult.data,
		}
	}
}

async function generateImage({ size, options }: { size: Size, options: Options }) {
	return satori(
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
							children: `${size.width}x${size.height}`
						}
					},
					{
						type: "div",
						props: {
							style: {
								fontSize: 16
							},
							children: Object.entries(options)
								.map(([name, value]) => `[${name}=${String(value)}]`)
								.join("")
						}
					},
				],
			},
		}, {
			width: size.width * options.dpr,
			height: size.height * options.dpr,
			fonts: [
				{
					name: "Inter",
					data: await fs.readFile("./public/Inter/static/Inter-Regular.ttf"),
				}
			],
		}
	)
}

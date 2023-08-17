import { z } from "zod"
import { match } from "ts-pattern"
import satori from "satori"
import { html } from "satori-html"
import { readFile } from "fs/promises"
import sharp from "sharp"

const SUPPORTED_FORMATS = ["png", "jpeg", "svg", "webp", "avif", "heif"] as const
type Format = typeof SUPPORTED_FORMATS[number]

export async function handle(value: string) {
	const literalResult = literalParametersSchema.safeParse(value)

	if (!literalResult.success) {
		return {
			success: false,
			error: literalResult.error
		}
	} else {
		const parameters = literalResult.data
		const svg = await placeholderSvg(parameters)

		const binary = match(parameters.format)
			.with("svg", () => false)
			.otherwise(() => true)

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

		return {
			success: true,
			data: {binary, image, mediaType}
		}
	}
}

async function placeholderSvg(parameters: Parameters) {
	return satori(
		PlaceholderHtml(parameters),
		{
			width: Math.round(parameters.width * parameters.dpr),
			height: Math.round(parameters.height * parameters.dpr),
			fonts: [
				{
					name: "Inter",
					data: await readFile("node_modules/@fontsource/inter/files/inter-latin-500-normal.woff"),
				},
			],
		}
	)
}

function PlaceholderHtml(props: Parameters) {
	const darkColor = "#1a1110"
	const lightColor = "#f7f7f7"

	const fontSizeMax = 45
	const fontSizeRatio = .17
	const fontSize = Math.min(Math.min(props.width, props.height) * props.dpr * fontSizeRatio, fontSizeMax * props.dpr)

	return html`
		<div
			style="
				height: 100%;
				width: 100%;
				display: flex;
				flexDirection: column;
				alignItems: center;
				justifyContent: center;
				backgroundColor: ${props.dark ? darkColor : lightColor};
				color: ${props.dark ? lightColor : darkColor};
				fontSize: ${fontSize}px;
				fontWeight: 600;
			"
		>
			<div>${`${props.width}x${props.height}`}</div>
			<div>${`@${props.dpr}x .${props.format}`}</div>
		</div>
	`
}

export const parametersSchema = z.object({
	width: z.coerce.number().positive().int().max(Number(process.env.DIMENSION_MAX)),
	height: z.coerce.number().positive().int().max(Number(process.env.DIMENSION_MAX)),
	dpr: z.coerce.number().positive().multipleOf(0.1).max(Number(process.env.DPR_MAX)).default(1),
	format: z.enum(SUPPORTED_FORMATS).default(process.env.FORMAT_DEFAULT as Format),
	dark: z.boolean(),
})

export type Parameters = z.infer<typeof parametersSchema>

const literalParametersRegex =
	/^(?<width>\d+)(?:x?(?<height>\d+))?(?:@(?<dpr>\d+(?:\.\d+)?)x)?(?:\.(?<format>\w+))?(?:\/(?<dark>dark))?/

export const literalParametersSchema = z
	.string()
	.regex(literalParametersRegex)
	.transform((value) => {
		const matches = value.match(literalParametersRegex)

		if (!matches || !matches.groups) {
			return {}
		}

		const { width, height, dpr, format, dark } = matches.groups
		return { width, height: height ?? width, dpr, format, dark: !!dark }
	})
	.pipe(parametersSchema)

import { z } from "zod"
import { match } from "ts-pattern"
import satori from "satori"
import { html } from "satori-html"
import sharp from "sharp"

const SUPPORTED_FORMATS = ["avif", "heif", "jpeg", "jxl", "png", "svg", "webp"] as const
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
			width: parameters.width * parameters.dpr,
			height: parameters.height * parameters.dpr,
			fonts: [
				{
					name: "Inter",
					data: await fetch("https://unpkg.com/@fontsource/inter/files/inter-latin-500-normal.woff").then(x => x.arrayBuffer()),
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

const positiveInt = z.coerce.number().int().positive()

export const parametersSchema = z.object({
	width: positiveInt.max(Number(process.env.DIMENSION_MAX)),
	height: positiveInt.max(Number(process.env.DIMENSION_MAX)),
	dpr: positiveInt.max(Number(process.env.DPR_MAX)).default(1),
	format: z.enum(SUPPORTED_FORMATS).default(process.env.FORMAT_DEFAULT as Format),
	dark: z.boolean(),
})

export type Parameters = z.infer<typeof parametersSchema>

const literalParametersRegex =
	/^(?<width>\d+)(?:x?(?<height>\d+))?(?:@(?<dpr>\d+)x)?(?:\.(?<format>\w+))?(?:\/(?<dark>dark))?/

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

import { z } from "zod"

export const SUPPORTED_FORMATS = [
	"avif",
	"heif",
	"jpeg",
	"jxl",
	"png",
	"svg",
	"webp",
] as const

const positiveInt = z.coerce.number().int().positive()

const envSchema = z.object({
	DIMENSION_MAX: positiveInt,
	DPR_MAX: positiveInt,
	FORMAT_DEFAULT: z.enum(SUPPORTED_FORMATS),
})

type Env = z.infer<typeof envSchema>

export const ENV: Env = {
	DIMENSION_MAX: 1600,
	DPR_MAX: 5,
	FORMAT_DEFAULT: "svg",
}

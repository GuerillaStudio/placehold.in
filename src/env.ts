import { z } from "zod"

export const formats = ["svg", "png", "jpeg", "webp"] as const

const positiveIntSchema = z.coerce.number().positive().step(1)

const envSchema = z.object({
	WIDTH_MAX: positiveIntSchema,
	HEIGHT_MAX: positiveIntSchema,
	FORMAT_DEFAULT: z.enum(formats),
	FORMAT_LIST: z.string()
		.transform(value => value.split(","))
		.pipe(z.array(z.enum(formats)).nonempty()),
	DPR_DEFAULT: positiveIntSchema,
	DPR_MAX: positiveIntSchema,
})

export const env = envSchema.parse(import.meta.env)

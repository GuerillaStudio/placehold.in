import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions"
import { builder } from "@netlify/functions"
import { handle } from "../placeholder"

const ttl = 60 * 60 * 24 * 364

const main: Handler = async (event: HandlerEvent, context: HandlerContext) => {
	console.log(event.path)

	const result = await handle(event.path.substring(1))

	if (!result.success) {
		return {
			statusCode: 422,
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				description: "Invalid parameters",
				issues: result.error.issues,
			}),
			ttl,
		}
	} else {
		const { image, binary, mediaType } = result.data

		return  {
			statusCode: 200,
			headers: {
				"Content-Type": mediaType,
			},
			body: binary ? image.toString("base64") : image,
			isBase64Encoded: binary,
			ttl,
		}
	}
}

const handler = builder(main)
export { handler }


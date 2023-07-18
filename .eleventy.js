require('dotenv').config()

module.exports = function(eleventyConfig) {
    eleventyConfig.addGlobalData("BASE_URL", process.env.URL ?? "")
    eleventyConfig.addGlobalData("SUPPORTED_FORMATS", ["avif", "heif", "jpeg", "jxl", "png", "svg", "webp"])
    eleventyConfig.addGlobalData("DIMENSION_MAX", process.env.DIMENSION_MAX)
    eleventyConfig.addGlobalData("DPR_MAX", process.env.DPR_MAX)
    eleventyConfig.addGlobalData("FORMAT_DEFAULT", process.env.FORMAT_DEFAULT)

    eleventyConfig.addNunjucksShortcode("placeholder", function({ width, height, dpr, format, dark, lazy }) {
        const path = [
            `${this.ctx.BASE_URL}/`,
            height ? `${width}x${height}` : width,
            dpr && `@${dpr}x`,
            format && `.${format}`,
            dark && "/dark",
        ].filter(x => x != null).join("")

        const description = [
            "A",
            dark && "dark",
            height ? "rectangle" : "square",
            format,
            "placeholder image",
            dpr && `scaled ${dpr} times`,
        ].filter(x => x != null).join(" ")

        return `
            <div class="not-prose">
                <figure>
                    <img src="${path}" width="${width}" height="${height ?? width}" alt="${description}" loading="${ lazy ? 'lazy' : 'eager' }"  fetchpriority="${ lazy ? 'low' : 'high' }" class="mx-auto text-base"  />
                    <figcaption class="mt-2">
                        <code class="break-all text-xs">${path}</code>
                    </figcaption>
                </figure>
            </div>
        `
    })

    // Copy the static assets to the output folder
    eleventyConfig.addPassthroughCopy({ "./static/": "/"})
    // copy & hot reload on "addPassthroughCopy" files
    eleventyConfig.setServerPassthroughCopyBehavior("copy")

    return {
        dir: {
        	input: "src",
        }
    };
};

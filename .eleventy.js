module.exports = function(eleventyConfig) {

    eleventyConfig.addShortcode("placeholderExample", function(props) {

        const { origin, width, height, dpr, format, dark, lazy } = props

        const path = [
            `${origin}/`,
            height ? `${width}x${height}` : width,
            dpr && `@${dpr}x`,
            format && `.${format}`,
            dark && "?dark",
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

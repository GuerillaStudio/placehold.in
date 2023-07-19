require('dotenv').config()

module.exports = function(eleventyConfig) {
    const BASE_URL = process.env.URL ?? ""

    eleventyConfig.addGlobalData("BASE_URL", BASE_URL)
    eleventyConfig.addGlobalData("SUPPORTED_FORMATS", ["png", "jpeg", "svg", "webp", "avif", "heif"])
    eleventyConfig.addGlobalData("DIMENSION_MAX", process.env.DIMENSION_MAX)
    eleventyConfig.addGlobalData("DPR_MAX", process.env.DPR_MAX)
    eleventyConfig.addGlobalData("FORMAT_DEFAULT", process.env.FORMAT_DEFAULT)

    eleventyConfig.addFilter("placeholderUrl", function({ width, height, dpr, format, dark }) {
        return [
            `${BASE_URL}/`,
            height ? `${width}x${height}` : width,
            dpr && `@${dpr}x`,
            format && `.${format}`,
            dark && "/dark",
        ].filter(x => x != null).join("")
    })

    eleventyConfig.addFilter("placeholderDescription", function({ width, height, dpr, format, dark }) {
        return [
            "A",
            dark && "dark",
            height !== width ? "rectangle" : "square",
            format,
            "placeholder image",
            dpr && `scaled ${dpr} times`,
        ].filter(x => x != null).join(" ")
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

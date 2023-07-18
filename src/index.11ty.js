
class Home {
    data() {
      return {
        layout: "layout.njk",
      };
    }

    render(data) {

    const formats = JSON.parse(data.global.env.SUPPORTED_FORMATS)

    return `

        <p class="lead">
        A quick way to display placeholder images during mockups and
        development using a simple and comprehensive syntax.
        </p>

        <div class="border-2 border-gray-200 bg-gray-100 p-2">
        <span>${data.global.origin}/</span><span class="bg-blue-100">300x200</span><span class="bg-yellow-100">@2x</span><span class="bg-green-100">.png</span><span class="bg-red-100">?dark</span>
        </div>

        <menu>
        <ul>
            <li>
                <a href="#dimensions" class="bg-blue-100">
                    Dimensions
                </a>
            </li>
            <li>
                <a href="#dpr" class="bg-yellow-100">
                    Device pixel ratio
                </a>
            </li>
            <li>
                <a href="#format" class="bg-green-100">
                    Format
                </a>
            </li>
            <li>
                <a href="#theme" class="bg-red-100">
                    Theme
                </a>
            </li>
        </ul>
        </menu>

        ${this.placeholderExample({origin: data.global.origin, format:'png', width:600, height:200, dark:true })}

        <section id="dimensions">
        <h2>
            <span class="bg-blue-100">Dimensions</span>
        </h2>

        <p>
            Required. Allowed value for both width and height is a
            positive integer between <code>1</code> and
            <code>${data.global.env.DIMENSION_MAX}</code>.
        </p>

        <div class="grid grid-cols-2 xs:grid-cols-4 gap-2 md:gap-5 items-center justify-items-center text-center">
            <div class="col-span-2">
            ${this.placeholderExample({ origin: data.global.origin, width:200 })}
            </div>
            <div class="col-span-2">
            ${this.placeholderExample({ origin: data.global.origin, width:300, height:200 })}
            </div>
            <div class="col-span-3">
            ${this.placeholderExample({ origin: data.global.origin, width:400, height:300, lazy:true })}
            </div>
            <div>
            ${this.placeholderExample({ origin: data.global.origin, width:100, height:200, lazy:true })}
            </div>
        </div>
        </section>

        <section id="dpr">
        <h2>
            <span class="bg-yellow-100">Device pixel ratio</span>
        </h2>

        <p>
            Optional with <code>1</code> as default. Allowed value is a
            positive integer between <code>1</code> and
            <code>${data.global.env.DPR_MAX}</code>.
        </p>

        <div class="grid grid-cols-1 xs:grid-cols-2 gap-2 md:gap-5 items-center justify-items-center text-center">
            ${this.placeholderExample({ origin: data.global.origin, width:200, dpr:2, lazy: true })}
            ${this.placeholderExample({ origin: data.global.origin, width:200, dpr:4, lazy: true })}
        </div>
        </section>

        <section id="format">
        <h2>
            <span class="bg-green-100">Format</span>
        </h2>

        <p>
            Optional with <code>${data.global.env.FORMAT_DEFAULT}</code> as default. Allowed values are ${formats.map((format, index) => {
                return `
                    ${index > 0 && (index !== formats.length - 1 ? ", " : " and ")}
                    <code>${format}</code>
                `
            }).join('')}.
        </p>

        <div class="grid grid-cols-1 xs:grid-cols-2 gap-2 md:gap-5 items-center justify-items-center text-center">
            ${this.placeholderExample({ origin: data.global.origin, width:200, format: 'png', lazy:true })}
            ${this.placeholderExample({ origin: data.global.origin, width:200, format: 'jpeg', lazy:true })}
            ${this.placeholderExample({ origin: data.global.origin, width:200, format: 'webp', lazy:true })}
            ${this.placeholderExample({ origin: data.global.origin, width:200, format: 'avif', lazy:true })}
        </div>
        </section>

        <section id="theme">
        <h2>
            <span class="bg-red-100">Theme</span>
        </h2>

        <p>
            Optional using the light theme as default. When specified
            the dark theme is used instead.
        </p>

        <div class="grid grid-cols-1 xs:grid-cols-2 gap-2 md:gap-5 items-center justify-items-center text-center">
            ${this.placeholderExample({ origin: data.global.origin, width: 200, lazy: true })}
            ${this.placeholderExample({ origin: data.global.origin, width: 200, dark: true, lazy: true })}
        </div>
        </section>

      `
    }
}


module.exports = Home;

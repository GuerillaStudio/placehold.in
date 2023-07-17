import { defineConfig } from 'astro/config';
import netlify from "@astrojs/netlify/functions";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";


// https://astro.build/config
export default defineConfig({
  // site: "https://placehold.in",
  output: "server",
  adapter: netlify(),
  integrations: [tailwind(), react()],
  build: {
    split: true
  },
  // vite: {
  //   plugins: [
  //     rawFonts([".woff"])
  //   ]
  // },
});

// // adapted from mattjennings
// // https://github.com/mattjennings/mattjennings.io/blob/master/vite.config.js
// function rawFonts(ext) {
//   return {
//     name: 'vite-plugin-raw-fonts',
//     resolveId(id) {
//       return ext.some(e => id.endsWith(e)) ? id : null;
//     },
//     transform(code, id) {
//       if (ext.some(e => id.endsWith(e))) {
//         const buffer = fs.readFileSync(id);
//         console.log(id);
//         return {
//           code: `export default ${JSON.stringify(buffer)}`,
//           map: null
//         };
//       }
//     }
//   };
// }

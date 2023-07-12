/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				primary: '#8f358d'
			},
			screens: {
				'xs': '400px'
			}
		},

	},
	plugins: [
		require('@tailwindcss/typography')
	],
}

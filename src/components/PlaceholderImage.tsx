/** @jsxImportSource react */

export function Placeholder(props: Parameters & { dark: boolean }) {
	const darkColor = "#1a1110"
	const lightColor = "#f7f7f7"

	const fontSizeMax = 45
	const fontSizeRatio = .17
	const fontSize = Math.min(Math.min(props.width, props.height) * props.dpr * fontSizeRatio, fontSizeMax * props.dpr)

	return (
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: props.dark ? darkColor : lightColor,
				color: props.dark ? lightColor : darkColor,
				fontSize: fontSize,
				fontWeight: 600,
			}}
		>
			<div>{`${props.width}x${props.height}`}</div>
			<div>{`@${props.dpr}x .${props.format}`}</div>
		</div>
	)
}

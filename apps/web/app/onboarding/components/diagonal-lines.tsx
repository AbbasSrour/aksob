import { useEffect, useState } from "react";

export function OnboardingDiagonalLines() {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	return (
		<div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
			{/* Far left line */}
			<div
				className="absolute animate-diagonal-line-draw"
				style={{
					top: "-16%",
					right: "16%",
					width: "85vw",
					height: "1px",
					backgroundColor: "#e5e7eb",
					animationDelay: "0.1s",
				}}
			/>

			{/* Left of center */}
			<div
				className="absolute animate-diagonal-line-draw"
				style={{
					top: "-8%",
					right: "8%",
					width: "85vw",
					height: "1px",
					backgroundColor: "#e5e7eb",
					animationDelay: "0.3s",
				}}
			/>

			{/* Center line */}
			<div
				className="absolute animate-diagonal-line-draw"
				style={{
					top: 0,
					right: 0,
					width: "85vw",
					height: "1px",
					backgroundColor: "#e5e7eb",
					animationDelay: "0.5s",
				}}
			/>

			{/* Right of center */}
			<div
				className="absolute animate-diagonal-line-draw"
				style={{
					top: "8%",
					right: "-8%",
					width: "85vw",
					height: "1px",
					backgroundColor: "#e5e7eb",
					animationDelay: "0.7s",
				}}
			/>

			{/* Far right line */}
			<div
				className="absolute animate-diagonal-line-draw"
				style={{
					top: "16%",
					right: "-16%",
					width: "85vw",
					height: "1px",
					backgroundColor: "#e5e7eb",
					animationDelay: "0.9s",
				}}
			/>
		</div>
	);
}

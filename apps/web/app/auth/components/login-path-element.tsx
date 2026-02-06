import { useEffect, useRef } from "react";
import { cn } from "~/app/lib/utils";

interface Point {
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
	alpha: number;
	baseAlpha: number;
	phase: number;
}

interface Node {
	label: string;
	x: number; // 0-1 relative
	y: number; // 0-1 relative
	color: string;
}

export function LoginPathElement({ className }: { className?: string }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d", { alpha: true });
		if (!ctx) return;

		let width = (canvas.width = window.innerWidth);
		let height = (canvas.height = window.innerHeight);

		// Configuration
		// Using RGB values to easily compose rgba strings
		const PRIMARY_RGB = "7, 105, 81"; // #076951 - Brand Green

		const PARTICLE_COUNT = 80;
		const CONNECTION_DIST = 170;

		// Nodes - "Faculty -> Alumni -> Students" path
		// Positioned on the right side of the screen (mirrored to left at render)
		const nodes: Node[] = [
			{ label: "FACULTY", x: 0.65, y: 0.2, color: PRIMARY_RGB },
			{ label: "ALUMNI", x: 0.78, y: 0.5, color: PRIMARY_RGB },
			{ label: "STUDENTS", x: 0.65, y: 0.8, color: PRIMARY_RGB },
		];

		// Particles
		const particles: Point[] = [];
		for (let i = 0; i < PARTICLE_COUNT; i++) {
			particles.push({
				x: Math.random() * width,
				y: Math.random() * height,
				vx: (Math.random() - 0.5) * 0.15,
				vy: (Math.random() - 0.5) * 0.15,
				size: Math.random() * 1.5 + 0.5,
				alpha: Math.random() * 0.4 + 0.1,
				baseAlpha: Math.random() * 0.4 + 0.1,
				phase: Math.random() * Math.PI * 2,
			});
		}

		// Mouse interaction
		const mouse = { x: -1000, y: -1000 };
		const handleMouseMove = (e: MouseEvent) => {
			mouse.x = e.clientX;
			mouse.y = e.clientY;
		};
		window.addEventListener("mousemove", handleMouseMove);

		const handleResize = () => {
			width = canvas.width = window.innerWidth;
			height = canvas.height = window.innerHeight;
		};
		window.addEventListener("resize", handleResize);

		// Helper for Cubic Bezier interpolation
		function getBezierPoint(
			t: number,
			p0: { x: number; y: number },
			p1: { x: number; y: number },
			cp1: { x: number; y: number },
			cp2: { x: number; y: number },
		) {
			const oneMinusT = 1 - t;
			return {
				x:
					oneMinusT ** 3 * p0.x +
					3 * oneMinusT ** 2 * t * cp1.x +
					3 * oneMinusT * t ** 2 * cp2.x +
					t ** 3 * p1.x,
				y:
					oneMinusT ** 3 * p0.y +
					3 * oneMinusT ** 2 * t * cp1.y +
					3 * oneMinusT * t ** 2 * cp2.y +
					t ** 3 * p1.y,
			};
		}

		// Animation Loop
		let animationFrameId: number;
		let time = 0;
		// Special "Packets" traveling properly along the path
		const packets = [0, 0.35, 0.7]; // Offsets

		const render = () => {
			time += 0.005; // Slower, smoother time
			ctx.clearRect(0, 0, width, height);

			// Subtle left-side wash to lift contrast behind the path
			const wash = ctx.createRadialGradient(
				width * 0.18,
				height * 0.55,
				0,
				width * 0.18,
				height * 0.55,
				Math.min(width, height) * 0.55,
			);
			wash.addColorStop(0, "rgba(7, 105, 81, 0.08)");
			wash.addColorStop(0.5, "rgba(7, 105, 81, 0.03)");
			wash.addColorStop(1, "rgba(7, 105, 81, 0)");
			ctx.fillStyle = wash;
			ctx.fillRect(0, 0, width, height);

			// 1. Draw Background Particles & Constellations
			ctx.lineWidth = 0.5;
			particles.forEach((p, i) => {
				p.x += p.vx;
				p.y += p.vy;

				// Wrap around
				if (p.x < 0) p.x = width;
				if (p.x > width) p.x = 0;
				if (p.y < 0) p.y = height;
				if (p.y > height) p.y = 0;

				// Twinkle
				p.alpha = p.baseAlpha + Math.sin(time * 3 + p.phase) * 0.2;

				// Draw Particle
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(${PRIMARY_RGB}, ${p.alpha})`;
				ctx.fill();

				// Connect to nearby particles
				for (let j = i + 1; j < particles.length; j++) {
					const p2 = particles[j];
					const dx = p.x - p2.x;
					const dy = p.y - p2.y;
					const dist = Math.sqrt(dx * dx + dy * dy);

					if (dist < CONNECTION_DIST) {
						ctx.beginPath();
						ctx.moveTo(p.x, p.y);
						ctx.lineTo(p2.x, p2.y);
						ctx.strokeStyle = `rgba(${PRIMARY_RGB}, ${
							0.1 * (1 - dist / CONNECTION_DIST)
						})`;
						ctx.stroke();
					}
				}

				// Repel/Connect Mouse
				const mDx = p.x - mouse.x;
				const mDy = p.y - mouse.y;
				const mDist = Math.sqrt(mDx * mDx + mDy * mDy);
				if (mDist < 250) {
					ctx.beginPath();
					ctx.moveTo(p.x, p.y);
					ctx.lineTo(mouse.x, mouse.y);
					ctx.strokeStyle = `rgba(${PRIMARY_RGB}, ${0.12 * (1 - mDist / 250)})`;
					ctx.stroke();
				}
			});

			// 2. Main Path Logic
			const leftPadding = 75;
			const verticalShift = height * 0;
			let nodePoints = nodes.map((n) => ({
				...n,
				x: (1 - n.x) * width,
				y: n.y * height + verticalShift,
			}));
			const minNodeX = Math.min(...nodePoints.map((n) => n.x));
			const shiftX = leftPadding - minNodeX;
			if (shiftX !== 0) {
				nodePoints = nodePoints.map((n) => ({
					...n,
					x: n.x + shiftX,
				}));
			}

			if (nodePoints.length >= 3) {
				const p0 = nodePoints[0];
				const p1 = nodePoints[1];
				const p2 = nodePoints[2];

				// Define Control Points for a nice S-curve or Arc
				// p0 -> p1
				const curve1CX1 = p0.x + (p1.x - p0.x) * 0.1;
				const curve1CY1 = p0.y + (p1.y - p0.y) * 0.8;
				const curve1CX2 = p1.x - (p1.x - p0.x) * 0.2; // tighter entry
				const curve1CY2 = p1.y - 40;

				// p1 -> p2
				const curve2CX1 = p1.x - 20;
				const curve2CY1 = p1.y + 40;
				const curve2CX2 = p2.x - (p2.x - p1.x) * 0.1;
				const curve2CY2 = p2.y - (p2.y - p1.y) * 0.5;

				// Draw The Path (Glow)
				ctx.save();
				ctx.shadowBlur = 16;
				ctx.shadowColor = `rgba(${PRIMARY_RGB}, 0.25)`;
				ctx.strokeStyle = `rgba(${PRIMARY_RGB}, 0.28)`;
				ctx.lineWidth = 2;
				ctx.setLineDash([3, 10]);

				ctx.beginPath();
				ctx.moveTo(p0.x, p0.y);
				ctx.bezierCurveTo(
					curve1CX1,
					curve1CY1,
					curve1CX2,
					curve1CY2,
					p1.x,
					p1.y,
				);
				ctx.stroke();

				ctx.beginPath();
				ctx.moveTo(p1.x, p1.y);
				ctx.bezierCurveTo(
					curve2CX1,
					curve2CY1,
					curve2CX2,
					curve2CY2,
					p2.x,
					p2.y,
				);
				ctx.stroke();
				ctx.restore();

				// 3. Draw Flow Packets along the path
				// We treat the two curves as one timeline t=0..2
				packets.forEach((offset) => {
					const t = (time * 0.4 + offset) % 2; // Loop 0 to 2
					let pos = { x: 0, y: 0 };
					let opacity = 1;

					if (t <= 1) {
						// First segment
						pos = getBezierPoint(
							t,
							p0,
							p1,
							{ x: curve1CX1, y: curve1CY1 },
							{ x: curve1CX2, y: curve1CY2 },
						);
						// Fade in/out at nodes
						opacity = Math.sin(t * Math.PI);
					} else {
						// Second segment (t from 1 to 2)
						const localT = t - 1;
						pos = getBezierPoint(
							localT,
							p1,
							p2,
							{ x: curve2CX1, y: curve2CY1 },
							{ x: curve2CX2, y: curve2CY2 },
						);
						opacity = Math.sin(localT * Math.PI);
					}

					// Draw Packet
					ctx.save();
					ctx.beginPath();
					ctx.arc(pos.x, pos.y, 3.5, 0, Math.PI * 2);
					const grad = ctx.createRadialGradient(
						pos.x,
						pos.y,
						0,
						pos.x,
						pos.y,
						6,
					);

					// Use PRIMARY_RGB (Darker Green) instead of ACCENT
					grad.addColorStop(0, `rgba(${PRIMARY_RGB}, ${opacity * 0.8})`);
					grad.addColorStop(1, `rgba(${PRIMARY_RGB}, 0)`);
					ctx.fillStyle = grad;
					ctx.fill();
					ctx.restore();
				});

				// Draw Path Nodes
				nodePoints.forEach((n, idx) => {
					// 1. Outer Orbit Ring
					ctx.beginPath();
					ctx.arc(n.x, n.y, 16, 0, Math.PI * 2);
					ctx.strokeStyle = `rgba(${PRIMARY_RGB}, 0.14)`;
					ctx.lineWidth = 1.2;
					ctx.setLineDash([]); // solid
					ctx.stroke();

					// 2. Rotating blip on orbit
					const orbitSpeed = time * (idx % 2 === 0 ? 1 : -1) + idx;
					const orbX = n.x + Math.cos(orbitSpeed) * 16;
					const orbY = n.y + Math.sin(orbitSpeed) * 16;
					ctx.beginPath();
					ctx.arc(orbX, orbY, 1.5, 0, Math.PI * 2);
					ctx.fillStyle = `rgba(${PRIMARY_RGB}, 0.5)`; // Less intense
					ctx.fill();

					// 3. Inner Glow (Toned Down)
					// Reduced oscillation range (4-6 instead of 6-8)
					const glowSize = 3.5 + Math.sin(time * 2 + idx) * 1.8;
					const glowGrad = ctx.createRadialGradient(
						n.x,
						n.y,
						1,
						n.x,
						n.y,
						glowSize * 2.5,
					);
					glowGrad.addColorStop(0, `rgba(${PRIMARY_RGB}, 0.2)`); // Lower opacity
					glowGrad.addColorStop(1, `rgba(${PRIMARY_RGB}, 0)`);
					ctx.fillStyle = glowGrad;
					ctx.beginPath();
					ctx.arc(n.x, n.y, glowSize * 2.6, 0, Math.PI * 2);
					ctx.fill();

					// 4. Core Circle
					ctx.beginPath();
					ctx.arc(n.x, n.y, 3.5, 0, Math.PI * 2);
					ctx.fillStyle = `rgb(${PRIMARY_RGB})`;
					ctx.fill();
					// White center spec
					ctx.beginPath();
					ctx.arc(n.x, n.y, 1.2, 0, Math.PI * 2);
					ctx.fillStyle = "rgba(255,255,255,0.8)";
					ctx.fill();

					// 5. Label
					ctx.fillStyle = `rgba(${PRIMARY_RGB}, 0.7)`;
					ctx.font = "600 10px Inter, sans-serif";
					ctx.letterSpacing = "1.5px";
					ctx.textAlign = "right";
					ctx.fillText(n.label, n.x - 22, n.y + 3);
				});
			}

			animationFrameId = requestAnimationFrame(render);
		};
		render();

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("resize", handleResize);
			cancelAnimationFrame(animationFrameId);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className={cn("fixed inset-0 z-0 pointer-events-none", className)}
		/>
	);
}

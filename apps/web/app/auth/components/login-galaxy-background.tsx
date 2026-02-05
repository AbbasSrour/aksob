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

export function LoginGalaxyBackground({ className }: { className?: string }) {
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
		const ACCENT_RGB = "0, 255, 163"; // #00ffa3 - Bright Teal for highlights
		
		const PARTICLE_COUNT = 60; // Reduced for cleaner look
		const CONNECTION_DIST = 150;

		// Nodes - "Faculty -> Alumni -> Students" path
		// Positioned on the right side of the screen
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
			cp2: { x: number; y: number }
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
				p.alpha = p.baseAlpha + Math.sin(time * 3 + p.phase) * 0.15;

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
							0.08 * (1 - dist / CONNECTION_DIST)
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
			const nodePoints = nodes.map((n) => ({
				...n,
				x: n.x * width,
				y: n.y * height,
			}));

			// --- NEW: THE GLOBAL MESH (The "Wild" Minimal Element) ---
			// A subtle rotating wireframe globe representing the network
			// Positioned high-right to oversee the network
			const globeX = width * 0.5; 
			const globeY = height * 0.28; // Higher up
			const globeRadius = Math.min(width, height) * 0.2;
			
			ctx.save();
			ctx.translate(globeX, globeY);
			// Rotate the whole system slowly
			const rotation = time * 0.15;
			ctx.rotate(0.2); // Tilt axis
			
			// Draw Latitudes/Longitudes
			ctx.strokeStyle = `rgba(${PRIMARY_RGB}, 0.08)`;
			ctx.lineWidth = 1;
			
			// 3D Projection Helper
			const numMeridians = 12;
			const numParallels = 8;
			
			// Draw Meridians
			for (let i = 0; i < numMeridians; i++) {
				const phi = (Math.PI * 2 * i) / numMeridians;
				ctx.beginPath();
				for (let j = 0; j <= 40; j++) {
					const theta = (Math.PI * j) / 40; 
					const r = globeRadius;
					const x3 = r * Math.sin(theta) * Math.cos(phi + rotation);
					const y3 = r * Math.cos(theta);
					const z3 = r * Math.sin(theta) * Math.sin(phi + rotation);
					
					const scale = 1 + z3 / 1000;
					const px = x3 * scale;
					const py = y3 * scale;
					
					if (j === 0) ctx.moveTo(px, py);
					else ctx.lineTo(px, py);
				}
				ctx.stroke();
			}

			// Draw Parallels
			for (let i = 1; i < numParallels; i++) {
				const theta = (Math.PI * i) / numParallels;
				const rRing = globeRadius * Math.sin(theta);
				const yRing = globeRadius * Math.cos(theta);
				
				ctx.beginPath();
				for (let j = 0; j <= 50; j++) {
					const phi = (Math.PI * 2 * j) / 50;
					const x3 = rRing * Math.cos(phi + rotation); 
					const z3 = rRing * Math.sin(phi + rotation);
					const y3 = yRing;

					const scale = 1 + z3 / 1000;
					const px = x3 * scale;
					const py = y3 * scale;

					if (j === 0) ctx.moveTo(px, py);
					else ctx.lineTo(px, py);
				}
				ctx.stroke();
			}
			
			// Draw "Live Hubs" - Darker Green, subtler
			const hubs = [
				{ phi: 0.5, theta: 1.2 }, // Beirut
				{ phi: 2.1, theta: 1.0 }, // Dubai
				{ phi: 4.5, theta: 0.8 }, // NYC
				{ phi: 3.8, theta: 0.9 }, // London
				{ phi: 5.8, theta: 1.1 }, // Paris
			];

			hubs.forEach(hub => {
				const currentPhi = hub.phi + rotation;
				const r = globeRadius;
				const x3 = r * Math.sin(hub.theta) * Math.cos(currentPhi);
				const y3 = r * Math.cos(hub.theta);
				const z3 = r * Math.sin(hub.theta) * Math.sin(currentPhi);
				
				if (z3 > -20) {
					const scale = 1 + z3 / 1000;
					const px = x3 * scale;
					const py = y3 * scale;
					
					// Draw Pin - Dark Green
					ctx.beginPath();
					ctx.arc(px, py, 1.5, 0, Math.PI * 2);
					ctx.fillStyle = `rgb(${PRIMARY_RGB})`; // Darker
					ctx.fill();
					
					// Pulse ring - very subtle
					const pulse = Math.abs(Math.sin(time * 1.5 + hub.phi));
					ctx.beginPath();
					ctx.arc(px, py, 1.5 + pulse * 4, 0, Math.PI * 2);
					ctx.strokeStyle = `rgba(${PRIMARY_RGB}, ${0.3 - pulse * 0.2})`; // Darker, faint
					ctx.stroke();
				}
			});

			ctx.restore();

			// Connection Line: Globe -> Alumni Node
			// Giving significance: The globe connects to the network path
			if (nodePoints.length > 1) {
				const alumniNode = nodePoints[1]; // ALUMNI is index 1
				ctx.beginPath();
				ctx.moveTo(globeX, globeY + globeRadius); // Bottom of globe
				// Curve towards Alumni node
				const midX = globeX;
				const midY = alumniNode.y - 50;
				ctx.quadraticCurveTo(midX, midY, alumniNode.x, alumniNode.y);
				
				ctx.strokeStyle = `rgba(${PRIMARY_RGB}, 0.1)`;
				ctx.setLineDash([1, 10]); // Very faint connection
				ctx.lineDashOffset = -time * 10; // Moving current
				ctx.lineWidth = 1;
				ctx.stroke();
			}

			// Add Label
			ctx.save();
			ctx.translate(globeX, globeY);
			
			ctx.textAlign = "center";
			ctx.font = "10px Inter, sans-serif";
			ctx.fillStyle = `rgba(${PRIMARY_RGB}, 0.6)`;
			// ctx.fillText("GLOBAL REACH", 0, globeRadius + 30);
			
			// Counter - Slow and steady
			const count = Math.floor(45000 + time * 0.2); 
			ctx.font = "bold 10px Inter, sans-serif";
			ctx.fillStyle = `rgba(${PRIMARY_RGB}, 0.8)`;
			ctx.fillText(count.toLocaleString() + " ACTIVE MEMBERS", 0, globeRadius + 35);
			
			ctx.restore();
            // ---------------------------------------------------------


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
				ctx.shadowBlur = 10; // Reduced bloom
				ctx.shadowColor = `rgba(${PRIMARY_RGB}, 0.2)`;
				ctx.strokeStyle = `rgba(${PRIMARY_RGB}, 0.2)`; // Subtler
				ctx.lineWidth = 1.5;
				ctx.setLineDash([2, 12]); // Sparse dash
				
				ctx.beginPath();
				ctx.moveTo(p0.x, p0.y);
				ctx.bezierCurveTo(curve1CX1, curve1CY1, curve1CX2, curve1CY2, p1.x, p1.y);
				ctx.stroke();
				
				ctx.beginPath();
				ctx.moveTo(p1.x, p1.y);
				ctx.bezierCurveTo(curve2CX1, curve2CY1, curve2CX2, curve2CY2, p2.x, p2.y);
				ctx.stroke();
				ctx.restore();

				// 3. Draw Flow Packets along the path
				// We treat the two curves as one timeline t=0..2
				packets.forEach((offset) => {
					let t = (time * 0.4 + offset) % 2; // Loop 0 to 2
					let pos = { x: 0, y: 0 };
					let opacity = 1;

					if (t <= 1) {
						// First segment
						pos = getBezierPoint(
							t, 
							p0, p1, 
							{x: curve1CX1, y: curve1CY1}, 
							{x: curve1CX2, y: curve1CY2}
						);
						// Fade in/out at nodes
						opacity = Math.sin(t * Math.PI); 
					} else {
						// Second segment (t from 1 to 2)
						const localT = t - 1;
						pos = getBezierPoint(
							localT, 
							p1, p2, 
							{x: curve2CX1, y: curve2CY1}, 
							{x: curve2CX2, y: curve2CY2}
						);
						opacity = Math.sin(localT * Math.PI); 
					}

					// Draw Packet
					ctx.save();
					ctx.beginPath();
					ctx.arc(pos.x, pos.y, 3, 0, Math.PI*2); // Smaller dot (3 vs 4)
					const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 6);
					
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
					ctx.arc(n.x, n.y, 14, 0, Math.PI * 2); // Smaller ring
					ctx.strokeStyle = `rgba(${PRIMARY_RGB}, 0.1)`; // Fainter
					ctx.lineWidth = 1;
					ctx.setLineDash([]); // solid
					ctx.stroke();
					
					// 2. Rotating blip on orbit
					const orbitSpeed = (time * (idx % 2 === 0 ? 1 : -1)) + idx;
					const orbX = n.x + Math.cos(orbitSpeed) * 14;
					const orbY = n.y + Math.sin(orbitSpeed) * 14;
					ctx.beginPath();
					ctx.arc(orbX, orbY, 1.5, 0, Math.PI * 2);
					ctx.fillStyle = `rgba(${PRIMARY_RGB}, 0.5)`; // Less intense
					ctx.fill();

					// 3. Inner Glow (Toned Down)
					// Reduced oscillation range (4-6 instead of 6-8)
					const glowSize = 3 + Math.sin(time * 2 + idx) * 1.5; 
					const glowGrad = ctx.createRadialGradient(n.x, n.y, 1, n.x, n.y, glowSize * 2.5);
					glowGrad.addColorStop(0, `rgba(${PRIMARY_RGB}, 0.2)`); // Lower opacity
					glowGrad.addColorStop(1, `rgba(${PRIMARY_RGB}, 0)`);
					ctx.fillStyle = glowGrad;
					ctx.beginPath();
					ctx.arc(n.x, n.y, glowSize * 2.5, 0, Math.PI * 2);
					ctx.fill();

					// 4. Core Circle
					ctx.beginPath();
					ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
					ctx.fillStyle = `rgb(${PRIMARY_RGB})`;
					ctx.fill();
					// White center spec
					ctx.beginPath();
					ctx.arc(n.x, n.y, 1, 0, Math.PI * 2); // Smaller spec
					ctx.fillStyle = "rgba(255,255,255,0.8)";
					ctx.fill();

					// 5. Label
					ctx.fillStyle = `rgba(${PRIMARY_RGB}, 0.7)`;
					ctx.font = "600 9px Inter, sans-serif"; // Slightly smaller
					ctx.letterSpacing = "2px";
					ctx.textAlign = "left";
					ctx.fillText(n.label, n.x + 22, n.y + 3);
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
			className={cn("absolute inset-0 z-0 pointer-events-none", className)}
		/>
	);
}

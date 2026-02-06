import { useEffect, useRef } from "react";
import * as THREE from "three";
import { cn } from "~/app/lib/utils";

export function LoginGlobElement({ className }: { className?: string }) {
	const containerRef = useRef<HTMLDivElement>(null);
	const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		// --- Setup Scene ---
		const scene = new THREE.Scene();
		scene.fog = new THREE.FogExp2(0xffffff, 0.002);

		const camera = new THREE.PerspectiveCamera(
			45,
			window.innerWidth / window.innerHeight,
			0.1,
			1000,
		);
		camera.position.set(0, 0, 40);

		const renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true,
			powerPreference: "high-performance",
		});
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(window.innerWidth, window.innerHeight);
		containerRef.current.appendChild(renderer.domElement);
		rendererRef.current = renderer;

		// --- Configuration ---
		const BRAND_GREEN = 0x076951;
		const BRAND_LIGHT = 0x0a8f75;

		// --- 1. The Globe ---
		const globeGroup = new THREE.Group();
		const globeRadius = 14;
		const globeGeometry = new THREE.IcosahedronGeometry(globeRadius, 3); // Lower detail for cleaner look

		// Globe Points - smaller and more subtle
		const pointsGeometry = new THREE.BufferGeometry();
		const positions: number[] = [];
		const colors: number[] = [];

		const color1 = new THREE.Color(BRAND_GREEN);
		const color2 = new THREE.Color(BRAND_LIGHT);

		const vertices = globeGeometry.getAttribute("position").array;
		for (let i = 0; i < vertices.length; i += 3) {
			positions.push(vertices[i], vertices[i + 1], vertices[i + 2]);
			const mixedColor = color1.clone().lerp(color2, Math.random() * 0.3);
			colors.push(mixedColor.r, mixedColor.g, mixedColor.b);
		}

		pointsGeometry.setAttribute(
			"position",
			new THREE.Float32BufferAttribute(positions, 3),
		);
		pointsGeometry.setAttribute(
			"color",
			new THREE.Float32BufferAttribute(colors, 3),
		);

		const pointsMaterial = new THREE.PointsMaterial({
			size: 0.08, // Smaller points
			vertexColors: true,
			transparent: true,
			opacity: 0.5, // More subtle
			sizeAttenuation: true,
		});
		const globePoints = new THREE.Points(pointsGeometry, pointsMaterial);
		globeGroup.add(globePoints);

		// Wireframe - very subtle
		const wireframeMat = new THREE.MeshBasicMaterial({
			color: BRAND_GREEN,
			wireframe: true,
			transparent: true,
			opacity: 0.03, // Even more subtle
		});
		const globeWireframe = new THREE.Mesh(globeGeometry, wireframeMat);
		globeGroup.add(globeWireframe);

		// Position
		globeGroup.position.set(25, -10, -5);
		scene.add(globeGroup);

		// --- 2. Minimal Connection Animation ---
		function getRandomPointOnSphere(radius: number): THREE.Vector3 {
			const phi = Math.random() * Math.PI * 2;
			const theta = Math.acos(2 * Math.random() - 1);
			return new THREE.Vector3(
				radius * Math.sin(theta) * Math.cos(phi),
				radius * Math.sin(theta) * Math.sin(phi),
				radius * Math.cos(theta),
			);
		}

		// Easing function for smooth animation
		function easeOutCubic(t: number): number {
			return 1 - (1 - t) ** 3;
		}

		function easeInOutQuad(t: number): number {
			return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
		}

		interface Connection {
			startPoint: THREE.Vector3;
			endPoint: THREE.Vector3;
			curve: THREE.CatmullRomCurve3;
			line: THREE.Line | null;
			lineGeometry: THREE.BufferGeometry | null;
			startDot: THREE.Mesh;
			endDot: THREE.Mesh;
			progress: number;
			phase: "wait" | "pulse-start" | "arc" | "pulse-end" | "fade";
			timer: number;
		}

		// Tiny, barely visible dots
		const dotGeom = new THREE.SphereGeometry(0.06, 8, 8);
		const dotMat = new THREE.MeshBasicMaterial({
			color: BRAND_LIGHT,
			transparent: true,
			opacity: 0,
		});

		// Very thin, subtle line
		const lineMat = new THREE.LineBasicMaterial({
			color: BRAND_LIGHT,
			transparent: true,
			opacity: 0.2,
		});

		function createConnection(delay: number): Connection {
			const startPoint = getRandomPointOnSphere(globeRadius);
			const endPoint = getRandomPointOnSphere(globeRadius);

			const mid = startPoint.clone().add(endPoint).multiplyScalar(0.5);
			mid.normalize().multiplyScalar(globeRadius * 1.15); // Subtle arc height

			const curve = new THREE.CatmullRomCurve3([startPoint, mid, endPoint]);

			const startDot = new THREE.Mesh(dotGeom, dotMat.clone());
			startDot.position.copy(startPoint);
			globeGroup.add(startDot);

			const endDot = new THREE.Mesh(dotGeom, dotMat.clone());
			endDot.position.copy(endPoint);
			globeGroup.add(endDot);

			return {
				startPoint,
				endPoint,
				curve,
				line: null,
				lineGeometry: null,
				startDot,
				endDot,
				progress: 0,
				phase: "wait",
				timer: -delay,
			};
		}

		// Only 2 connections for minimal look
		const connections: Connection[] = [
			createConnection(0),
			createConnection(2.5),
		];

		function updateLine(conn: Connection, progress: number) {
			if (conn.line) {
				globeGroup.remove(conn.line);
				conn.lineGeometry?.dispose();
				conn.line = null;
			}

			if (progress <= 0) return;

			const numPoints = Math.max(2, Math.floor(progress * 40));
			const points: THREE.Vector3[] = [];
			for (let i = 0; i < numPoints; i++) {
				const t = (i / 40) * progress;
				points.push(conn.curve.getPoint(t));
			}

			conn.lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
			conn.line = new THREE.Line(conn.lineGeometry, lineMat.clone());
			globeGroup.add(conn.line);
		}

		function resetConnection(conn: Connection) {
			if (conn.line) {
				globeGroup.remove(conn.line);
				conn.lineGeometry?.dispose();
				conn.line = null;
			}

			conn.startPoint = getRandomPointOnSphere(globeRadius);
			conn.endPoint = getRandomPointOnSphere(globeRadius);

			const mid = conn.startPoint
				.clone()
				.add(conn.endPoint)
				.multiplyScalar(0.5);
			mid.normalize().multiplyScalar(globeRadius * 1.15);

			conn.curve = new THREE.CatmullRomCurve3([
				conn.startPoint,
				mid,
				conn.endPoint,
			]);
			conn.startDot.position.copy(conn.startPoint);
			conn.endDot.position.copy(conn.endPoint);
			conn.progress = 0;
			conn.phase = "wait";
			conn.timer = 0;
		}

		// --- Animation ---
		let time = 0;
		const clock = new THREE.Clock();

		const animate = () => {
			const delta = clock.getDelta();
			time += delta;

			// Slow globe rotation
			globeGroup.rotation.y -= delta * 0.03;
			globeGroup.rotation.x = Math.sin(time * 0.15) * 0.03;

			// Animate connections
			connections.forEach((conn) => {
				conn.timer += delta;
				if (conn.timer < 0) return;

				const startMat = conn.startDot.material as THREE.MeshBasicMaterial;
				const endMat = conn.endDot.material as THREE.MeshBasicMaterial;

				switch (conn.phase) {
					case "wait":
						// Brief pause before starting
						if (conn.timer > 0.3) {
							conn.phase = "pulse-start";
							conn.timer = 0;
						}
						break;

					case "pulse-start": {
						// Gentle pulse at start point
						const pulseIn = easeOutCubic(Math.min(conn.timer / 0.4, 1));
						startMat.opacity = pulseIn * 0.3;
						conn.startDot.scale.setScalar(0.8 + pulseIn * 0.4);

						if (conn.timer > 0.5) {
							conn.phase = "arc";
							conn.timer = 0;
						}
						break;
					}

					case "arc": {
						// Smooth arc animation
						const arcDuration = 1.2; // Slower, more elegant
						const rawProgress = Math.min(conn.timer / arcDuration, 1);
						conn.progress = easeInOutQuad(rawProgress);
						updateLine(conn, conn.progress);

						// Fade start dot as line progresses
						startMat.opacity = (1 - conn.progress) * 0.3;
						conn.startDot.scale.setScalar(1 + (1 - conn.progress) * 0.2);

						// Line opacity
						if (conn.line) {
							(conn.line.material as THREE.LineBasicMaterial).opacity = 0.15;
						}

						if (conn.progress >= 1) {
							conn.phase = "pulse-end";
							conn.timer = 0;
						}
						break;
					}

					case "pulse-end": {
						// Gentle pulse at end point
						const pulseOut = easeOutCubic(Math.min(conn.timer / 0.4, 1));
						endMat.opacity = pulseOut * 0.3;
						conn.endDot.scale.setScalar(0.8 + pulseOut * 0.4);
						startMat.opacity = 0;

						if (conn.timer > 0.6) {
							conn.phase = "fade";
							conn.timer = 0;
						}
						break;
					}

					case "fade": {
						// Elegant fade out
						const fadeProgress = Math.min(conn.timer / 0.8, 1);
						const fadeOpacity = 1 - easeOutCubic(fadeProgress);

						endMat.opacity = fadeOpacity * 0.3;
						conn.endDot.scale.setScalar(1 + (1 - fadeOpacity) * 0.3);

						if (conn.line) {
							(conn.line.material as THREE.LineBasicMaterial).opacity =
								fadeOpacity * 0.15;
						}

						if (fadeProgress >= 1) {
							resetConnection(conn);
						}
						break;
					}
				}
			});

			// Very subtle camera movement
			camera.position.x = Math.sin(time * 0.08) * 0.3;
			camera.position.y = Math.cos(time * 0.08) * 0.3;
			camera.lookAt(0, 0, 0);

			renderer.render(scene, camera);
			requestAnimationFrame(animate);
		};

		const handleResize = () => {
			if (!containerRef.current || !rendererRef.current) return;
			const w = window.innerWidth;
			const h = window.innerHeight;
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
			rendererRef.current.setSize(w, h);
		};

		window.addEventListener("resize", handleResize);
		animate();

		// Cleanup
		return () => {
			window.removeEventListener("resize", handleResize);
			if (rendererRef.current && containerRef.current) {
				containerRef.current.removeChild(rendererRef.current.domElement);
				rendererRef.current.dispose();
			}
			pointsGeometry.dispose();
			pointsMaterial.dispose();
			globeGeometry.dispose();
			wireframeMat.dispose();
			dotGeom.dispose();
			dotMat.dispose();
			lineMat.dispose();
			connections.forEach((conn) => {
				conn.lineGeometry?.dispose();
			});
			scene.clear();
		};
	}, []);

	return (
		<div
			ref={containerRef}
			className={cn(
				"fixed inset-0 z-0 overflow-hidden pointer-events-none",
				className,
			)}
		/>
	);
}

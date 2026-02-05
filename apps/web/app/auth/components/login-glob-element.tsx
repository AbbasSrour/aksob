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
		// Light background to match the form's dark text
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

		// --- 1. The Globe (Top Right, Clipped) ---
		const globeGroup = new THREE.Group();
		const globeGeometry = new THREE.IcosahedronGeometry(14, 4);

		const geometry = new THREE.BufferGeometry();
		const positions = [];
		const sizes = [];
		const colors = [];

		const color1 = new THREE.Color(BRAND_GREEN);
		const color2 = new THREE.Color(0x0a8f75); // Lighter green

		const vertices = globeGeometry.getAttribute("position").array;
		for (let i = 0; i < vertices.length; i += 3) {
			const x = vertices[i];
			const y = vertices[i + 1];
			const z = vertices[i + 2];

			positions.push(x, y, z);
			sizes.push(Math.random() * 0.15 + 0.05);

			// Mix colors
			const mixedColor = color1.clone().lerp(color2, Math.random() * 0.5);
			colors.push(mixedColor.r, mixedColor.g, mixedColor.b);
		}

		geometry.setAttribute(
			"position",
			new THREE.Float32BufferAttribute(positions, 3),
		);
		geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));
		geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

		const material = new THREE.PointsMaterial({
			size: 0.15,
			vertexColors: true,
			transparent: true,
			opacity: 0.8,
			sizeAttenuation: true,
			blending: THREE.NormalBlending, // Normal blending for light bg
		});

		const globePoints = new THREE.Points(geometry, material);
		globeGroup.add(globePoints);

		// Wireframe - darker
		const wireframeMat = new THREE.MeshBasicMaterial({
			color: BRAND_GREEN,
			wireframe: true,
			transparent: true,
			opacity: 0.05,
		});
		const globeWireframe = new THREE.Mesh(globeGeometry, wireframeMat);
		globeGroup.add(globeWireframe);

		// Position: Bottom Right corner, slightly more inward for visibility
		globeGroup.position.set(25, -10, -5);
		scene.add(globeGroup);

		// --- Animation ---
		let time = 0;
		const clock = new THREE.Clock(); // Use clock for smooth delta

		const animate = () => {
			const delta = clock.getDelta();
			time += delta;

			// Rotate Globe
			globeGroup.rotation.y -= delta * 0.05;
			globeGroup.rotation.x = Math.sin(time * 0.2) * 0.05;

			// Subtle Camera sway
			camera.position.x = Math.sin(time * 0.1);
			camera.position.y = Math.cos(time * 0.1);
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
			rendererRef.current.setSize(w, h); // Canvas size matches window
			// Canvas style is handled by renderer, but we use fixed container to match
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

			// Globe
			geometry.dispose();
			material.dispose();
			globeGeometry.dispose();
			wireframeMat.dispose();

			scene.clear();
		};
	}, []);

	return (
		<div
			ref={containerRef}
			className={cn(
				"fixed inset-0 z-0 overflow-hidden pointer-events-none", // Changed to fixed
				className,
			)}
		></div>
	);
}

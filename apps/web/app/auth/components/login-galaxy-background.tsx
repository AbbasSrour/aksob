import { useEffect, useRef } from "react";
import * as THREE from "three";
import { cn } from "~/app/lib/utils";

export function LoginGalaxyBackground({ className }: { className?: string }) {
	const containerRef = useRef<HTMLDivElement>(null);
	const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

	useEffect(() => {
		if (typeof window === "undefined" || !containerRef.current) return;

		let isDisposed = false;

		// --- Setup Scene ---
		const scene = new THREE.Scene();
		// Clean white/off-white fog to blend with background
		scene.fog = new THREE.FogExp2(0xffffff, 0.002);

		const camera = new THREE.PerspectiveCamera(
			45,
			window.innerWidth / window.innerHeight,
			0.1,
			1000,
		);
		camera.position.set(0, 0, 50);

		const renderer = new THREE.WebGLRenderer({
			alpha: true, // Transparent background
			antialias: true,
			powerPreference: "high-performance",
		});
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(window.innerWidth, window.innerHeight);
		containerRef.current.appendChild(renderer.domElement);
		rendererRef.current = renderer;

		// --- Constants ---
		const BRAND_GREEN = new THREE.Color(0x076951);

		const elements: THREE.Mesh[] = [];

		// --- Helper: Solid Circle (Flattened Cylinder/Disc) ---
		// "Solid circles" implies filled shapes, effectively discs in 3D.
		// giving them a tiny bit of thickness to feel "3D" but keeping the circle billboard look.
		function createSolidCircle(
			radius: number,
			pos: THREE.Vector3,
			opacity: number,
			thickness = 0.5,
		) {
			const geometry = new THREE.CylinderGeometry(
				radius,
				radius,
				thickness,
				64,
			);
			const material = new THREE.MeshBasicMaterial({
				color: BRAND_GREEN,
				transparent: true,
				opacity: opacity,
			});
			const mesh = new THREE.Mesh(geometry, material);
			// Cylinder defaults to upright (standing on XZ plane), rotate to face camera-ish
			mesh.rotation.x = Math.PI / 2;
			mesh.position.copy(pos);
			return mesh;
		}

		// --- Helper: Soft Blob (Sphere) ---
		function createSoftBlob(
			radius: number,
			pos: THREE.Vector3,
			opacity: number,
		) {
			const geometry = new THREE.SphereGeometry(radius, 64, 64);
			const material = new THREE.MeshBasicMaterial({
				color: BRAND_GREEN,
				transparent: true,
				opacity: opacity,
				depthWrite: false, // Soft blending
			});
			const mesh = new THREE.Mesh(geometry, material);
			mesh.position.copy(pos);
			return mesh;
		}

		// --- 1. Top Right ---
		// Soft background blur pushed far to the corner
		const trBlur = createSoftBlob(10, new THREE.Vector3(38, 25, -20), 0.04);
		scene.add(trBlur);
		elements.push(trBlur);

		// --- 2. Left Side ---
		// Single large solid circle (far left edge)
		const leftCircle = createSolidCircle(
			8,
			new THREE.Vector3(-38, 5, -8),
			0.08,
		);
		leftCircle.rotation.x = Math.PI / 2 + 0.1;
		leftCircle.rotation.y = 0.2;
		scene.add(leftCircle);
		elements.push(leftCircle);

		// --- 3. Bottom Right ---
		// Soft blob pushed further down and right
		const brBlob = createSoftBlob(10, new THREE.Vector3(25, -28, -10), 0.05);
		scene.add(brBlob);
		elements.push(brBlob);

		// --- Animation ---
		const clock = new THREE.Clock();
		let time = 0;

		const animate = () => {
			if (isDisposed) return;

			const delta = clock.getDelta();
			time += delta;

			// Very slow, gentle 2D floating (no rotation, no Z movement)
			elements.forEach((el, i) => {
				// Horizontal drift
				el.position.x += Math.sin(time * 0.3 + i * 2) * 0.003;
				// Vertical bobbing
				el.position.y += Math.cos(time * 0.4 + i) * 0.003;
			});

			// No camera movement, keep it stable
			renderer.render(scene, camera);
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
		renderer.setAnimationLoop(animate);

		// Cleanup
		return () => {
			isDisposed = true;
			renderer.setAnimationLoop(null);
			window.removeEventListener("resize", handleResize);
			if (
				rendererRef.current &&
				containerRef.current?.contains(rendererRef.current.domElement)
			) {
				containerRef.current.removeChild(rendererRef.current.domElement);
				rendererRef.current.dispose();
			}
			rendererRef.current = null;
			scene.clear();
		};
	}, []);

	return (
		<div
			ref={containerRef}
			className={cn(
				"fixed inset-0 z-0 pointer-events-none overflow-hidden",
				className,
			)}
		/>
	);
}

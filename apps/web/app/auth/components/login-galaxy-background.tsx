import { useEffect, useRef } from "react";
import * as THREE from "three";
import { cn } from "~/app/lib/utils";

export function LoginGalaxyBackground({ className }: { className?: string }) {
	const containerRef = useRef<HTMLDivElement>(null);
	const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

	useEffect(() => {
		if (!containerRef.current) return;

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
		function createSolidCircle(radius: number, pos: THREE.Vector3, opacity: number, thickness = 0.5) {
			const geometry = new THREE.CylinderGeometry(radius, radius, thickness, 64);
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
		function createSoftBlob(radius: number, pos: THREE.Vector3, opacity: number) {
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


		// --- 1. Top Right Cluster ---
		// Replicating: Large blur, medium circle, small circle, dot.

		// Large Background Blur (The "Glow")
		const trBlur = createSoftBlob(14, new THREE.Vector3(25, 15, -10), 0.05);
		scene.add(trBlur);
		elements.push(trBlur);

		// Medium Solid Circle
		// "Border" equivalent -> Low opacity solid
		const trCircle1 = createSolidCircle(7, new THREE.Vector3(22, 12, 0), 0.1);
		// Tilted slightly to show 3D nature
		trCircle1.rotation.x = Math.PI / 2 - 0.2;
		trCircle1.rotation.z = -0.1;
		scene.add(trCircle1);
		elements.push(trCircle1);

		// Smaller Solid Circle (Inner)
		const trCircle2 = createSolidCircle(5, new THREE.Vector3(19, 10, 5), 0.15);
		trCircle2.rotation.x = Math.PI / 2 - 0.1;
		scene.add(trCircle2);
		elements.push(trCircle2);

		// The "Dot" (Solid small sphere)
		const trDot = createSoftBlob(0.6, new THREE.Vector3(16, 9, 8), 0.9);
		scene.add(trDot);
		elements.push(trDot);


		// --- 2. Left Side ---
		// Single large ring/circle
		const leftCircle = createSolidCircle(9, new THREE.Vector3(-32, 2, -5), 0.08);
		leftCircle.rotation.x = Math.PI / 2 + 0.1;
		leftCircle.rotation.y = 0.2;
		scene.add(leftCircle);
		elements.push(leftCircle);


		// --- 3. Bottom Right ---
		// Large soft blob
		const brBlob = createSoftBlob(15, new THREE.Vector3(12, -20, -5), 0.06);
		scene.add(brBlob);
		elements.push(brBlob);


		// --- Animation ---
		const clock = new THREE.Clock();
		let time = 0;

		const animate = () => {
			const delta = clock.getDelta();
			time += delta;

			// Very slow, heavy floating (Ambient)
			elements.forEach((el, i) => {
				// Bobbing
				el.position.y += Math.sin(time * 0.5 + i) * 0.005;
				
				// Gentle Rotation for the discs
				if (el.geometry.type === 'CylinderGeometry') {
					el.rotation.z += Math.cos(time * 0.3 + i) * 0.001;
					el.rotation.x += Math.sin(time * 0.2 + i) * 0.001;
				}
			});

			// No camera movement, keep it stable
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

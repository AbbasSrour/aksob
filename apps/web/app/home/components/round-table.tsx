import { ArrowRight, MessageCircle, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const DISCUSSION_GROUPS = [
	{
		number: "01",
		topic: "Entrepreneurship & Startups",
		description:
			"Alumni founders and student innovators share war stories, validate ideas, and build ventures together.",
		seats: "5 alumni + 5 students",
	},
	{
		number: "02",
		topic: "Finance & Investment Banking",
		description:
			"A focused forum for alumni in finance to mentor students breaking into banking, PE, and asset management.",
		seats: "5 alumni + 5 students",
	},
	{
		number: "03",
		topic: "Leadership & Career Strategy",
		description:
			"Executives and rising talent discuss leadership transitions, career pivots, and the skills that accelerate growth.",
		seats: "5 alumni + 5 students",
	},
];

/* ------------------------------------------------------------------ */
/*  Three.js table scene — loaded from Blender GLB                      */
/* ------------------------------------------------------------------ */

function TableScene() {
	const mountRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = mountRef.current;
		if (!container) return;

		const width = container.clientWidth;
		const height = container.clientHeight;

		// Scene
		const scene = new THREE.Scene();
		scene.background = null;

		// Camera — top-down product view
		const aspect = width / height;
		const frustumHeight = 2.25;
		const camera = new THREE.OrthographicCamera(
			(-frustumHeight * aspect) / 2,
			(frustumHeight * aspect) / 2,
			frustumHeight / 2,
			-frustumHeight / 2,
			0.1,
			20,
		);
		camera.position.set(0, 5, 0);
		camera.up.set(0, 0, -1);
		camera.lookAt(0, 0.37, 0);

		// Renderer
		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setSize(width, height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1.0;
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		container.appendChild(renderer.domElement);

		// Neutral studio environment for calibrated PBR reflections.
		const pmremGenerator = new THREE.PMREMGenerator(renderer);
		const environmentMap = pmremGenerator.fromScene(
			new RoomEnvironment(),
			0.04,
		).texture;
		scene.environment = environmentMap;

		// Standard PBR studio lighting
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.28);
		scene.add(ambientLight);

		const keyLight = new THREE.DirectionalLight(0xfffbf2, 1.55);
		keyLight.position.set(2.4, 6, 1.8);
		keyLight.castShadow = true;
		keyLight.shadow.mapSize.set(2048, 2048);
		keyLight.shadow.camera.near = 0.5;
		keyLight.shadow.camera.far = 10;
		keyLight.shadow.camera.left = -2;
		keyLight.shadow.camera.right = 2;
		keyLight.shadow.camera.top = 2;
		keyLight.shadow.camera.bottom = -2;
		keyLight.shadow.bias = -0.0001;
		scene.add(keyLight);

		const fillLight = new THREE.DirectionalLight(0xf3f4ee, 0.38);
		fillLight.position.set(-2.5, 4, -1.6);
		scene.add(fillLight);

		const topFillLight = new THREE.DirectionalLight(0xffffff, 0.24);
		topFillLight.position.set(0, 5, -2.8);
		scene.add(topFillLight);

		const assetVersion = "dark-tabletop-pbr-20260513-2";
		const textureLoader = new THREE.TextureLoader();
		const tabletopBaseColorMap = textureLoader.load(
			`/models/textures/tabletop_basecolor_4k.png?v=${assetVersion}`,
		);
		tabletopBaseColorMap.colorSpace = THREE.SRGBColorSpace;
		tabletopBaseColorMap.flipY = false;

		const tabletopRoughnessMap = textureLoader.load(
			`/models/textures/tabletop_roughness_4k.png?v=${assetVersion}`,
		);
		tabletopRoughnessMap.colorSpace = THREE.NoColorSpace;
		tabletopRoughnessMap.flipY = false;

		const tabletopNormalMap = textureLoader.load(
			`/models/textures/tabletop_normal_4k.png?v=${assetVersion}`,
		);
		tabletopNormalMap.colorSpace = THREE.NoColorSpace;
		tabletopNormalMap.flipY = false;

		const heroTabletopMaterial = new THREE.MeshPhysicalMaterial({
			name: "tabletop_pbr_dark_green_stone_runtime",
			color: "#0f342e",
			map: tabletopBaseColorMap,
			roughnessMap: tabletopRoughnessMap,
			normalMap: tabletopNormalMap,
			metalness: 0.0,
			roughness: 0.28,
			clearcoat: 0.32,
			clearcoatRoughness: 0.24,
			envMapIntensity: 0.68,
			normalScale: new THREE.Vector2(0.34, 0.34),
		});

		const tabletopEdgeMaterial = new THREE.MeshStandardMaterial({
			name: "tabletop_quiet_dark_green_edge_runtime",
			color: "#091916",
			metalness: 0.0,
			roughness: 0.42,
			envMapIntensity: 0.48,
		});

		const tabletopUndersideMaterial = new THREE.MeshStandardMaterial({
			name: "tabletop_underside_near_black_green_runtime",
			color: "#111614",
			metalness: 0.0,
			roughness: 0.56,
			envMapIntensity: 0.45,
		});

		const brassMaterial = new THREE.MeshStandardMaterial({
			name: "satin_machined_brass_runtime",
			color: "#b58a3c",
			metalness: 1.0,
			roughness: 0.24,
			envMapIntensity: 1.05,
		});

		const pedestalMaterial = new THREE.MeshStandardMaterial({
			name: "dark_powder_coated_pedestal_runtime",
			color: "#111614",
			metalness: 0.0,
			roughness: 0.52,
			envMapIntensity: 0.55,
		});

		const calibrateMaterial = (
			material: THREE.Material,
			objectName: string,
		) => {
			if (!(material instanceof THREE.MeshStandardMaterial)) return;

			if (material.map) material.map.colorSpace = THREE.SRGBColorSpace;
			if (material.roughnessMap) {
				material.roughnessMap.colorSpace = THREE.NoColorSpace;
			}
			if (material.normalMap) {
				material.normalMap.colorSpace = THREE.NoColorSpace;
			}
			if (material.aoMap) material.aoMap.colorSpace = THREE.NoColorSpace;
			if (material.metalnessMap) {
				material.metalnessMap.colorSpace = THREE.NoColorSpace;
			}

			const materialName = material.name.toLowerCase();
			const meshName = objectName.toLowerCase();
			const isTabletopHero =
				meshName.includes("tabletop_core") &&
				!materialName.includes("edge") &&
				!materialName.includes("underside");

			if (isTabletopHero || materialName.includes("tabletop_pbr")) {
				// Keep the GLB PBR material, but explicitly attach the exported maps so
				// the tabletop never falls back to a white/default imported material.
				material.color.set("#0f342e");
				material.map = tabletopBaseColorMap;
				material.roughnessMap = tabletopRoughnessMap;
				material.normalMap = tabletopNormalMap;
				material.metalness = 0.0;
				material.roughness = 0.28;
				material.envMapIntensity = 0.68;
				material.normalScale.set(0.34, 0.34);
				if (material instanceof THREE.MeshPhysicalMaterial) {
					material.clearcoat = 0.32;
					material.clearcoatRoughness = 0.24;
				}
			} else if (materialName.includes("brass") || meshName.includes("brass")) {
				material.metalness = 1.0;
				material.roughness = 0.24;
				material.envMapIntensity = 1.05;
			} else if (materialName.includes("edge")) {
				material.metalness = 0.0;
				material.roughness = 0.42;
				material.envMapIntensity = 0.48;
			} else if (
				materialName.includes("pedestal") ||
				meshName.includes("pedestal")
			) {
				material.metalness = 0.0;
				material.roughness = 0.52;
				material.envMapIntensity = 0.55;
			} else if (materialName.includes("underside")) {
				material.metalness = 0.0;
				material.roughness = 0.56;
				material.envMapIntensity = 0.45;
			}

			material.needsUpdate = true;
		};

		// Load the Blender-exported GLB model
		const loader = new GLTFLoader();
		let model: THREE.Group | null = null;

		loader.load(
			`/models/round-table.glb?v=${assetVersion}`,
			(gltf) => {
				model = gltf.scene;
				model.traverse((child) => {
					if (!(child instanceof THREE.Mesh)) return;

					child.castShadow = true;
					child.receiveShadow = true;

					const meshName = child.name.toLowerCase();
					if (meshName.includes("tabletop_core")) {
						child.material = [
							heroTabletopMaterial,
							tabletopEdgeMaterial,
							tabletopUndersideMaterial,
						];
						return;
					}

					if (meshName.includes("brass")) {
						child.material = brassMaterial;
						return;
					}

					if (meshName.includes("pedestal")) {
						child.material = pedestalMaterial;
						return;
					}

					const materials = Array.isArray(child.material)
						? child.material
						: [child.material];
					for (const material of materials) {
						calibrateMaterial(material, child.name);
					}
				});
				scene.add(model);
			},
			undefined,
			(error) => console.error("Failed to load table model:", error),
		);

		// Animation loop
		let rafId: number;
		const animate = () => {
			rafId = requestAnimationFrame(animate);
			renderer.render(scene, camera);
		};
		animate();

		// Resize handler
		const handleResize = () => {
			const w = container.clientWidth;
			const h = container.clientHeight;
			const nextAspect = w / h;
			camera.left = (-frustumHeight * nextAspect) / 2;
			camera.right = (frustumHeight * nextAspect) / 2;
			camera.top = frustumHeight / 2;
			camera.bottom = -frustumHeight / 2;
			camera.updateProjectionMatrix();
			renderer.setSize(w, h);
		};
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
			cancelAnimationFrame(rafId);
			if (model) {
				model.traverse((child) => {
					if (child instanceof THREE.Mesh) {
						child.geometry.dispose();
						const materials = Array.isArray(child.material)
							? child.material
							: [child.material];
						for (const mat of materials) {
							if (mat) {
								for (const key of Object.keys(mat)) {
									const val = (mat as Record<string, unknown>)[key];
									if (val instanceof THREE.Texture) val.dispose();
								}
								mat.dispose();
							}
						}
					}
				});
			}
			environmentMap.dispose();
			tabletopBaseColorMap.dispose();
			tabletopRoughnessMap.dispose();
			tabletopNormalMap.dispose();
			pmremGenerator.dispose();
			renderer.dispose();
			if (container.contains(renderer.domElement)) {
				container.removeChild(renderer.domElement);
			}
		};
	}, []);

	return (
		<div
			ref={mountRef}
			style={{
				width: "100%",
				aspectRatio: "16 / 10",
				maxWidth: "720px",
				margin: "0 auto",
				position: "relative",
				borderRadius: "16px",
				overflow: "hidden",
			}}
		/>
	);
}

/* ------------------------------------------------------------------ */
/*  Main section wrapper (kept from original)                          */
/* ------------------------------------------------------------------ */

export function RoundTable() {
	const sectionRef = useRef<HTMLElement>(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const el = sectionRef.current;
		if (!el) return;

		const prefersReduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (prefersReduced) {
			setIsVisible(true);
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.08 },
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<section
			ref={sectionRef}
			className="relative z-10 py-24 md:py-32 overflow-hidden"
		>
			<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="text-center mb-16 md:mb-20">
					<span
						className={`inline-block text-xs font-semibold italic tracking-[0.15em] text-[var(--gray-400)] mb-6 ${isVisible ? "animate-editorial-fade" : "opacity-0"}`}
					>
						Alumni & Students
					</span>

					<h2
						className={`text-3xl md:text-5xl lg:text-[3.5rem] font-light leading-[1.15] tracking-[-0.01em] max-w-3xl mx-auto ${isVisible ? "animate-editorial-reveal" : "opacity-0"}`}
						style={{
							fontFamily: "var(--font-display)",
							animationDelay: "0.15s",
						}}
					>
						<span className="text-(--aksob-darkest)">
							Where Ideas Meet at the{" "}
						</span>
						<span className="text-(--aksob-primary)">Round Table</span>
					</h2>

					<p
						className={`mt-6 max-w-xl mx-auto text-sm md:text-base text-[var(--gray-500)] leading-relaxed ${isVisible ? "animate-editorial-slide-up" : "opacity-0"}`}
						style={{ animationDelay: "0.3s" }}
					>
						Three intimate discussion groups bring together alumni and students
						for focused conversations on entrepreneurship, finance, and
						leadership.
					</p>
				</div>

				{/* 3D Table Canvas */}
				<div
					className={`transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
					style={{ transitionDelay: "0.4s" }}
				>
					<TableScene />
				</div>

				{/* Discussion groups — 3 columns */}
				<div className="mt-20 md:mt-28 grid gap-6 md:grid-cols-3">
					{DISCUSSION_GROUPS.map((group, index) => (
						<div
							key={group.number}
							className={`group relative rounded-2xl border border-[var(--gray-200)] bg-white/60 backdrop-blur-sm p-7 md:p-8 transition-all duration-300 hover:border-(--aksob-primary)/30 hover:bg-[var(--pale-mint)]/30 hover:-translate-y-1 hover:shadow-lg ${isVisible ? "animate-editorial-slide-up" : "opacity-0"}`}
							style={{
								animationDelay: `${0.6 + index * 0.12}s`,
							}}
						>
							<span
								className="text-sm font-medium text-(--aksob-primary)"
								style={{ fontFamily: "var(--font-display)" }}
							>
								{group.number}
							</span>

							<h3
								className="mt-4 text-xl md:text-2xl font-medium text-(--aksob-darkest) leading-tight"
								style={{ fontFamily: "var(--font-display)" }}
							>
								{group.topic}
							</h3>

							<p className="mt-3 text-sm text-[var(--gray-500)] leading-relaxed">
								{group.description}
							</p>

							<div className="mt-6 flex items-center gap-2 text-xs text-[var(--gray-400)]">
								<Users size={14} />
								<span>{group.seats}</span>
							</div>
						</div>
					))}
				</div>

				{/* Sign-up CTA */}
				<div
					className={`mt-16 md:mt-24 ${isVisible ? "animate-editorial-slide-up" : "opacity-0"}`}
					style={{ animationDelay: "1.1s" }}
				>
					<div className="relative overflow-hidden rounded-2xl bg-[#0f1110]">
						<div className="pointer-events-none absolute inset-0 hidden lg:block">
							{[20, 40, 60, 80].map((pos) => (
								<div
									key={pos}
									className="absolute top-0 bottom-0 w-px bg-white/[0.06]"
									style={{ left: `${pos}%` }}
								/>
							))}
						</div>

						<div className="relative flex flex-col lg:flex-row items-center gap-10 lg:gap-16 p-8 md:p-12 lg:p-16">
							<div className="flex-1 text-center lg:text-left">
								<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] mb-6">
									<MessageCircle
										size={14}
										className="text-(--aksob-secondary)"
									/>
									<span className="text-xs font-medium text-white/70 tracking-wide">
										Limited seats available
									</span>
								</div>

								<h3
									className="text-2xl md:text-3xl lg:text-4xl font-light leading-[1.15] tracking-[-0.01em] text-white"
									style={{ fontFamily: "var(--font-display)" }}
								>
									Join a{" "}
									<span className="text-(--aksob-secondary)">Round Table</span>{" "}
									Discussion
								</h3>

								<p className="mt-4 max-w-lg text-sm md:text-base text-white/45 leading-relaxed">
									Alumni: share your expertise and mentor the next generation.
									Students: gain real-world insights from industry leaders. Each
									session brings together 5 alumni and 5 students for focused,
									intimate conversations.
								</p>
							</div>

							<div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-center gap-4">
								<button
									type="button"
									className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-(--aksob-primary) text-white text-sm font-medium hover:bg-(--aksob-secondary) transition-colors duration-200"
								>
									Sign Up as Alumni
									<ArrowRight size={16} />
								</button>
								<button
									type="button"
									className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/20 text-white text-sm font-medium hover:bg-white/5 transition-colors duration-200"
								>
									Learn More
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

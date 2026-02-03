import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import "./galaxy.css";
import { type Alumnus, type MajorCluster, galaxyData } from "../utils/galaxy-data";

interface ClusterUserData {
	clusterIndex: number;
	blinkOffsets: Float32Array;
	blinkSpeeds: Float32Array;
	baseColors: Float32Array;
	targetState?: "cloud" | "grid";
	transitionTime?: number;
	morphFactor?: number;
}

export function meta() {
	return [
		{ title: "Galaxy of Stars - AKSOB Alumni" },
		{
			name: "description",
			content: "Explore the AKSOB Alumni network galaxy.",
		},
	];
}

export default function Galaxy() {
	// const navigate = useNavigate();
	// biome-ignore lint/suspicious/noAssignInExpressions: I don't care I love it
	const navigate = (path: string) => (window.location.href = path); // Fallback
	const mountRef = useRef<HTMLDivElement>(null);
	const [viewMode, setViewMode] = useState<"overview" | "cluster">("overview");
	const [selectedStar, setSelectedStar] = useState<{
		x: number;
		y: number;
		data: Alumnus;
	} | null>(null);
	const [hoveredStar, setHoveredStar] = useState<{
		x: number;
		y: number;
		data: Alumnus;
	} | null>(null); // Re-added for tooltip
	const [clusterBgColor, setClusterBgColor] = useState<string | null>(null); // Track active cluster color for background
	// Track sidebar visibility for animation in loop
	const sidebarOpenRef = useRef(false);

	// Refs for animation state to avoid re-renders
	const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
	const controlsRef = useRef<OrbitControls | null>(null);
	const targetCameraPos = useRef(new THREE.Vector3(0, 100, 400));
	const targetControlsTarget = useRef(new THREE.Vector3(0, 0, 0));
	const isTransitioning = useRef(false);
	const viewModeRef = useRef<"overview" | "cluster">("overview");
	const currentViewOffset = useRef(0); // For smooth sidebar camera shift

	// Store cluster meshes to toggle visibility
	const clusterMeshesRef = useRef<THREE.Points[]>([]);
	// Store original positions for "Back" functionality if needed, or just standard centers
	const clusterCentersRef = useRef<THREE.Vector3[]>([]);

	// Function exposed to React state to trigger view changes
	const _handleClusterClick = (clusterIndex: number) => {
		if (viewMode === "cluster") return;

		// Find cluster center
		const cluster = galaxyData[clusterIndex];
		if (!cluster) return;

		// Recalculate position (same logic as generation)
		const _clusterAngle = (clusterIndex / galaxyData.length) * Math.PI * 2;
		const _clusterRadius = 150 + Math.random() * 50; // Note: Randomness in generation means this might be slightly off if not stored.
		// Correction: We stored positions in 'calculatedClusterPositions' inside useEffect. We need access to that.
		// Solution: We will dispatch a custom event or use a ref accessible by the click handler.
		// For now, let's trigger via the DOM click handler inside useEffect to have access to local closures.
	};

	const handleBackClick = () => {
		setViewMode("overview"); // Update UI
		viewModeRef.current = "overview"; // Update Logic
		setClusterBgColor(null); // Reset background to black

		// Reset Camera Target
		targetCameraPos.current.set(0, 100, 400);
		targetControlsTarget.current.set(0, 0, 0);
		isTransitioning.current = true;

		// Ensure rotation is OFF during transition to avoid conflict
		if (controlsRef.current) {
			controlsRef.current.autoRotate = false;
		}

		// Switch active cluster back to cloud state
		clusterMeshesRef.current.forEach((mesh) => {
			mesh.visible = true;
			if (mesh.userData.linesMesh) mesh.userData.linesMesh.visible = true;
			(mesh.userData as ClusterUserData).targetState = "cloud";
			(mesh.userData as ClusterUserData).transitionTime = 0;
			(mesh.material as THREE.PointsMaterial).opacity = 1;
		});
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: This effect should only run once on mount to setup Three.js scene
	useEffect(() => {
		if (!mountRef.current) return;

		// --- Scene Setup ---
		const scene = new THREE.Scene();
		// Deeper fog for more contrast
		scene.fog = new THREE.FogExp2(0x050a09, 0.0008);

		const camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			3000, // Increased far plane for background stars
		);
		camera.position.set(0, 100, 400);
		cameraRef.current = camera;

		const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio for performance
		// Enable tone mapping for "glow" feel
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1.2;
		mountRef.current.appendChild(renderer.domElement);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;
		controls.autoRotate = true;
		controls.autoRotateSpeed = 0.3; // Slower, majestic rotation
		controls.maxDistance = 1200;
		controls.minDistance = 20;
		controlsRef.current = controls;

		// --- Background Stars (Deep Field) ---
		// Thousands of tiny static stars to create depth
		const bgGeometry = new THREE.BufferGeometry();
		const bgCount = 10000;
		const bgPositions = new Float32Array(bgCount * 3);
		const bgSizes = new Float32Array(bgCount);
		const bgColors = new Float32Array(bgCount * 3);

		for (let i = 0; i < bgCount; i++) {
			const r = 800 + Math.random() * 1200; // Slightly closer for visibility
			const theta = Math.random() * Math.PI * 2;
			const phi = Math.acos(Math.random() * 2 - 1);
			bgPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
			bgPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
			bgPositions[i * 3 + 2] = r * Math.cos(phi);

			// Varied sizes - some larger "bright" stars
			bgSizes[i] = 0.5 + Math.random() * 3;

			// Brighter white with slight color variation
			const shade = 0.7 + Math.random() * 0.3;
			bgColors[i * 3] = shade;
			bgColors[i * 3 + 1] = shade;
			bgColors[i * 3 + 2] = shade * (0.95 + Math.random() * 0.05); // Slight blue tint
		}
		bgGeometry.setAttribute(
			"position",
			new THREE.BufferAttribute(bgPositions, 3),
		);
		bgGeometry.setAttribute("color", new THREE.BufferAttribute(bgColors, 3));
		bgGeometry.setAttribute("size", new THREE.BufferAttribute(bgSizes, 1));

		const bgMaterial = new THREE.PointsMaterial({
			size: 2.5,
			vertexColors: true,
			transparent: true,
			opacity: 1.0,
			sizeAttenuation: true,
			blending: THREE.AdditiveBlending,
		});
		const bgStars = new THREE.Points(bgGeometry, bgMaterial);
		scene.add(bgStars);

		// --- Galaxy Generation (Per Cluster) ---
		const createStarTexture = () => {
			const canvas = document.createElement("canvas");
			canvas.width = 64; // Higher res
			canvas.height = 64;
			const context = canvas.getContext("2d");
			if (!context) return new THREE.Texture();

			// Soft glow gradient
			const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
			gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
			gradient.addColorStop(0.15, "rgba(255, 255, 255, 0.9)");
			gradient.addColorStop(0.4, "rgba(255, 255, 255, 0.2)");
			gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

			context.fillStyle = gradient;
			context.fillRect(0, 0, 64, 64);

			const texture = new THREE.CanvasTexture(canvas);
			return texture;
		};

		const texture = createStarTexture();

		const alumniDataGrid: Alumnus[][] = [];
		clusterMeshesRef.current = [];
		clusterCentersRef.current = [];
		const clusterHitMeshes: THREE.Mesh[] = [];

		galaxyData.forEach((cluster: MajorCluster, clusterIndex: number) => {
			const particleCount = cluster.alumni.length;
			const geometry = new THREE.BufferGeometry();
			const positions = new Float32Array(particleCount * 3);
			const colors = new Float32Array(particleCount * 3);
			const sizes = new Float32Array(particleCount);

			const clusterAlumni: Alumnus[] = [];
			const colorHelper = new THREE.Color();

			// Calculate Center
			const clusterAngle = (clusterIndex / galaxyData.length) * Math.PI * 2;
			const clusterRadius = 200 + Math.random() * 80; // Spread them out more
			const clusterX = Math.cos(clusterAngle) * clusterRadius;
			const clusterZ = Math.sin(clusterAngle) * clusterRadius;
			// Clusters at slightly different heights for 3D feel
			const clusterY = (Math.random() - 0.5) * 60;
			const center = new THREE.Vector3(clusterX, clusterY, clusterZ);
			clusterCentersRef.current.push(center);

			const blinkOffsets = new Float32Array(particleCount);
			const blinkSpeeds = new Float32Array(particleCount);
			const baseColors = new Float32Array(particleCount * 3);

			// Store positions for lines
			const particlePositionsVec3: THREE.Vector3[] = [];

			cluster.alumni.forEach((alumnus: Alumnus, i: number) => {
				const r = Math.random() * 60; // Tighter clusters
				const theta = Math.random() * Math.PI * 2;
				const phi = Math.random() * Math.PI;

				const x = clusterX + r * Math.sin(phi) * Math.cos(theta);
				const y = clusterY + (Math.random() - 0.5) * 40; // Flattened slightly
				const z = clusterZ + r * Math.sin(phi) * Math.sin(theta);

				positions[i * 3] = x;
				positions[i * 3 + 1] = y;
				positions[i * 3 + 2] = z;

				particlePositionsVec3.push(new THREE.Vector3(x, y, z));

				// Store original cluster color
				colorHelper.set(cluster.color);
				colorHelper.offsetHSL(0, 0, (Math.random() - 0.5) * 0.2);

				// Use cluster colors directly
				colors[i * 3] = colorHelper.r;
				colors[i * 3 + 1] = colorHelper.g;
				colors[i * 3 + 2] = colorHelper.b;

				// Store base colors for blinking effect
				baseColors[i * 3] = colorHelper.r;
				baseColors[i * 3 + 1] = colorHelper.g;
				baseColors[i * 3 + 2] = colorHelper.b;

				blinkOffsets[i] = Math.random() * Math.PI * 2;
				blinkSpeeds[i] = 1.0 + Math.random() * 2.0; // Faster blink

				sizes[i] = 2.0 + Math.random() * 3.0; // Varied sizes

				clusterAlumni.push(alumnus);
			});

			// --- Constellation Lines ---
			// Connect nearby stars with faint lines
			const linePoints: THREE.Vector3[] = [];
			const maxConnections = 2; // Keep it clean
			const connectionDistance = 25;

			for (let i = 0; i < particleCount; i++) {
				const p1 = particlePositionsVec3[i];
				let connections = 0;
				for (let j = i + 1; j < particleCount; j++) {
					const p2 = particlePositionsVec3[j];
					if (
						p1.distanceToSquared(p2) <
						connectionDistance * connectionDistance
					) {
						linePoints.push(p1);
						linePoints.push(p2);
						connections++;
						if (connections >= maxConnections) break;
					}
				}
			}

			const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
			const lineMaterial = new THREE.LineBasicMaterial({
				color: cluster.color,
				transparent: true,
				opacity: 0.12, // Subtle lines
				blending: THREE.AdditiveBlending,
				depthWrite: false,
			});
			const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
			scene.add(linesMesh);
			// Bind lines visibility to points
			// We can attach it to the points object in userData or manage parallel array

			// Pre-calculate Grid Positions
			const gridPositions = new Float32Array(particleCount * 3);
			const fieldWidth = 350;
			const fieldHeight = 220;
			const minDistance = 12; // More spacing
			const placedPoints: { x: number; y: number }[] = [];

			for (let i = 0; i < particleCount; i++) {
				let x = 0,
					y = 0,
					_found = false;
				for (let attempt = 0; attempt < 50; attempt++) {
					x = (Math.random() - 0.5) * fieldWidth;
					y = (Math.random() - 0.5) * fieldHeight;
					let overlap = false;
					for (const p of placedPoints) {
						const dx = p.x - x;
						const dy = p.y - y;
						if (dx * dx + dy * dy < minDistance * minDistance) {
							overlap = true;
							break;
						}
					}
					if (!overlap) {
						_found = true;
						break;
					}
				}
				placedPoints.push({ x, y });
				gridPositions[i * 3] = center.x + x;
				gridPositions[i * 3 + 1] = center.y + y;
				gridPositions[i * 3 + 2] = center.z;
			}

			geometry.setAttribute(
				"position",
				new THREE.BufferAttribute(positions, 3),
			);
			geometry.setAttribute(
				"initialPosition",
				new THREE.BufferAttribute(positions.slice(), 3),
			);
			geometry.setAttribute(
				"gridPosition",
				new THREE.BufferAttribute(gridPositions, 3),
			);
			geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
			geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

			const material = new THREE.PointsMaterial({
				size: 8, // Bigger base size, attenuated
				sizeAttenuation: true,
				map: texture,
				alphaTest: 0.01,
				transparent: true,
				vertexColors: true,
				blending: THREE.AdditiveBlending,
				depthWrite: false,
				opacity: 1.0,
			});

			const points = new THREE.Points(geometry, material);
			points.userData = {
				clusterIndex: clusterIndex,
				blinkOffsets: blinkOffsets,
				blinkSpeeds: blinkSpeeds,
				baseColors: baseColors,
				linesMesh: linesMesh, // Store ref to lines
			};
			scene.add(points);
			clusterMeshesRef.current.push(points);
			alumniDataGrid.push(clusterAlumni);

			// Hit Mesh
			const hitMesh = new THREE.Mesh(
				new THREE.SphereGeometry(70, 16, 16), // Larger hit area
				new THREE.MeshBasicMaterial({ visible: false }),
			);
			hitMesh.position.copy(center);
			hitMesh.userData = { clusterIndex: clusterIndex };
			scene.add(hitMesh);
			clusterHitMeshes.push(hitMesh);
		});

		// --- Raycaster ---
		const raycaster = new THREE.Raycaster();
		raycaster.params.Points.threshold = 5;
		const mouse = new THREE.Vector2();

		const onMouseMove = (event: MouseEvent) => {
			mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
			mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
		};

		const enterCluster = (index: number) => {
			setViewMode("cluster");
			viewModeRef.current = "cluster";
			const center = clusterCentersRef.current[index];

			// Hide other clusters, transition colors for the active one
			clusterMeshesRef.current.forEach((mesh, i) => {
				if (i !== index) {
					mesh.visible = false;
					if (mesh.userData.linesMesh) mesh.userData.linesMesh.visible = false;
				} else {
					// Trigger Scatter Animation for the entered cluster
					(mesh.userData as ClusterUserData).targetState = "grid";
					(mesh.userData as ClusterUserData).transitionTime = 0;
					// Hide lines when in grid mode
					if (mesh.userData.linesMesh) mesh.userData.linesMesh.visible = false;
				}
			});

			// Set background color to cluster color
			setClusterBgColor(galaxyData[index].color);

			// Camera Logic
			targetControlsTarget.current.copy(center);
			// Zoom out slightly more than before to fit the scattered sphere
			const offset = new THREE.Vector3(0, 0, 150);
			targetCameraPos.current.copy(center).add(offset);

			isTransitioning.current = true;
			controls.autoRotate = false;
		};

		// --- Animation Loop ---
		let hoveredIndex = -1;
		let hoveredClusterIndex = -1;
		const tempV = new THREE.Vector3();

		const animate = () => {
			requestAnimationFrame(animate);

			// Camera Transition Logic
			if (isTransitioning.current) {
				// Use a slightly faster lerp for responsiveness
				camera.position.lerp(targetCameraPos.current, 0.08);
				controls.target.lerp(targetControlsTarget.current, 0.08);

				// Check if close enough to stop transition
				if (
					camera.position.distanceTo(targetCameraPos.current) < 1.0 &&
					controls.target.distanceTo(targetControlsTarget.current) < 1.0
				) {
					isTransitioning.current = false;

					// If we just finished transitioning back to Overview, resume rotation
					if (viewModeRef.current === "overview") {
						controls.autoRotate = true;
					}
				}
			}

			// --- Twinkle Animation ---
			const time = Date.now() * 0.001;
			clusterMeshesRef.current.forEach((points) => {
				if (!points.visible) return; // Optimization

				const colors = points.geometry.attributes.color.array as Float32Array;
				const { blinkOffsets, blinkSpeeds, baseColors } = points.userData;

				for (let i = 0; i < blinkOffsets.length; i++) {
					// Sine wave between 0.5 and 1.0 intensity for subtle blinking
					const brightness =
						0.6 + 0.4 * Math.sin(time * blinkSpeeds[i] + blinkOffsets[i]);

					colors[i * 3] = baseColors[i * 3] * brightness;
					colors[i * 3 + 1] = baseColors[i * 3 + 1] * brightness;
					colors[i * 3 + 2] = baseColors[i * 3 + 2] * brightness;
				}

				points.geometry.attributes.color.needsUpdate = true;

				// --- Position Morphing (Cloud <-> Grid) ---
				if (points.userData.targetState) {
					const uTime = points.userData.transitionTime || 0;
					const targetTime = 1; // 1 second transition

					if (uTime < targetTime) {
						const dt = 0.02; // Approximation or use delta time
						points.userData.transitionTime = uTime + dt;
						const alpha = Math.min(
							points.userData.transitionTime / targetTime,
							1,
						);

						// Ease function
						const _t =
							alpha < 0.5 ? 2 * alpha * alpha : -1 + (4 - 2 * alpha) * alpha;

						const positions = points.geometry.attributes.position
							.array as Float32Array;
						const initial = points.geometry.attributes.initialPosition
							.array as Float32Array;
						const grid = points.geometry.attributes.gridPosition
							.array as Float32Array;

						// If target is grid, go initial -> grid. If cloud, go grid -> initial??
						// No, simpler: always lerp between initial and grid based on factor.
						// But wait, we modified the actual 'position' attribute.
						// So we should interpolate between two fixed buffers into the active 'position' buffer.

						// Determine interpolation factor based on state
						// We need a 'currentFactor' stored. Or just animate 'transitionProgress' 0->1.
						// Let state determine direction.

						// We need a persistent 'morphFactor' 0 (cloud) to 1 (grid)
						let morph = points.userData.morphFactor || 0;
						const targetMorph = points.userData.targetState === "grid" ? 1 : 0;

						// Simple approach logic
						if (Math.abs(targetMorph - morph) > 0.01) {
							morph += (targetMorph - morph) * 0.1; // Smooth approach
							points.userData.morphFactor = morph;

							for (let i = 0; i < positions.length; i++) {
								positions[i] = initial[i] * (1 - morph) + grid[i] * morph;
							}
							points.geometry.attributes.position.needsUpdate = true;
						}
					}
				}
			});

			controls.update();

			// Update Labels Visibility
			clusterCentersRef.current.forEach((center, i: number) => {
				const _x = 0,
					_y = 0; // calculated below
				const labelEl = document.getElementById(`cluster-label-${i}`);

				if (labelEl) {
					// Determine visibility based on logic
					let isVisible = true;
					if (viewModeRef.current === "cluster") {
						// Use ref for reliable state in animation loop
						// In cluster mode, only show if the cluster is visible
						if (clusterMeshesRef.current[i].visible === false)
							isVisible = false;
					}

					if (isVisible) {
						tempV.copy(center);
						tempV.project(camera);
						if (tempV.z < 1) {
							const lx = (tempV.x * 0.5 + 0.5) * window.innerWidth;
							const ly = (-(tempV.y * 0.5) + 0.5) * window.innerHeight;
							labelEl.style.display = "block";
							labelEl.style.transform = `translate(-50%, -50%) translate(${lx}px, ${ly}px)`;
						} else {
							labelEl.style.display = "none";
						}
					} else {
						labelEl.style.display = "none";
					}
				}
			});

			// Mouse Interaction
			raycaster.setFromCamera(mouse, camera);

			if (viewModeRef.current === "overview") {
				const hits = raycaster.intersectObjects(clusterHitMeshes);
				document.body.style.cursor = hits.length > 0 ? "pointer" : "default";
				setHoveredStar(null);
			} else if (viewModeRef.current === "cluster") {
					const visibleClusters = clusterMeshesRef.current.filter(
						(m) => m.visible,
					);
				const intersects = raycaster.intersectObjects(visibleClusters);

				document.body.style.cursor =
					intersects.length > 0 ? "pointer" : "default";

				if (intersects.length > 0) {
					const instanceId = intersects[0].index;
					const clusterIdx = intersects[0].object.userData.clusterIndex;

					if (
						instanceId !== undefined &&
						clusterIdx !== undefined &&
						(instanceId !== hoveredIndex || clusterIdx !== hoveredClusterIndex)
					) {
						hoveredIndex = instanceId;
						hoveredClusterIndex = clusterIdx;

						const starData = alumniDataGrid[clusterIdx][instanceId]; // Access data

						// Calculate screen pos for tooltip
						const p = intersects[0].point.clone();
						p.project(camera);
						const startX = (p.x * 0.5 + 0.5) * window.innerWidth;
						const startY = (-(p.y * 0.5) + 0.5) * window.innerHeight;

						setHoveredStar({ x: startX, y: startY, data: starData });
					}
				} else {
					setHoveredStar(null);
					hoveredIndex = -1;
					hoveredClusterIndex = -1;
				}
			}

			// Handle Camera Offset for Sidebar
			// We want to shift the view so the center of the 3D scene appears to the LEFT
			// to make room for the sidebar on the RIGHT.
			// setViewOffset(fullW, fullH, x, y, w, h)
			// Positive x shifts the finding window to the right, which makes the image shift LEFT.
			const targetOffset = sidebarOpenRef.current
				? window.innerWidth * 0.15
				: 0;

			// Smoothly interpolate offset
			if (Math.abs(currentViewOffset.current - targetOffset) > 0.5) {
				currentViewOffset.current +=
					(targetOffset - currentViewOffset.current) * 0.1;

				camera.setViewOffset(
					window.innerWidth,
					window.innerHeight,
					currentViewOffset.current,
					0,
					window.innerWidth,
					window.innerHeight,
				);
			}

			renderer.render(scene, camera);
		};

		animate();

		// Click Handler (Interaction)
		const onClick = (_event: MouseEvent) => {
			if (isTransitioning.current) return;
			raycaster.setFromCamera(mouse, camera);

			if (viewModeRef.current === "overview") {
				const intersects = raycaster.intersectObjects(clusterHitMeshes);
				if (intersects.length > 0) {
					enterCluster(intersects[0].object.userData.clusterIndex);
				}
			} else {
				// Cluster Mode: Select Star
			const visibleClusters = clusterMeshesRef.current.filter(
				(m) => m.visible,
			);
				const intersects = raycaster.intersectObjects(visibleClusters);

				if (intersects.length > 0) {
					const instanceId = intersects[0].index;
					const clusterIdx = intersects[0].object.userData.clusterIndex;

					if (instanceId !== undefined && clusterIdx !== undefined) {
						const starData = alumniDataGrid[clusterIdx][instanceId]; // Access data
						setSelectedStar({ x: 0, y: 0, data: starData }); // Coords not needed for sidebar
						sidebarOpenRef.current = true;
					}
				} else {
					// Clicking empty space deselects
					setSelectedStar(null);
					sidebarOpenRef.current = false;
				}
			}
		};

		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("click", onClick);

		const handleResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		};
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("click", onClick);
			if (mountRef.current && renderer.domElement) {
				mountRef.current.removeChild(renderer.domElement);
			}
			// Dispose of all geometries and materials
			clusterMeshesRef.current.forEach((mesh) => {
				mesh.geometry.dispose();
				(mesh.material as THREE.Material).dispose();
			});
			renderer.dispose();
		};
	}, []);

	return (
		<div className="galaxy-container" ref={mountRef}>
			{/* Labels */}
			{galaxyData.map((cluster: MajorCluster, i: number) => (
				<div
					key={i}
					id={`cluster-label-${i}`}
					className="cluster-label"
					style={{ top: 0, left: 0, display: "none" }}
				>
					{cluster.name}
				</div>
			))}

			{/* Back Button */}
			{viewMode === "cluster" && (
				<button
					type="button"
					className="glass-back-button"
					onClick={handleBackClick}
				>
					← Back to Overview
				</button>
			)}

			{/* Hover Tooltip (Detailed) */}
			{!selectedStar && hoveredStar && viewMode === "cluster" && (
				<div
					className="star-popup visible"
					style={{
						top: hoveredStar.y,
						left: hoveredStar.x,
						pointerEvents: "none", // Ensure clicks pass through to 3D scene (unless buttons are inside?)
						// If we want hover to be interactive (e.g. click button), pointerEvents must be auto.
						// But raycaster runs on mousemove. If tooltip covers the star, mousemove might lose the star?
						// Usually simpler if tooltip is offset or non-interactive for selection.
						// Since Click on Star opens Sidebar, this tooltip is just preview.
					}}
				>
					<div className="popup-header">
						<div className="popup-avatar">
							{hoveredStar.data.name.substring(0, 2).toUpperCase()}
						</div>
						<div className="popup-info">
							<h3>{hoveredStar.data.name}</h3>
							<p>
								{hoveredStar.data.major} '
								{hoveredStar.data.year.toString().slice(-2)}
							</p>
						</div>
					</div>
					<div className="popup-details">
						{hoveredStar.data.position}
						<br />
						{hoveredStar.data.company}
					</div>
					{/* Trace/Hint */}
					<div className="text-[10px] text-white/50 mt-2 uppercase tracking-wide">
						Click to view profile & chat
					</div>
				</div>
			)}

			{/* Side Panel (Desktop) */}
			<div className={`galaxy-sidebar ${selectedStar ? "open" : ""}`}>
				{selectedStar && (
					<>
						<button
							type="button"
							className="sidebar-close"
							onClick={() => {
								setSelectedStar(null);
								sidebarOpenRef.current = false;
							}}
						>
							×
						</button>

						<div className="sidebar-header">
							<div className="sidebar-avatar">
								{selectedStar.data.name.substring(0, 2).toUpperCase()}
							</div>
							<div>
								<h2>{selectedStar.data.name}</h2>
								<p className="sidebar-subtitle">
									{selectedStar.data.major} '
									{selectedStar.data.year.toString().slice(-2)}
								</p>
							</div>
						</div>

						<div className="sidebar-content">
							<div className="sidebar-section">
								<h3>Current Position</h3>
								<p>{selectedStar.data.position}</p>
								<p className="text-sm opacity-70">
									{selectedStar.data.company}
								</p>
							</div>

							<hr className="sidebar-divider" />

							<div className="sidebar-section">
								<h3>Location</h3>
								<p>Beirut, Lebanon</p>
							</div>

							<button
								type="button"
								className="sidebar-action-btn"
								onClick={() => navigate(`/chat/${selectedStar.data.id}`)}
							>
								Start Conversation
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

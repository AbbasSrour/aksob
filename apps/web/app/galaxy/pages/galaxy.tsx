import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createOrGetDm } from "~/app/chat/lib/chat";
import { useSession } from "~/app/lib/auth";
import {
	type Connection,
	type ConnectionType,
	findConnectionMatch,
	sendConnectionRequest,
} from "~/app/lib/connections";
import { listUsers } from "~/app/lib/users";
import "./galaxy.css";
import {
	type Alumnus,
	buildGalaxyData,
	type ProgramCluster,
} from "../utils/galaxy-data";

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
	const navigate = useNavigate();
	const { data: session } = useSession();
	const mountRef = useRef<HTMLDivElement>(null);
	const [galaxyData, setGalaxyData] = useState<ProgramCluster[]>([]);
	const [isLoadingUsers, setIsLoadingUsers] = useState(true);
	const [isStartingConversation, setIsStartingConversation] = useState(false);
	const [conversationError, setConversationError] = useState<string | null>(
		null,
	);
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
	const [introPhase, setIntroPhase] = useState<
		"prefix" | "cycle" | "easter" | "fading" | "done"
	>("prefix");
	const [cycleText, setCycleText] = useState("");
	const [visibleEasterLines, setVisibleEasterLines] = useState(0);

	// Connection finder state
	const [showConnectionSheet, setShowConnectionSheet] = useState(false);
	const [connectionStep, setConnectionStep] = useState<
		"agent" | "type" | "form"
	>("type");
	const [connectionType, setConnectionType] = useState<ConnectionType | null>(
		null,
	);
	const [connectionDescription, setConnectionDescription] = useState("");
	const [matches, setMatches] = useState<Alumnus[]>([]);
	const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
	const [showMatchCard, setShowMatchCard] = useState(false);
	const [createdConnection, setCreatedConnection] = useState<Connection | null>(
		null,
	);
	const [isSendingRequest, setIsSendingRequest] = useState(false);
	const [connectionError, setConnectionError] = useState<string | null>(null);

	// Agent UI state
	const [agentTools, setAgentTools] = useState<
		Array<{ name: string; status: "thinking" | "done" | "error" }>
	>([]);
	const [agentThinking, setAgentThinking] = useState(false);

	// Track sidebar visibility for animation in loop
	const sidebarOpenRef = useRef(false);

	// Refs for animation state to avoid re-renders
	const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
	const controlsRef = useRef<OrbitControls | null>(null);
	const targetCameraPos = useRef(new THREE.Vector3(0, 100, 400));
	const targetControlsTarget = useRef(new THREE.Vector3(0, 0, 0));
	const introCameraZ = useRef(400);
	const introProgressRef = useRef(0);
	const lastIntroProgressRef = useRef(-1);
	const introPhaseRef = useRef(introPhase);
	const introSkippedRef = useRef(false);
	const isTransitioning = useRef(false);
	const viewModeRef = useRef<"overview" | "cluster">("overview");
	const activeClusterIndexRef = useRef<number | null>(null);
	const navigateToMatchRef = useRef<((match: Alumnus) => void) | null>(null);
	const selectedMatchMarkerRef = useRef<THREE.Sprite | null>(null);
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
		activeClusterIndexRef.current = null;
		if (selectedMatchMarkerRef.current) {
			selectedMatchMarkerRef.current.visible = false;
		}
		// Reset Camera Target
		targetCameraPos.current.set(0, 100, introCameraZ.current);
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

	const handleStartConversation = async () => {
		if (!selectedStar || isStartingConversation) {
			return;
		}

		setIsStartingConversation(true);
		setConversationError(null);
		try {
			const response = await createOrGetDm(selectedStar.data.id);
			navigate(`/chat/${response.data.conversationId}`);
		} catch (error) {
			if (
				error instanceof Error &&
				"status" in error &&
				(error as Error & { status: number }).status === 401
			) {
				const redirectTo = encodeURIComponent(`/galaxy`);
				navigate(`/auth/login?redirectTo=${redirectTo}`);
				return;
			}

			setConversationError(
				error instanceof Error
					? error.message
					: "Could not start this conversation right now.",
			);
		} finally {
			setIsStartingConversation(false);
		}
	};

	const getDisplayTitle = (star: Alumnus) => {
		return star.position.trim() || "Not specified";
	};

	const getDisplayCompany = (star: Alumnus) => {
		return star.company.trim() || "Not specified";
	};

	const userType = (session?.user?.type as string) ?? "student";

	// Connection type eligibility (must match backend CONNECTION_TYPE_ELIGIBILITY)
	const ELIGIBLE_CONNECTION_TYPES: Record<string, ConnectionType[]> = {
		alumni: ["mentorship", "career_coaching", "research", "project"],
		student: [
			"mentorship",
			"career_coaching",
			"study_partner",
			"buddy",
			"research",
			"project",
		],
		faculty: ["mentorship", "career_coaching", "research", "project"],
	};
	const eligibleTypes = ELIGIBLE_CONNECTION_TYPES[userType] ?? [];

	// Connection types from API (filtered by user eligibility)
	const CONNECTION_TYPE_OPTIONS: Array<{
		value: ConnectionType;
		label: string;
		icon: string;
	}> = [
		{ value: "mentorship", label: "Mentorship", icon: "🎓" },
		{ value: "career_coaching", label: "Career Coaching", icon: "💼" },
		{ value: "study_partner", label: "Study Partner", icon: "📚" },
		{ value: "buddy", label: "Buddy", icon: "🤝" },
		{ value: "research", label: "Research", icon: "🔬" },
		{ value: "project", label: "Project", icon: "🚀" },
	].filter((opt) => eligibleTypes.includes(opt.value));

	// Fly camera to a match position
	const flyToMatch = (match: Alumnus) => {
		navigateToMatchRef.current?.(match);
	};

	const getConnectionErrorMessage = (error: unknown) => {
		if (error instanceof Error) {
			try {
				const parsed = JSON.parse(error.message) as { error?: unknown };
				if (typeof parsed.error === "string") {
					return parsed.error;
				}
			} catch {
				return error.message;
			}
			return error.message;
		}

		return "Could not find a connection match right now.";
	};

	const findAlumnusById = (userId: string) => {
		for (const cluster of galaxyData) {
			const alumnus = cluster.alumni.find((item) => item.id === userId);
			if (alumnus) {
				return alumnus;
			}
		}

		return null;
	};

	// Handle connection search through the API.
	const handleSearch = async () => {
		if (!connectionType) return;
		setConnectionStep("agent");
		setAgentThinking(true);
		setConnectionError(null);
		setCreatedConnection(null);
		setAgentTools([{ name: "Finding connection options", status: "thinking" }]);

		try {
			const response = await findConnectionMatch({
				type: connectionType,
				message: connectionDescription.trim() || undefined,
			});
			const candidateMatches = response.data.candidates
				.map((candidate) => findAlumnusById(candidate.id))
				.filter((match): match is Alumnus => match !== null);

			setAgentTools([{ name: "Finding connection options", status: "done" }]);

			if (candidateMatches.length === 0) {
				setConnectionError(
					"Matches were found, but those users are not visible in the current galaxy.",
				);
				return;
			}

			setMatches(candidateMatches);
			setCurrentMatchIndex(0);
			setShowConnectionSheet(false);
			setShowMatchCard(true);
			setTimeout(() => flyToMatch(candidateMatches[0]), 100);
		} catch (error) {
			if (
				error instanceof Error &&
				"status" in error &&
				(error as Error & { status: number }).status === 401
			) {
				const redirectTo = encodeURIComponent("/galaxy");
				navigate(`/auth/login?redirectTo=${redirectTo}`);
				return;
			}
			setAgentTools((prev) =>
				prev.map((tool) => ({ ...tool, status: "error" })),
			);
			setConnectionError(getConnectionErrorMessage(error));
		} finally {
			setAgentThinking(false);
		}
	};

	const handleSendRequest = async () => {
		if (!connectionType || !matches[currentMatchIndex]) return;

		setIsSendingRequest(true);
		setConnectionError(null);

		try {
			const response = await sendConnectionRequest({
				type: connectionType,
				matchedUserId: matches[currentMatchIndex].id,
				message: connectionDescription.trim() || undefined,
			});

			setCreatedConnection(response.data);
		} catch (error) {
			if (
				error instanceof Error &&
				"status" in error &&
				(error as Error & { status: number }).status === 401
			) {
				const redirectTo = encodeURIComponent("/galaxy");
				navigate(`/auth/login?redirectTo=${redirectTo}`);
				return;
			}

			setConnectionError(getConnectionErrorMessage(error));
		} finally {
			setIsSendingRequest(false);
		}
	};

	// Navigate between matches
	const goToMatch = (index: number) => {
		if (index < 0 || index >= matches.length) return;
		setCurrentMatchIndex(index);
		flyToMatch(matches[index]);
	};

	useEffect(() => {
		let isMounted = true;

		const loadUsers = async () => {
			try {
				const response = await listUsers();
				if (!isMounted) {
					return;
				}
				setGalaxyData(buildGalaxyData(response.data));
			} catch {
				if (!isMounted) {
					return;
				}
				setGalaxyData(buildGalaxyData([]));
			} finally {
				if (isMounted) {
					setIsLoadingUsers(false);
				}
			}
		};

		void loadUsers();

		return () => {
			isMounted = false;
		};
	}, []);

	// Keep ref in sync with introPhase state for 3D click handler
	useEffect(() => {
		introPhaseRef.current = introPhase;
	}, [introPhase]);

	// Intro animation — rotating typewriter: cycle words, end on LOVE
	useEffect(() => {
		const WORDS = [
			"STUDY BUDDY",
			"RESEARCH PARTNER",
			"MENTOR",
			"CAREER COACH",
			"PROJECT PARTNER",
			"BUDDY",
			"LOVE 💕",
		] as const;
		const EASTER_LINES = [
			"ohh embarrassing 😳",
			"maybe there is something for that already 🤭",
		] as const;
		const sleep = (ms: number) =>
			new Promise((resolve) => setTimeout(resolve, ms));

		let cancelled = false;
		const shouldStopIntro = () => cancelled || introSkippedRef.current;

		const run = async () => {
			await sleep(500);

			// Prefix fades in
			if (shouldStopIntro()) return;
			setIntroPhase("cycle");
			await sleep(500);

			// Cycle through words: type → pause → backspace → next
			for (let w = 0; w < WORDS.length; w++) {
				if (shouldStopIntro()) return;
				const word = WORDS[w];

				// Type out
				for (let i = 1; i <= word.length; i++) {
					if (shouldStopIntro()) return;
					setCycleText(word.slice(0, i));
					await sleep(75);
				}

				// Pause — much longer on LOVE (the easter egg)
				await sleep(w === WORDS.length - 1 ? 1800 : 700);

				// Backspace (except after LOVE — the final word)
				if (w < WORDS.length - 1) {
					for (let i = word.length - 1; i >= 0; i--) {
						if (shouldStopIntro()) return;
						setCycleText(word.slice(0, i));
						await sleep(40);
					}
					await sleep(250);
				}
			}

			await sleep(500);

			// Easter egg footnotes appear below LOVE
			if (shouldStopIntro()) return;
			setIntroPhase("easter");
			for (let i = 0; i < EASTER_LINES.length; i++) {
				if (shouldStopIntro()) return;
				setVisibleEasterLines(i + 1);
				await sleep(550);
			}

			await sleep(1200);

			// Fade out overlay + camera pull-back
			if (shouldStopIntro()) return;
			setIntroPhase("fading");
			introCameraZ.current = 520;
			await sleep(1000);
			setIntroPhase("done");
		};

		run();

		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		if (!mountRef.current || galaxyData.length === 0) return;

		introProgressRef.current = 0;
		lastIntroProgressRef.current = -1;

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
		controls.enablePan = false;
		controls.maxDistance = 1200;
		controls.minDistance = 20;
		controlsRef.current = controls;

		const overviewTarget = new THREE.Vector3(0, 0, 0);

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

		const createSelectedMarkerTexture = () => {
			const canvas = document.createElement("canvas");
			canvas.width = 128;
			canvas.height = 128;
			const context = canvas.getContext("2d");
			if (!context) return new THREE.Texture();

			context.clearRect(0, 0, 128, 128);
			context.strokeStyle = "rgba(212, 175, 55, 0.95)";
			context.lineWidth = 5;
			context.beginPath();
			context.arc(64, 64, 34, 0, Math.PI * 2);
			context.stroke();

			context.strokeStyle = "rgba(255, 255, 255, 0.55)";
			context.lineWidth = 2;
			context.beginPath();
			context.arc(64, 64, 46, 0, Math.PI * 2);
			context.stroke();

			const markerTexture = new THREE.CanvasTexture(canvas);
			return markerTexture;
		};

		const selectedMarkerTexture = createSelectedMarkerTexture();
		const selectedMarkerMaterial = new THREE.SpriteMaterial({
			map: selectedMarkerTexture,
			transparent: true,
			opacity: 0,
			depthWrite: false,
			depthTest: false,
		});
		const selectedMarker = new THREE.Sprite(selectedMarkerMaterial);
		selectedMarker.visible = false;
		selectedMarker.scale.set(34, 34, 1);
		selectedMarker.renderOrder = 10;
		scene.add(selectedMarker);
		selectedMatchMarkerRef.current = selectedMarker;

		const FORMATION_DURATION = 10000; // 10 seconds
		let formationStart: number | null = null;
		const formationInterval = setInterval(() => {
			if (introPhaseRef.current !== "done") return;

			formationStart ??= Date.now();

			const elapsed = Date.now() - formationStart;
			const progress = Math.min(elapsed / FORMATION_DURATION, 1);
			// Ease out cubic
			introProgressRef.current = 1 - (1 - progress) ** 3;

			if (progress >= 1) {
				clearInterval(formationInterval);
			}
		}, 16);

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
			size: 3.5,
			map: texture,
			vertexColors: true,
			transparent: true,
			opacity: 0.8,
			sizeAttenuation: false,
			blending: THREE.AdditiveBlending,
			depthWrite: false,
		});
		const bgStars = new THREE.Points(bgGeometry, bgMaterial);
		scene.add(bgStars);

		// --- Galaxy Generation (Per Cluster) ---
		const alumniDataGrid: Alumnus[][] = [];
		clusterMeshesRef.current = [];
		clusterCentersRef.current = [];
		const clusterHitMeshes: THREE.Mesh[] = [];

		galaxyData.forEach((cluster: ProgramCluster, clusterIndex: number) => {
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
				opacity: 0, // Fade links in as the intro formation completes
				blending: THREE.AdditiveBlending,
				depthWrite: false,
			});
			const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
			scene.add(linesMesh);
			// Bind lines visibility to points
			// We can attach it to the points object in userData or manage parallel array

			// Pre-calculate Intro Start Positions (stars form from edges)
			const introStartPositions = new Float32Array(particleCount * 3);
			for (let i = 0; i < particleCount; i++) {
				// Distribute on a very large sphere, biased toward equator for edge effect
				const introRadius = 1400 + Math.random() * 1000;
				const theta = Math.random() * Math.PI * 2;
				// Bias toward equator so particles come from sides, not poles
				const phi = Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.6;
				introStartPositions[i * 3] =
					introRadius * Math.sin(phi) * Math.cos(theta);
				introStartPositions[i * 3 + 1] =
					introRadius * Math.sin(phi) * Math.sin(theta);
				introStartPositions[i * 3 + 2] = introRadius * Math.cos(phi);
			}

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
				new THREE.BufferAttribute(introStartPositions.slice(), 3),
			);
			geometry.setAttribute(
				"initialPosition",
				new THREE.BufferAttribute(positions.slice(), 3),
			);
			geometry.setAttribute(
				"introStartPosition",
				new THREE.BufferAttribute(introStartPositions, 3),
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

		const updateMousePosition = (event: MouseEvent) => {
			mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
			mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
		};

		const getNearestVisibleStarHit = (event: MouseEvent) => {
			const maxDistance = 18;
			let nearest: {
				clusterIndex: number;
				particleIndex: number;
				x: number;
				y: number;
				distance: number;
			} | null = null;

			for (const mesh of clusterMeshesRef.current) {
				if (!mesh.visible) continue;

				const clusterIndex = mesh.userData.clusterIndex as number | undefined;
				if (clusterIndex === undefined) continue;

				const positions = mesh.geometry.attributes.position
					.array as Float32Array;
				for (let i = 0; i < positions.length; i += 3) {
					tempV.set(positions[i], positions[i + 1], positions[i + 2]);
					tempV.project(camera);
					if (tempV.z < -1 || tempV.z > 1) continue;

					const x = (tempV.x * 0.5 + 0.5) * window.innerWidth;
					const y = (-(tempV.y * 0.5) + 0.5) * window.innerHeight;
					const distance = Math.hypot(event.clientX - x, event.clientY - y);

					if (
						distance <= maxDistance &&
						(!nearest || distance < nearest.distance)
					) {
						nearest = {
							clusterIndex,
							particleIndex: i / 3,
							x,
							y,
							distance,
						};
					}
				}
			}

			return nearest;
		};

		const enterCluster = (index: number) => {
			setViewMode("cluster");
			viewModeRef.current = "cluster";
			activeClusterIndexRef.current = index;
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

			// Camera Logic
			targetControlsTarget.current.copy(center);
			// Zoom out slightly more than before to fit the scattered sphere
			const offset = new THREE.Vector3(0, 0, 150);
			targetCameraPos.current.copy(center).add(offset);

			isTransitioning.current = true;
			controls.autoRotate = false;
		};

		const highlightStarInCluster = (
			clusterIndex: number,
			particleIndex: number,
		) => {
			const mesh = clusterMeshesRef.current[clusterIndex];
			if (!mesh) return;

			const grid = mesh.geometry.attributes.gridPosition.array as Float32Array;
			const targetPos = new THREE.Vector3(
				grid[particleIndex * 3],
				grid[particleIndex * 3 + 1],
				grid[particleIndex * 3 + 2],
			);

			if (selectedMatchMarkerRef.current) {
				selectedMatchMarkerRef.current.position.copy(targetPos);
				selectedMatchMarkerRef.current.visible = true;
				(
					selectedMatchMarkerRef.current.material as THREE.SpriteMaterial
				).opacity = 1;
			}
		};

		const returnToOverview = () => {
			setViewMode("overview");
			viewModeRef.current = "overview";
			activeClusterIndexRef.current = null;
			targetCameraPos.current.set(0, 100, introCameraZ.current);
			targetControlsTarget.current.set(0, 0, 0);
			isTransitioning.current = true;

			if (controlsRef.current) {
				controlsRef.current.autoRotate = false;
			}

			clusterMeshesRef.current.forEach((mesh) => {
				mesh.visible = true;
				if (mesh.userData.linesMesh) mesh.userData.linesMesh.visible = true;
				(mesh.userData as ClusterUserData).targetState = "cloud";
				(mesh.userData as ClusterUserData).transitionTime = 0;
				(mesh.material as THREE.PointsMaterial).opacity = 1;
			});

			if (selectedMatchMarkerRef.current) {
				selectedMatchMarkerRef.current.visible = false;
			}
		};

		navigateToMatchRef.current = (match: Alumnus) => {
			const clusterIndex = galaxyData.findIndex(
				(cluster) => cluster.name === match.program,
			);
			if (clusterIndex === -1) return;

			const particleIndex = galaxyData[clusterIndex]?.alumni.findIndex(
				(alumnus) => alumnus.id === match.id,
			);
			if (particleIndex === undefined || particleIndex === -1) return;

			const focusSelected = () => {
				enterCluster(clusterIndex);
				window.setTimeout(
					() => highlightStarInCluster(clusterIndex, particleIndex),
					900,
				);
			};

			if (
				viewModeRef.current === "cluster" &&
				activeClusterIndexRef.current !== clusterIndex
			) {
				returnToOverview();
				window.setTimeout(focusSelected, 900);
				return;
			}

			if (viewModeRef.current === "overview") {
				focusSelected();
				return;
			}

			highlightStarInCluster(clusterIndex, particleIndex);
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

			if (viewModeRef.current === "overview" && !isTransitioning.current) {
				controls.target.lerp(overviewTarget, 0.02);
			}

			// Intro/overview camera pull-back. Do not fight cluster focus transitions.
			if (
				viewModeRef.current === "overview" &&
				Math.abs(camera.position.z - introCameraZ.current) > 0.5
			) {
				camera.position.z += (introCameraZ.current - camera.position.z) * 0.03;
			}

			if (selectedMatchMarkerRef.current?.visible) {
				const pulse = 1 + Math.sin(Date.now() * 0.006) * 0.1;
				selectedMatchMarkerRef.current.scale.set(34 * pulse, 34 * pulse, 1);
			}

			// --- Galaxy Formation (Intro) ---
			if (introProgressRef.current !== lastIntroProgressRef.current) {
				const t = introProgressRef.current;
				clusterMeshesRef.current.forEach((points) => {
					const positions = points.geometry.attributes.position
						.array as Float32Array;
					const initial = points.geometry.attributes.initialPosition
						.array as Float32Array;
					const introStart = points.geometry.attributes.introStartPosition
						?.array as Float32Array | undefined;
					if (!introStart) return;

					for (let i = 0; i < positions.length; i++) {
						positions[i] = introStart[i] + (initial[i] - introStart[i]) * t;
					}
					points.geometry.attributes.position.needsUpdate = true;

					const linesMesh = points.userData.linesMesh as
						| THREE.LineSegments
						| undefined;
					const linesMaterial = linesMesh?.material as
						| THREE.LineBasicMaterial
						| undefined;
					if (linesMaterial) {
						const lineFade = Math.max(0, Math.min(1, (t - 0.96) / 0.04));
						linesMaterial.opacity = lineFade * 0.12;
					}
				});
				lastIntroProgressRef.current = introProgressRef.current;
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
					if (
						introPhaseRef.current !== "done" ||
						introProgressRef.current < 0.98
					) {
						labelEl.style.display = "none";
						return;
					}

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

		// Mouse Interaction
		const onMouseMove = (_event: MouseEvent) => {
			if (introPhaseRef.current !== "done") {
				document.body.style.cursor = "default";
				setHoveredStar(null);
				return;
			}

			updateMousePosition(_event);

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
				const nearestStarHit =
					intersects.length === 0 ? getNearestVisibleStarHit(_event) : null;

				document.body.style.cursor =
					intersects.length > 0 || nearestStarHit ? "pointer" : "default";

				if (intersects.length > 0 || nearestStarHit) {
					const instanceId =
						nearestStarHit?.particleIndex ?? intersects[0].index;
					const clusterIdx =
						nearestStarHit?.clusterIndex ??
						intersects[0].object.userData.clusterIndex;

					if (
						instanceId !== undefined &&
						clusterIdx !== undefined &&
						(instanceId !== hoveredIndex || clusterIdx !== hoveredClusterIndex)
					) {
						hoveredIndex = instanceId;
						hoveredClusterIndex = clusterIdx;

						const starData = alumniDataGrid[clusterIdx][instanceId]; // Access data

						// Calculate screen pos for tooltip
						const startX = nearestStarHit
							? nearestStarHit.x
							: (intersects[0].point.clone().project(camera).x * 0.5 + 0.5) *
								window.innerWidth;
						const startY = nearestStarHit
							? nearestStarHit.y
							: (-(intersects[0].point.clone().project(camera).y * 0.5) + 0.5) *
								window.innerHeight;

						setHoveredStar({ x: startX, y: startY, data: starData });
					}
				} else {
					setHoveredStar(null);
					hoveredIndex = -1;
					hoveredClusterIndex = -1;
				}
			}
		};

		// Click Handler (Interaction)
		const onClick = (_event: MouseEvent) => {
			if (introPhaseRef.current !== "done") return;
			updateMousePosition(_event);
			raycaster.setFromCamera(mouse, camera);

			if (viewModeRef.current === "overview") {
				if (isTransitioning.current) return;
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
				const nearestStarHit =
					intersects.length === 0 ? getNearestVisibleStarHit(_event) : null;

				if (intersects.length > 0 || nearestStarHit) {
					const instanceId =
						nearestStarHit?.particleIndex ?? intersects[0].index;
					const clusterIdx =
						nearestStarHit?.clusterIndex ??
						intersects[0].object.userData.clusterIndex;

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
			navigateToMatchRef.current = null;
			selectedMatchMarkerRef.current = null;
			clearInterval(formationInterval);
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
			bgGeometry.dispose();
			bgMaterial.dispose();
			texture.dispose();
			selectedMarkerTexture.dispose();
			selectedMarkerMaterial.dispose();
			controls.dispose();
			renderer.dispose();
		};
	}, [galaxyData]);

	return (
		<div className="galaxy-container" ref={mountRef}>
			{/* Intro Overlay */}
			{introPhase !== "done" && (
				<div
					className={`galaxy-intro-overlay${introPhase === "fading" ? " fading" : ""}`}
				>
					<div className="galaxy-typewriter-container">
						<div
							className={`galaxy-typewriter-prefix${introPhase !== "prefix" ? " visible" : ""}`}
						>
							Looking for a
						</div>
						<div className="galaxy-typewriter-word">
							{cycleText}
							{introPhase !== "fading" && (
								<span className="galaxy-typewriter-cursor" />
							)}
						</div>
						<div className="galaxy-easter-lines">
							{[
								"ohh embarrassing 😳",
								"maybe there is something for that already 🤭",
							].map((line, i) =>
								i < visibleEasterLines ? (
									<div
										key={`easter-${i}`}
										className="galaxy-easter-line visible"
										style={{
											animationDelay: `${i * 0.12}s`,
										}}
									>
										{line}
									</div>
								) : null,
							)}
						</div>
					</div>
				</div>
			)}

			{/* Action Button — persists after intro */}
			{viewMode === "overview" && !showConnectionSheet && !showMatchCard && (
				<button
					className={`galaxy-action-btn${introPhase === "done" ? " expanded" : ""}`}
					onClick={(e) => {
						e.stopPropagation();
						if (introPhase !== "done") {
							introSkippedRef.current = true;
							setVisibleEasterLines(0);
							setIntroPhase("fading");
							introCameraZ.current = 520;
							setTimeout(() => setIntroPhase("done"), 900);
						} else {
							if (!session) {
								const redirectTo = encodeURIComponent("/galaxy");
								navigate(`/auth/login?redirectTo=${redirectTo}`);
								return;
							}
							setShowConnectionSheet(true);
							setConnectionStep("type");
							setConnectionType(null);
							setConnectionDescription("");
							setConnectionError(null);
							setCreatedConnection(null);
							setIsSendingRequest(false);
							setAgentTools([]);
						}
					}}
					type="button"
				>
					<span className="galaxy-action-btn-text">
						{introPhase === "done" ? "Find connections" : "Skip intro"}
					</span>
					<span className="galaxy-action-btn-icon">✦</span>
				</button>
			)}

			{/* Connection Sheet */}
			{showConnectionSheet && (
				<div className="galaxy-sheet-overlay">
					<button
						aria-label="Close connection finder"
						className="galaxy-sheet-backdrop"
						onClick={() => setShowConnectionSheet(false)}
						type="button"
					/>
					<div className="galaxy-sheet">
						{connectionStep === "agent" && (
							<div className="galaxy-agent">
								<div className="galaxy-agent-header">
									<div className="galaxy-agent-dot" />
									<span className="galaxy-agent-name">AKSOB Agent</span>
									{agentThinking && (
										<span className="galaxy-agent-thinking">thinking</span>
									)}
								</div>
								<div className="galaxy-agent-tools">
									{agentTools.map((tool, i) => (
										<div
											key={i}
											className={`galaxy-agent-tool${tool.status === "done" ? " done" : ""}${tool.status === "error" ? " error" : ""}`}
										>
											<span className="galaxy-agent-tool-icon">
												{tool.status === "done"
													? "✓"
													: tool.status === "error"
														? "!"
														: "◌"}
											</span>
											<span className="galaxy-agent-tool-name">
												{tool.name}
											</span>
											{tool.status === "thinking" && (
												<span className="galaxy-agent-tool-dots">
													<span />
													<span />
													<span />
												</span>
											)}
										</div>
									))}
								</div>
								{connectionError && (
									<>
										<p className="galaxy-sheet-error">{connectionError}</p>
										<button
											className="galaxy-sheet-btn secondary"
											onClick={() => setConnectionStep("form")}
											type="button"
										>
											Back
										</button>
									</>
								)}
							</div>
						)}

						{connectionStep === "type" && (
							<>
								<h2 className="galaxy-sheet-title">
									What are you looking for?
								</h2>
								<div className="galaxy-type-grid">
									{CONNECTION_TYPE_OPTIONS.map((type) => (
										<button
											key={type.value}
											className={`galaxy-type-card${connectionType === type.value ? " selected" : ""}`}
											onClick={() => setConnectionType(type.value)}
											type="button"
										>
											<span className="galaxy-type-icon">{type.icon}</span>
											<span className="galaxy-type-label">{type.label}</span>
										</button>
									))}
								</div>
								<button
									className="galaxy-sheet-btn full"
									disabled={!connectionType}
									onClick={() => setConnectionStep("form")}
									type="button"
								>
									Continue
								</button>
							</>
						)}

						{connectionStep === "form" && (
							<>
								<h2 className="galaxy-sheet-title">
									{
										CONNECTION_TYPE_OPTIONS.find(
											(t) => t.value === connectionType,
										)?.label
									}
								</h2>
								<p className="galaxy-sheet-subtitle">
									Tell us what you are looking for and we will find the best
									match
								</p>
								<textarea
									className="galaxy-sheet-input"
									placeholder="I am looking for..."
									rows={4}
									value={connectionDescription}
									onChange={(e) => setConnectionDescription(e.target.value)}
								/>
								<div className="galaxy-sheet-actions">
									<button
										className="galaxy-sheet-btn secondary"
										onClick={() => setConnectionStep("type")}
										type="button"
									>
										Back
									</button>
									<button
										className="galaxy-sheet-btn"
										onClick={handleSearch}
										type="button"
									>
										Find matches
									</button>
								</div>
							</>
						)}
					</div>
				</div>
			)}

			{/* Match Card */}
			{showMatchCard && matches.length > 0 && (
				<div className="galaxy-match-card">
					<button
						className="galaxy-match-nav prev"
						onClick={() => goToMatch(currentMatchIndex - 1)}
						disabled={currentMatchIndex === 0}
						type="button"
					>
						←
					</button>

					<div className="galaxy-match-content">
						<div className="galaxy-match-avatar">
							{matches[currentMatchIndex].name.charAt(0)}
						</div>
						<h3 className="galaxy-match-name">
							{matches[currentMatchIndex].name}
						</h3>
						<p className="galaxy-match-meta">
							{matches[currentMatchIndex].program} •{" "}
							{matches[currentMatchIndex].graduationYear}
						</p>
						<p className="galaxy-match-bio">
							{matches[currentMatchIndex].bio || "No bio available"}
						</p>
						<div className="galaxy-match-counter">
							{currentMatchIndex + 1} / {matches.length}
						</div>
						{connectionError && (
							<p className="galaxy-sheet-error">{connectionError}</p>
						)}
						{createdConnection?.matchedUserId ===
						matches[currentMatchIndex].id ? (
							<div className="galaxy-match-action sent">
								Request sent • {createdConnection.status}
							</div>
						) : (
							<button
								className="galaxy-match-action"
								disabled={isSendingRequest}
								onClick={handleSendRequest}
								type="button"
							>
								{isSendingRequest ? "Sending..." : "Send request"}
							</button>
						)}
						<button
							className="galaxy-match-close"
							onClick={() => {
								setShowMatchCard(false);
								setMatches([]);
								setCurrentMatchIndex(0);
								setCreatedConnection(null);
								setIsSendingRequest(false);
								setConnectionError(null);
								if (selectedMatchMarkerRef.current) {
									selectedMatchMarkerRef.current.visible = false;
								}
								// Reset camera
								targetCameraPos.current.set(0, 100, introCameraZ.current);
								targetControlsTarget.current.set(0, 0, 0);
								isTransitioning.current = true;
							}}
							type="button"
						>
							Close
						</button>
					</div>

					<button
						className="galaxy-match-nav next"
						onClick={() => goToMatch(currentMatchIndex + 1)}
						disabled={currentMatchIndex === matches.length - 1}
						type="button"
					>
						→
					</button>
				</div>
			)}

			{isLoadingUsers && (
				<div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 text-white">
					Loading galaxy...
				</div>
			)}
			{/* Labels */}
			{galaxyData.map((cluster: ProgramCluster, i: number) => (
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
								{hoveredStar.data.program} '
								{hoveredStar.data.year.toString().slice(-2)}
							</p>
						</div>
					</div>
					<div className="popup-details">
						{getDisplayTitle(hoveredStar.data)}
						<br />
						{getDisplayCompany(hoveredStar.data)}
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
								setConversationError(null);
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
									{selectedStar.data.program} '
									{selectedStar.data.year.toString().slice(-2)}
								</p>
							</div>
						</div>

						<div className="sidebar-content">
							<div className="sidebar-section">
								<h3>Current Position</h3>
								<p>{getDisplayTitle(selectedStar.data)}</p>
								<p className="text-sm opacity-70">
									{getDisplayCompany(selectedStar.data)}
								</p>
							</div>

							<hr className="sidebar-divider" />

							<div className="sidebar-section">
								<h3>Location</h3>
								<p>Beirut, Lebanon</p>
							</div>

							{conversationError && (
								<p className="galaxy-sheet-error">{conversationError}</p>
							)}

							<button
								type="button"
								className="sidebar-action-btn"
								onClick={handleStartConversation}
								disabled={isStartingConversation}
							>
								{isStartingConversation ? "Starting..." : "Start Conversation"}
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

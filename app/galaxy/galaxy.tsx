import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { Route } from "./+types/galaxy";
import "./galaxy.css";
import { galaxyData, type Alumnus } from "./galaxy-data";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Galaxy of Stars - AKSOB Alumni" },
    { name: "description", content: "Explore the AKSOB Alumni network galaxy." },
  ];
}

export default function Galaxy() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'cluster'>('overview');
  const [hoveredStar, setHoveredStar] = useState<{ x: number, y: number, data: Alumnus } | null>(null);
  
  // Refs for animation state to avoid re-renders
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const targetCameraPos = useRef(new THREE.Vector3(0, 100, 400));
  const targetControlsTarget = useRef(new THREE.Vector3(0, 0, 0));
  const isTransitioning = useRef(false);
  const viewModeRef = useRef<'overview' | 'cluster'>('overview');

  // Store cluster meshes to toggle visibility
  const clusterMeshesRef = useRef<THREE.Points[]>([]);
  // Store original positions for "Back" functionality if needed, or just standard centers
  const clusterCentersRef = useRef<THREE.Vector3[]>([]);

  // Function exposed to React state to trigger view changes
  const handleClusterClick = (clusterIndex: number) => {
    if (viewMode === 'cluster') return;

    // Find cluster center
    const cluster = galaxyData[clusterIndex];
    if (!cluster) return;
    
    // Recalculate position (same logic as generation)
    const clusterAngle = (clusterIndex / galaxyData.length) * Math.PI * 2;
    const clusterRadius = 150 + Math.random() * 50; // Note: Randomness in generation means this might be slightly off if not stored. 
    // Correction: We stored positions in 'calculatedClusterPositions' inside useEffect. We need access to that.
    // Solution: We will dispatch a custom event or use a ref accessible by the click handler.
    // For now, let's trigger via the DOM click handler inside useEffect to have access to local closures.
  };

  const handleBackClick = () => {
    setViewMode('overview'); // Update UI
    viewModeRef.current = 'overview'; // Update Logic
    
    // Reset Camera Target
    targetCameraPos.current.set(0, 100, 400);
    targetControlsTarget.current.set(0, 0, 0);
    isTransitioning.current = true;
    
    // Ensure rotation is OFF during transition to avoid conflict
    if (controlsRef.current) {
        controlsRef.current.autoRotate = false;
    }
    
    
    // Switch active cluster back to cloud state
    clusterMeshesRef.current.forEach(mesh => {
        mesh.visible = true;
        (mesh.userData as any).targetState = 'cloud';
        (mesh.userData as any).transitionTime = 0;
        (mesh.material as THREE.PointsMaterial).opacity = 1;
    });
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x192c27, 0.0005);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 100, 400);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controlsRef.current = controls;

    // --- Galaxy Generation (Per Cluster) ---
    // Helper to generate a soft glowing star texture
    const createStarTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const context = canvas.getContext('2d');
        if (!context) return new THREE.Texture();
        
        const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        context.fillStyle = gradient;
        context.fillRect(0,0,32,32);
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    };

    const texture = createStarTexture();
    
    const alumniDataGrid: Alumnus[][] = [];
    clusterMeshesRef.current = [];
    clusterCentersRef.current = [];
    const clusterHitMeshes: THREE.Mesh[] = [];

    galaxyData.forEach((cluster, clusterIndex) => {
      const particleCount = cluster.alumni.length;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3); // Keep colors if we want internal variation, otherwise material color is enough? Let's keep variance.
      const sizes = new Float32Array(particleCount);
      
      const clusterAlumni: Alumnus[] = [];
      const colorHelper = new THREE.Color();
      
      // Calculate Center
      const clusterAngle = (clusterIndex / galaxyData.length) * Math.PI * 2;
      const clusterRadius = 150 + Math.random() * 50;
      const clusterX = Math.cos(clusterAngle) * clusterRadius;
      const clusterZ = Math.sin(clusterAngle) * clusterRadius;
      const center = new THREE.Vector3(clusterX, 0, clusterZ);
      clusterCentersRef.current.push(center);

      const blinkOffsets = new Float32Array(particleCount);
      const blinkSpeeds = new Float32Array(particleCount);
      const baseColors = new Float32Array(particleCount * 3);

      cluster.alumni.forEach((alumnus, i) => {
        // Position relative to 0,0,0 (Cluster local space) could be useful, but keeping World Space is easier for the "One Galaxy" feel initially.
        // ACTUALLY: If we want to isolate them easily, World Space is fine as long as we move the camera.
        
        const r = Math.random() * 50;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;

        const x = clusterX + r * Math.sin(phi) * Math.cos(theta); // World Space Placement
        const y = (Math.random() - 0.5) * 40;
        const z = clusterZ + r * Math.sin(phi) * Math.sin(theta);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        colorHelper.set(cluster.color);
        // Add slight variation
        // colorHelper.offsetHSL(0, 0, (Math.random() - 0.5) * 0.1);
        colors[i * 3] = colorHelper.r;
        colors[i * 3 + 1] = colorHelper.g;
        colors[i * 3 + 2] = colorHelper.b;
        
        // Store base color for animation
        baseColors[i * 3] = colorHelper.r;
        baseColors[i * 3 + 1] = colorHelper.g;
        baseColors[i * 3 + 2] = colorHelper.b;

        // Blink params
        blinkOffsets[i] = Math.random() * Math.PI * 2;
        blinkSpeeds[i] = 0.5 + Math.random() * 1.5;

        sizes[i] = 1.5 + Math.random() * 1.5;
        
        clusterAlumni.push(alumnus);
      });
      
      // Pre-calculate Grid Positions for "Scattered" view
      // We want a nice distribution (e.g., Sphere or Grid) centered at 0,0,0 (local space of cluster)
      // Since particles are world space, we need to add the cluster center offset.
      const gridPositions = new Float32Array(particleCount * 3);
      const rowSize = Math.ceil(Math.pow(particleCount, 1/3)); 
      
      // Let's use a Fibonacci Sphere distribution for nice evenly spaced "scatter"
      const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle
      
      for (let i=0; i < particleCount; i++) {
          const y = 1 - (i / (particleCount - 1)) * 2; // y goes from 1 to -1
          const radius = Math.sqrt(1 - y * y); // radius at y
          
          const theta = phi * i; // golden angle increment
          
          const rx = Math.cos(theta) * radius;
          const rz = Math.sin(theta) * radius;
          
          // Radius of the "Scattered" sphere. Make it large enough to fill screen comfortably.
          const spreadRadius = 100; 

          gridPositions[i*3] = center.x + rx * spreadRadius;
          gridPositions[i*3+1] = center.y + y * spreadRadius; 
          gridPositions[i*3+2] = center.z + rz * spreadRadius;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      // Store original cloud positions to return to
      geometry.setAttribute('initialPosition', new THREE.BufferAttribute(positions.slice(), 3)); 
      geometry.setAttribute('gridPosition', new THREE.BufferAttribute(gridPositions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const material = new THREE.PointsMaterial({ 
          size: 6, // Increased size for visibility
          sizeAttenuation: true, 
          map: texture, 
          alphaTest: 0.1, // Lower threshold for soft edges
          transparent: true,
          vertexColors: true,
          blending: THREE.AdditiveBlending, // Additive blending for "glow"
          depthWrite: false, // Prevent z-fighting with transparency
          opacity: 0.9
      });

      const points = new THREE.Points(geometry, material);
      points.userData = { 
          clusterIndex: clusterIndex,
          blinkOffsets: blinkOffsets,
          blinkSpeeds: blinkSpeeds,
          baseColors: baseColors
      }; // Tag it
      scene.add(points);
      clusterMeshesRef.current.push(points);
      alumniDataGrid.push(clusterAlumni);
      
      // Hit Mesh for Cluster Selection
      const hitMesh = new THREE.Mesh(
        new THREE.SphereGeometry(50, 16, 16),
        new THREE.MeshBasicMaterial({ visible: false })
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

    const onClick = (event: MouseEvent) => {
        if (isTransitioning.current) return;
        raycaster.setFromCamera(mouse, camera);

        if (viewModeRef.current === 'overview') { // Use ref for reliable state in event handler
            const intersects = raycaster.intersectObjects(clusterHitMeshes);
            if (intersects.length > 0) {
                enterCluster(intersects[0].object.userData.clusterIndex);
            }
        } else { // Cluster Mode
            // Check for Star Clicks (Chat) - Optional handled by popup button
        }
    };

    const enterCluster = (index: number) => {
        setViewMode('cluster');
        viewModeRef.current = 'cluster'; 
        const center = clusterCentersRef.current[index];
        
        // Hide other clusters
        clusterMeshesRef.current.forEach((mesh, i) => {
            if (i !== index) {
                 mesh.visible = false;
            } else {
                // Trigger Scatter Animation for the entered cluster
                (mesh.userData as any).targetState = 'grid';
                (mesh.userData as any).transitionTime = 0;
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

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);

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
        if (camera.position.distanceTo(targetCameraPos.current) < 1.0 && 
            controls.target.distanceTo(targetControlsTarget.current) < 1.0) {
             isTransitioning.current = false;
             
             // If we just finished transitioning back to Overview, resume rotation
             if (viewModeRef.current === 'overview') {
                 controls.autoRotate = true;
             }
        }
      }

      // --- Twinkle Animation ---
      const time = Date.now() * 0.001;
      clusterMeshesRef.current.forEach(points => {
          if (!points.visible) return; // Optimization
          
          const colors = points.geometry.attributes.color.array as Float32Array;
          const { blinkOffsets, blinkSpeeds, baseColors } = points.userData;
          
          for (let i = 0; i < blinkOffsets.length; i++) {
               // Sine wave between 0.4 and 1.0 intensity
               const brightness = 0.6 + 0.4 * Math.sin(time * blinkSpeeds[i] + blinkOffsets[i]);
               
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
                  const alpha = Math.min(points.userData.transitionTime / targetTime, 1);
                  
                  // Ease function
                  const t = alpha < .5 ? 2 * alpha * alpha : -1 + (4 - 2 * alpha) * alpha;
                  
                  const positions = points.geometry.attributes.position.array as Float32Array;
                  const initial = points.geometry.attributes.initialPosition.array as Float32Array;
                  const grid = points.geometry.attributes.gridPosition.array as Float32Array;
                  
                  // If target is grid, go initial -> grid. If cloud, go grid -> initial??
                  // No, simpler: always lerp between initial and grid based on factor.
                  // But wait, we modified the actual 'position' attribute.
                  // So we should interpolate between two fixed buffers into the active 'position' buffer.
                  
                  // Determine interpolation factor based on state
                  // We need a 'currentFactor' stored. Or just animate 'transitionProgress' 0->1.
                  // Let state determine direction.
                  
                  // We need a persistent 'morphFactor' 0 (cloud) to 1 (grid)
                  let morph = points.userData.morphFactor || 0;
                  const targetMorph = points.userData.targetState === 'grid' ? 1 : 0;
                  
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
      clusterCentersRef.current.forEach((center, i) => {
        const x = 0, y = 0; // calculated below
        const labelEl = document.getElementById(`cluster-label-${i}`);
        
        if (labelEl) {
            // Determine visibility based on logic
            let isVisible = true;
            if (viewModeRef.current === 'cluster') { // Use ref for reliable state in animation loop
                // In cluster mode, only show if the cluster is visible
                if (clusterMeshesRef.current[i].visible === false) isVisible = false;
            }

            if (isVisible) {
                tempV.copy(center);
                tempV.project(camera);
                if (tempV.z < 1) {
                    const lx = (tempV.x * 0.5 + 0.5) * window.innerWidth;
                    const ly = (-(tempV.y * 0.5) + 0.5) * window.innerHeight;
                    labelEl.style.display = 'block';
                    labelEl.style.transform = `translate(-50%, -50%) translate(${lx}px, ${ly}px)`;
                } else {
                    labelEl.style.display = 'none';
                }
            } else {
                labelEl.style.display = 'none';
            }
        }
      });

      // Mouse Interaction
      raycaster.setFromCamera(mouse, camera);
      
      // Different interactions based on state
      // We can infer state from controls.autoRotate (True = Overview, False = Cluster)
      // const isOverview = controls.autoRotate; // Replaced by viewModeRef.current

      if (viewModeRef.current === 'overview') { // Use ref for reliable state
          // Highlight Clusters logic (Optional visual scale up)
          // For now, cursor change on hover over cluster mesh
          const hits = raycaster.intersectObjects(clusterHitMeshes);
          document.body.style.cursor = hits.length > 0 ? 'pointer' : 'default';
          setHoveredStar(null); // No star popups in overview
      } else if (viewModeRef.current === 'cluster') { // Cluster Mode: Use ref for reliable state
          // Cluster Mode: Raycast only against the VISIBLE cluster mesh
          const visibleClusters = clusterMeshesRef.current.filter(m => m.visible);
          const intersects = raycaster.intersectObjects(visibleClusters);
          
          if (intersects.length > 0) {
            document.body.style.cursor = 'pointer';
            const instanceId = intersects[0].index;
            const clusterIdx = intersects[0].object.userData.clusterIndex; // Get which cluster

            // Check if valid
            if (instanceId !== undefined && clusterIdx !== undefined && 
               (instanceId !== hoveredIndex || clusterIdx !== hoveredClusterIndex)) {
                 
               hoveredIndex = instanceId;
               hoveredClusterIndex = clusterIdx;
               
               const starData = alumniDataGrid[clusterIdx][instanceId]; // Access correct data
               
               const p = intersects[0].point.clone();
               p.project(camera);
               const startX = (p.x * 0.5 + 0.5) * window.innerWidth;
               const startY = (-(p.y * 0.5) + 0.5) * window.innerHeight;

               setHoveredStar({ x: startX, y: startY, data: starData });
            }
          } else {
             document.body.style.cursor = 'default';
             if (hoveredStar) setHoveredStar(null);
             hoveredIndex = -1;
             hoveredClusterIndex = -1;
          }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      // Dispose of all geometries and materials
      clusterMeshesRef.current.forEach(mesh => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div className="galaxy-container" ref={mountRef}>
       {/* Labels */}
       {galaxyData.map((cluster, i) => (
        <div key={i} id={`cluster-label-${i}`} className="cluster-label" style={{ top: 0, left: 0, display: 'none' }}>
          {cluster.name}
        </div>
      ))}

      {/* Back Button */}
      {viewMode === 'cluster' && (
          <button 
            className="back-button"
            onClick={handleBackClick}
            style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                zIndex: 100,
                padding: '10px 20px',
                background: 'rgba(7, 105, 81, 0.9)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                backdropFilter: 'blur(4px)'
            }}
          >
            ← Back to Galaxy
          </button>
      )}

      {/* Interaction UI Layer */}
      {hoveredStar && viewMode === 'cluster' && (
        <div 
          className={`star-popup visible`} 
          style={{ 
            top: hoveredStar.y, 
            left: hoveredStar.x,
          }}
        >
          <div className="popup-header">
              <div className="popup-avatar">{hoveredStar.data.name.substring(0,2).toUpperCase()}</div>
              <div className="popup-info">
                  <h3>{hoveredStar.data.name}</h3>
                  <p>{hoveredStar.data.major} '{hoveredStar.data.year.toString().slice(-2)}</p>
              </div>
          </div>
          <div className="popup-details">
              {hoveredStar.data.position}<br/>{hoveredStar.data.company}
          </div>
          <button className="popup-action" onClick={() => alert(`Start chat with ${hoveredStar.data.name}`)}>
            Chat Now
          </button>
        </div>
      )}
    </div>
  );
}

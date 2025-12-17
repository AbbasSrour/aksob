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
  const [selectedStar, setSelectedStar] = useState<Alumnus | null>(null);
  const [hoveredStar, setHoveredStar] = useState<{ x: number, y: number, data: Alumnus } | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    // Fog to blend distant stars into background
    scene.fog = new THREE.FogExp2(0x192c27, 0.0005); // Match css background

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 100, 400);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // --- Galaxy Generation ---
    const particleCount = galaxyData.reduce((acc, cluster) => acc + cluster.alumni.length, 0);
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    // Auxiliary array to store user data for raycasting mapping
    const alumniData: Alumnus[] = [];
    const calculatedClusterPositions: { name: string, position: THREE.Vector3 }[] = [];

    const colorHelper = new THREE.Color();
    let index = 0;

    galaxyData.forEach((cluster, clusterIndex) => {
      // Create random center for each cluster
      const clusterAngle = (clusterIndex / galaxyData.length) * Math.PI * 2;
      const clusterRadius = 150 + Math.random() * 50;
      const clusterX = Math.cos(clusterAngle) * clusterRadius;
      const clusterZ = Math.sin(clusterAngle) * clusterRadius;
      
      // Store center for labels
      calculatedClusterPositions.push({
        name: cluster.name,
        position: new THREE.Vector3(clusterX, 0, clusterZ) // Center precisely on the cluster plane
      });

      cluster.alumni.forEach((alumnus) => {
        // Random position within cluster
        const r = Math.random() * 50; // Radius spread of cluster
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;

        const x = clusterX + r * Math.sin(phi) * Math.cos(theta);
        const y = (Math.random() - 0.5) * 40; // Flattened galaxy
        const z = clusterZ + r * Math.sin(phi) * Math.sin(theta);

        positions[index * 3] = x;
        positions[index * 3 + 1] = y;
        positions[index * 3 + 2] = z;

        colorHelper.set(cluster.color);
        colors[index * 3] = colorHelper.r;
        colors[index * 3 + 1] = colorHelper.g;
        colors[index * 3 + 2] = colorHelper.b;

        sizes[index] = 1.5 + Math.random() * 1.5; // Random size

        alumniData.push(alumnus);
        index++;
      });
    });

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Generate circular sprite texture
    const sprite = new THREE.TextureLoader().load("https://threejs.org/examples/textures/sprites/disc.png");

    const material = new THREE.PointsMaterial({ 
      size: 4, 
      sizeAttenuation: true, 
      map: sprite, 
      alphaTest: 0.5, 
      transparent: true,
      vertexColors: true
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // --- Raycaster for Interaction ---
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 5; // Hit box size
    const mouse = new THREE.Vector2();

    const onMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', onMouseMove);

    // --- Animation Loop ---
    let hoveredIndex = -1;
    // Temp vector for projection
    const tempV = new THREE.Vector3();

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();

      // Update Labels
      calculatedClusterPositions.forEach((cluster, i) => {
        tempV.copy(cluster.position);
        tempV.project(camera);
        // Only update DOM if the previous frame was different enough to avoid heavy dom thrashing?
        // Actually, for smoothness we update every frame. React state might be too slow for 60fps loop if we use setState.
        // Better: Direct DOM manipulation.
        const x = (tempV.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(tempV.y * 0.5) + 0.5) * window.innerHeight;
        
        const labelEl = document.getElementById(`cluster-label-${i}`);
        if (labelEl) {
          if (tempV.z < 1) { // Visible (in front of camera)
            labelEl.style.display = 'block';
            labelEl.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
            // Fade out if too far? Optional.
          } else {
            labelEl.style.display = 'none';
          }
        }
      });

      // Raycasting
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(particles);

      if (intersects.length > 0) {
        document.body.style.cursor = 'pointer';
        const instanceId = intersects[0].index;
        
        if (instanceId !== undefined && instanceId !== hoveredIndex) {
          hoveredIndex = instanceId;
          const starData = alumniData[instanceId];
          
          // Project 3D position to 2D screen coordinates for popup
          const p = intersects[0].point.clone();
          p.project(camera);
          const x = (p.x * 0.5 + 0.5) * window.innerWidth;
          const y = (-(p.y * 0.5) + 0.5) * window.innerHeight;

          setHoveredStar({ x, y, data: starData });
          controls.autoRotate = false; // Pause rotation on interaction
        }
      } else {
        document.body.style.cursor = 'default';
        if (hoveredIndex !== -1) {
          hoveredIndex = -1;
          setHoveredStar(null);
          controls.autoRotate = true; // Resume rotation
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // --- Resize Handler ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      particles.geometry.dispose();
      (particles.material as THREE.Material).dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="galaxy-container" ref={mountRef}>
       {/* Labels Container - We render them once and update positions via ID in animate loop */}
       {galaxyData.map((cluster, i) => (
        <div key={i} id={`cluster-label-${i}`} className="cluster-label" style={{ top: 0, left: 0, display: 'none' }}>
          {cluster.name}
        </div>
      ))}

      {/* Interaction UI Layer */}
      {hoveredStar && (
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

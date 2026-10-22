import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Predefined landmark buildings identified in the TopoExport model
const KNOWN_BUILDING_MAP = {
  TPX_Buildings_108: {
    name: 'Block C (CS, AI & Data Science)',
    code: 'BLOCK_C',
    category: 'Academic Block',
    floors: 4,
    description: 'Main academic complex housing Computer Science, AI, and Central Auditoriums',
  },
  TPX_Buildings_220: {
    name: 'Workshops (Mechanical & Civil)',
    code: 'WORKSHOPS',
    category: 'Engineering Labs',
    floors: 2,
    description: 'Heavy machinery, fluid dynamics, and civil structural testing workshops',
  },
  TPX_Buildings_210: {
    name: 'Library & Information Centre',
    code: 'LIBRARY',
    category: 'Central Library',
    floors: 3,
    description: 'Central campus library, digital research repositories, and quiet study zones',
  },
  TPX_Buildings_133: {
    name: 'Boys Hostel Complex',
    code: 'BOYS_HOSTEL',
    category: 'Residential',
    floors: 5,
    description: 'Campus residential hostel with dining and recreation areas',
  },
  TPX_Buildings_135: {
    name: 'Girls Hostel Complex',
    code: 'GIRLS_HOSTEL',
    category: 'Residential',
    floors: 5,
    description: 'Campus residential hostel with 24/7 security and dedicated study halls',
  },
  TPX_Buildings_240: {
    name: 'Campus Cafeteria & Food Court',
    code: 'CAFETERIA',
    category: 'Amenities',
    floors: 2,
    description: 'Multi-cuisine campus dining, student lounge, and snack kiosks',
  },
  TPX_Buildings_178: {
    name: 'STEP Incubation & Research Centre',
    code: 'STEP',
    category: 'Research & Innovation',
    floors: 3,
    description: 'Science & Technology Entrepreneurs Park with startup incubator labs',
  },
};

export const Interactive3DMap = forwardRef(function Interactive3DMap(
  {
    currentState,
    selectedBuilding,
    onSelectBuilding,
    onBearingChange,
    isTopView = false,
  },
  ref
) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const buildingMeshesRef = useRef([]);
  const hoveredMeshRef = useRef(null);
  const animFrameRef = useRef(null);
  const cameraTargetPosRef = useRef(null);
  const cameraTargetLookAtRef = useRef(null);

  // Loading & interactive UI states
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [hoveredInfo, setHoveredInfo] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Layer visibility state
  const [layerVisibility, setLayerVisibility] = useState({
    buildings: true,
    trees: true,
    roads: true,
    terrain: true,
    waterways: true,
    contours: true,
  });

  // Expose imperative API for FloatingControls and external triggers
  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      if (!cameraRef.current || !controlsRef.current) return;
      const cam = cameraRef.current;
      const target = controlsRef.current.target;
      const dir = new THREE.Vector3().subVectors(cam.position, target);
      if (dir.length() > 50) {
        dir.multiplyScalar(0.75);
        cam.position.copy(target).add(dir);
        controlsRef.current.update();
      }
    },
    zoomOut: () => {
      if (!cameraRef.current || !controlsRef.current) return;
      const cam = cameraRef.current;
      const target = controlsRef.current.target;
      const dir = new THREE.Vector3().subVectors(cam.position, target);
      if (dir.length() < 2400) {
        dir.multiplyScalar(1.25);
        cam.position.copy(target).add(dir);
        controlsRef.current.update();
      }
    },
    resetNorth: () => {
      if (!cameraRef.current || !controlsRef.current) return;
      const cam = cameraRef.current;
      const target = controlsRef.current.target;
      const distance = cam.position.distanceTo(target);
      const pitchRad = isTopView ? 0.001 : Math.PI / 4;
      cameraTargetPosRef.current = new THREE.Vector3(
        target.x,
        target.y + distance * Math.sin(pitchRad || 0.7),
        target.z + distance * Math.cos(pitchRad || 0.7)
      );
      cameraTargetLookAtRef.current = target.clone();
    },
    recenter: () => {
      if (!controlsRef.current) return;
      cameraTargetPosRef.current = isTopView
        ? new THREE.Vector3(0, 950, 0)
        : new THREE.Vector3(0, 520, 680);
      cameraTargetLookAtRef.current = new THREE.Vector3(0, 0, 0);
    },
  }));

  // Camera orientation effect based on isTopView
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    if (isTopView) {
      // 2D Nadir Overhead view
      cameraTargetPosRef.current = new THREE.Vector3(0, 950, 0.001);
      cameraTargetLookAtRef.current = new THREE.Vector3(0, 0, 0);
      controlsRef.current.maxPolarAngle = Math.PI / 2;
    } else {
      // 3D Isometric Perspective view
      cameraTargetPosRef.current = new THREE.Vector3(0, 500, 650);
      cameraTargetLookAtRef.current = new THREE.Vector3(0, 0, 0);
      controlsRef.current.maxPolarAngle = Math.PI / 2.05;
    }
  }, [isTopView]);

  // Focus camera when selectedBuilding changes
  useEffect(() => {
    if (!selectedBuilding || !buildingMeshesRef.current.length) return;
    const targetMesh = buildingMeshesRef.current.find(
      (m) =>
        m.name === selectedBuilding.id ||
        (selectedBuilding.code === 'BLOCK_C' && m.name === 'TPX_Buildings_108') ||
        (selectedBuilding.name?.toLowerCase().includes('admin') && m.name === 'TPX_Buildings_240') ||
        (selectedBuilding.name?.toLowerCase().includes('workshop') && m.name === 'TPX_Buildings_220') ||
        (selectedBuilding.name?.toLowerCase().includes('library') && m.name === 'TPX_Buildings_210') ||
        (selectedBuilding.name?.toLowerCase().includes('step') && m.name === 'TPX_Buildings_178')
    );

    if (targetMesh) {
      const box = new THREE.Box3().setFromObject(targetMesh);
      const center = box.getCenter(new THREE.Vector3());
      cameraTargetLookAtRef.current = center.clone();
      cameraTargetPosRef.current = new THREE.Vector3(
        center.x + 90,
        center.y + 110,
        center.z + 130
      );
    }
  }, [selectedBuilding]);

  // Layer toggle handler
  const toggleLayer = useCallback((layerKey) => {
    setLayerVisibility((prev) => {
      const next = { ...prev, [layerKey]: !prev[layerKey] };
      if (!modelRef.current) return next;

      modelRef.current.traverse((child) => {
        const name = child.name || '';
        if (layerKey === 'buildings' && (name.includes('TPX_Buildings') || child.userData.category === 'buildings')) {
          child.visible = next[layerKey];
        } else if (layerKey === 'trees' && (name.includes('TPX_Trees') || child.userData.category === 'trees')) {
          child.visible = next[layerKey];
        } else if (layerKey === 'roads' && (name.includes('TPX_Roads') || child.userData.category === 'roads')) {
          child.visible = next[layerKey];
        } else if (layerKey === 'terrain' && (name.includes('TPX_Ground') || name.includes('TPX_GreenAreas') || child.userData.category === 'terrain')) {
          child.visible = next[layerKey];
        } else if (layerKey === 'waterways' && (name.includes('TPX_Waterways') || child.userData.category === 'waterways')) {
          child.visible = next[layerKey];
        } else if (layerKey === 'contours' && (name.includes('TPX_Contours') || child.userData.category === 'contours')) {
          child.visible = next[layerKey];
        }
      });
      return next;
    });
  }, []);

  // Initialize Three.js scene and load GLB model
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0d14);
    scene.fog = new THREE.FogExp2(0x0a0d14, 0.0004);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 8000);
    camera.position.set(0, 520, 680);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.minDistance = 40;
    controls.maxDistance = 2200;
    controls.maxPolarAngle = Math.PI / 2.05;
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 1.0);
    hemiLight.position.set(0, 500, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 2.4);
    dirLight.position.set(350, 650, 300);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 50;
    dirLight.shadow.camera.far = 1800;
    const shadowD = 600;
    dirLight.shadow.camera.left = -shadowD;
    dirLight.shadow.camera.right = shadowD;
    dirLight.shadow.camera.top = shadowD;
    dirLight.shadow.camera.bottom = -shadowD;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // Subtle dark foundation circular platform under the campus
    const groundGeo = new THREE.CylinderGeometry(850, 850, 4, 64);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.9,
      metalness: 0.1,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = -2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Subtle coordinate grid for orientation
    const grid = new THREE.GridHelper(1400, 28, 0x334155, 0x1e293b);
    grid.position.y = -1.9;
    scene.add(grid);

    // 6. Raycasting Setup
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    const buildingMeshes = [];

    // 7. Load GLB Model
    const loader = new GLTFLoader();
    loader.load(
      '/topoexport_3D_modeling.glb',
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;

        // TopoExport exports GIS CAD model with Z-up: Rotate -90° on X to align with Three.js Y-up
        model.rotation.x = -Math.PI / 2;
        model.updateMatrixWorld(true);

        // Center the entire campus at (0, 0, 0)
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;

        // Inspect and classify nodes
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Preserve original material
            child.userData.originalMaterial = child.material;

            const name = child.name || '';
            const parentName = child.parent?.name || '';

            if (name.includes('TPX_Buildings') || parentName.includes('TPX_Buildings')) {
              child.userData.category = 'buildings';
              child.userData.isBuilding = true;
              buildingMeshes.push(child);
            } else if (name.includes('TPX_Trees') || parentName.includes('TPX_Trees')) {
              child.userData.category = 'trees';
            } else if (name.includes('TPX_Roads') || parentName.includes('TPX_Roads')) {
              child.userData.category = 'roads';
            } else if (name.includes('TPX_Waterways') || parentName.includes('TPX_Waterways')) {
              child.userData.category = 'waterways';
            } else if (name.includes('TPX_Contours') || parentName.includes('TPX_Contours')) {
              child.userData.category = 'contours';
            } else {
              child.userData.category = 'terrain';
            }
          }
        });

        buildingMeshesRef.current = buildingMeshes;
        scene.add(model);
        setIsLoading(false);
        setLoadProgress(100);
      },
      (xhr) => {
        if (xhr.lengthComputable && xhr.total > 0) {
          const percent = Math.min(99, Math.round((xhr.loaded / xhr.total) * 100));
          setLoadProgress(percent);
        } else {
          // Synthetic progress if header missing
          setLoadProgress((prev) => Math.min(90, prev + 15));
        }
      },
      (error) => {
        console.error('Error loading 3D GLB model:', error);
        setLoadError('Failed to load 3D campus model. Please verify file accessibility.');
        setIsLoading(false);
      }
    );

    // 8. Event Handlers (Pointer Move, Pointer Click, Resize)
    const handlePointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      setTooltipPos({ x: e.clientX, y: e.clientY });

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(buildingMeshesRef.current, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        renderer.domElement.style.cursor = 'pointer';

        if (hoveredMeshRef.current !== hit) {
          // Restore previous
          if (hoveredMeshRef.current && hoveredMeshRef.current.userData.originalMaterial) {
            hoveredMeshRef.current.material = hoveredMeshRef.current.userData.originalMaterial;
          }

          // Highlight new hit
          hoveredMeshRef.current = hit;
          const highlightMat = hit.material.clone();
          if (highlightMat.emissive) {
            highlightMat.emissive = new THREE.Color(0x3b82f6);
            highlightMat.emissiveIntensity = 0.7;
          }
          hit.material = highlightMat;

          const known = KNOWN_BUILDING_MAP[hit.name];
          setHoveredInfo({
            name: known?.name || `Campus Building (${hit.name.replace('TPX_Buildings_', 'Block ')})`,
            category: known?.category || 'Campus Facility',
            description: known?.description || 'Extruded 3D architectural zone from TopoExport CAD/GIS dataset',
            floors: known?.floors || Math.max(1, Math.round((hit.geometry?.boundingBox?.max?.z || 12) / 3)),
          });
        }
      } else {
        renderer.domElement.style.cursor = 'default';
        if (hoveredMeshRef.current) {
          if (hoveredMeshRef.current.userData.originalMaterial) {
            hoveredMeshRef.current.material = hoveredMeshRef.current.userData.originalMaterial;
          }
          hoveredMeshRef.current = null;
          setHoveredInfo(null);
        }
      }
    };

    const handlePointerDown = (e) => {
      // Only handle primary left click
      if (e.button !== 0) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(buildingMeshesRef.current, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const known = KNOWN_BUILDING_MAP[hit.name];
        const buildingObj = {
          id: hit.name,
          name: known?.name || `Campus Building (${hit.name.replace('TPX_Buildings_', 'Block ')})`,
          category: known?.category || 'Campus Facility',
          description: known?.description || 'Interactive 3D building model',
          indoor_mapping_status: known ? 'verified' : 'planned',
        };

        if (onSelectBuilding) {
          onSelectBuilding(buildingObj);
        }

        // Smoothly animate camera towards selected building
        const hitBox = new THREE.Box3().setFromObject(hit);
        const hitCenter = hitBox.getCenter(new THREE.Vector3());
        cameraTargetLookAtRef.current = hitCenter.clone();
        cameraTargetPosRef.current = new THREE.Vector3(
          hitCenter.x + 100,
          hitCenter.y + 120,
          hitCenter.z + 140
        );
      }
    };

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    const domElement = renderer.domElement;
    domElement.addEventListener('pointermove', handlePointerMove);
    domElement.addEventListener('pointerdown', handlePointerDown);

    // 9. Animation Loop
    let lastBearing = -999;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      // Smooth camera interpolation if target exists
      if (cameraTargetPosRef.current) {
        camera.position.lerp(cameraTargetPosRef.current, 0.08);
        if (camera.position.distanceTo(cameraTargetPosRef.current) < 1.0) {
          cameraTargetPosRef.current = null;
        }
      }

      if (cameraTargetLookAtRef.current) {
        controls.target.lerp(cameraTargetLookAtRef.current, 0.08);
        if (controls.target.distanceTo(cameraTargetLookAtRef.current) < 0.5) {
          cameraTargetLookAtRef.current = null;
        }
      }

      controls.update();

      // Emit bearing changes for compass sync
      if (onBearingChange) {
        const azimuthal = controls.getAzimuthalAngle();
        const currentBearing = Math.round(((-azimuthal * 180) / Math.PI + 360) % 360);
        if (currentBearing !== lastBearing) {
          lastBearing = currentBearing;
          onBearingChange(currentBearing);
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // 10. Cleanup on Unmount
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('pointermove', handlePointerMove);
      domElement.removeEventListener('pointerdown', handlePointerDown);

      controls.dispose();
      renderer.dispose();

      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }

      // Dispose scene objects
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    };
  }, [onSelectBuilding, onBearingChange]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-stone-950 select-none">
      {/* 3D Canvas Mount Point */}
      <div ref={containerRef} className="w-full h-full absolute inset-0 z-0" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-stone-950/80 backdrop-blur-md text-white transition-opacity duration-300">
          <div className="w-64 flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <div className="text-sm font-bold tracking-wide uppercase">
                Loading 3D Campus Model
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                TopoExport CAD/GIS • {loadProgress}%
              </div>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-200"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {loadError && (
        <div className="absolute inset-x-4 top-20 z-20 max-w-md mx-auto p-4 rounded-2xl bg-red-950/90 border border-red-500/40 text-red-200 text-xs backdrop-blur-md shadow-2xl flex items-center gap-3">
          <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <div className="font-semibold text-white">3D Model Notice</div>
            <div className="opacity-90">{loadError}</div>
          </div>
        </div>
      )}

      {/* Hover Tooltip / Floating Card */}
      {hoveredInfo && !isLoading && (
        <div
          className="fixed pointer-events-none z-30 px-3 py-2 rounded-xl bg-black/85 backdrop-blur-md border border-blue-500/40 text-white shadow-2xl transition-all duration-150 transform -translate-x-1/2 -translate-y-full mb-3"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 14}px`,
          }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <div className="text-xs font-bold text-white tracking-wide">
              {hoveredInfo.name}
            </div>
          </div>
          <div className="text-[10px] text-blue-300 font-medium mt-0.5">
            {hoveredInfo.category} • ~{hoveredInfo.floors} Floors
          </div>
          <div className="text-[9px] text-slate-400 max-w-xs mt-1 leading-snug">
            Click to focus and view floorplans
          </div>
        </div>
      )}

      {/* Layer Toggles & 3D HUD Badge (Bottom-Left) */}
      <div className="absolute left-4 bottom-8 z-10 flex flex-col gap-2 pointer-events-auto">
        {/* Layer Toggles Bar */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 shadow-xl text-white">
          <button
            type="button"
            onClick={() => toggleLayer('buildings')}
            title="Toggle Buildings"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              layerVisibility.buildings
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-white/50 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>🏢</span>
            <span className="hidden sm:inline">Buildings</span>
          </button>

          <button
            type="button"
            onClick={() => toggleLayer('trees')}
            title="Toggle Trees"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              layerVisibility.trees
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-white/50 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>🌳</span>
            <span className="hidden sm:inline">Trees</span>
          </button>

          <button
            type="button"
            onClick={() => toggleLayer('roads')}
            title="Toggle Roads"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              layerVisibility.roads
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-white/50 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>🛣️</span>
            <span className="hidden sm:inline">Roads</span>
          </button>

          <button
            type="button"
            onClick={() => toggleLayer('terrain')}
            title="Toggle Terrain"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              layerVisibility.terrain
                ? 'bg-stone-700 text-white shadow-sm'
                : 'text-white/50 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>⛰️</span>
            <span className="hidden sm:inline">Terrain</span>
          </button>
        </div>

        {/* 3D Model Attribution Pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-mono text-white/50 w-fit">
          <span>TopoExport 3D GIS</span>
          <span>•</span>
          <span>345 Buildings • 2,300+ Trees</span>
        </div>
      </div>
    </div>
  );
});

export default Interactive3DMap;

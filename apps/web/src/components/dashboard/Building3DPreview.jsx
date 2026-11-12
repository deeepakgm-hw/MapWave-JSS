import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function Building3DPreview({ building, height = 220 }) {
  const containerRef = useRef(null);
  const [viewType, setViewType] = useState('3d'); // '3d' | 'photo'
  const [isRotating, setIsRotating] = useState(true);

  const imageMap = {
    BLOCK_A: '/images/block_a.png',
    BLOCK_B: '/images/block_b.png',
    BLOCK_CIVIL: '/images/block_civil.png',
  };

  const code = (building?.code || '').toUpperCase();
  const photoUrl = imageMap[code] || building?.image || '/jssate_campus_aerial.jpg';

  useEffect(() => {
    if (viewType !== '3d' || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 320;
    const sceneHeight = height;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeceeed);

    const camera = new THREE.PerspectiveCamera(40, width / sceneHeight, 0.1, 1000);
    camera.position.set(28, 22, 28);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (err) {
      console.warn('WebGLRenderer not supported in this environment:', err);
      return;
    }
    renderer.setSize(width, sceneHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minDistance = 15;
    controls.maxDistance = 60;
    controls.autoRotate = isRotating;
    controls.autoRotateSpeed = 1.2;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const blueLight = new THREE.PointLight(0x38bdf8, 2.5, 60);
    blueLight.position.set(-15, 12, -15);
    scene.add(blueLight);

    // Architectural Ground Grid
    const grid = new THREE.GridHelper(50, 20, 0x334155, 0x1e293b);
    grid.position.y = -0.1;
    scene.add(grid);

    // Building Group
    const buildingGroup = new THREE.Group();

    // Procedural representation tuned to building architecture
    const floorCount = building?.floor_count || 3;
    const buildingHeight = floorCount * 4;
    const isCivil = code.includes('CIVIL');
    const isBlockB = code.includes('BLOCK_B') || code.includes('LIBRARY');

    const baseColor = isCivil ? 0xf59e0b : isBlockB ? 0xa855f7 : 0x3b82f6;

    // Main structural blocks
    for (let f = 0; f < floorCount; f++) {
      const floorY = f * 4 + 2;
      const floorGeo = new THREE.BoxGeometry(16, 3.6, 12);
      const floorMat = new THREE.MeshStandardMaterial({
        color: baseColor,
        metalness: 0.2,
        roughness: 0.3,
        transparent: true,
        opacity: 0.88,
      });
      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.position.y = floorY;
      buildingGroup.add(floorMesh);

      // Floor separator plate
      const slabGeo = new THREE.BoxGeometry(16.6, 0.4, 12.6);
      const slabMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6 });
      const slabMesh = new THREE.Mesh(slabGeo, slabMat);
      slabMesh.position.y = floorY + 1.9;
      buildingGroup.add(slabMesh);

      // Window strips
      const winGeo = new THREE.BoxGeometry(16.1, 1.4, 12.1);
      const winMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.7,
      });
      const winMesh = new THREE.Mesh(winGeo, winMat);
      winMesh.position.y = floorY;
      buildingGroup.add(winMesh);
    }

    // Entrance portico / wing
    const wingGeo = new THREE.BoxGeometry(6, buildingHeight * 0.7, 5);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 });
    const wingMesh = new THREE.Mesh(wingGeo, wingMat);
    wingMesh.position.set(0, (buildingHeight * 0.7) / 2, 7.5);
    buildingGroup.add(wingMesh);

    scene.add(buildingGroup);

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      camera.aspect = newWidth / sceneHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, sceneHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [viewType, building, height, isRotating, code]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/60 shadow-inner group">
      {/* 3D vs Aerial Photo Toggle */}
      <div className="absolute top-3 right-3 z-10 flex items-center bg-slate-950/80 backdrop-blur-md rounded-xl p-1 border border-white/10 shadow-lg">
        <button
          type="button"
          onClick={() => setViewType('3d')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            viewType === '3d'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          3D Model
        </button>
        <button
          type="button"
          onClick={() => setViewType('photo')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            viewType === 'photo'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Aerial Photo
        </button>
      </div>

      {viewType === '3d' ? (
        <div className="relative w-full" style={{ height }}>
          <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
          {/* 3D Hint overlay */}
          <div className="absolute bottom-2.5 left-3 pointer-events-none flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-950/70 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/10">
            <svg className="w-3 h-3 text-blue-400 animate-spin" style={{ animationDuration: '4s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Drag to rotate • Scroll to zoom</span>
          </div>

          <button
            type="button"
            onClick={() => setIsRotating(!isRotating)}
            title={isRotating ? 'Pause auto-rotation' : 'Start auto-rotation'}
            className="absolute bottom-2.5 right-3 px-2 py-1 bg-slate-950/70 hover:bg-slate-900 text-slate-300 text-[10px] font-mono rounded-md border border-white/10 transition-colors cursor-pointer"
          >
            {isRotating ? '⏸ Pause' : '▶ Rotate'}
          </button>
        </div>
      ) : (
        <div className="relative w-full overflow-hidden flex items-center justify-center bg-slate-950" style={{ height }}>
          <img
            src={photoUrl}
            alt={building?.name || 'Building Aerial View'}
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src = '/jssate_campus_aerial.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-2 left-3 text-[11px] font-medium text-white/90">
            {building?.short_name || building?.name} • Aerial Satellite Crop
          </div>
        </div>
      )}
    </div>
  );
}

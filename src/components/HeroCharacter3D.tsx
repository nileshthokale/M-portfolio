import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export type HeroModelPreset = 'avatar' | 'torus' | 'crystal';

interface HeroCharacter3DProps {
  reducedMotion: boolean;
}

// Pre-allocated math helpers outside render loop (Zero GC)
const _targetRot = new THREE.Vector3();

export const HeroCharacter3D: React.FC<HeroCharacter3DProps> = ({ reducedMotion }) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [preset, setPreset] = useState<HeroModelPreset>('avatar');
  const [hudCollapsed, setHudCollapsed] = useState(false);

  const presetRef = useRef<HeroModelPreset>('avatar');
  const reducedMotionRef = useRef<boolean>(reducedMotion);
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const requestRenderRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    presetRef.current = preset;
    requestRenderRef.current?.();
  }, [preset]);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
    requestRenderRef.current?.();
  }, [reducedMotion]);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // 1. Software WebGL detection from GPU renderer string
    const isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement('canvas');
        const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = Math.max(container.clientWidth, 340);
    const height = Math.max(container.clientHeight, 360);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0, 0.12, 6.4);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // 3. Balanced 3-Point Studio Lighting Rig (Warm Key + Cool Hemisphere Fill + Rim)
    const hemiLight = new THREE.HemisphereLight(0xb4a5ff, 0x181528, 1.1);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffe8d6, 2.0);
    keyLight.position.set(3.2, 4.2, 4.5);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLightPink = new THREE.PointLight(0xff4fa3, 5.2, 12);
    rimLightPink.position.set(-3.4, 1.8, -1.5);
    scene.add(rimLightPink);

    const rimLightOrange = new THREE.PointLight(0xff9a3c, 4.2, 12);
    rimLightOrange.position.set(3.4, -1.2, 2.4);
    scene.add(rimLightOrange);

    // 4. Composite 10-part Procedural 3D Hero Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Calibrated PBR Materials (varied roughness >= 0.25 across parts)
    const skinMat = new THREE.MeshPhysicalMaterial({
      color: 0xd99173,
      roughness: 0.42,
      metalness: 0.04,
      clearcoat: 0.28,
      clearcoatRoughness: 0.3,
    });

    const cheekBlushMat = new THREE.MeshStandardMaterial({
      color: 0xc9735b,
      roughness: 0.5,
      metalness: 0.02,
    });

    const hairMat = new THREE.MeshPhysicalMaterial({
      color: 0x221512,
      roughness: 0.55,
      metalness: 0.15,
      clearcoat: 0.25,
    });

    const visorGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x7b5cff,
      roughness: 0.1,
      metalness: 0.25,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.88,
    });

    const chromeMat = new THREE.MeshPhysicalMaterial({
      color: 0xeef0f5,
      roughness: 0.12,
      metalness: 0.92,
      clearcoat: 0.8,
    });

    const pinkGlossMat = new THREE.MeshPhysicalMaterial({
      color: 0xff4fa3,
      roughness: 0.14,
      metalness: 0.3,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
    });

    const orangeGlossMat = new THREE.MeshPhysicalMaterial({
      color: 0xff9a3c,
      roughness: 0.18,
      metalness: 0.25,
      clearcoat: 0.9,
    });

    const eyeWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xfafcff,
      roughness: 0.12,
      metalness: 0.0,
    });

    const irisMat = new THREE.MeshPhysicalMaterial({
      color: 0x3b2216,
      roughness: 0.08,
      metalness: 0.1,
      clearcoat: 1.0,
    });

    const pupilDarkMat = new THREE.MeshBasicMaterial({
      color: 0x070709,
    });

    // --- Preset A: Stylized 3D Character Head (matches reference video 00:00-00:02) ---
    const avatarGroup = new THREE.Group();

    // Part 1: Sculpted Cranium + Jawline
    const headGeo = new THREE.SphereGeometry(1.16, 36, 36);
    headGeo.scale(0.92, 1.06, 0.94);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    avatarGroup.add(headMesh);

    // Part 2: Volumetric Swept Stylized Hair Waves (matching the curly/wavy quiff in 00:00-00:01)
    const hairGroup = new THREE.Group();
    const hairCapsules: Array<[number, number, number, number, number, number, number]> = [
      // [x, y, z, radius, len, rotZ, rotX]
      [0.0, 1.18, 0.26, 0.34, 0.55, 0.35, -0.25],
      [-0.48, 1.1, 0.24, 0.3, 0.48, 0.65, -0.15],
      [0.48, 1.12, 0.22, 0.32, 0.5, -0.55, -0.2],
      [-0.82, 0.78, 0.08, 0.28, 0.42, 0.25, 0.1],
      [0.82, 0.8, 0.08, 0.28, 0.42, -0.25, 0.1],
      [0.0, 1.28, -0.18, 0.42, 0.62, 1.57, 0.0],
      [-0.62, 0.95, -0.35, 0.38, 0.5, 0.4, 0.2],
      [0.62, 0.95, -0.35, 0.38, 0.5, -0.4, 0.2],
      [0.0, 0.72, -0.62, 0.52, 0.6, 1.57, 0.0],
    ];
    hairCapsules.forEach(([x, y, z, r, l, rz, rx]) => {
      const capGeo = new THREE.CapsuleGeometry(r, l, 12, 20);
      const lock = new THREE.Mesh(capGeo, hairMat);
      lock.position.set(x, y, z);
      lock.rotation.set(rx, 0, rz);
      hairGroup.add(lock);
    });
    avatarGroup.add(hairGroup);

    // Part 3 & 4: Large Expressive Pixar/Stylized Eyes with Iris, Dark Pupil & Dual Specular Glints
    const eyesGroup = new THREE.Group();
    const eyeGeo = new THREE.SphereGeometry(0.25, 28, 28);
    const irisGeo = new THREE.SphereGeometry(0.15, 24, 24);
    const pupilGeo = new THREE.SphereGeometry(0.085, 20, 20);
    const glintLargeGeo = new THREE.SphereGeometry(0.042, 12, 12);
    const glintSmallGeo = new THREE.SphereGeometry(0.022, 10, 10);

    [-0.39, 0.39].forEach((xOffset) => {
      const eyeSocket = new THREE.Group();
      eyeSocket.position.set(xOffset, 0.1, 0.96);

      const sclera = new THREE.Mesh(eyeGeo, eyeWhiteMat);
      sclera.scale.set(1.04, 1.08, 0.62);
      eyeSocket.add(sclera);

      const iris = new THREE.Mesh(irisGeo, irisMat);
      iris.position.set(0, 0, 0.11);
      iris.scale.set(1, 1, 0.48);
      eyeSocket.add(iris);

      const pupil = new THREE.Mesh(pupilGeo, pupilDarkMat);
      pupil.position.set(0, 0, 0.16);
      pupil.scale.set(1, 1, 0.35);
      eyeSocket.add(pupil);

      const glint1 = new THREE.Mesh(glintLargeGeo, eyeWhiteMat);
      glint1.position.set(0.055, 0.055, 0.19);
      eyeSocket.add(glint1);

      const glint2 = new THREE.Mesh(glintSmallGeo, eyeWhiteMat);
      glint2.position.set(-0.045, -0.04, 0.185);
      eyeSocket.add(glint2);

      eyesGroup.add(eyeSocket);
    });
    avatarGroup.add(eyesGroup);

    // Part 5: Thick Expressive Eyebrows (Left cocked, Right furrowed — matches 00:01 of video)
    const browGeo = new THREE.CapsuleGeometry(0.095, 0.36, 12, 16);
    const leftBrow = new THREE.Mesh(browGeo, hairMat);
    leftBrow.position.set(-0.4, 0.46, 1.01);
    leftBrow.rotation.z = Math.PI / 2 - 0.12;
    avatarGroup.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeo, hairMat);
    rightBrow.position.set(0.4, 0.5, 1.01);
    rightBrow.rotation.z = Math.PI / 2 + 0.24;
    avatarGroup.add(rightBrow);

    // Part 6: Sculpted Rounded Bridge & Nose Tip
    const noseBridge = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.26, 12, 16), skinMat);
    noseBridge.position.set(0, -0.02, 1.08);
    noseBridge.rotation.x = -0.25;
    avatarGroup.add(noseBridge);

    const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.145, 20, 20), cheekBlushMat);
    noseTip.position.set(0, -0.14, 1.15);
    noseTip.scale.set(1.18, 0.88, 0.95);
    avatarGroup.add(noseTip);

    // Part 7: Stylized Confident Smirk Mouth
    const mouthGeo = new THREE.CapsuleGeometry(0.05, 0.26, 10, 16);
    const mouthMesh = new THREE.Mesh(mouthGeo, cheekBlushMat);
    mouthMesh.position.set(0, -0.45, 1.0);
    mouthMesh.rotation.z = Math.PI / 2 + 0.08;
    avatarGroup.add(mouthMesh);

    // Part 8 & 9: Ears + Silver Hoop Earrings (matching 00:01 of reference video)
    const earGeo = new THREE.SphereGeometry(0.25, 20, 20);
    const ringGeo = new THREE.TorusGeometry(0.11, 0.032, 12, 24);
    [-1.05, 1.05].forEach((xPos) => {
      const ear = new THREE.Mesh(earGeo, skinMat);
      ear.position.set(xPos, -0.02, 0.04);
      ear.scale.set(0.45, 0.85, 0.65);
      avatarGroup.add(ear);

      const earring = new THREE.Mesh(ringGeo, chromeMat);
      earring.position.set(xPos * 1.03, -0.23, 0.1);
      earring.rotation.y = Math.PI / 2;
      avatarGroup.add(earring);
    });

    // Part 10: Neck & Cyber Collar Base
    const neckGeo = new THREE.CylinderGeometry(0.36, 0.44, 0.62, 24);
    const neckMesh = new THREE.Mesh(neckGeo, skinMat);
    neckMesh.position.set(0, -1.16, -0.05);
    avatarGroup.add(neckMesh);

    const collarGeo = new THREE.TorusGeometry(0.54, 0.17, 20, 36);
    const collarMesh = new THREE.Mesh(collarGeo, visorGlassMat);
    collarMesh.position.set(0, -1.36, 0.0);
    collarMesh.rotation.x = Math.PI / 2;
    avatarGroup.add(collarMesh);

    rootGroup.add(avatarGroup);

    // --- Preset B: Kali Cyber Torus Knot Sculpture ---
    const torusGroup = new THREE.Group();
    const knotGeo = new THREE.TorusKnotGeometry(0.95, 0.3, 96, 24);
    const knotMesh = new THREE.Mesh(knotGeo, pinkGlossMat);
    const innerCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 1), chromeMat);
    const orbitalRing = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.06, 16, 64), visorGlassMat);
    orbitalRing.rotation.x = Math.PI / 3;
    torusGroup.add(knotMesh, innerCore, orbitalRing);
    torusGroup.visible = false;
    rootGroup.add(torusGroup);

    // --- Preset C: Data Science Faceted Crystal Matrix ---
    const crystalGroup = new THREE.Group();
    const icoMain = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15, 0), visorGlassMat);
    for (let i = 0; i < 6; i++) {
      const sat = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 20, 20),
        i % 2 === 0 ? pinkGlossMat : orangeGlossMat
      );
      const angle = (i / 6) * Math.PI * 2;
      sat.position.set(Math.cos(angle) * 1.55, Math.sin(angle) * 1.15, Math.sin(angle * 2) * 0.4);
      crystalGroup.add(sat);
    }
    crystalGroup.add(icoMain);
    crystalGroup.visible = false;
    rootGroup.add(crystalGroup);

    // Floating Satellite Glossy Blobs around the hero subject
    const satellitesGroup = new THREE.Group();
    const blob1 = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24), pinkGlossMat);
    blob1.position.set(-1.75, 0.92, 0.4);
    const blob2 = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.08, 16, 32), orangeGlossMat);
    blob2.position.set(1.8, 0.68, -0.3);
    const blob3 = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), chromeMat);
    blob3.position.set(1.65, -0.88, 0.5);
    satellitesGroup.add(blob1, blob2, blob3);
    rootGroup.add(satellitesGroup);

    // Soft radial contact shadow plane beneath hero bust
    const shadowGeo = new THREE.CircleGeometry(1.6, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.set(0, -1.72, 0);
    scene.add(contactShadow);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // 5. Render Loop with Software-WebGL Pacing & Zero-Warning High-Resolution Timer
    let lastTimeMs = performance.now();
    const startTimeMs = lastTimeMs;
    let frameId = 0;
    let initTimerId = 0;
    let isDisposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (isDisposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 8);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 90);
          }
        };
        frameId = window.setTimeout(poll, 8);
      } else {
        frameId = window.setTimeout(cb, 90);
      }
    }

    function updateScene(dt: number, elapsed: number) {
      const activePreset = presetRef.current;
      avatarGroup.visible = activePreset === 'avatar';
      torusGroup.visible = activePreset === 'torus';
      crystalGroup.visible = activePreset === 'crystal';

      const px = pointerRef.current.x;
      const py = pointerRef.current.y;

      if (!reducedMotionRef.current) {
        _targetRot.set(py * 0.32, px * 0.48 + Math.sin(elapsed * 0.7) * 0.14, 0);
        rootGroup.rotation.x = THREE.MathUtils.damp(rootGroup.rotation.x, _targetRot.x, 5, dt);
        rootGroup.rotation.y = THREE.MathUtils.damp(rootGroup.rotation.y, _targetRot.y, 5, dt);
        rootGroup.position.y = Math.sin(elapsed * 1.6) * 0.08;

        eyesGroup.rotation.y = THREE.MathUtils.damp(eyesGroup.rotation.y, px * 0.22, 8, dt);
        eyesGroup.rotation.x = THREE.MathUtils.damp(eyesGroup.rotation.x, py * 0.18, 8, dt);

        torusGroup.rotation.z = elapsed * 0.35;
        crystalGroup.rotation.y = elapsed * 0.4;
        blob1.position.y = 0.92 + Math.sin(elapsed * 2.1) * 0.16;
        blob2.rotation.x = elapsed * 1.2;
        blob2.rotation.y = elapsed * 0.9;
        blob3.rotation.y = -elapsed * 1.4;
      } else {
        rootGroup.rotation.set(0, 0, 0);
        rootGroup.position.set(0, 0, 0);
      }
    }

    let renderBusy = false;
    let renderDirty = false;
    function requestRender() {
      if (isDisposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        if (isDisposed) return;
        renderDirty = false;
        const now = performance.now();
        const dt = Math.min((now - lastTimeMs) / 1000, 0.1);
        lastTimeMs = now;
        const elapsed = (now - startTimeMs) / 1000;

        const w = Math.max(container.clientWidth, 300);
        const h = Math.max(container.clientHeight, 320);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);

        updateScene(dt, elapsed);
        renderer.render(scene, camera);
        const done = () => {
          renderBusy = false;
          if (renderDirty) requestRender();
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    requestRenderRef.current = requestRender;

    function tickGpu() {
      if (isDisposed) return;
      const now = performance.now();
      const dt = Math.min((now - lastTimeMs) / 1000, 0.1);
      lastTimeMs = now;
      const elapsed = (now - startTimeMs) / 1000;
      updateScene(dt, elapsed);
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tickGpu);
    }

    // Immediate initial draw so first paint is never empty
    updateScene(0.016, 0.25);
    renderer.render(scene, camera);

    if (isSoftwareGl) {
      requestRender();
      initTimerId = window.setTimeout(requestRender, 120);
    } else {
      frameId = requestAnimationFrame(tickGpu);
    }

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      pointerRef.current.x = Math.max(-1, Math.min(1, nx));
      pointerRef.current.y = Math.max(-1, Math.min(1, ny));
      if (isSoftwareGl) requestRender();
    };

    const handleResize = () => {
      if (!container || isDisposed) return;
      if (isSoftwareGl) {
        requestRender();
      } else {
        const w = Math.max(container.clientWidth, 300);
        const h = Math.max(container.clientHeight, 320);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      clearTimeout(initTimerId);
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      envTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      className="relative w-full h-[360px] sm:h-[430px] lg:h-[500px] flex items-center justify-center select-none"
      data-testid="hero-3d-viewport"
    >
      {/* Isolated WebGL Canvas Mount */}
      <div
        ref={canvasMountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        aria-label="Interactive 3D stylized character portrait of Nilesh"
        role="img"
      />

      {/* Unified Collapsible Bottom Control Dock (Zero Viewport Occlusion) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
        <button
          type="button"
          onClick={() => setHudCollapsed((prev) => !prev)}
          className="px-3 py-1 text-[11px] font-medium tracking-wider uppercase text-[#eef0f5]/80 bg-[#0d101b] border border-white/15 rounded-t-lg hover:text-white transition-colors whitespace-nowrap"
          aria-expanded={!hudCollapsed}
          aria-label={hudCollapsed ? 'Show 3D Sculpture Controls' : 'Hide 3D Sculpture Controls'}
        >
          {hudCollapsed ? '▴ 3D Mesh' : '▾ 3D Mesh'}
        </button>
        {!hudCollapsed && (
          <div
            className="flex items-center gap-1 p-1 bg-[#0d101b] border border-white/20 rounded-full shadow-lg"
            role="group"
            aria-label="Select 3D Hero Sculpture"
          >
            {(
              [
                { id: 'avatar', label: '3D Bust' },
                { id: 'torus', label: 'Kali Knot' },
                { id: 'crystal', label: 'Data Core' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPreset(item.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors whitespace-nowrap shrink-0 ${
                  preset === item.id
                    ? 'bg-[#7b5cff] text-white'
                    : 'text-[#eef0f5]/75 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function MicrocontrollerCanvas({ activeBank = "A", isFlashing = false }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06080d, 0.05);

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 5, 8.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const cyanPoint = new THREE.PointLight(0x00f0ff, 8, 15);
    cyanPoint.position.set(-2, 3, 3);
    scene.add(cyanPoint);

    const emeraldPoint = new THREE.PointLight(0x10b981, 6, 12);
    emeraldPoint.position.set(3, 2, 2);
    scene.add(emeraldPoint);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2);
    rimLight.position.set(0, 10, -5);
    scene.add(rimLight);

    // --- PCB Substrate (Matte dark solder-mask) ---
    const pcbGroup = new THREE.Group();
    scene.add(pcbGroup);

    const pcbGeo = new THREE.BoxGeometry(6.2, 0.14, 4.4);
    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x090d14,
      roughness: 0.35,
      metalness: 0.85,
    });
    const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat);
    pcbGroup.add(pcbMesh);

    // Ground plane grid lines under PCB
    const gridHelper = new THREE.GridHelper(18, 36, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -1.2;
    scene.add(gridHelper);

    // --- Gold/Copper Edge Connector Pins ---
    const pinGeo = new THREE.BoxGeometry(0.12, 0.16, 0.4);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.2,
    });
    for (let i = -2.6; i <= 2.6; i += 0.35) {
      const pinTop = new THREE.Mesh(pinGeo, goldMat);
      pinTop.position.set(i, 0.01, -2.1);
      pcbGroup.add(pinTop);

      const pinBottom = new THREE.Mesh(pinGeo, goldMat);
      pinBottom.position.set(i, 0.01, 2.1);
      pcbGroup.add(pinBottom);
    }

    // --- Main SoC / MCU Chip (ESP32 / Cortex-M) ---
    const socGeo = new THREE.BoxGeometry(1.8, 0.22, 1.8);
    const socMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      roughness: 0.2,
      metalness: 0.9,
    });
    const socMesh = new THREE.Mesh(socGeo, socMat);
    socMesh.position.set(-1.2, 0.12, 0);
    pcbGroup.add(socMesh);

    // Metallic heat spreader cap on SoC
    const capGeo = new THREE.BoxGeometry(1.4, 0.04, 1.4);
    const capMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.95,
      roughness: 0.15,
    });
    const capMesh = new THREE.Mesh(capGeo, capMat);
    capMesh.position.set(-1.2, 0.24, 0);
    pcbGroup.add(capMesh);

    // --- Dual SPI Flash Memory Chips (Bank A & Bank B) ---
    const flashGeo = new THREE.BoxGeometry(0.9, 0.16, 1.1);

    const bankAMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x10b981,
      emissiveIntensity: activeBank === "A" ? 0.7 : 0.08,
      roughness: 0.3,
      metalness: 0.8,
    });
    const bankAMesh = new THREE.Mesh(flashGeo, bankAMat);
    bankAMesh.position.set(1.4, 0.11, -0.9);
    pcbGroup.add(bankAMesh);

    const bankBMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x00f0ff,
      emissiveIntensity: activeBank === "B" ? 0.7 : 0.08,
      roughness: 0.3,
      metalness: 0.8,
    });
    const bankBMesh = new THREE.Mesh(flashGeo, bankBMat);
    bankBMesh.position.set(1.4, 0.11, 0.9);
    pcbGroup.add(bankBMesh);

    // --- Glowing Bus Traces connecting MCU to Flash ---
    const traceMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.65,
    });

    const createTrace = (p1, p2, p3) => {
      const points = [
        new THREE.Vector3(p1[0], p1[1], p1[2]),
        new THREE.Vector3(p2[0], p2[1], p2[2]),
        new THREE.Vector3(p3[0], p3[1], p3[2]),
      ];
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      return new THREE.Line(geom, traceMat);
    };

    pcbGroup.add(createTrace([-0.3, 0.08, -0.4], [0.6, 0.08, -0.4], [0.95, 0.08, -0.9]));
    pcbGroup.add(createTrace([-0.3, 0.08, -0.2], [0.7, 0.08, -0.2], [0.95, 0.08, -0.7]));
    pcbGroup.add(createTrace([-0.3, 0.08, 0.2], [0.7, 0.08, 0.2], [0.95, 0.08, 0.7]));
    pcbGroup.add(createTrace([-0.3, 0.08, 0.4], [0.6, 0.08, 0.4], [0.95, 0.08, 0.9]));

    // --- Antenna / RF Shield trace pattern ---
    const antennaMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, opacity: 0.5, transparent: true });
    const antPoints = [
      new THREE.Vector3(-2.8, 0.08, -1.8),
      new THREE.Vector3(-2.8, 0.08, 1.8),
      new THREE.Vector3(-2.6, 0.08, 1.8),
      new THREE.Vector3(-2.6, 0.08, -1.6),
      new THREE.Vector3(-2.4, 0.08, -1.6),
      new THREE.Vector3(-2.4, 0.08, 1.6),
    ];
    const antGeo = new THREE.BufferGeometry().setFromPoints(antPoints);
    pcbGroup.add(new THREE.Line(antGeo, antennaMat));

    // --- Floating Data Stream Particles (Photons / OTA Binary Stream) ---
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 8;
      particlePositions[i * 3 + 1] = Math.random() * 3 + 0.1;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      particleSpeeds[i] = 0.02 + Math.random() * 0.04;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: isFlashing ? 0x00f0ff : 0x38bdf8,
      size: 0.06,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- Mouse Parallax Interaction ---
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0.35;
    let targetRotationY = -0.45;

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x;
      mouseY = y;
    };
    window.addEventListener("mousemove", onMouseMove);

    // --- Render Loop ---
    let frameId;
    let clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth board tilt following mouse + gentle ambient hover
      targetRotationY = -0.45 + mouseX * 0.45;
      targetRotationX = 0.38 - mouseY * 0.35;

      pcbGroup.rotation.y += (targetRotationY - pcbGroup.rotation.y) * 0.05;
      pcbGroup.rotation.x += (targetRotationX - pcbGroup.rotation.x) * 0.05;
      pcbGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.08;

      // Pulse bank LEDs
      if (activeBank === "A") {
        bankAMat.emissiveIntensity = 0.6 + Math.sin(elapsedTime * 4) * 0.25;
        bankBMat.emissiveIntensity = isFlashing ? 0.7 + Math.sin(elapsedTime * 16) * 0.4 : 0.05;
      } else {
        bankBMat.emissiveIntensity = 0.6 + Math.sin(elapsedTime * 4) * 0.25;
        bankAMat.emissiveIntensity = isFlashing ? 0.7 + Math.sin(elapsedTime * 16) * 0.4 : 0.05;
      }

      // Stream particles towards the target chip
      const positions = particleGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] -= particleSpeeds[i] * (isFlashing ? 3 : 1);
        if (positions[i * 3 + 1] < 0.1) {
          positions[i * 3 + 1] = 3.5;
          positions[i * 3] = (Math.random() - 0.5) * 6;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [activeBank, isFlashing]);

  return <div ref={mountRef} className="three-pcb-container" />;
}

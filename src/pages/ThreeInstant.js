import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton";

const ThreeInstant = () => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);
  const [arSession, setArSession] = useState(null);

  useEffect(() => {
    const container = containerRef.current;

    // Create Scene, Camera & Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    rendererRef.current = renderer;

    if (container) {
      container.appendChild(renderer.domElement);
    }

    // Lighting
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    const arButton = ARButton.createButton(renderer, {
      optionalFeatures: ["dom-overlay"], // Allows UI elements to stay visible
      domOverlay: { root: document.body }, // Define where the overlay exists
    });
  
    document.body.appendChild(arButton);

    arButton.style.display = "none";

    renderer.xr.addEventListener("sessionstart", (event) => setArSession(event));
    renderer.xr.addEventListener("sessionend", () => setArSession(null));

    // Animation Loop
    const animate = () => {
      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
      });
    };

    animate();

    return () => {
      renderer.setAnimationLoop(null);
      if (container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const spawnCone = () => {
    if (!sceneRef.current || !cameraRef.current) return;

    const geometry = new THREE.CylinderGeometry(0, 0.05, 0.2, 32).rotateX(Math.PI / 2);
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(0, 0, -0.3).applyMatrix4(cameraRef.current.matrixWorld);
    mesh.quaternion.setFromRotationMatrix(cameraRef.current.matrixWorld);

    sceneRef.current.add(mesh);
  };

  const exitAR = () => {
    if (arSession) {
        arSession.end();
    }
  }

  return (
    <div ref={containerRef} className="w-full h-screen bg-black relative">
      {/* Floating Button */}
      {arSession && (
        <button
          onClick={spawnCone}
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "10px 20px",
            fontSize: "16px",
            background: "blue",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            zIndex: 1000, // Ensure it's above the AR scene
          }}
        >
          Spawn Cone
        </button>
      )}
    </div>
  );
};

export default ThreeInstant;

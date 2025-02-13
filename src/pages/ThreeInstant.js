import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import imgOverlay from '../assets/peacock.png'
// import { ARButton } from "three/examples/jsm/webxr/ARButton";

const ThreeInstant = () => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);
  const [arSession, setArSession] = useState(false);
  const [isAligned, setIsAligned] = useState(false);

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

  const startAR = async () => {
    const session = await navigator.xr.requestSession("immersive-ar", {
      optionalFeatures: ["dom-overlay"], // Allows UI elements to stay visible
      domOverlay: { root: document.body }, // Define where the overlay exists
    });

    session.addEventListener("end", () => {
        setArSession(false);
    })
    rendererRef.current.xr.setReferenceSpaceType("local")
  
    await rendererRef.current.xr.setSession(session);
    setArSession(true);
  }

  const alignScene = () => {
    if (!sceneRef.current || !cameraRef.current) return;

    const geometry = new THREE.CylinderGeometry(0, 0.05, 0.2, 32).rotateX(Math.PI / 2);
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(0, 0, -0.3).applyMatrix4(cameraRef.current.matrixWorld);
    mesh.quaternion.setFromRotationMatrix(cameraRef.current.matrixWorld);

    sceneRef.current.add(mesh);

    setIsAligned(true);
  };

  const exitAR = () => {
    const session = rendererRef.current?.xr.getSession();
    if (session) session.end();

    // Clear the scene
    if (sceneRef.current) {
        while (sceneRef.current.children.length > 0) {
          const object = sceneRef.current.children[0];
          if (!object.isLight) {
            if (object.geometry) object.geometry.dispose();
            if (object.material) object.material.dispose();
            sceneRef.current.remove(object);
          }
          
        }
    }

    if (isAligned) setIsAligned(false);
  }

  return (
    <div ref={containerRef} className="w-full h-screen bg-black relative">
      {/* Custom Start AR button */}
      {!arSession && (
        <button
          onClick={startAR}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "15px 25px",
            fontSize: "18px",
            background: "green",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            zIndex: 1000,
          }}
        >
          Start AR
        </button>
      )}

      {/* Alignment image */}
      {arSession && !isAligned && (
        <img
          src={imgOverlay}
          alt="AR Guide Overlay"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            /*width: "auto",
            height: "auto",*/
            opacity: 0.5,
            pointerEvents: "none",
            zIndex: 999,
          }}
        />
      )}

      {/* Custom Back button */}
      {arSession && (
        <button
          onClick={exitAR}
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            padding: "10px 15px",
            fontSize: "16px",
            background: "red",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            zIndex: 1000,
          }}
        >
          Back
        </button>
      )}
      {/* Floating Button */}
      {arSession && !isAligned && (
        <button
          onClick={alignScene}
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
          Align Scene
        </button>
      )}
    </div>
  );
};

export default ThreeInstant;

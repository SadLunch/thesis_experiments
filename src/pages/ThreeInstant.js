import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton";

const ThreeInstant = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    // Scene, Camera & Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;

    if (container) {
      container.appendChild(renderer.domElement);
    }

    // Lighting
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    // Geometry for Cones
    const geometry = new THREE.CylinderGeometry(0, 0.05, 0.2, 32).rotateX(Math.PI / 2);

    // Controller (for screen touch input)
    const controller = renderer.xr.getController(0);
    scene.add(controller);

    // Function to spawn a cone 0.3 in front of the camera
    const spawnCone = () => {
      const material = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(0, 0, -0.3).applyMatrix4(camera.matrixWorld);
      mesh.quaternion.setFromRotationMatrix(camera.matrixWorld);
      scene.add(mesh);
    };

    // Create a 3D button
    const buttonGeometry = new THREE.PlaneGeometry(0.2, 0.1);
    const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
    button.position.set(0, -0.2, -0.5); // Place in front of the camera
    scene.add(button);

    // Raycaster for detecting button clicks
    const raycaster = new THREE.Raycaster();
    const tempMatrix = new THREE.Matrix4();

    const onSelect = () => {
      tempMatrix.identity().extractRotation(controller.matrixWorld);
      raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
      raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

      const intersects = raycaster.intersectObject(button);

      if (intersects.length > 0) {
        spawnCone(); // If button is tapped, spawn a cone
      }
    };

    controller.addEventListener("select", onSelect);

    document.body.appendChild(ARButton.createButton(renderer));

    // Animation Loop
    const animate = () => {
      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
      });
    };

    animate();

    return () => {
      renderer.setAnimationLoop(null);
      controller.removeEventListener("select", onSelect);
      if (container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-screen bg-black" />;
};

export default ThreeInstant;

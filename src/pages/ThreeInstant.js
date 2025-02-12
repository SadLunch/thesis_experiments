import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton";

const ThreeInstant = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;

    if (container) {
      container.appendChild(renderer.domElement);
    }

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    const coneGeometry = new THREE.ConeGeometry(0.1, 0.2, 32);
    const coneMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });

    const controller = renderer.xr.getController(0);
    scene.add(controller);

    const placeObject = (event) => {
      const cone = new THREE.Mesh(coneGeometry, coneMaterial);
      const pos = new THREE.Vector3();
      pos.setFromMatrixPosition(controller.matrixWorld);
      cone.position.copy(pos);
      scene.add(cone);
    };

    controller.addEventListener("select", placeObject);

    document.body.appendChild(ARButton.createButton(renderer));

    const animate = () => {
      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
      });
    };

    animate();

    return () => {
      renderer.setAnimationLoop(null);
      controller.removeEventListener("select", placeObject);
      if (container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-screen bg-black" />;
};

export default ThreeInstant;

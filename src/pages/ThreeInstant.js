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

    const geometry = new THREE.CylinderGeometry( 0, 0.05, 0.2, 32 ).rotateX( Math.PI / 2 );

    const controller = renderer.xr.getController(0);
    scene.add(controller);

    const placeObject = (event) => {
      const material = new THREE.MeshPhongMaterial( { color: 0xffffff * Math.random() } );
      const mesh = new THREE.Mesh( geometry, material );
      mesh.position.set(0, 0, -0.3).applyMatrix4(controller.matrixWorld);
      mesh.quaternion.setFromRotationMatrix(controller.matrixWorld);
      scene.add(mesh);
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

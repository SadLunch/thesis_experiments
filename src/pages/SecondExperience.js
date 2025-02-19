import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { XRButton } from "three/addons/webxr/XRButton.js";

const SecondExperience = () => {
  const mountRef = useRef(null);
  const [selectedObject, setSelectedObject] = useState(null);

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x808080);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10);
    camera.position.set(0, 1.6, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;
    if (mount) mount.appendChild(renderer.domElement);

    document.body.appendChild(XRButton.createButton(renderer, { requiredFeatures: ["hit-test"] }));

    const hemiLight = new THREE.HemisphereLight(0xbcbcbc, 0xa5a5a5, 3);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 3);
    dirLight.position.set(0, 6, 0);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const group = new THREE.Group();
    scene.add(group);

    const geometries = [
      new THREE.BoxGeometry(0.2, 0.2, 0.2),
      new THREE.ConeGeometry(0.2, 0.2, 64),
      new THREE.CylinderGeometry(0.2, 0.2, 0.2, 64),
      new THREE.IcosahedronGeometry(0.2, 8),
      new THREE.TorusGeometry(0.2, 0.04, 64, 32),
    ];

    for (let i = 0; i < 50; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const material = new THREE.MeshStandardMaterial({
        color: Math.random() * 0xffffff,
        roughness: 0.7,
        metalness: 0.0,
      });
      const object = new THREE.Mesh(geometry, material);
      object.position.set(Math.random() * 4 - 2, Math.random() * 2, Math.random() * 4 - 2);
      object.castShadow = true;
      object.receiveShadow = true;
      group.add(object);
    }

    const raycaster = new THREE.Raycaster();
    const touch = new THREE.Vector2();

    function onTouchStart(event) {
      touch.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
      touch.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(touch, camera);
      const intersects = raycaster.intersectObjects(group.children);
      if (intersects.length > 0) {
        setSelectedObject(intersects[0].object);
      }
    }

    function onTouchMove(event) {
      if (selectedObject) {
        touch.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        touch.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(touch, camera);
        const planeIntersect = raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
        if (planeIntersect) {
          selectedObject.position.copy(planeIntersect);
        }
      }
    }

    function onTouchEnd() {
      setSelectedObject(null);
    }

    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);

    function animate() {
      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
      });
    }
    animate();

    return () => {
      if (mount) mount.removeChild(renderer.domElement);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [selectedObject]);

  return <div ref={mountRef} />;
};

export default SecondExperience;
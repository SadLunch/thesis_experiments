import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { XRButton } from "three/addons/webxr/XRButton.js";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";

const SecondExperience = () => {
    const mountRef = useRef(null);
    //const [selectedObject, setSelectedObject] = useState(null);
  
    useEffect(() => {
        const mount = mountRef.current;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x808080);
  
      const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10);
      camera.position.set(0, 1.6, 3);
  
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      renderer.xr.enabled = true;
      if (mount) mount.appendChild(renderer.domElement);
      document.body.appendChild(XRButton.createButton(renderer));
  
      // Lighting
      const hemiLight = new THREE.HemisphereLight(0xbcbcbc, 0xa5a5a5, 3);
      scene.add(hemiLight);
  
      const dirLight = new THREE.DirectionalLight(0xffffff, 3);
      dirLight.position.set(0, 6, 0);
      dirLight.castShadow = true;
      scene.add(dirLight);
  
      // Floor
      const floorGeometry = new THREE.PlaneGeometry(6, 6);
      const floorMaterial = new THREE.ShadowMaterial({ opacity: 0.25 });
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);
  
      // Objects Group
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
        object.rotation.set(Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI);
        object.scale.setScalar(Math.random() + 0.5);
        object.castShadow = true;
        object.receiveShadow = true;
        group.add(object);
      }
  
      // Controllers
      const controller1 = renderer.xr.getController(0);
      const controller2 = renderer.xr.getController(1);
      scene.add(controller1);
      scene.add(controller2);
  
      const controllerModelFactory = new XRControllerModelFactory();
      const controllerGrip1 = renderer.xr.getControllerGrip(0);
      controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
      scene.add(controllerGrip1);
  
      const controllerGrip2 = renderer.xr.getControllerGrip(1);
      controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
      scene.add(controllerGrip2);
  
      const raycaster = new THREE.Raycaster();
  
      function onSelectStart(event) {
        const controller = event.target;
        raycaster.setFromXRController(controller);
        const intersections = raycaster.intersectObjects(group.children);
        if (intersections.length > 0) {
          const object = intersections[0].object;
          object.material.emissive.b = 1;
          controller.attach(object);
          controller.userData.selected = object;
        }
      }
  
      function onSelectEnd(event) {
        const controller = event.target;
        if (controller.userData.selected) {
          const object = controller.userData.selected;
          object.material.emissive.b = 0;
          group.attach(object);
          controller.userData.selected = undefined;
        }
      }
  
      controller1.addEventListener("selectstart", onSelectStart);
      controller1.addEventListener("selectend", onSelectEnd);
      controller2.addEventListener("selectstart", onSelectStart);
      controller2.addEventListener("selectend", onSelectEnd);
  
      function animate() {
        renderer.setAnimationLoop(() => {
          renderer.render(scene, camera);
        });
      }
  
      animate();
  
      return () => {
        if (mount) mount.removeChild(renderer.domElement);
      };
    }, []);
  
    return <div ref={mountRef} />;
  };

export default SecondExperience;
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import imgOverlay from '../assets/peacock.png'
import { XRControllerModelFactory } from "three/examples/jsm/Addons.js";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
// import { ARButton } from "three/examples/jsm/webxr/ARButton";

const raycaster = new THREE.Raycaster();
// const touchPoint = new THREE.Vector2();
// let selectedObject = null;
// let isMoving = false;
let controller, controllerGrip, group;
let intersected = [];

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

    // Group of objects in the scene
    group = new THREE.Group();
    scene.add(group);

    // Controllers
    controller = renderer.xr.getController(0);
    controller.addEventListener('selectstart', handleStart);
    controller.addEventListener('selectend', handleEnd);
    scene.add(controller);

    //Controller Grip (idk it was in the examples of Three.js)
    const controllerModelFactory = new XRControllerModelFactory();

    controllerGrip = renderer.xr.getControllerGrip(0);
    controllerGrip.add(controllerModelFactory.createControllerModel(controllerGrip));
    scene.add(controllerGrip);

    const geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );

    const line = new THREE.Line( geometry );
    line.name = 'line';
    line.scale.z = 5;

    controller.add( line.clone() );

    // window.addEventListener('touchstart', handleTouchStart);
    // window.addEventListener('touchmove', handleDrag);
    // window.addEventListener('touchend', handleTouchEnd);

    function handleStart(event) {
      const controller = event.target;
  
      const intersections = getIntersections(controller);
  
      if (intersections.length > 0) {
        const intersection = intersections[0];
  
        const object = intersection.object;
        object.material.emissive.b = 1;
        controller.attach(object);
  
        controller.userData.selected = object;
      }
    };
  
    function handleEnd(event) {
      const controller = event.target;
  
      if (controller.userData.selected !== undefined) {
        const object = controller.userData.selected;
        object.material.emissive.b = 0;
        group.attach(object);
  
        controller.userData.selected = undefined;
      }
    };
  
    function getIntersections(controller) {
      controller.updateMatrixWorld();
      raycaster.setFromXRController(controller);
      return raycaster.intersectObjects(group.children, false);
    }
  
    function intersectObjects(controller) {
      if (controller.userData.targetRayMode === 'screen') return;
  
      if (controller.userData.selected !== undefined) return;
  
      const line = controller.getObjectByName( 'line' );
      const intersections = getIntersections( controller );
  
      if ( intersections.length > 0 ) {
  
        const intersection = intersections[ 0 ];
  
        const object = intersection.object;
        object.material.emissive.r = 1;
        intersected.push( object );
  
        line.scale.z = intersection.distance;
  
      } else {
  
        line.scale.z = 5;
  
      }
    }
  
    function cleanIntersected() {
      while (intersected.length) {
        const object = intersected.pop();
        object.material.emissive.r = 0;
      }
    }

    // Animation Loop
    const animate = () => {
      cleanIntersected();

      intersectObjects(controller);

      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
      });
      // if (isMoving) {
      //   renderer.render(scene, camera);
      //   isMoving = false;
      // }
    };

    animate();

    return () => {
      // window.removeEventListener('touchstart', handleTouchStart);
      // window.removeEventListener('touchmove', handleDrag);
      // window.removeEventListener('touchend', handleTouchEnd);

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

    // // Create the object
    // const geometry = new THREE.CylinderGeometry(0, 0.05, 0.2, 32).rotateX(Math.PI / 2);
    // const material = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() });
    // const model = new THREE.Mesh(geometry, material);

    // Adding a model
    const loader = new GLTFLoader();
    loader.load(
      "/assets/scene.gltf",
      (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, -0.3).applyMatrix4(cameraRef.current.matrixWorld);
        model.quaternion.setFromRotationMatrix(cameraRef.current.matrixWorld);

        group.add(model);

        setIsAligned(true);
      },
      (xhr) => { console.log(`Loading model: ${(xhr.loaded / xhr.total) * 100}% loaded`); },
      (error) => { console.log('Error loading modle:', error); }
    );

    /**
     * position.set receives 3 values (x, y, z)
     * +x is to the right -x is to the left
     * +y is up -y is down
     * +z is behind the person -z is in front of the person
     */
    // model.position.set(0, 0, -0.3).applyMatrix4(cameraRef.current.matrixWorld);
    // model.quaternion.setFromRotationMatrix(cameraRef.current.matrixWorld);

    // group.add(model);

    // setIsAligned(true);
  };

  

  // const handleTouchStart = (event) => {
  //   if (!sceneRef.current || !cameraRef.current) return;

  //   // Normalize touch position
  //   touchPoint.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
  //   touchPoint.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;

  //   raycaster.setFromCamera(touchPoint, cameraRef.current);
  //   const intersects = raycaster.intersectObjects(sceneRef.current.children, true);

  //   if (intersects.length > 0) selectedObject = intersects[0].object;
  // };

  // const handleDrag = (event) => {
  //   if (!sceneRef.current || !cameraRef.current || !selectedObject) return;
  //   isMoving = true;

  //   touchPoint.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
  //   touchPoint.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;

  //   raycaster.setFromCamera(touchPoint, cameraRef.current);
  //   const intersects = raycaster.intersectObjects(sceneRef.current.children, true);

  //   if (intersects.length > 0) {
  //     selectedObject.position.copy(intersects[0].point.x, intersects[0].point.y, selectedObject.position.z);
  //   }
  // };

  // const handleTouchEnd = () => {
  //   selectedObject = null;
  // }

  const exitAR = () => {
    const session = rendererRef.current?.xr.getSession();
    if (session) session.end();

    // Clear the scene
    if (sceneRef.current) {
      sceneRef.current.children.forEach((object) => {
        if (!object.isLight) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) object.material.dispose();
          sceneRef.current.remove(object);
        }
      });
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

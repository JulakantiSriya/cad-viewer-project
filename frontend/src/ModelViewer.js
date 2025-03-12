import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ModelViewer = ({ modelUrl }) => {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const [mesh, setMesh] = useState(null);

  useEffect(() => {
    if (!modelUrl) {
      console.error("No model URL provided!");
      return;
    }

    console.log("Model URL:", modelUrl);

    // Cleanup existing renderer if needed
    if (rendererRef.current) {
      rendererRef.current.dispose();
      mountRef.current?.removeChild(rendererRef.current.domElement);
    }

    // Create Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x202020);

    // Create Camera
    const aspectRatio =
      mountRef.current.clientWidth / mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    camera.position.set(0, 0, 10);

    // Create Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // Load STL Model
    const loader = new STLLoader();

    loader.load(
      modelUrl,
      (geometry) => {
        console.log("Model Loaded Successfully:", geometry);

        // Create material and mesh
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const loadedMesh = new THREE.Mesh(geometry, material);
        scene.add(loadedMesh);
        setMesh(loadedMesh); // Store mesh for export

        // Calculate Bounding Box
        const boundingBox = new THREE.Box3().setFromObject(loadedMesh);
        const center = boundingBox.getCenter(new THREE.Vector3());
        const size = boundingBox.getSize(new THREE.Vector3());

        // Center Model
        loadedMesh.position.sub(center);

        // Adjust Camera Position
        const maxDimension = Math.max(size.x, size.y, size.z);
        const fitDistance =
          maxDimension / (2 * Math.tan((camera.fov * Math.PI) / 360));
        camera.position.set(0, 0, fitDistance * 2);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        console.log("Model Bounding Box:", boundingBox);
      },
      (xhr) => {
        console.log(`Model ${(xhr.loaded / xhr.total) * 100}% loaded`);
      },
      (error) => {
        console.error("Error loading model:", error);
      }
    );

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 100;
    controlsRef.current = controls;

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      camera.aspect =
        mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight
      );
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      console.log("Cleaning up...");
      window.removeEventListener("resize", handleResize);

      if (mesh) {
        mesh.geometry.dispose();
        mesh.material.dispose();
        scene.remove(mesh);
      }

      if (controlsRef.current) {
        controlsRef.current.dispose();
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
        mountRef.current?.removeChild(rendererRef.current.domElement);
        rendererRef.current = null;
      }
    };
  }, [modelUrl]);

  // Function to export STL to OBJ
  const exportToOBJ = () => {
    if (!mesh) {
      toast.error("No model loaded to export.");
      return;
    }

    const exporter = new OBJExporter();
    const objData = exporter.parse(mesh);

    const blob = new Blob([objData], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "exported_model.obj";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Model exported as OBJ!");
  };

  return (
    <div>
      <ToastContainer />
      <div ref={mountRef} style={{ width: "100%", height: "79vh" }} />
      {mesh && (
        <button
          onClick={exportToOBJ}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            padding: "10px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Export to OBJ
        </button>
      )}
    </div>
  );
};

export default ModelViewer;

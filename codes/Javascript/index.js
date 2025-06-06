import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color('#0b58d1');

// add THE SUN
const sun = new THREE.SpotLight(0xfff0dd, 15, 100, Math.PI / 1.5, 1, 1);
sun.position.set(15, 30, 10);
sun.castShadow = true;
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 100;
sun.shadow.camera.fov = 40;
const sunTarget = new THREE.Object3D();
sunTarget.position.set(0, 0, 0);
scene.add(sunTarget);
sun.target = sunTarget;

scene.add(sun);

// illuminate the scene with ambient light
const light = new THREE.AmbientLight( 0x404040, 0.45 ); // soft white light
scene.add( light );

// Define camera positions and lookAt targets
const cameraPath = [
  {
    position: new THREE.Vector3(0, 2, 5),
    lookAt: new THREE.Vector3(0, 1, 0),
  },
  {
    position: new THREE.Vector3(5, 2.5, 4),
    lookAt: new THREE.Vector3(0, 1.5, -2),
  },
  {
    position: new THREE.Vector3(10, 3, 0),
    lookAt: new THREE.Vector3(5, 1, -5),
  },
  {
    position: new THREE.Vector3(7, 2, -5),
    lookAt: new THREE.Vector3(3, 1.2, -10),
  },
  {
    position: new THREE.Vector3(3, 1.8, -8),
    lookAt: new THREE.Vector3(0, 1, -15),
  },
];

// Shared lookAt target
const lookAtTarget = new THREE.Vector3();
lookAtTarget.copy(cameraPath[0].lookAt); // Start at first target

// Current step
let currentStep = 0;
let isAnimating = false;

function animateCameraTo(index) {
  if (index < 0 || index >= cameraPath.length || isAnimating) return;

  const next = cameraPath[index];
  const duration = 2.5; // seconds

  isAnimating = true;

  gsap.to(camera.position, {
    x: next.position.x,
    y: next.position.y,
    z: next.position.z,
    ease: "power2.inOut",
    duration,
  });

  gsap.to(lookAtTarget, {
    x: next.lookAt.x,
    y: next.lookAt.y,
    z: next.lookAt.z,
    ease: "power2.inOut",
    duration,
    onUpdate: () => {
      camera.lookAt(lookAtTarget);
    },
    onComplete: () => {
      currentStep = index;
      isAnimating = false;
    }
  });
}

// Scroll wheel trigger
window.addEventListener("wheel", (event) => {
  if (isAnimating) return;

  if (event.deltaY > 0) {
    animateCameraTo(currentStep + 1);
  } else {
    animateCameraTo(currentStep - 1);
  }
});

// Camera setup
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 5);
camera.lookAt(new THREE.Vector3(0, 1, 0));


// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Resize listener
window.addEventListener('resize', () => {
  const { innerWidth, innerHeight } = window;
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// GLTF Loader
const loader = new GLTFLoader();
loader.load(
  'media/models/street.glb',
  (gltf) => {
    const model = gltf.scene;
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(model);
  },
  (xhr) => {
    console.log(`Loading: ${(xhr.loaded / xhr.total) * 100}%`);
  },
  (error) => {
    console.error('Error loading GLTF model:', error);
  }
);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

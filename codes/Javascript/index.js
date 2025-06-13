import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color('#0b58d1');
scene.fog = new THREE.Fog('#0b58d1', 10, 50); // Fog starts at 10 units, ends at 50


// add THE SUN
const sun = new THREE.SpotLight(0xfff0dd, 150, 100, Math.PI / 1.5, 1, 1);
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

// add GOD RAYS
const rayGeometry = new THREE.ConeGeometry(5, 20, 32, 1, true);
const rayMaterial = new THREE.MeshBasicMaterial({
  color: 0xfff0dd,
  transparent: true,
  opacity: 1,
  side: THREE.BackSide,
  depthWrite: true,
});

const godRay = new THREE.Mesh(rayGeometry, rayMaterial);
godRay.position.copy(sun.position);
godRay.rotation.x = -Math.PI / 2;
scene.add(godRay);

scene.fog = new THREE.Fog(0xfff0dd, 5, 300); // Reapply fog to match background

// illuminate the scene with ambient light
const light = new THREE.AmbientLight( 0x404040, 0.45 ); // soft white light
scene.add( light );

// Define camera positions and lookAt targets
const cameraPath = [
  {
    // Fired from the jagdtiger
    position: new THREE.Vector3(-0.989, 1.055, -0.6),
    lookAt: new THREE.Vector3(1.5, 0.4, -25),
    bankZ: 0.1
  },
  {
    // Swoop past the KV from the right
    position: new THREE.Vector3(1.5, 0.4, -20),
    lookAt: new THREE.Vector3(1.5, 1, -25),
    bankZ: -0.1
  },
  {
    // Drive-by the Sherman on the left
    position: new THREE.Vector3(-3, 2.2, -35),
    lookAt: new THREE.Vector3(-1.6, 1.5, -40),
    bankZ: 0.1
  },
  {
    // Ponder the Jagdtiger
    position: new THREE.Vector3(0, 0.15, -4.6),
    lookAt: new THREE.Vector3(-1.2, 1.3, 0),
    bankZ: 0
  },
  {
    // Peek from inside right building
    position: new THREE.Vector3(3.9, 2.8, -15),
    lookAt: new THREE.Vector3(1.2, 0.2, -28),
    bankZ: 0.3
  },
  {
    // Sherman commander view
    position: new THREE.Vector3(-1.7, 1.78, -40.2),
    lookAt: new THREE.Vector3(0, 0, 30),
    bankZ: 0.03
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
  const duration = 2.8; // cinematic drift duration

  isAnimating = true;

  // Animate position
  gsap.to(camera.position, {
    x: next.position.x,
    y: next.position.y,
    z: next.position.z,
    ease: "power3.inOut",
    duration,
  });

  // Animate lookAt using an Object3D as a target
  gsap.to(lookAtTarget, {
    x: next.lookAt.x,
    y: next.lookAt.y,
    z: next.lookAt.z,
    ease: "power2.inOut",
    duration,
    onUpdate: () => {
      camera.lookAt(lookAtTarget);
    }
  });

  // Animate camera "banking" using quaternions
  const tempCam = new THREE.PerspectiveCamera();
  tempCam.position.copy(next.position);
  tempCam.lookAt(next.lookAt);

  gsap.to(camera.rotation, {
    x: tempCam.rotation.x + (next.bankX || 0),
    y: tempCam.rotation.y + (next.bankY || 0),
    z: tempCam.rotation.z + (next.bankZ || 0),
    duration,
    ease: "sine.inOut",
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
  0.001,
  2000
);
camera.position.set(-0.989, 1.055, -0.6);
camera.lookAt(new THREE.Vector3(1.5, 0.4, -25));


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

// GLTF Loaders
const loader = new GLTFLoader();

loader.load('media/models/jagdtiger.glb', (gltf) => {
  const jagdtiger = gltf.scene;
  jagdtiger.position.set(-1.2, 0.02, 2); // Left of camera
  jagdtiger.rotation.y = Math.PI; // Face toward -Z (assumed camera dir)
  jagdtiger.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  scene.add(jagdtiger);
});

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
  },
  (error) => {
    console.error('Error loading GLTF model:', error);
  }
);

loader.load('media/models/KV.glb', (gltf) => {
  const KV = gltf.scene;
  KV.scale.set(0.05, 0.05, 0.05); // Shrink a lot
  KV.position.set(1.5, 0.4, -25); // In front, center road
  KV.rotation.y = 0.4; // Face camera
  KV.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  scene.add(KV);
});

// SHERMAN FIREFLY (slightly smaller)
loader.load('media/models/sherman.glb', (gltf) => {
  const sherman = gltf.scene;
  sherman.scale.set(0.4, 0.4, 0.4); // Make it smaller
  sherman.position.set(-1.6, 0.75, -40); // Behind KV
  sherman.rotation.y = 0; // Same facing as KV
  sherman.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  scene.add(sherman);
});

const terrainSize = 450;
const segments = 450;
const groundGeometry = new THREE.PlaneGeometry(terrainSize, terrainSize, segments, segments);
groundGeometry.rotateX(-Math.PI / 2);

// Load texture FIRST
const textureLoader = new THREE.TextureLoader();
const groundTexture = textureLoader.load('media/img/rockT.avif');
groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(32, 32);

// THEN create material
const groundMaterial = new THREE.MeshStandardMaterial({
  map: groundTexture,
  roughness: 1,
  metalness: 0,
  side: THREE.DoubleSide,
});

// NOW create the mesh using the above material
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.position.y = -0.01;
ground.receiveShadow = true;

// Mountain elevation logic
const posAttr = groundGeometry.attributes.position;
for (let i = 0; i < posAttr.count; i++) {
  const x = posAttr.getX(i);
  const z = posAttr.getZ(i);
  const dist = Math.sqrt(x * x + z * z);

  if (dist > 100) {
    const noise =
      (Math.sin(x * 0.3) * Math.cos(z * 0.3) +
      Math.sin(z * 0.5) * 0.5 +
      Math.random() * 0.3) * 4;
  
    const height = Math.pow((dist - 60) * 0.08, 1.4) + noise;
    posAttr.setY(i, height);
  }
}

groundGeometry.computeVertexNormals(); // important after manipulating vertices
posAttr.needsUpdate = true;
scene.add(ground);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

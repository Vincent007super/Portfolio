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


let shadowLight = new THREE.DirectionalLight(0xfefefe, 2);
shadowLight.castShadow = true;
shadowLight.shadow.bias = -0.0001;
shadowLight.shadow.mapSize.width = 2048;
shadowLight.shadow.mapSize.height = 2048;
shadowLight.position.set(-0.5, 10, -2);
shadowLight.shadow.camera.left = -20;
shadowLight.shadow.camera.right = 20;
shadowLight.shadow.camera.top = 20;
shadowLight.shadow.camera.bottom = -20;
shadowLight.shadow.camera.near = 0.5;
shadowLight.shadow.camera.far = 500;
scene.add(shadowLight);


scene.add(sun);
scene.add(shadowLight);

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
    // Drive-by the KV1s on the left
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
    // KV1s commander view
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
      child.castShadow = true;
      child.receiveShadow = true;
  });
  scene.add(jagdtiger);
});

loader.load(
  'media/models/street.glb',
  (gltf) => {
    const model = gltf.scene;
    model.traverse((child) => {
        child.castShadow = true;
        child.receiveShadow = true;
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

      // Replace material to make it metallic
      const original = child.material;
      child.material = new THREE.MeshStandardMaterial({
        color: original.color || new THREE.Color('gray'),
        metalness: 0.7,
        roughness: 0.3,
        map: original.map || null
      });
    }
  });
  scene.add(KV);
  createKVInfoPanel();
});

// KV1s FIREFLY (slightly smaller)
loader.load('media/models/KV1s.glb', (gltf) => {
  const KV1s = gltf.scene;
  KV1s.scale.set(0.018, 0.018, 0.018); // Make it smaller
  KV1s.position.set(-1.6, 0.5, -40); // Behind KV
  KV1s.rotation.y = 0; // Same facing as KV
  KV1s.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;

      // Replace material to make it metallic
      const original = child.material;
      child.material = new THREE.MeshStandardMaterial({
        color: original.color || new THREE.Color('gray'),
        metalness: 0.7,
        roughness: 0.3,
        map: original.map || null
      });
    }
  });
  scene.add(KV1s);
});

function createKVInfoPanel() {
  const boardWidth = 3.2;
  const boardHeight = 1.7;
  const boardRadius = 0.18;
  const infoBoardPosition = new THREE.Vector3(-1.35, 1.55, -24.5);
  const kvWorldPosition = new THREE.Vector3(1.5, 0.85, -25);
  const textPlaneWidth = boardWidth * 0.9;
  const textPlaneHeight = boardHeight * 0.95;
  const textPlaneOffsetX = -boardWidth * 0.05;
  const textPlaneOffsetY = 0.02;
  const canvasWidth = 1024;
  const canvasHeight = 512;
  const rightColumnAnchor = 0.58;

  const infoGroup = new THREE.Group();
  infoGroup.position.copy(infoBoardPosition);

  const shape = new THREE.Shape();
  const halfW = boardWidth / 2;
  const halfH = boardHeight / 2;
  shape.moveTo(-halfW + boardRadius, -halfH);
  shape.lineTo(halfW - boardRadius, -halfH);
  shape.quadraticCurveTo(halfW, -halfH, halfW, -halfH + boardRadius);
  shape.lineTo(halfW, halfH - boardRadius);
  shape.quadraticCurveTo(halfW, halfH, halfW - boardRadius, halfH);
  shape.lineTo(-halfW + boardRadius, halfH);
  shape.quadraticCurveTo(-halfW, halfH, -halfW, halfH - boardRadius);
  shape.lineTo(-halfW, -halfH + boardRadius);
  shape.quadraticCurveTo(-halfW, -halfH, -halfW + boardRadius, -halfH);

  const backingGeometry = new THREE.ShapeGeometry(shape);
  const backingMaterial = new THREE.MeshStandardMaterial({
    color: 0x090909,
    transparent: true,
    opacity: 0.95,
    metalness: 0.15,
    roughness: 0.75,
  });
  const backingPlane = new THREE.Mesh(backingGeometry, backingMaterial);
  backingPlane.receiveShadow = false;
  backingPlane.castShadow = false;
  infoGroup.add(backingPlane);

  const infoVideo = document.createElement('video');
  infoVideo.src = 'media/vid/kv-1.mp4';
  infoVideo.loop = true;
  infoVideo.muted = true;
  infoVideo.playsInline = true;
  infoVideo.autoplay = true;
  infoVideo.crossOrigin = 'anonymous';
  infoVideo.load();
  infoVideo.play().catch(() => {});

  const videoTexture = new THREE.VideoTexture(infoVideo);
  if ('colorSpace' in videoTexture) {
    videoTexture.colorSpace = THREE.SRGBColorSpace;
  } else {
    videoTexture.encoding = THREE.sRGBEncoding;
  }
  const videoWidth = boardWidth * 0.45;
  const videoHeight = boardHeight * 0.45;
  const textPlaneLeftEdge = textPlaneOffsetX - textPlaneWidth / 2;
  const videoLeftEdge = textPlaneLeftEdge + textPlaneWidth * rightColumnAnchor;
  const videoCenterX = videoLeftEdge + videoWidth / 2;
  const videoPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(videoWidth, videoHeight),
    new THREE.MeshBasicMaterial({ map: videoTexture })
  );
  videoPlane.position.set(videoCenterX, boardHeight * 0.22, 0.02);
  infoGroup.add(videoPlane);

  const infoCanvas = document.createElement('canvas');
  infoCanvas.width = canvasWidth;
  infoCanvas.height = canvasHeight;
  const ctx = infoCanvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(20, 100, 560, 410);

    ctx.font = '600 52px \"Arial\"';
    ctx.fillStyle = '#f6d89a';
    ctx.fillText('KV-1 Heavy Tank', 40, 80);

    const specs = [
      { label: 'Introduced', value: '1940' },
      { label: 'Weight', value: '45 tons' },
      { label: 'Armor', value: 'Up to 90 mm' },
      { label: 'Armament', value: '76 mm F-32' },
      { label: 'Top speed', value: '35 km/h' },
      { label: 'Crew', value: '5 soldiers' },
    ];

    const specStartY = 122;
    const specRowSpacing = 72;
    const specRowWidth = 520;
    const specRowHeight = 56;
    specs.forEach((spec, index) => {
      const y = specStartY + index * specRowSpacing;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.fillRect(40, y - specRowHeight / 2, specRowWidth, specRowHeight);
      ctx.font = '600 22px \"Arial\"';
      ctx.fillStyle = '#6c8ab5';
      ctx.fillText(spec.label.toUpperCase(), 56, y - 6);
      ctx.font = '600 32px \"Arial\"';
      ctx.fillStyle = '#fef3d7';
      ctx.fillText(spec.value, 56, y + 22);
    });

  }

  const textTexture = new THREE.CanvasTexture(infoCanvas);
  const textPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(textPlaneWidth, textPlaneHeight),
    new THREE.MeshBasicMaterial({ map: textTexture, transparent: true })
  );
  textPlane.position.set(textPlaneOffsetX, textPlaneOffsetY, 0.03);
  infoGroup.add(textPlane);

  const funFactCanvas = document.createElement('canvas');
  funFactCanvas.width = 1024;
  funFactCanvas.height = 320;
  const funFactCtx = funFactCanvas.getContext('2d');
  if (funFactCtx) {
    funFactCtx.fillStyle = '#151515';
    funFactCtx.fillRect(0, 0, funFactCanvas.width, funFactCanvas.height);

    funFactCtx.font = '600 54px \"Arial\"';
    funFactCtx.fillStyle = '#f4d79b';
    funFactCtx.fillText('Fun Fact', 36, 80);
    funFactCtx.font = '28px \"Arial\"';
    funFactCtx.fillStyle = '#fefefe';
    const funFactLines = [
      'In 1941, a lone KV-1 blocked a bridge for an entire day,',
      'forcing a German column to reroute after it ran out of shells.',
      'The surviving crew slipped away only after expending every round.'
    ];
    funFactLines.forEach((line, index) => {
      funFactCtx.fillText(line, 36, 130 + index * 40);
    });
  }

  const funFactTexture = new THREE.CanvasTexture(funFactCanvas);
  const funFactPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(videoWidth, boardHeight * 0.38),
    new THREE.MeshBasicMaterial({ map: funFactTexture, transparent: true })
  );
  const funFactCenterY = -boardHeight * 0.28;
  funFactPlane.position.set(videoLeftEdge + videoWidth / 2, funFactCenterY, 0.035);
  infoGroup.add(funFactPlane);

  scene.add(infoGroup);

  const pointerMaterial = new THREE.LineBasicMaterial({ color: 0xfff4c3 });
  const pointerStart = new THREE.Vector3(
    infoBoardPosition.x + boardWidth / 2 - boardRadius * 0.5,
    infoBoardPosition.y,
    infoBoardPosition.z + 0.01
  );
  const pointerGeometry = new THREE.BufferGeometry().setFromPoints([
    pointerStart,
    kvWorldPosition
  ]);
  const pointer = new THREE.Line(pointerGeometry, pointerMaterial);
  scene.add(pointer);
}

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

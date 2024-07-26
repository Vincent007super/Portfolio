let scene, camera, renderer, planes = [], videoPlane;
let currentIndex = 0;
const textures = [
    'textures/who2.png',
    'textures/who2.png',
    'textures/who2.png',
    'textures/who2.png',
    'textures/who2.png'
];
const totalElements = textures.length; // +1 for the video
let delta = 150;
let canScroll = true;
const speed = 0.005;
let startZ = 150;

console.log('Total Elements:', totalElements);
console.log('Textures:', textures);

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Set up video
    const video = document.createElement('video');
    video.src = 'media/vid/surface.mp4';
    video.loop = true;
    video.muted = true;
    video.play();

    const videoTexture = new THREE.VideoTexture(video);
    const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.DoubleSide });
    const videoGeometry = new THREE.PlaneGeometry(16, 9);
    videoPlane = new THREE.Mesh(videoGeometry, videoMaterial);
    videoPlane.position.set(0, 0, 50);
    videoPlane.scale.set(25, 25, 3);
    scene.add(videoPlane);

    console.log('Video plane added at position:', videoPlane.position);

    // Set up image planes
    textures.forEach((texture, index) => {
        const geometry = new THREE.PlaneGeometry(16, 9);
        const material = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load(texture),
            side: THREE.DoubleSide,
            transparent: true
        });
        const plane = new THREE.Mesh(geometry, material);
        plane.position.set(0, 0, -50 + (index - 1) * -delta);
        plane.scale.set(3, 3, 1);
        scene.add(plane);
        planes.push(plane);
        console.log(`Plane ${index} added at position:`, plane.position);
    });

    camera.position.z = startZ;
    console.log('Initial camera position:', camera.position);

    setupProgressBar();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('wheel', onWheelScroll, { passive: false });
}

function updatePositions() {
    const targetZ = startZ - (currentIndex * delta);
    camera.position.z = lerp(camera.position.z, targetZ, speed);

    console.log('Camera Z:', camera.position.z.toFixed(2), 'Target Z:', targetZ, 'Current Index:', currentIndex);

    // Add this line to update plane opacities
    updatePlaneOpacities();

    updateProgressBar();
    updateBackground();
}

function updatePlaneOpacities() {
    const planeDistance = 50; // Distance at which planes start to fade
    [videoPlane, ...planes].forEach((plane, index) => {
        const distance = Math.abs(camera.position.z - plane.position.z);
        const opacity = Math.max(0, Math.min(1, 1 - (distance - planeDistance) / 100));
        plane.material.opacity = opacity;
    });
}

function onWheelScroll(event) {
    console.log('Scrolling, canScroll:', canScroll);
    event.preventDefault();
    if (!canScroll) return;

    const scrollDirection = Math.sign(event.deltaY);
    currentIndex = Math.max(0, Math.min(currentIndex + scrollDirection, totalElements - 1));
    console.log('New Current Index:', currentIndex);

    canScroll = false;
    setTimeout(() => {
        canScroll = true;
        console.log('Scroll enabled');
    }, 300);
}

function setupProgressBar() {
    const progressPointsContainer = document.querySelector('.progress-points');
    progressPointsContainer.innerHTML = '';
    for (let i = 0; i < totalElements; i++) {
        const point = document.createElement('div');
        point.classList.add('progress-point');
        progressPointsContainer.appendChild(point);
    }
}

function updateProgressBar() {
    const points = document.querySelectorAll('.progress-point');
    points.forEach((point, index) => {
        point.classList.toggle('active', index === currentIndex);
    });
}

function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

function animate() {
    requestAnimationFrame(animate);
    updatePositions();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateBackground() {
    const progress = currentIndex / (totalElements - 1);
    const startColor = { r: 33, g: 173, b: 218 };
    const endColor = { r: 20, g: 17, b: 40 };
    const currentColor = {
        r: Math.round(lerp(startColor.r, endColor.r, progress)),
        g: Math.round(lerp(startColor.g, endColor.g, progress)),
        b: Math.round(lerp(startColor.b, endColor.b, progress))
    };
    document.body.style.backgroundColor = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`;
}

init();
animate();

console.log('Script fully loaded and executed');
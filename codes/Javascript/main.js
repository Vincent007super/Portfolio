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

let audioElements = [];
let currentAudio = null;
let nextAudio = null;

let previousIndex = -1;
let videoOverlay2, videoOverlay3;

console.log('Total Elements:', totalElements);
console.log('Textures:', textures);

let audioSources = [
    'media/audio/ambience_top.mp3',
    'media/audio/ambience_2.mp3',
    'media/audio/ambience_3.mp3',
    'media/audio/ambience_4.mp3',
    'media/audio/ambience_5.mp3'
];

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Set up main video
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

    // Set up video overlays
    setupVideoOverlays();

    // Initialize audio
    initAudio();

    camera.position.z = startZ;
    console.log('Initial camera position:', camera.position);

    setupProgressBar();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('wheel', onWheelScroll, { passive: false });
}

function setupVideoOverlays() {
    // Video overlay 2 (for planes 2 and 3)
    const video2 = document.createElement('video');
    video2.src = 'media/vid/light.mp4';
    video2.loop = true;
    video2.muted = true;
    video2.play();
    video2.oncanplay = () => console.log('Video 2 loaded and can play');


    const videoTexture2 = new THREE.VideoTexture(video2);
    const videoMaterial2 = new THREE.MeshBasicMaterial({
        map: videoTexture2,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
    });
    videoOverlay2 = new THREE.Mesh(new THREE.PlaneGeometry(16, 9), videoMaterial2);
    videoOverlay2.scale.set(68, 68, 1);
    camera.add(videoOverlay2);
    videoOverlay2.position.set(0, -145, -200);

    // Video overlay 3 (for planes 4 and 5)
    const video3 = document.createElement('video');
    video3.src = 'media/vid/dust.mp4';
    video3.loop = true;
    video3.muted = true;
    video3.play();
    video3.oncanplay = () => console.log('Video 3 loaded and can play');

    const videoTexture3 = new THREE.VideoTexture(video3);
    const videoMaterial3 = new THREE.MeshBasicMaterial({
        map: videoTexture3,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
    });
    videoOverlay3 = new THREE.Mesh(new THREE.PlaneGeometry(16, 9), videoMaterial3);
    videoOverlay3.scale.set(60, 60, 1);
    camera.add(videoOverlay3);
    videoOverlay3.position.set(0, 0, -200);

    scene.add(camera);
}

function fadeTo(material, targetOpacity, duration = 1000) {
    const currentOpacity = { opacity: material.opacity };
    
    console.log(`Starting fade to ${targetOpacity} for material with current opacity: ${material.opacity}`);
    
    new TWEEN.Tween(currentOpacity)
        .to({ opacity: targetOpacity }, duration)
        .easing(TWEEN.Easing.Quadratic.InOut) // Apply easing
        .onUpdate(() => {
            material.opacity = currentOpacity.opacity;
        })
        .onComplete(() => {
            console.log(`Fade complete to ${targetOpacity} for material. Final opacity: ${material.opacity}`);
        })
        .start();
}

function updateVideoOverlays() {
    const fadeDuration = 2000;  // Duration in milliseconds
    const maxOpacity2 = 0.75;
    const maxOpacity3 = 0.75;

    if (currentIndex <= 1) {
        if (Math.abs(videoOverlay2.material.opacity - maxOpacity2) > 0.01) {
            console.log('Starting fade for videoOverlay2 to maxOpacity2:', maxOpacity2);
            fadeTo(videoOverlay2.material, maxOpacity2, fadeDuration);
        }
        if (Math.abs(videoOverlay3.material.opacity - 0) > 0.01) {
            console.log('Starting fade for videoOverlay3 to 0');
            fadeTo(videoOverlay3.material, 0, fadeDuration);
        }
    } else if (currentIndex === 2) {
        if (Math.abs(videoOverlay2.material.opacity - (maxOpacity2 * 0.6)) > 0.01) {
            console.log('Starting fade for videoOverlay2 to:', maxOpacity2 * 0.6);
            fadeTo(videoOverlay2.material, maxOpacity2 * 0.6, fadeDuration);
        }
        if (Math.abs(videoOverlay3.material.opacity - (maxOpacity3 * 0.4)) > 0.01) {
            console.log('Starting fade for videoOverlay3 to:', maxOpacity3 * 0.4);
            fadeTo(videoOverlay3.material, maxOpacity3 * 0.4, fadeDuration);
        }
    } else if (currentIndex === 3) {
        if (Math.abs(videoOverlay2.material.opacity - 0) > 0.01) {
            console.log('Starting fade for videoOverlay2 to 0');
            fadeTo(videoOverlay2.material, 0, fadeDuration);
        }
        if (Math.abs(videoOverlay3.material.opacity - (maxOpacity3 * 0.6)) > 0.01) {
            console.log('Starting fade for videoOverlay3 to:', maxOpacity3 * 0.6);
            fadeTo(videoOverlay3.material, maxOpacity3 * 0.6, fadeDuration);
        }
    } else if (currentIndex >= 4) {
        if (Math.abs(videoOverlay2.material.opacity - 0) > 0.01) {
            console.log('Starting fade for videoOverlay2 to 0');
            fadeTo(videoOverlay2.material, 0, fadeDuration);
        }
        if (Math.abs(videoOverlay3.material.opacity - maxOpacity3) > 0.01) {
            console.log('Starting fade for videoOverlay3 to maxOpacity3:', maxOpacity3);
            fadeTo(videoOverlay3.material, maxOpacity3, fadeDuration);
        }
    }
    console.log(`Video 2 opacity: ${videoOverlay2.material.opacity.toFixed(2)}, Video 3 opacity: ${videoOverlay3.material.opacity.toFixed(2)}`);
}

function initAudio() {
    audioSources.forEach((src, index) => {
        const audio = new Audio(src);
        audio.loop = true;
        audio.volume = 0;
        audioElements.push(audio);
        console.log(`Audio ${index} initialized:`, src);
    });
    currentAudio = audioElements[0];
    currentAudio.volume = 0.45;
    currentAudio.play();
    console.log('Initial audio started:', audioSources[0]);
}

function updatePositions() {
    const targetZ = startZ - (currentIndex * delta);
    camera.position.z = lerp(camera.position.z, targetZ, speed);

    updatePlaneOpacities();
    updateProgressBar();
    updateBackground();

    if (currentIndex !== previousIndex) {
        console.log('Index changed. Updating video overlays.');
        updateVideoOverlays();
        previousIndex = currentIndex;
    }
}


function updateAudio() {
    const nextIndex = Math.min(currentIndex, audioElements.length - 1);
    console.log('Updating audio. Current Index:', currentIndex, 'Next Audio Index:', nextIndex);
    
    if (currentAudio !== audioElements[nextIndex]) {
        console.log('Audio change detected');
        if (currentAudio) {
            console.log('Fading out current audio:', audioSources[audioElements.indexOf(currentAudio)]);
            fadeOutAudio(currentAudio);
        }
        currentAudio = audioElements[nextIndex];
        console.log('Fading in new audio:', audioSources[nextIndex]);
        fadeInAudio(currentAudio);
    } else {
        console.log('No audio change needed');
    }
}

function fadeOutAudio(audio, duration = 1000) {
    console.log('Starting fade out for audio:', audioSources[audioElements.indexOf(audio)]);
    const fadeInterval = 50;
    const steps = duration / fadeInterval;
    const volumeStep = audio.volume / steps;

    const fadeOutInterval = setInterval(() => {
        if (audio.volume > volumeStep) {
            audio.volume -= volumeStep;
            console.log('Fading out. Current volume:', audio.volume.toFixed(2));
        } else {
            audio.volume = 0;
            audio.pause();
            clearInterval(fadeOutInterval);
            console.log('Fade out complete. Audio paused.');
        }
    }, fadeInterval);
}

function fadeInAudio(audio, duration = 1000) {
    console.log('Starting fade in for audio:', audioSources[audioElements.indexOf(audio)]);
    const fadeInterval = 50;
    const steps = duration / fadeInterval;
    const volumeStep = 0.45 / steps;  

    audio.volume = 0;
    audio.play();

    const fadeInInterval = setInterval(() => {
        if (audio.volume < 0.45 - volumeStep) {
            audio.volume += volumeStep;
            console.log('Fading in. Current volume:', audio.volume.toFixed(2));
        } else {
            audio.volume = 0.45;
            clearInterval(fadeInInterval);
            console.log('Fade in complete. Final volume:', audio.volume.toFixed(2));
        }
    }, fadeInterval);
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
    const newIndex = Math.max(0, Math.min(currentIndex + scrollDirection, totalElements - 1));
    
    if (newIndex !== currentIndex) {
        currentIndex = newIndex;
        console.log('New Current Index:', currentIndex);
        updateAudio();
    }

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
    TWEEN.update(); // This line is crucial for TWEEN animations to work
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
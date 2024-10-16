import * as THREE from '../../node_modules/three/build/three.module.js';
import { initFishSchool, animateFishSchool } from './fish.js';
import { initSubmarine, animateSubmarine, updateSubmarineOpacity } from './submarine.js';
// import {Text} from '../../node_modules/troika-three-text/src/index.js';

const clock = new THREE.Clock();

let scene, camera, renderer, planes = [], videoPlane;
let fishSchoolPlane, submarinePlane;
let currentIndex = 0;
const planesAmount = 5;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let delta = 150;
let canScroll = true;
const speed = 0.009;
let startZ = 150;

let audioElements = [];
let currentAudio = null;
// let nextAudio = null;

console.log('amount of planes:', planesAmount);

let audioSources = [
    'media/audio/ambience_top.mp3',
    'media/audio/ambience_2.mp3',
    'media/audio/ambience_3.mp3',
    'media/audio/ambience_4.mp3',
    'media/audio/ambience_5.mp3'
];

function checkMaterials() {
    scene.traverse((object) => {
        if (object.isMesh) {
            const material = object.material;

            if (material.map) console.log(`${object.name || 'Unnamed object'} has a diffuse map`);
            if (material.normalMap && object.geometry) {
                const geometry = object.geometry;

                // Ensure geometry has necessary attributes before computing tangents
                if (geometry.attributes.normal && geometry.attributes.uv) {
                    if (!geometry.attributes.tangent) {
                        console.log(`${object.name || 'Unnamed object'} is missing tangents, computing them now`);
                        try {
                            geometry.computeTangents();
                            console.log('Tangents computed successfully for', object.name || 'Unnamed object');
                        } catch (e) {
                            console.error('Failed to compute tangents for', object.name || 'Unnamed object', e);
                        }
                    }
                } else {
                    console.warn(`Skipping tangent computation for ${object.name || 'Unnamed object'}: Missing normal or UV attributes.`);
                }
            }
        } else {
            console.log(`Object skipped, type is: ${object.type}`);
        }
    });
}



// initialize webgl and three.js ----------------------------------------------------------------------------------------
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

    checkMaterials();

    for (let i = 0; i < planesAmount; i++) {
        planeLoad(i);
    }


    // Set up image planes
    function planeLoad(index) {
        const geometry = new THREE.PlaneGeometry(16, 9);
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0x44d1ef), // Lichtblauw in hexadecimaal
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.4 // 40% doorzichtigheid
        });
        const plane = new THREE.Mesh(geometry, material);
        plane.position.set(0, 0, -50 + (index - 1) * -delta);
        plane.scale.set(3, 3, 1);
        scene.add(plane);
        planes.push(plane);
        console.log(`Plane ${index} added at position:`, plane.position);

        // Initialize fish school for the second plane
        if (index === 1) {
            fishSchoolPlane = plane;
            console.log('Fish school plane set:', fishSchoolPlane);
            initFishSchool(fishSchoolPlane);
            console.log('Fish school initialized on plane:', fishSchoolPlane);
        }
        if (index === 3) { // This is plane 4 (index 3)
            submarinePlane = plane;
            console.log('Submarine plane set:', submarinePlane);
            const scene = new THREE.Scene();
            initSubmarine(submarinePlane, scene);
            console.log('Submarine initialized on plane:', submarinePlane);
        }
    }

    // function addElementsToPlane(plane, elements) {
    //     elements.forEach((element) => {
    //         let mesh;
    
    //         // Voeg tekst toe aan het plane als een CanvasTexture
    //         if (element.type === 'title' || element.type === 'button') {
    //             const canvas = document.createElement('canvas');
    //             const context = canvas.getContext('2d');
    //             context.innerWidth = 2000;
    //             context.font = 'Bold 60px Arial';
    //             context.fillStyle = 'white';
    //             context.fillText(element.text, 0, 50, 2000);
    //             const texture = new THREE.CanvasTexture(canvas);
    //             const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    //             const geometry = new THREE.PlaneGeometry(4, 2);
    //             mesh = new THREE.Mesh(geometry, material);
    //         }
    
    //         // Voeg een afbeelding toe aan het plane
    //         if (element.type === 'image') {
    //             const textureLoader = new THREE.TextureLoader();
    //             const texture = textureLoader.load(element.src);
    //             const material = new THREE.MeshBasicMaterial({ map: texture });
    //             const geometry = new THREE.PlaneGeometry(4, 2);
    //             mesh = new THREE.Mesh(geometry, material);
    //         }
    
    //         // Stel de positie in
    //         const { x, y, z } = element.position;
    //         mesh.position.set(x, y, z);
    
    //         // Voeg de klikfunctie toe voor knoppen en afbeeldingen
    //         if (element.link) {
    //             mesh.userData = { link: element.link };
    //             mesh.callback = function () {
    //                 window.location.href = mesh.userData.link;
    //             };
    //         }
    
    //         // Voeg de mesh toe aan de plane
    //         plane.add(mesh);
    //     });
    // }
    
    // // Voeg elementen toe aan elk plane
    // planeElements.forEach((elements, index) => {
    //     addElementsToPlane(planes[index], elements);
    // });

    // Add elements to each plane

    // if (fishSchoolPlane) {
    //     initFishSchool(fishSchoolPlane);
    //     console.log('Fish school initialized on plane:', fishSchoolPlane);
    // } else {
    //     console.error('Fish school plane not found');
    // }

    if (planes[1]) {
        initFishSchool(planes[1]);
    }

    initAudio();

    camera.position.z = startZ;
    console.log('Initial camera position:', camera.position);

    setupProgressBar();
    // addElementsToPlane(plane, element);

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('wheel', onWheelScroll, { passive: false });
}

function onDocumentMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.callback) object.callback();
    }
}

window.addEventListener('click', onDocumentMouseClick);

// Audio code -----------------------------------------------------------------------------------------------------------
function initAudio() {
    canScroll = false;
    document.getElementById('startButton').addEventListener('click', () => {
        document.getElementById('audio-overlay').style.display = 'none'; // Verberg de overlay na klikken
        canScroll = true;

        audioSources.forEach((src, index) => {
            const audio = new Audio(src);
            audio.loop = true;
            audio.volume = 0;
            audioElements.push(audio);
        });
        currentAudio = audioElements[0];
        currentAudio.volume = 0.45;
        currentAudio.play();
    });
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

// Plane code -----------------------------------------------------------------------------------------------------------------
function updatePlaneOpacities() {
    const planeDistance = 50; // Distance at which planes start to fade
    [videoPlane, ...planes].forEach((plane, index) => {
        const distance = Math.abs(camera.position.z - plane.position.z);
        const opacity = Math.max(0, Math.min(0.9, 0.9 - (Math.abs(planeDistance - distance) / 100)));
        plane.material.opacity = opacity;

        // Pas de zichtbaarheid van de vissengroep aan
        if (index === 1 && plane.children.length > 0) {
            plane.children[0].visible = opacity > 0;
        }
    });
}

function updatePositions() {
    const targetZ = startZ - (currentIndex * delta);
    camera.position.z = lerp(camera.position.z, targetZ, speed);

    // Check if we are on the submarine's plane
    const isOnSubmarinePlane = (currentIndex === 3); // Assuming plane 3 holds the submarine
    animateSubmarine(isOnSubmarinePlane);

    updatePlaneOpacities();
    updateProgressBar();
    updateBackground();
}

// General code -----------------------------------------------------------------------------------------------------------------
function onWheelScroll(event) {
    console.log('Scrolling, canScroll:', canScroll);
    event.preventDefault();
    if (!canScroll) return;

    const scrollDirection = Math.sign(event.deltaY);
    const newIndex = Math.max(0, Math.min(currentIndex + scrollDirection, planesAmount - 1));

    if (newIndex !== currentIndex) {
        currentIndex = newIndex;
        console.log('New Current Index:', currentIndex);
        updateAudio();
        updateSubmarineOpacity(currentIndex);
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
    for (let i = 0; i < planesAmount; i++) {
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

function animate(time) {
    const deltaTime = clock.getDelta();
    requestAnimationFrame(animate);
    updatePositions();
    if (planes[1] && planes[1].children.length > 0) {
        animateFishSchool(time);
    }
    if (planes[3] && planes[3].children.length > 0) {
        animateSubmarine();
    }
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateBackground() {
    const progress = currentIndex / (planesAmount - 1);
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
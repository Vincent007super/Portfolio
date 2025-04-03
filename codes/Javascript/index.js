import * as THREE from 'three';
import { TextureLoader, PlaneGeometry, RepeatWrapping } from 'three';
import { Water } from 'https://unpkg.com/three@0.174.0/examples/jsm/objects/Water.js';

let scene, camera, renderer;
let objects = []; // Array to hold our scrollable objects
let planesContent = [
    {
        plane: 1,
        layout: "title", // Layout type
        title: "Hello world",
        description: "Welcome to my portfolio. Interested? Scroll down to dive in!",
        image: "example1.png"
        },
    {
        plane: 2,
        layout: "detailed", // Layout type
        title: "Outgoing and a fast learner",
        description: "A true history fanatic, Vincent loves to travel across countries to visit places where once was fought and explore the machinery with which they engaged in combat. But of course, one must not merely see history if not learn from it. Vincent tries to stuff as much information as possible out of those short trips to take back home. And once home he is always ready for the next trip.",
        image1: "../../media/img/London.jpg",
        image2: "../../media/img/Italy.jpg",
        extraInfo: "Click here to learn more about me",
        link: "about_me.html"
    },
    {
        plane: 3,
        layout: "title", // Nieuwe lay-out met meerdere afbeeldingen
        title: "A Collection of Images",
        description: "Here are some images for you."
    },
    {
        plane: 4,
        layout: "detailed", // Layout type
        title: "Dit zijn een aantal projecten waaran ik heb gewerkt",
        description: "meer ga je niet krijgen :D.",
        image: "../../media/img/FDR.jpg",
        extraInfo: "Klik hier om meer te zien",
        link: "page4.html"
    }
];
const planeLocations = [
    { x: 0, y: 0, z: 0 }, // Plane 1
    { x: 0, y: -30, z: 8 }, // Plane 2
    { x: 0, y: -70, z: 5 }, // Plane 3
    { x: 0, y: -120, z: -60 } // Plane 4
];

// Scroll variables
let scroll;
let newScroll;
let canScroll = true;
let camPosZ; // Z position variable of the camera
let currCam = 1; // Where the Camera currently is
const waterGeometry = new PlaneGeometry(10000, 10000);
// Initialize Three.js

// function checkScreenSize() {
//     if (window.innerWidth < 1750) {
//         document.body.innerHTML = 
//             <div id="screen-warning" style="
//                 position: fixed;
//                 top: 0; left: 0; width: 100%; height: 100%;
//                 background: gray;
//                 color: white;
//                 display: flex;
//                 justify-content: center;
//                 align-items: center;
//                 font-size: 24px;
//                 text-align: center;
//                 z-index: 9999;
//             ">
//                 <p>Vergroot je browser of zet hem op volledig scherm om deze site te bekijken.</p>
//             </div>
//         ;
//     } else {
//         let warning = document.getElementById('screen-warning');
//         if (warning) warning.remove();
//     }
// }

// Set initial camera position
function camPosCalc() {

    if (window.innerWidth < 1000) {
        camPosZ = 15;
        console.log("Kleiner dan 1000, camPosZ is nu " + camPosZ);
    } else if (window.innerWidth >= 1000 && window.innerWidth < 1500) {
        camPosZ = 11;
        console.log("Groter dan 1000 en kleiner dan 1500, camPosZ is nu " + camPosZ);
    } else if (window.innerWidth >= 1500 && window.innerWidth < 1920) {
        camPosZ = 9;
        console.log("Groter dan 1500 en kleiner dan 1920, camPosZ is nu " + camPosZ);
    } else if (window.innerWidth == 1920) {
        camPosZ = 8;
        console.log("Zo groot als 1920, camPosZ is nu " + camPosZ);
    } else if (window.innerWidth > 1920) {
        camPosZ = 7;
        console.log("Groter dan 1920, camPosZ is nu: " + camPosZ)
    } else {
        console.error(camera.position.z + " Something went wrong. Your screen width of " + window.innerWidth + " Does not work properly with our site, please make your browser smaller or larger.");
    }
    camera.position.z = camPosZ;
}

function init() {
    scene = new THREE.Scene({});
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    camera.position.y = 0;
    camera.rotatex = 50;

    // Create Raycaster and mouse vector
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseClick(event) {
        event.preventDefault();

        // Convert mouse position to normalized device coordinates (-1 to +1)
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

        // Update the raycaster with the camera position and mouse direction
        raycaster.setFromCamera(mouse, camera);

        // Check if any planes were clicked
        const intersects = raycaster.intersectObjects(objects);

        if (intersects.length > 0) {
            // Find the first intersected object
            const clickedPlane = intersects[0].object;

            // Find the plane's associated content
            console.log(planesContent);
            const clickedIndex = objects.indexOf(clickedPlane); // Get index of clicked plane
            const clickedContent = planesContent[clickedIndex]; // Retrieve corresponding content
            

            if (clickedContent && clickedContent.link !== undefined) {
                window.location.href = clickedContent.link; // Redirect to the linked page
            }
        }
    }

    camPosCalc();
    // Add planes with content from planesContent array
    planesContent.forEach((content, index) => {
        const plane = createTextPlane(content); // Pass content for each plane
        try {
            plane.position.set(planeLocations[index].x, planeLocations[index].y, planeLocations[index].z);
            console.log(plane + " added to scene " + planeLocations[index].x, planeLocations[index].y, planeLocations[index].z);
        } catch (error) {
            console.error("Error: " + error);
            // plane.position = planeLocations[index].x, planeLocations[index].y, planeLocations[index].z; // Stagger planes vertically

        };
        scene.add(plane);
        objects.push(plane);
        console.log(plane, "added to scene at", planeLocations[index]);
    });

    //add water or smth
    scene.add(water);

    // Fog handling
    scene.background = new THREE.Color(0x9FC5E8); // Match fog color for smooth transition
    // scene.fog = new THREE.Fog(0x073763, 1, 100); // Dark blue fading effect


    window.addEventListener('resize', onWindowResize);

    window.addEventListener('wheel', onScroll);

    window.addEventListener('mousedown', onMouseClick, false);


    console.log('Scene initialized');
}

// Create a plane with dynamic content and layout
function createTextPlane(content) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, color: 0xffffff, opacity: 0.8 });
    const geometry = new THREE.PlaneGeometry(16, 9, 10, 10);
    const textPlane = new THREE.Mesh(geometry, material);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    context.fillStyle = 'rgba(192, 220, 224, 0.85)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Tekst wrap functie
    function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const testWidth = ctx.measureText(testLine).width;
            if (testWidth > maxWidth && i > 0) {
                ctx.fillText(line, x, y);
                line = words[i] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, y);
    }

    // Layout-specifiek ontwerp toepassen
    if (content.layout === "title") {
        context.fillStyle = 'black';
        context.font = '64px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.fillText(content.title, canvas.width / 2, 185);
        context.font = '32px Arial';
        wrapText(context, content.description, canvas.width / 2, canvas.height / 2, 1200, 40);
    } else if (content.layout === "detailed") {
        if (content.image1) {
            const imagePlane1 = createContrastImagePlane(content.image1, 5, 4.2, 1.5);
            imagePlane1.position.set(-3.5, -2.5, 0.1); // Pas de positie aan
            textPlane.add(imagePlane1);
        }
        if (content.image2) {
            const imagePlane2 = createContrastImagePlane(content.image2, 6, 4.2, 2);
            imagePlane2.position.set(3.5, - 2.5, 0.1); // Pas de positie aan
            textPlane.add(imagePlane2);
        }
        context.fillStyle = 'black';
        context.font = '48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.fillText(content.title, canvas.width / 2, 50);
        context.font = '28px Arial';
        wrapText(context, content.description, canvas.width / 2, 150, canvas.width - 1000, 35);
    } else if (content.layout === "multipleImages") {
        context.fillStyle = 'black';
        context.font = '64px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText(content.title, 75, 85);
        context.font = '32px Arial';
        wrapText(context, content.description, 75, 180, 1000, 40);
        // Voeg meerdere afbeeldingen toe
        content.images.forEach((image, index) => {
            const imagePlane = createContrastImagePlane(image, 4, 3); // Afbeelding groot maken
            imagePlane.position.set(75 + (index * 5), 250, 0.1); // Elke afbeelding naar een andere plek verplaatsen
            textPlane.add(imagePlane); // Voeg toe aan de plane
        });
    } else if (content.layout === "video") {
        context.fillStyle = 'black';
        context.font = '64px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText(content.title, 75, 85);
        context.font = '32px Arial';
        wrapText(context, content.description, 75, 180, 1000, 40);
        // Voeg een video toe
        const videoPlane = createVideoPlane(content.videoUrl);
        videoPlane.position.set(4, -0.2, 0.1);
        textPlane.add(videoPlane); // Voeg video toe als kind van de tekstplane
    }
    // Plaats afbeelding als apart object
    if (content.layout === "detailed" && content.image) {
        const imagePlane = createContrastImagePlane(content.image, 4, 4.5); // Afbeeldingsgrootte aanpassen
        imagePlane.position.set(3.5, 0, 0.1); // Positie ten opzichte van de tekst
        textPlane.add(imagePlane); // Voeg afbeelding toe als kind van de tekstplane
    }

    return textPlane;
}

// Create water plane
const textureLoader = new TextureLoader();
const normalMap = textureLoader.load('../../media/textures/waternormals.jpg', (texture) => {
    texture.wrapS = texture.wrapT = RepeatWrapping;
});

const water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: normalMap,
    alpha: 1.0,
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f, // Deep blue-green ocean
    distortionScale: 3.7,
    fog: true
});

water.rotation.x = -Math.PI / 2;

water.position.y = -5;

// Handle scrolling
function onScroll(scroll) {
    if (canScroll) {
        canScroll = false;
        newScroll = event.deltaY;

        if (newScroll > 0 && currCam < objects.length) {
            currCam++;
        } else if (newScroll < 0 && currCam > 1) {
            currCam--;
        } else {
            canScroll = true;
            return;
        }

        // Bereken het nieuwe doel op basis van de huidige positie
        let targetY = planeLocations[currCam - 1].y;
        let targetZ = planeLocations[currCam - 1].z + 10;

        let tl = gsap.timeline({
            onComplete: () => {
                canScroll = true;
            }
        });

        tl.to(camera.rotation, {
            x: 0.2,
            ease: "power3.inOut",
            duration: 1.5
        })
            .to(camera.position, {
                z: targetZ + 3.5,
                ease: "power3.inOut",
                duration: 2
            }, "-=1") // Zorg voor overlap tussen bewegingen
            .to(camera.rotation, {
                x: -1,
                ease: "power3.inOut",
                duration: 1.5
            }, "-=1")
            .to(camera.position, {
                y: targetY,
                ease: "power3.inOut",
                duration: 2
            }, "-=1.2")
            .to(camera.rotation, {
                x: 0,
                ease: "power3.inOut",
                duration: 1.5
            }, "-=1");
    }
}
// Image on plane
function createContrastImagePlane(imageUrl, width, height, contrast = 1.5) {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(imageUrl);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    const material = new THREE.ShaderMaterial({
        uniforms: {
            texture1: { value: texture },
            contrast: { value: contrast }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            uniform sampler2D texture1;
            uniform float contrast;

            void main() {
                vec4 color = texture2D(texture1, vUv);
                color.rgb = ((color.rgb - 0.5) * contrast) + 0.5; // Contrast aanpassen
                gl_FragColor = color;
            }
        `,
        transparent: true
    });

    const geometry = new THREE.PlaneGeometry(width, height);
    const imagePlane = new THREE.Mesh(geometry, material);
    return imagePlane;
}

// Video on plane
function createVideoPlane(videoUrl) {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.load();
    video.play();
    video.loop = true;

    const texture = new THREE.VideoTexture(video);
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    const geometry = new THREE.PlaneGeometry(16, 9); // Pas de grootte aan
    const videoPlane = new THREE.Mesh(geometry, material);

    return videoPlane;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    water.material.uniforms['time'].value += 1.0 / 60.0; // Animates the water

    renderer.render(scene, camera);
}

// Resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    camPosCalc();
}

// Initialize everything
init();
animate();
import * as THREE from '../../node_modules/three/src/Three.js';
import { gsap } from '../../node_modules/gsap/all.js';

let scene, camera, renderer;
let objects = []; // Array to hold our scrollable objects
let planesContent = [
    {
        plane: 1,
        layout: "basic", // Layout type
        title: "Hello world",
        description: "Welcome to my website :D",
        image: "example1.png"
    },
    {
        plane: 2,
        layout: "detailed", // Layout type
        title: "American declaration on the empire of Japan",
        description: "Japan has, therefore, undertaken a surprise offensive extending throughout the Pacific area. The facts of yesterday and today speak for themselves. The people of the United States have already formed their opinions and well understand the implications to the very life and safety of our Nation. As Commander in Chief of the Army and Navy I have directed that all measures be taken for our defense. But always will our whole Nation remember the character of the onslaught against us. No matter how long it may take us to overcome this premeditated invasion, the American people in their righteous might will win through to absolute victory.",
        image: "../../media/img/FDR.jpg",
        extraInfo: "~ Franklin D. Rooseveld"
    },
    {
        plane: 3,
        layout: "multipleImages", // Nieuwe lay-out met meerdere afbeeldingen
        title: "A Collection of Images",
        description: "Here are some images for you.",
        images: ["image1.jpg", "image2.jpg", "image3.jpg"] // Meerdere afbeeldingen
    },
    {
        plane: 4,
        layout: "video", // Nieuwe lay-out voor video
        title: "Watch This Video",
        description: "A fascinating video about history.",
        videoUrl: "video.mp4" // Video URL of pad naar lokaal bestand
    }
];

// Scroll variables
let scroll;
let newScroll;
let canScroll = true;
let camPosZ; // Z position variable of the camera
let currCam = 1; // Where the Camera currently is
// Initialize Three.js

// Set initial camera position
function camPosCalc() {

    if (window.innerWidth < 1000) {
        camPosZ = 15;
        console.log("Kleiner dan 1000, camPosZ is nu " + camPosZ);
    } else if (window.innerWidth >= 1000 && window.innerWidth < 1920) {
        camPosZ = 10;
        console.log("Groter dan 1000 en kleiner dan 1920, camPosZ is nu " + camPosZ);
    } else if (window.innerWidth == 1920 || window.innerWidth > 1920) {
        camPosZ = 5;
        console.log("Groter dan 1920, camPosZ is nu " + camPosZ);
    } else {
        console.error(camera.position.z + " Something went wrong. Your screen width of " + window.innerWidth + " Does not work properly with our site, please make your browser smaller or larger.");
    }
    camera.position.z = camPosZ;
}

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    camera.position.y = 0;

    camPosCalc();
    // Add planes with content from planesContent array
    planesContent.forEach((content, index) => {
        const plane = createTextPlane(content); // Pass content for each plane
        plane.position.y = index * -12.5; // Stagger planes vertically
        scene.add(plane);
        objects.push(plane);
    });

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('wheel', onScroll);

    console.log('Scene initialized');
}

// Create a plane with dynamic content and layout
function createTextPlane(content) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const geometry = new THREE.PlaneGeometry(16, 9);
    const textPlane = new THREE.Mesh(geometry, material);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    context.fillStyle = 'transparent';
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
    if (content.layout === "basic") {
        context.fillStyle = 'black';
        context.font = '64px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.fillText(content.title, canvas.width / 2, 185);

        context.font = '32px Arial';
        wrapText(context, content.description, canvas.width / 2, canvas.height / 2, 1200, 40);
    } else if (content.layout === "detailed") {
        // Gedetailleerde layout: Titel, beschrijving, afbeelding en extra informatie
        context.fillStyle = 'black';
        context.font = '64px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText(content.title, 75, 85);

        // Beschrijving
        context.font = '32px Arial';
        wrapText(context, content.description, 75, 180, 1000, 40);

        // Extra informatie
        wrapText(context, content.extraInfo, 75, canvas.height - 200, 1800, 40);
    } else if (content.layout === "multipleImages") {
        context.fillStyle = 'white';
        context.font = '64px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText(content.title, 75, 85);

        context.font = '32px Arial';
        wrapText(context, content.description, 75, 180, 1000, 40);

        // Voeg meerdere afbeeldingen toe
        content.images.forEach((image, index) => {
            const imagePlane = createImagePlane(image, 4, 3); // Afbeelding groot maken
            imagePlane.position.set(75 + (index * 5), 250, 0.1); // Elke afbeelding naar een andere plek verplaatsen
            textPlane.add(imagePlane); // Voeg toe aan de plane
        });
    } else if (content.layout === "video") {
        context.fillStyle = 'white';
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
        const imagePlane = createImagePlane(content.image, 4, 4.5); // Afbeeldingsgrootte aanpassen
        imagePlane.position.set(3.5, 0, 0.1); // Positie ten opzichte van de tekst
        textPlane.add(imagePlane); // Voeg afbeelding toe als kind van de tekstplane
    }
    return textPlane;
}



// Handle scrolling
function onScroll(scroll) {
    if (canScroll) {
        canScroll = false;
        newScroll = scroll.deltaY;

        if (newScroll > 0 && currCam < objects.length) {
            currCam++;
        } else if (newScroll < 0 && currCam > 1) {
            currCam--;
        } else {
            canScroll = true;
            return;
        }

        const targetY = -12.5 * (currCam - 1); // Target y-position
        gsap.timeline()
            .to(camera.position, { z: camPosZ + 10, duration: 0.5 }) // Move camera back
            .to(camera.position, { y: targetY, duration: 0.5 }) // Slide camera down
            .to(camera.position, { z: camPosZ, duration: 0.5 }) // Move camera forward
            .call(() => { canScroll = true; }); // Re-enable scrolling after animation

        console.log(`Camera moved to plane ${currCam}, new y: ${targetY}`);
    }
}
// Image on plane
function createImagePlane(imageUrl, width, height) {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(imageUrl);

    const material = new THREE.MeshBasicMaterial({ map: texture });
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

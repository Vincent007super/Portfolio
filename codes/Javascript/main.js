let scene, camera, renderer, planes = [];

function init() {
    scene = new THREE.Scene();
    scene.background = null;  // Maak de achtergrond van de scène doorzichtig

    camera = new THREE.PerspectiveCamera(
        100,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });  // Schakel alpha in bij het maken van de renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    camera.position.z = 60; // Verplaats de camera verder naar achteren

    for (let i = 0; i < textures.length; i++) {
        const geometry = new THREE.PlaneGeometry(16, 9);
        const texture = new THREE.TextureLoader().load(textures[i], function (texture) {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        });
        const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true, alphaTest: 0.1 });
        const plane = new THREE.Mesh(geometry, material);
        plane.position.set(0, 0, cardPoint[i] + (current * delta) + startZ); // Plaats de planes op de juiste afstand
        scene.add(plane);
        planes.push(plane);
    }

    // Create progress points
    const progressPointsContainer = document.querySelector('.progress-points');
    for (let i = 0; i < textures.length; i++) {
        const point = document.createElement('div');
        point.classList.add('progress-point');
        progressPointsContainer.appendChild(point);
    }

    window.addEventListener('resize', onWindowResize);
}

function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

function lerpColor(startColor, endColor, t) {
    const start = startColor.match(/\d+/g).map(Number);
    const end = endColor.match(/\d+/g).map(Number);
    const result = start.map((s, i) => i < 3 ? Math.round(lerp(s, end[i], t)) : lerp(s, end[i], t));
    return `rgba(${result[0]}, ${result[1]}, ${result[2]}, ${result[3]})`;
}

function updateBackground() {
    const cardIndex = Math.abs(current);
    const nextCardIndex = cardIndex + 1;
    const cardPointDistance = Math.abs(delta);
    const currentCardPosition = Math.abs(planes[cardIndex].position.z - (cardPoint[cardIndex] + startZ));
    const transitionProgress = currentCardPosition / cardPointDistance;

    const startColor = "rgba(33 173 218, 1)";
    const endColor = "rgba(20, 17, 40, 1)";
    const backgroundColor = lerpColor(startColor, endColor, Math.min(Math.max((cardIndex + transitionProgress) / (textures.length + 2), 0), 1));
    document.body.style.transition = 'background-color 0.5s ease';  // Voeg overgang toe
    document.body.style.backgroundColor = backgroundColor;
}

function updateProgressBar() {
    const points = document.querySelectorAll('.progress-point');
    points.forEach((point, index) => {
        if (index === -current) {
            point.classList.add('active');
        } else {
            point.classList.remove('active');
        }
    });
}

function updateScaleAndPosition() {
    planes.forEach((plane, index) => {
        let posZ = cardPoint[index] + (current * delta) + startZ;
        plane.position.z = lerp(plane.position.z, posZ, speed); //laatste waarde is animatie snelheid
    });

    camera.position.z = 60; // positie waar camera inlaad

    updateProgressBar();
    updateBackground();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    updateScaleAndPosition();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
animate();

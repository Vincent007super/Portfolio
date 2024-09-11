import * as THREE from '../../node_modules/three/build/three.module.js';
let fishGroup, fishGeometry, fishMaterial, fishTexture;
const numFish = 150;
const swimSpeed = 0.05;
const verticalRange = 50;
const depthRange = 10;

function initFishSchool(plane) {
    fishGroup = new THREE.Group();
    plane.add(fishGroup);

    const textureLoader = new THREE.TextureLoader();
    fishTexture = textureLoader.load('../../media/img/fish.svg');

    fishGeometry = new THREE.PlaneGeometry(2, 1);
    fishMaterial = new THREE.MeshBasicMaterial({ 
        map: fishTexture, 
        transparent: true, 
        side: THREE.DoubleSide 
    });

    for (let i = 0; i < numFish; i++) {
        const fish = new THREE.Mesh(fishGeometry, fishMaterial);
        resetFishPosition(fish);
        fishGroup.add(fish);
    }
}


function resetFishPosition(fish) {
    fish.position.set(
        -70 + Math.random() * 10, // Start from slightly off-screen left
        Math.random() * verticalRange - verticalRange / 2,
        Math.random() * depthRange - depthRange / 2
    );
    fish.userData.speed = swimSpeed + Math.random() * 0.02 - 0.01;
    fish.userData.verticalSpeed = 0;
    fish.userData.verticalDirection = Math.random() < 0.5 ? 1 : -1;
    fish.userData.changeDirectionTime = Math.random() * 5000 + 2000;
}


function animateFishSchool(time) {
    fishGroup.children.forEach((fish, index) => {
        // Horizontal movement
        fish.position.x += fish.userData.speed;

        // Vertical movement
        if (time % fish.userData.changeDirectionTime < 20) {
            fish.userData.verticalDirection *= -1;
            fish.userData.changeDirectionTime = Math.random() * 5000 + 2000;
        }

        fish.userData.verticalSpeed = lerp(
            fish.userData.verticalSpeed,
            fish.userData.verticalDirection * 0.02,
            0.02
        );

        fish.position.y += fish.userData.verticalSpeed;

        // Rotate fish based on movement direction
        const targetRotation = Math.atan2(fish.userData.verticalSpeed, fish.userData.speed);
        fish.rotation.z = lerp(fish.rotation.z, targetRotation, 0.1);

        // Flip fish vertically if moving downwards
        fish.scale.y = Math.sign(Math.cos(fish.rotation.z));

        // If fish swims off-screen to the right, reset its position
        if (fish.position.x > 70) {
            resetFishPosition(fish);
        }

        // Keep fish within vertical bounds
        if (fish.position.y > verticalRange / 2 || fish.position.y < -verticalRange / 2) {
            fish.userData.verticalDirection *= -1;
        }
    });
}

function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

// Export functions to be used in main.js
export { initFishSchool, animateFishSchool };

import * as THREE from '../../node_modules/three/build/three.module.js';
import { GLTFLoader } from '../../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
// import { FogExp2 } from '../../node_modules/three/src/scenes/FogExp2.js';

let submarineModel;
let submarineInitialZ = -50;  // Startpositie achter de plane
let submarineTargetZ = 30;  // Doelpositie wanneer de plane in beeld is
let moveSpeed = 0.05;         // Snelheid van de beweging op de Z-as
let isVisible = false;         // Houdt bij of de submarine zichtbaar is
let previousIsOnPlane = null;  // Variabele om vorige status bij te houden

function initSubmarine(plane, scene) {
    if (!scene) {
        console.error("Scene instance is undefined");
        return;
    }

    // Voeg mist toe aan de scene voor een "onderwater"-effect
    scene.fog = new THREE.FogExp2(0x001e0f, 0.02);  // Groenig watergevoel

    const loader = new GLTFLoader();
    loader.load(
        '../../media/models/submarine.glb',
        (gltf) => {
            submarineModel = gltf.scene;
            submarineModel.scale.set(0.5, 0.5, 0.5);
            submarineModel.position.set(0.5, 0, submarineInitialZ); // Submarine begint iets naar rechts
            submarineModel.rotation.set(0, Math.PI / 1, 0);  // Submarine loodrecht op de plane gericht

            // Zorg ervoor dat materialen goed zijn ingesteld
            submarineModel.traverse((child) => {
                if (child.isMesh) {
                    child.material.side = THREE.DoubleSide;
                    if (child.material.map) child.material.map.encoding = THREE.sRGBEncoding;

                    if (child.material.normalMap && child.geometry) {
                        const geometry = child.geometry;

                        if (geometry.attributes.normal && geometry.attributes.uv && !geometry.attributes.tangent) {
                            console.log(`Tangenten berekenen voor ${child.name || 'Naamloos mesh'}`);
                            geometry.computeTangents();
                        } else {
                            console.warn(`Tangenten overslaan voor ${child.name || 'Naamloos mesh'}: Ontbrekende attributen.`);
                        }
                    }
                }
            });

            submarineModel.visible = false; // Maak de submarine onzichtbaar bij het laden
            plane.add(submarineModel);
            console.log('Submarine geladen en toegevoegd aan de plane');
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% geladen');
        },
        (error) => {
            console.error('Er is een fout opgetreden bij het laden van de submarine', error);
        }
    );
}

function animateSubmarine(isOnPlane) {
    if (submarineModel) {
        // Subtiele zweefbeweging op de Y-as
        submarineModel.position.y = Math.sin(Date.now() * 0.001) * 0.1;

        // Bepaal de doelpositie op de Z-as
        const targetZ = isOnPlane ? submarineTargetZ : submarineInitialZ;

        // Interpoleer soepel tussen de huidige Z-positie en het doel met behulp van lerp
        submarineModel.position.z = THREE.MathUtils.lerp(submarineModel.position.z, targetZ, moveSpeed);

    }
}

function updateSubmarineOpacity(currentIndex) {
    console.log(currentIndex);
    if (currentIndex === 3) {
        submarineModel.visible = true;
        isVisible = true;
        console.log("submarine is zichtbaar");
    } else if (currentIndex !== 3) {
        submarineModel.visible = false;
        isVisible = false;
        console.log("submarine is ontzichtbaar");
    } else {
        console.log(currentIndex + " " + "is not a number")
    }
}

export { initSubmarine, animateSubmarine, updateSubmarineOpacity };

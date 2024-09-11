import * as THREE from '../../node_modules/three/build/three.module.js';
import { GLTFLoader } from '../../node_modules/';

let submarineModel;

function initSubmarine(plane) {
    const loader = new GLTFLoader();
    loader.load(
        '../../media/models/submarine.glb',
        (gltf) => {
            submarineModel = gltf.scene;
            submarineModel.scale.set(0.5, 0.5, 0.5);
            submarineModel.position.set(0, 0, -1);
            submarineModel.rotation.set(0, 10, 0);

            // Ensure proper material setup
            submarineModel.traverse((child) => {
                if (child.isMesh) {
                    child.material.side = THREE.DoubleSide;
                    if (child.material.map) child.material.map.encoding = THREE.sRGBEncoding;
            
                    // Check if normalMap exists and compute tangents conditionally
                    if (child.material.normalMap && child.geometry) {
                        const geometry = child.geometry;
            
                        // Ensure geometry has necessary attributes before computing tangents
                        if (geometry.attributes.normal && geometry.attributes.uv && !geometry.attributes.tangent) {
                            console.log(`Computing tangents for ${child.name || 'Unnamed mesh'}`);
                            geometry.computeTangents();
                        } else {
                            console.warn(`Skipping tangent computation for ${child.name || 'Unnamed mesh'}: Missing attributes.`);
                        }
                    }
                }
            });
            

            plane.add(submarineModel);
            console.log('Submarine loaded and added to plane');
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
            console.error('An error happened while loading the submarine', error);
        }
    );
}

function animateSubmarine() {
    if (submarineModel) {
        submarineModel.position.y = Math.sin(Date.now() * 0.001) * 0.1;
    }
}

export { initSubmarine, animateSubmarine };
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- Scene Setup ---
const canvas = document.querySelector('#three-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e); // Color cielo atardecer/oscuro
scene.fog = new THREE.Fog(0x1a1a2e, 20, 100);

// --- Camera Setup ---
const size = {
    width: window.innerWidth,
    height: window.innerHeight
};

const camera = new THREE.PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
camera.position.set(30, 15, 30); // Vista lateral/perspectiva como el boceto
scene.add(camera);

// --- Renderer Setup ---
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

// --- Controls ---
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffccaa, 1.5);
sunLight.position.set(-20, 20, 10);
sunLight.castShadow = true;
scene.add(sunLight);

// --- Materials ---
const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8 });
const darkStoneMaterial = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.9 });
const glowMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });

// --- 1. Plataforma Base ---
const platformGeo = new THREE.BoxGeometry(10, 1, 40);
const platform = new THREE.Mesh(platformGeo, stoneMaterial);
platform.position.set(0, 5, 0);
platform.receiveShadow = true;
scene.add(platform);

// --- 2. Pilares de Soporte ---
function createSupportPillar(x, z) {
    const pillarGeo = new THREE.CylinderGeometry(1.5, 2, 15, 8);
    const pillar = new THREE.Mesh(pillarGeo, stoneMaterial);
    pillar.position.set(x, -2.5, z); // Empieza desde abajo hasta la plataforma
    pillar.castShadow = true;
    scene.add(pillar);
}

createSupportPillar(0, -15);
createSupportPillar(0, 0);
createSupportPillar(0, 15);

// --- 3. La Puerta Detallada (sobre el extremo de la plataforma) ---
const doorGroup = new THREE.Group();
const doorY = 5.5; // Altura de la superficie de la plataforma
const doorZ = -18; // Posición al final

// Marcos principales (Columnas de la puerta)
const frameMaterial = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.6, metalness: 0.2 });

const columnL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 12, 1.2), frameMaterial);
columnL.position.set(-4, doorY + 6, doorZ);
columnL.castShadow = true;

const columnR = new THREE.Mesh(new THREE.BoxGeometry(1.2, 12, 1.2), frameMaterial);
columnR.position.set(4, doorY + 6, doorZ);
columnR.castShadow = true;

// Bases de las columnas
const baseL = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1, 1.8), frameMaterial);
baseL.position.set(-4, doorY + 0.5, doorZ);
const baseR = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1, 1.8), frameMaterial);
baseR.position.set(4, doorY + 0.5, doorZ);

// Arco Superior (Usando Torus para alineación intuitiva)
const archGeo = new THREE.TorusGeometry(4, 0.6, 16, 100, Math.PI);
const arch = new THREE.Mesh(archGeo, frameMaterial);
arch.position.set(0, doorY + 12, doorZ);
arch.rotation.x = 0; // Torus ya está en el plano XY
arch.rotation.y = 0;
arch.rotation.z = 0; // Ya es un arco de +X a -X

// Moldura superior
const archTrimGeo = new THREE.TorusGeometry(4.3, 0.2, 16, 100, Math.PI);
const archTrim = new THREE.Mesh(archTrimGeo, darkStoneMaterial);
archTrim.position.set(0, doorY + 12, doorZ + 0.1);

// El brillo de la puerta
const doorGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(6.8, 12),
    new THREE.MeshBasicMaterial({ color: 0xe0f7ff, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
);
doorGlow.position.set(0, doorY + 6, doorZ - 0.1);

// Adornos laterales (Solo los de arriba, pegados a la esquina superior)
function createEar(x, y, isRight = false) {
    const ear = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.5, 0.5), frameMaterial);
    ear.position.set(x, y, doorZ);
    ear.rotation.z = isRight ? -0.5 : 0.5;
    doorGroup.add(ear);
}
// Solo los superiores, ahora más arriba (cerca de la unión con el arco)
createEar(-4.5, doorY + 11.5);
createEar(4.5, doorY + 11.5, true);

doorGroup.add(columnL, columnR, baseL, baseR, arch, archTrim, doorGlow);
scene.add(doorGroup);

// --- 4. Camino Roto (Rocas flotantes en el otro extremo) ---
const fragmentsGroup = new THREE.Group();

function createFloatingRock(x, y, z, s) {
    const geo = new THREE.IcosahedronGeometry(s, 0);
    const rock = new THREE.Mesh(geo, darkStoneMaterial);
    rock.position.set(x, y, z);
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    fragmentsGroup.add(rock);
}

// Generar fragmentos cerca del final del camino (z > 20)
for(let i = 0; i < 15; i++) {
    createFloatingRock(
        (Math.random() - 0.5) * 10,
        5 + (Math.random() - 0.5) * 5,
        25 + Math.random() * 15,
        Math.random() * 1.5 + 0.5
    );
}
scene.add(fragmentsGroup);

// --- Resize Handler ---
window.addEventListener('resize', () => {
    size.width = window.innerWidth;
    size.height = window.innerHeight;
    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();
    renderer.setSize(size.width, size.height);
});

// --- Animation Loop ---
const animate = () => {
    controls.update();
    
    // Animación sutil de las rocas flotantes
    fragmentsGroup.children.forEach((rock, i) => {
        rock.position.y += Math.sin(Date.now() * 0.001 + i) * 0.01;
        rock.rotation.y += 0.005;
    });

    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
};

animate();

console.log('Paso 1: Puerta, Base y Camino Roto cargados');

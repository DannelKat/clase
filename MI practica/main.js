import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';


// --- Script Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initAboutModel();
});

// --- Particles Section (Hero Background) ---
function initParticles() {
    const section = document.querySelector('.hero-section');
    const canvas = document.querySelector('#particles-canvas');
    if (!section || !canvas) return;

    const startInit = () => {
        const width = section.offsetWidth;
        const height = section.offsetHeight;
        
        if (width === 0 || height === 0) {
            setTimeout(startInit, 100);
            return;
        }

        const pScene = new THREE.Scene();
        const pCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        const pRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        
        pRenderer.setSize(width, height);
        pRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const particlesGeometry = new THREE.BufferGeometry();
        const count = 4000;
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 15;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.12,
            color: 0xff3333,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        });

        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        pScene.add(particlesMesh);

        pCamera.position.z = 5;

        function pAnimate() {
            requestAnimationFrame(pAnimate);
            particlesMesh.rotation.y += 0.001;
            particlesMesh.rotation.x += 0.0005;
            pRenderer.render(pScene, pCamera);
        }

        window.addEventListener('resize', () => {
            const newWidth = section.offsetWidth;
            const newHeight = section.offsetHeight;
            pCamera.aspect = newWidth / newHeight;
            pCamera.updateProjectionMatrix();
            pRenderer.setSize(newWidth, newHeight);
        });

        pAnimate();
    };

    startInit();
    
}

/*
==========================================================================
                     GUÍA TÉCNICA PARA EL PARCIAL
            HTML, BOOTSTRAP, JS & THREE.JS (MULTIMEDIA)
==========================================================================

--------------------------------------------------------------------------
1. CONCEPTOS TEÓRICOS (Para preguntas abiertas o sustentación):
--------------------------------------------------------------------------
* WEBGL: API de JavaScript para renderizar gráficos 3D/2D dentro de un <canvas> 
  sin plugins. Three.js es la librería que facilita usar WebGL.
* RENDERER: El "motor" que dibuja la escena. Propiedades clave:
    - alpha: true -> Permite que el fondo del HTML sea visible tras el 3D.
    - antialias: true -> Suaviza los bordes de los objetos ("serruchado").
* ESCENA (Scene): Es el espacio 3D donde colocas objetos, luces y cámaras.
* MESH (Malla): La unión de una Geometría (forma) y un Material (apariencia).
* TRANSMISSION & ROUGHNESS: Propiedades de 'MeshPhysicalMaterial' para lograr
  el efecto Glassmorphism (cristal).

--------------------------------------------------------------------------
2. ESTRUCTURA DE BOOTSTRAP (Wireframe):
--------------------------------------------------------------------------
* .container: Centra el contenido y evita que toque los bordes.
* .row: Define una fila para el sistema de rejilla.
* .col-lg-6: Columna que ocupa la mitad (6 de 12) en pantallas grandes.
* .py-5 / .my-5: Utilidades de espaciado (Padding/Margin en eje Y - vertical).
* .sticky-top: Mantiene el Navbar fijo arriba al hacer scroll.

--------------------------------------------------------------------------
3. EFECTOS ADICIONALES (CÓDIGO PARA DESCOMENTAR Y USAR):
--------------------------------------------------------------------------

// --- EFECTO A: CARGAR MODELOS EXTERNOS (GLTF/GLB) ---
/*
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js';

function loadMyModel() {
    const loader = new GLTFLoader();
    loader.load('tu_archivo.glb', (gltf) => {
        const model = gltf.scene;
        model.scale.set(1.5, 1.5, 1.5); // Ajustar tamaño
        scene.add(model);
    });
}
*/

// --- EFECTO B: LLUVIA DE CUBOS (INSTANCED MESH - ALTO RENDIMIENTO) ---
/*
function initInstancedCubes() {
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const material = new THREE.MeshNormalMaterial();
    const mesh = new THREE.InstancedMesh(geometry, material, 1000);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < 1000; i++) {
        dummy.position.set((Math.random()-0.5)*20, (Math.random()-0.5)*20, (Math.random()-0.5)*20);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
    }
    scene.add(mesh);
}
*/

// --- EFECTO C: POST-PROCESAMIENTO BLOOM (BRILLO NEÓN) ---
/*
// Requiere imports de EffectComposer, RenderPass y UnrealBloomPass al inicio.
function setupBloom() {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight), 
        1.5, 0.4, 0.85
    );
    composer.addPass(bloomPass);
}
// NOTA: En animate() cambiar renderer.render por composer.render();
*/

// --- EFECTO D: INTERACCIÓN CON EL MOUSE (ROTACIÓN SUAVE) ---
/*
window.addEventListener('mousemove', (event) => {
    // Normalizar coordenadas del mouse de -1 a +1
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    if (crystal) {
        crystal.rotation.y = mouseX * 0.5;
        crystal.rotation.x = -mouseY * 0.5;
    }
});
*/

/* --------------------------------------------------------------------------
4. CHECKLIST DE ERRORES COMUNES (F12 EN NAVEGADOR):
--------------------------------------------------------------------------
* ¿El modelo se ve negro? -> Te falta agregar Luces (AmbientLight / PointLight).
* ¿El modelo no carga? -> Verifica que la ruta del archivo sea correcta.
* ¿El canvas es pequeño? -> Revisa que el contenedor (hero-box) tenga ancho/alto definido.
* ¿No funciona el import? -> Asegúrate que la etiqueta <script> sea type="module".

==========================================================================
 */

// main.js - Three.js Premium Scene
import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';

let scene, camera, renderer, crystal;
let particles;

function init() {
    const container = document.querySelector('.hero-box');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({ 
        canvas: document.querySelector('#three-canvas'),
        antialias: true,
        alpha: true 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x7000ff, 2);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const blueLight = new THREE.PointLight(0x00d4ff, 2);
    blueLight.position.set(-5, -5, 5);
    scene.add(blueLight);

    // Main Crystal Object
    const geometry = new THREE.IcosahedronGeometry(2, 0);
    const material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.9, // Glass effect
        thickness: 0.5,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
    });
    
    crystal = new THREE.Mesh(geometry, material);
    scene.add(crystal);

    // Background Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const count = 1500;
    const positions = new Float32Array(count * 3);

    for(let i = 0; i < count * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 30;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05,
        color: 0x7000ff,
        transparent: true,
        opacity: 0.8
    });

    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    camera.position.z = 8;

    animate();
}

function animate() {
    requestAnimationFrame(animate);

    if (crystal) {
        crystal.rotation.y += 0.005;
        crystal.rotation.x += 0.003;
        
        // Float effect
        crystal.position.y = Math.sin(Date.now() * 0.001) * 0.2;
    }

    if (particles) {
        particles.rotation.y += 0.001;
    }

    renderer.render(scene, camera);
}

// Mouse Interaction
window.addEventListener('mousemove', (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 2;
    const y = (event.clientY / window.innerHeight - 0.5) * 2;

    if (crystal) {
        crystal.rotation.x = y * 0.5;
        crystal.rotation.y = x * 0.5;
    }
});

// Resize
window.addEventListener('resize', () => {
    const container = document.querySelector('.hero-box');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

init();

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class SceneManager {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.z = options.cameraZ || 5;
        this.clock = new THREE.Clock();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    render(callback) {
        const animate = () => {
            requestAnimationFrame(animate);
            const delta = this.clock.getDelta();
            const elapsed = this.clock.getElapsedTime();
            if (callback) callback(delta, elapsed);
            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }
}

function initHero() {
    const hero = new SceneManager('canvas-hero');
    if (!hero.scene) return;

    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 15;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        color: 0xffffff,
        transparent: true,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    hero.scene.add(particlesMesh);

    const ringGeo = new THREE.TorusGeometry(2, 0.01, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    const rings = [];
    for (let i = 0; i < 8; i++) {
        const ring = new THREE.Mesh(ringGeo, ringMat.clone());
        ring.scale.set(1 + i * 0.8, 1 + i * 0.8, 1);
        hero.scene.add(ring);
        rings.push(ring);
    }

    hero.render((delta, elapsed) => {
        particlesMesh.rotation.y = elapsed * 0.05;
        particlesMesh.rotation.x = elapsed * 0.02;

        rings.forEach((ring, i) => {
            ring.scale.x += 0.02;
            ring.scale.y += 0.02;
            ring.material.opacity -= 0.003;
            if (ring.material.opacity <= 0) {
                ring.scale.set(1, 1, 1);
                ring.material.opacity = 0.5;
            }
        });
    });
}

function initAbout() {
    const about = new SceneManager('canvas-about', { cameraZ: 4 });
    if (!about.scene) return;

    const loader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();
    let radioModel;

    loader.load('assets/cathedral_radio.glb', (gltf) => {
        radioModel = gltf.scene;
        const box = new THREE.Box3().setFromObject(radioModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        radioModel.position.sub(center);
        radioModel.position.y = -0.8;

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.5 / maxDim;
        radioModel.scale.setScalar(scale);

        const lightIntensity = 50;
        const lightDist = 10;

        const lights = [
            { pos: [2, -1, 0] },
            { pos: [-2, -1, 0] },
            { pos: [0, -2, 2] },
            { pos: [0, -2, -2] }
        ];

        lights.forEach(l => {
            const pLight = new THREE.PointLight(0xff0000, lightIntensity, lightDist);
            pLight.position.set(...l.pos);
            about.scene.add(pLight);
        });

        about.scene.add(radioModel);
    });

    const light = new THREE.PointLight(0xffffff, 20);
    light.position.set(5, 5, 5);
    about.scene.add(light);
    about.scene.add(new THREE.AmbientLight(0xffffff, 1));

    about.render((delta, elapsed) => {
        if (radioModel) {
            radioModel.rotation.y = elapsed * 0.5;
        }
    });
}

function initBroadcast() {
    const broadcast = new SceneManager('canvas-broadcast', { cameraZ: 10 });
    if (!broadcast.scene) return;
}

function initContracts() {
    const contracts = new SceneManager('canvas-contracts', { cameraZ: 5 });
    if (!contracts.scene) return;

    const bars = [];
    const barCount = 80;
    const group = new THREE.Group();
    for (let i = 0; i < barCount; i++) {
        const h = Math.random() * 3 + 1;
        const geo = new THREE.BoxGeometry(0.3, h, 0.3);
        const mat = new THREE.MeshStandardMaterial({
            color: 0x8b0000,
            emissive: 0x8b0000,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.4
        });
        const bar = new THREE.Mesh(geo, mat);
        bar.position.x = (i - barCount / 2) * 0.4;
        bar.position.y = h / 2 - 4;
        group.add(bar);
        bars.push(bar);
    }
    contracts.scene.add(group);
    contracts.scene.add(new THREE.AmbientLight(0xffffff, 0.8));

    contracts.render((delta, elapsed) => {
        bars.forEach((bar, i) => {
            const noise = Math.sin(elapsed * 2 + i * 0.2) * 1.5;
            bar.scale.y = 1 + noise * 0.3;
            bar.position.y = (bar.geometry.parameters.height * bar.scale.y) / 2 - 4;
            bar.material.emissiveIntensity = 0.5 + Math.sin(elapsed * 4 + i) * 0.5;
        });
    });

    const signButton = document.querySelector('#contracts .cta-button');
    if (signButton) {
        signButton.addEventListener('click', () => {
            alert('¡Trato hecho! Tu alma ahora pertenece al Demonio de la Radio.');
            signButton.innerHTML = 'ALMA VENDIDA';
            signButton.style.borderColor = '#ffffff';
            signButton.disabled = true;
        });
    }
}

function initLenis() {
    const lenis = new Lenis({
        lerp: 0.05,
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 1.5,
        infinite: false,
    })

    function raf(time) {
        lenis.raf(time)
        requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)
}

function initMenuVisibility() {
    const navbar = document.getElementById('navbar');
    const sideMenu = document.querySelector('.side-menu');
    const hazbinLogo = document.querySelector('.hazbin-logo');
    const divider = document.querySelector('.hazbin-divider');

    if (!divider) return;

    window.addEventListener('scroll', () => {
        const dividerRect = divider.getBoundingClientRect();

        if (dividerRect.top < 150) {
            if (navbar) {
                navbar.style.opacity = '0';
                navbar.style.pointerEvents = 'none';
            }
            if (sideMenu) {
                sideMenu.style.opacity = '0';
                sideMenu.style.pointerEvents = 'none';
            }
            if (hazbinLogo) {
                hazbinLogo.style.opacity = '0';
                hazbinLogo.style.pointerEvents = 'none';
            }
        } else {
            if (navbar) {
                navbar.style.opacity = '1';
                navbar.style.pointerEvents = 'all';
            }
            if (sideMenu) {
                sideMenu.style.opacity = '1';
                sideMenu.style.pointerEvents = 'all';
            }
            if (hazbinLogo) {
                hazbinLogo.style.opacity = '0.6';
                hazbinLogo.style.pointerEvents = 'all';
            }
        }
    });
}

function initProductDrag() {
    const slider = document.querySelector('.product-slider');
    let isDown = false;
    let startX;
    let scrollLeft;

    if (!slider) return;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.classList.add('active');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.classList.remove('active');
    });
    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('active');
    });
    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2;
        slider.scrollLeft = scrollLeft - walk;
    });
}

window.addEventListener('DOMContentLoaded', () => {
    initHero();
    initAbout();
    initBroadcast();
    initContracts();
    initLenis();
    initMenuVisibility();
    initProductDrag();
});

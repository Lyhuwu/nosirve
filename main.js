import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// --- VARIABLES DE CONTROL ---
let gameStarted = false;
let targetZ = 55; 
let autoRotateTimer = null; 
let isDragging = false;
let startX = 0;
let startY = 0;

// --- 1. LÓGICA DE INTERFAZ ---
const startBtn = document.getElementById('start-btn');
const overlay = document.getElementById('intro-overlay');
if (startBtn && overlay) {
    startBtn.addEventListener('click', () => {
        overlay.classList.add('rolling-up');
        setTimeout(() => {
             overlay.classList.add('fade-out');
             gameStarted = true;
        }, 1200);
    });
}

// --- 2. ESCENA 3D ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
camera.position.z = 100;

// --- ILUMINACIÓN ---
const ambientLight = new THREE.AmbientLight(0x404040, 2); 
scene.add(ambientLight);
const sunLight = new THREE.DirectionalLight(0xffffff, 3);
sunLight.position.set(50, 30, 50);
scene.add(sunLight);

// --- EFECTO BLOOM ---
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.1;
bloomPass.strength = 1.8;
composer.addPass(bloomPass);

// --- FONDO DE ESTRELLAS ---
const starCoords = [];
for(let i=0; i<4000; i++) {
    starCoords.push(THREE.MathUtils.randFloatSpread(350), THREE.MathUtils.randFloatSpread(350), THREE.MathUtils.randFloatSpread(350));
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
const backgroundStars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xa0c4ff, size: 0.09 }));
scene.add(backgroundStars);

// --- MINI UNIVERSOS (PLANETAS AMBIENTALES) ---
const ambientPlanets = []; 

function createIcyPlanet(size, x, y, z) {
    const geo = new THREE.SphereGeometry(size, 32, 32);
    const mat = new THREE.MeshStandardMaterial({ color: 0xa0e0ff, roughness: 0.2, metalness: 0.8 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    ambientPlanets.push(mesh);
}

function createRingedPlanet(size, x, y, z) {
    const planetGroup = new THREE.Group();
    const sphereGeo = new THREE.SphereGeometry(size, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({ color: 0x4682b4, roughness: 0.7, flatShading: true });
    const planet = new THREE.Mesh(sphereGeo, sphereMat);
    planetGroup.add(planet);
    const ringGeo = new THREE.RingGeometry(size * 1.4, size * 2, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x87cefa, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    planetGroup.add(ring);
    planetGroup.position.set(x, y, z);
    planetGroup.rotation.x = 0.5;
    planetGroup.rotation.z = 0.2;
    scene.add(planetGroup);
    ambientPlanets.push(planetGroup);
}

createRingedPlanet(6, 40, 25, -30);
createIcyPlanet(4, -50, -20, -10);
createIcyPlanet(2, -30, 40, 20);
createIcyPlanet(3, 60, -40, 0);

// --- CONSTELACIÓN SOFI ---
const sofPoints = [
    // S
    { pos: [-16, 6, 0], text: "El inicio de nuestra historia ❤️", img: "fotos/foto1.jpg", link: "" },
    { pos: [-19, 3, 0], text: "Esta canción me recuerda a ti", img: "", link: "https://spotify.com" },
    { pos: [-16, 0, 0], text: "Cada momento es especial", img: "fotos/foto2.jpg", link: "" },
    { pos: [-13, -3, 0], text: "Tu sonrisa es mi motor", img: "", link: "" },
    { pos: [-16, -6, 0], text: "S de Siempre", img: "", link: "" },
    // O
    { pos: [-8, 4, 0], text: "Tus ojos son galaxias", img: "", link: "" },
    { pos: [-3, 4, 0], text: "Nuestra canción favorita", img: "", link: "https://youtube.com" },
    { pos: [-3, -4, 0], text: "Un recuerdo inolvidable", img: "fotos/foto3.jpg", link: "" },
    { pos: [-8, -4, 0], text: "Tú y yo, por siempre", img: "", link: "" },
    { pos: [-8, 4, 0], text: "" },
    // F
    { pos: [2, 6, 0], text: "Felicidad es estar contigo", img: "", link: "" },
    { pos: [2, -6, 0], text: "Favorito recuerdo", img: "fotos/foto4.jpg", link: "" },
    { pos: [2, 0, 0], text: "Nuestra playlist", img: "", link: "https://spotify.com" },
    { pos: [7, 0, 0], text: "Fue el destino", img: "", link: "" },
    // I
    { pos: [12, 4, 0], text: "Increíble Sofi", img: "", link: "" },
    { pos: [12, -6, 0], text: "Inolvidable", img: "", link: "" },
    { pos: [12, 7, 0], text: "Tú eres mi estrella más brillante", img: "", link: "" }
];

const visualObjects = []; // Aquí guardamos las esferas visibles para animarlas
const hitObjects = [];    // Aquí guardamos las esferas invisibles para detectarlas

const lineMat = new THREE.LineBasicMaterial({ color: 0x87cefa, transparent: true, opacity: 0.3 });
const starBaseMaterial = new THREE.MeshBasicMaterial({ color: 0xe0ffff });
// Material invisible para el hitbox
const hitMaterial = new THREE.MeshBasicMaterial({ visible: false }); 

for (let i = 0; i < sofPoints.length; i++) {
    const p = sofPoints[i];
    if (p.text !== "") {
        // 1. ESFERA VISUAL (Pequeña y bonita: 0.6)
        const visualMesh = new THREE.Mesh(new THREE.SphereGeometry(0.6, 24, 24), starBaseMaterial.clone());
        visualMesh.position.set(...p.pos);
        scene.add(visualMesh);
        visualObjects.push(visualMesh);

        // 2. ESFERA FANTASMA (Grande e invisible: 2.5) -> Esta recibe el clic
        const hitMesh = new THREE.Mesh(new THREE.SphereGeometry(2.5, 16, 16), hitMaterial);
        hitMesh.position.set(...p.pos);
        // Guardamos los datos en la esfera fantasma
        hitMesh.userData = { text: p.text, img: p.img, link: p.link }; 
        scene.add(hitMesh);
        hitObjects.push(hitMesh);
    }
    const saltos = [4, 9, 13]; 
    if (i < sofPoints.length - 1 && !saltos.includes(i)) {
        const lGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...p.pos), new THREE.Vector3(...sofPoints[i+1].pos)]);
        scene.add(new THREE.Line(lGeo, lineMat));
    }
}

// --- CONTROLES ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.autoRotate = false;
controls.autoRotateSpeed = 0.8; 

// --- INTERACCIÓN ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('pointerdown', (e) => {
    if (!gameStarted) return;
    controls.autoRotate = false;
    if (autoRotateTimer) clearTimeout(autoRotateTimer);
    isDragging = false;
    startX = e.clientX;
    startY = e.clientY;
});

window.addEventListener('pointermove', (e) => {
    if (!gameStarted) return;
    if (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5) {
        isDragging = true;
    }
});

window.addEventListener('pointerup', (e) => {
    if (!gameStarted) return;
    if (autoRotateTimer) clearTimeout(autoRotateTimer);
    autoRotateTimer = setTimeout(() => { controls.autoRotate = true; }, 3000);
    if (isDragging) return;

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    
    // IMPORTANTE: El raycaster ahora busca en hitObjects (las esferas grandes invisibles)
    const intersects = raycaster.intersectObjects(hitObjects);

    if (intersects.length > 0) {
        const data = intersects[0].object.userData;
        document.getElementById('memory-text').innerText = data.text;
        const imgEl = document.getElementById('memory-img');
        const linkEl = document.getElementById('memory-link');
        if(data.img) { imgEl.src = data.img; imgEl.classList.remove('hidden'); } else { imgEl.classList.add('hidden'); }
        if(data.link) { linkEl.href = data.link; linkEl.classList.remove('hidden'); } else { linkEl.classList.add('hidden'); }
        document.getElementById('memory-modal').classList.remove('hidden');
    }
});

document.getElementById('close-modal').onclick = () => {
    document.getElementById('memory-modal').classList.add('hidden');
};

// --- ANIMACIÓN ---
function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    if (gameStarted) {
        camera.position.z += (targetZ - camera.position.z) * 0.02;
        if (!controls.autoRotate && Math.abs(camera.position.z - targetZ) < 0.5 && !autoRotateTimer) {
             if (!isDragging) controls.autoRotate = true;
        }
    }

    backgroundStars.rotation.y += 0.0001;

    ambientPlanets.forEach((planet, i) => {
        planet.rotation.y += 0.002 * (i % 2 === 0 ? 1 : -1);
    });

    // Animamos las esferas visuales (las pequeñas)
    visualObjects.forEach((obj, i) => {
        obj.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.1);
        const hue = 0.55 + Math.sin(time * 0.5 + i) * 0.05; 
        obj.material.color.setHSL(hue, 0.7, 0.8);
    });

    controls.update();
    composer.render();
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

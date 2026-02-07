import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// --- VARIABLES DE CONTROL ---
let gameStarted = false;
let targetZ = 55; // Posición final de la cámara (Zoom In)

// --- 1. LÓGICA DE INTERFAZ (BOTÓN Y PERGAMINO) ---
const startBtn = document.getElementById('start-btn');
const overlay = document.getElementById('intro-overlay');

if (startBtn && overlay) {
    startBtn.addEventListener('click', () => {
        // 1. Activar animación CSS para enrollar el pergamino
        overlay.classList.add('rolling-up');

        // 2. Esperar 1.2s (lo que dura la animación) y luego desvanecer el fondo negro
        setTimeout(() => {
             overlay.classList.add('fade-out');
             // 3. Iniciar el "viaje espacial" de la cámara
             gameStarted = true;
        }, 1200);
    });
} else {
    console.error("Error crítico: No se encontró el botón de inicio.");
}

// --- 2. ESCENA 3D ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// CORRECCIÓN: Variable 'const' añadida correctamente
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// POSICIÓN INICIAL DE CÁMARA (Lejana, para el efecto de viaje)
camera.position.z = 100;

// --- EFECTO BLOOM (RESPLANDOR AZULADO) ---
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.1;
bloomPass.strength = 2.0; // Intensidad del brillo
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

// --- CONSTELACIÓN SOFI (CONFIGURACIÓN) ---
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

const memoryObjects = [];
// Líneas azul cielo transparentes
const lineMat = new THREE.LineBasicMaterial({ color: 0x87cefa, transparent: true, opacity: 0.3 });
// Estrellas base blanco hielo
const starBaseMaterial = new THREE.MeshBasicMaterial({ color: 0xe0ffff });

// GENERACIÓN DE OBJETOS 3D
for (let i = 0; i < sofPoints.length; i++) {
    const p = sofPoints[i];
    if (p.text !== "") {
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.75, 24, 24), starBaseMaterial.clone());
        mesh.position.set(...p.pos);
        mesh.userData = { text: p.text, img: p.img, link: p.link };
        scene.add(mesh);
        memoryObjects.push(mesh);
    }
    const saltos = [4, 9, 13]; 
    if (i < sofPoints.length - 1 && !saltos.includes(i)) {
        const lGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...p.pos), new THREE.Vector3(...sofPoints[i+1].pos)]);
        scene.add(new THREE.Line(lGeo, lineMat));
    }
}

// --- CLICS E INTERACCIÓN ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (e) => {
    // Solo permitir clics si la intro ya desapareció (gameStarted es true)
    if(gameStarted) {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(memoryObjects);
        
        if (intersects.length > 0) {
            const data = intersects[0].object.userData;
            document.getElementById('memory-text').innerText = data.text;
            const imgEl = document.getElementById('memory-img');
            const linkEl = document.getElementById('memory-link');
            
            // Lógica para mostrar/ocultar elementos
            if(data.img) { imgEl.src = data.img; imgEl.classList.remove('hidden'); } else { imgEl.classList.add('hidden'); }
            if(data.link) { linkEl.href = data.link; linkEl.classList.remove('hidden'); } else { linkEl.classList.add('hidden'); }
            
            document.getElementById('memory-modal').classList.remove('hidden');
        }
    }
});

document.getElementById('close-modal').onclick = () => document.getElementById('memory-modal').classList.add('hidden');

// --- ANIMACIÓN PRINCIPAL ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = false; // Empieza quieto
controls.autoRotateSpeed = 0.5;

function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    // 1. EFECTO VIAJE (Zoom In)
    if (gameStarted) {
        // Movemos la cámara suavemente hacia el objetivo (55)
        camera.position.z += (targetZ - camera.position.z) * 0.02;
        
        // Si la cámara ya está cerca, activar rotación automática
        if (Math.abs(camera.position.z - targetZ) < 0.5) {
            controls.autoRotate = true;
        }
    }

    backgroundStars.rotation.y += 0.0002;

    // Latido y colores de las estrellas de Sofi
    memoryObjects.forEach((obj, i) => {
        obj.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.1);
        // Oscilar colores suavemente (tonos azules)
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

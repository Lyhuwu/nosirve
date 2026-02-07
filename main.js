import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// --- ESCENA ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 40;

// --- RESPLANDOR (BLOOM) ---
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.strength = 1.8; // Qué tanto brillan las estrellas
composer.addPass(bloomPass);

// --- FONDO DE ESTRELLAS ---
const starCoords = [];
for(let i=0; i<5000; i++) {
    starCoords.push(THREE.MathUtils.randFloatSpread(300), THREE.MathUtils.randFloatSpread(300), THREE.MathUtils.randFloatSpread(300));
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.07 })));

// --- DATOS DE LA CONSTELACIÓN SOFI ---
// Rellena aquí tus fotos (img) y links de canciones
const sofPoints = [
    // S
    { pos: [-16, 6, 0], text: "El inicio de todo ❤️", img: "", link: "" },
    { pos: [-19, 3, 0], text: "Nuestra canción especial", img: "", link: "https://open.spotify.com/track/TU_LINK" },
    { pos: [-16, 0, 0], text: "Siempre juntos", img: "", link: "" },
    { pos: [-13, -3, 0], text: "Eres mi persona favorita", img: "", link: "" },
    { pos: [-16, -6, 0], text: "S de Sofi", img: "", link: "" },
    // O
    { pos: [-8, 4, 0], text: "Ojos que me encantan", img: "", link: "" },
    { pos: [-3, 4, 0], text: "Un momento inolvidable", img: "", link: "" },
    { pos: [-3, -4, 0], text: "Escucha esto...", img: "", link: "https://youtube.com/watch?v=TU_LINK" },
    { pos: [-8, -4, 0], text: "Te amo infinito", img: "", link: "" },
    { pos: [-8, 4, 0], text: "" }, // Cierre de la O
    // F
    { pos: [2, 6, 0], text: "Felicidad pura contigo", img: "", link: "" },
    { pos: [2, -6, 0], text: "Favorito recuerdo", img: "", link: "" },
    { pos: [2, 0, 0], text: "Nuestra playlist", img: "", link: "https://open.spotify.com/playlist/TU_LINK" },
    { pos: [7, 0, 0], text: "Fue el destino", img: "", link: "" },
    // I
    { pos: [12, 4, 0], text: "Increíble Sofi", img: "", link: "" },
    { pos: [12, -6, 0], text: "Inolvidable", img: "", link: "" },
    { pos: [12, 7, 0], text: "Tú eres mi estrella", img: "", link: "" }
];

const memoryObjects = [];
const lineMat = new THREE.LineBasicMaterial({ color: 0xff69b4, transparent: true, opacity: 0.4 });

for (let i = 0; i < sofPoints.length; i++) {
    const p = sofPoints[i];
    if (p.text !== "") {
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.75, 24, 24), new THREE.MeshBasicMaterial({ color: 0xff1493 }));
        mesh.position.set(...p.pos);
        mesh.userData = { text: p.text, img: p.img, link: p.link };
        scene.add(mesh);
        memoryObjects.push(mesh);
    }
    // Lógica para no conectar letras entre sí
    const saltos = [4, 9, 13]; 
    if (i < sofPoints.length - 1 && !saltos.includes(i)) {
        const lGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...p.pos), new THREE.Vector3(...sofPoints[i+1].pos)]);
        scene.add(new THREE.Line(lGeo, lineMat));
    }
}

// --- INTERACCIÓN ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(memoryObjects);

    if (intersects.length > 0) {
        const data = intersects[0].object.userData;
        const imgEl = document.getElementById('memory-img');
        const linkEl = document.getElementById('memory-link');
        
        document.getElementById('memory-text').innerText = data.text;
        
        // Manejo de imagen
        if(data.img) { imgEl.src = data.img; imgEl.classList.remove('hidden'); } 
        else { imgEl.classList.add('hidden'); }
        
        // Manejo de link de música
        if(data.link) { linkEl.href = data.link; linkEl.classList.remove('hidden'); } 
        else { linkEl.classList.add('hidden'); }
        
        document.getElementById('memory-modal').classList.remove('hidden');
    }
});

document.getElementById('close-modal').onclick = () => document.getElementById('memory-modal').classList.add('hidden');

// --- ANIMACIÓN ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.002;
    memoryObjects.forEach(obj => {
        obj.scale.setScalar(1 + Math.sin(time) * 0.15); // Estrellas que "laten"
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

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// --- CONFIGURACIÓN BÁSICA ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0, 0, 35);

// --- EFECTO DE BRILLO (BLOOM) ---
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.15;
bloomPass.strength = 1.6; 
composer.addPass(bloomPass);

// --- ESTRELLAS DE FONDO ---
const starCoords = [];
for(let i=0; i<4000; i++) {
    starCoords.push(THREE.MathUtils.randFloatSpread(250), THREE.MathUtils.randFloatSpread(250), THREE.MathUtils.randFloatSpread(250));
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.08 });
scene.add(new THREE.Points(starGeo, starMat));

// --- CONSTELACIÓN "SOFI" ---
const sofPoints = [
    // S
    { pos: [-16, 6, 0], text: "S - Eres mi sueño hecho realidad." },
    { pos: [-19, 3, 0], text: "S - Siempre estaré para ti." },
    { pos: [-16, 0, 0], text: "S - Sonreír es mejor si es contigo." },
    { pos: [-13, -3, 0], text: "S - Solo tú sabes cómo hacerme feliz." },
    { pos: [-16, -6, 0], text: "S - Si te tengo a ti, lo tengo todo." },
    // O
    { pos: [-8, 4, 0], text: "O - Oh, qué suerte tuve de encontrarte." },
    { pos: [-3, 4, 0], text: "O - Oro es poco comparado con nuestro amor." },
    { pos: [-3, -4, 0], text: "O - Onrepeat mis pensamientos sobre ti." },
    { pos: [-8, -4, 0], text: "O - Ojalá nuestra historia nunca termine." },
    { pos: [-8, 4, 0], text: "" }, // Cierre
    // F
    { pos: [2, 6, 0], text: "F - Fuiste, eres y serás mi todo." },
    { pos: [2, -6, 0], text: "F - Felicidad rima con nosotros." },
    { pos: [2, 0, 0], text: "F - Favoritos son nuestros momentos." },
    { pos: [7, 0, 0], text: "F - Fue el destino quien nos unió." },
    // I
    { pos: [12, 4, 0], text: "I - Increíble es lo que siento por ti." },
    { pos: [12, -6, 0], text: "I - Infinito es el tiempo que quiero estar contigo." },
    { pos: [12, 7, 0], text: "I - Tú eres mi estrella más brillante." }
];

const memoryObjects = [];
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff69b4, transparent: true, opacity: 0.5 });

for (let i = 0; i < sofPoints.length; i++) {
    const p = sofPoints[i];
    if (p.text !== "") {
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.7, 24, 24), new THREE.MeshBasicMaterial({ color: 0xff1493 }));
        mesh.position.set(...p.pos);
        mesh.userData = { text: p.text };
        scene.add(mesh);
        memoryObjects.push(mesh);
    }
    const saltos = [4, 9, 13]; 
    if (i < sofPoints.length - 1 && !saltos.includes(i)) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...p.pos), new THREE.Vector3(...sofPoints[i+1].pos)]);
        scene.add(new THREE.Line(lineGeo, lineMaterial));
    }
}

// --- INTERACCIÓN Y CONTROLES ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

window.addEventListener('click', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(memoryObjects);
    if (intersects.length > 0) {
        document.getElementById('memory-text').innerText = intersects[0].object.userData.text;
        document.getElementById('memory-modal').classList.remove('hidden');
    }
});

document.getElementById('close-modal').onclick = () => document.getElementById('memory-modal').classList.add('hidden');

function animate() {
    requestAnimationFrame(animate);
    memoryObjects.forEach(obj => obj.scale.setScalar(1 + Math.sin(Date.now() * 0.002) * 0.15));
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

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const scene = new THREE.Scene();
// Ajusté la cámara un poco más lejos para que quepa mejor en móvil
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 55;

// --- BLOOM (Resplandor Azulado) ---
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
// Ajusté el umbral para que el brillo azul se note más
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.1;
bloomPass.strength = 2.0;
composer.addPass(bloomPass);

// --- FONDO ESTRELLAS ---
const starCoords = [];
for(let i=0; i<4000; i++) {
    starCoords.push(THREE.MathUtils.randFloatSpread(350), THREE.MathUtils.randFloatSpread(350), THREE.MathUtils.randFloatSpread(350));
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
// Estrellas de fondo blancas/azuladas
const backgroundStars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xa0c4ff, size: 0.09 }));
scene.add(backgroundStars);

// --- CONSTELACIÓN SOFI (Colores Nuevos) ---
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
// Material de línea: Azul cielo claro (#87cefa) y transparente
const lineMat = new THREE.LineBasicMaterial({ color: 0x87cefa, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending });

// Material base de estrella: Blanco azulado (#e0ffff)
const starBaseMaterial = new THREE.MeshBasicMaterial({ color: 0xe0ffff });

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
        document.getElementById('memory-text').innerText = data.text;
        const imgEl = document.getElementById('memory-img');
        if(data.img) { imgEl.src = data.img; imgEl.classList.remove('hidden'); } else { imgEl.classList.add('hidden'); }
        const linkEl = document.getElementById('memory-link');
        if(data.link) { linkEl.href = data.link; linkEl.classList.remove('hidden'); } else { linkEl.classList.add('hidden'); }
        document.getElementById('memory-modal').classList.remove('hidden');
    }
});

document.getElementById('close-modal').onclick = () => document.getElementById('memory-modal').classList.add('hidden');
document.getElementById('start-btn').onclick = () => document.getElementById('intro-overlay').classList.add('fade-out');

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true; // Añadí rotación automática suave
controls.autoRotateSpeed = 0.5;

function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;
    backgroundStars.rotation.y += 0.0002;

    memoryObjects.forEach((obj, i) => {
        // Latido suave
        obj.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.1);
        // Cambio de color suave entre azules y blancos
        // HSL: Hue (tono azul ~0.6), Saturation (baja para que sea suave), Lightness (alta para brillo)
        const hue = 0.55 + Math.sin(time * 0.5 + i) * 0.05; // Oscila en tonos azules
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

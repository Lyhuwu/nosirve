import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// 1. ESCENA
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0, 0, 40);

// 2. EFECTO DE BRILLO (BLOOM)
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.1;
bloomPass.strength = 1.8; 
composer.addPass(bloomPass);

// 3. ESTRELLAS DE FONDO
const starCoords = [];
for(let i=0; i<3000; i++) {
    const x = THREE.MathUtils.randFloatSpread(200);
    const y = THREE.MathUtils.randFloatSpread(200);
    const z = THREE.MathUtils.randFloatSpread(200);
    starCoords.push(x, y, z);
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
scene.add(new THREE.Points(starGeo, starMat));

// 4. CONSTELACIÓN "SOFI" CON LÁSERES
const sofPoints = [
    { pos: [-15, 5, 0], text: "El inicio de nuestra historia ❤️" },
    { pos: [-12, -2, 0], text: "Tu sonrisa ilumina mi mundo." },
    { pos: [-5, 5, 0], text: "Eres mi deseo cumplido." },
    { pos: [-5, -2, 0], text: "Sofi, mi lugar seguro." },
    { pos: [2, 5, 0], text: "Por mil galaxias más juntos." },
    { pos: [9, 5, 0], text: "Te amo más allá de las estrellas." }
];

const memoryObjects = [];
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff69b4, transparent: true, opacity: 0.5 });

sofPoints.forEach((p, i) => {
    // Estrella interactiva
    const geo = new THREE.SphereGeometry(0.7, 32, 32);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff1493 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...p.pos);
    mesh.userData = { text: p.text };
    scene.add(mesh);
    memoryObjects.push(mesh);

    // Conectar con la siguiente estrella (Láser)
    if (i < sofPoints.length - 1) {
        const points = [new THREE.Vector3(...p.pos), new THREE.Vector3(...sofPoints[i+1].pos)];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeo, lineMaterial);
        scene.add(line);
    }
});

// 5. INTERACCIÓN
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

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

// 6. ANIMACIÓN Y CONTROLES
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.002;
    
    // Hacer que las estrellas de Sofi pulsen
    memoryObjects.forEach(obj => {
        obj.scale.setScalar(1 + Math.sin(time) * 0.2);
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

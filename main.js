import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// --- VARIABLES DE CONTROL ---
let gameStarted = false;
let targetZ = 55; 
let autoRotateTimer = null; // Para reiniciar el giro automático
let isDragging = false; // Para distinguir clic de arrastre
let startX = 0;
let startY = 0;

// --- 1. LÓGICA DE INTERFAZ (BOTÓN DE INICIO) ---
const startBtn = document.getElementById('start-btn');
const overlay = document.getElementById('intro-overlay');

if (startBtn && overlay) {
    startBtn.addEventListener('click', () => {
        // Animación de salida del pergamino
        overlay.classList.add('rolling-up');
        // Esperar a que termine la animación visual
        setTimeout(() => {
             overlay.classList.add('fade-out');
             gameStarted = true; // ¡Comienza el viaje!
        }, 1200);
    });
}

// --- 2. ESCENA 3D ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg'), antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimización para móviles
camera.position.z = 100; // Posición inicial lejana

// --- EFECTO BLOOM (RESPLANDOR) ---
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.1;
bloomPass.strength = 1.8; // Intensidad del brillo
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

// --- CONSTELACIÓN SOFI (DATOS) ---
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
// Material base de estrella
const starBaseMaterial = new THREE.MeshBasicMaterial({ color: 0xe0ffff });

// CREACIÓN DE OBJETOS 3D
for (let i = 0; i < sofPoints.length; i++) {
    const p = sofPoints[i];
    if (p.text !== "") {
        // Aumentamos el tamaño de la esfera (1.1) para que sea fácil tocarla en móvil
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(1.1, 24, 24), starBaseMaterial.clone());
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

// --- CONTROLES DE CÁMARA ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false; // Deshabilitar paneo para no perder el centro
controls.autoRotate = false; // Empieza quieto
controls.autoRotateSpeed = 0.8; 

// --- GESTIÓN DE INTERACCIÓN TÁCTIL (TOUCH) ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// 1. AL TOCAR LA PANTALLA (Pointer Down)
window.addEventListener('pointerdown', (e) => {
    if (!gameStarted) return;
    
    // Detener rotación automática inmediatamente
    controls.autoRotate = false;
    if (autoRotateTimer) clearTimeout(autoRotateTimer);

    // Guardar posición inicial para detectar si es clic o arrastre
    isDragging = false;
    startX = e.clientX;
    startY = e.clientY;
});

// 2. AL MOVER EL DEDO (Pointer Move)
window.addEventListener('pointermove', (e) => {
    if (!gameStarted) return;
    
    // Si se mueve más de 5 pixeles, es un arrastre (no un clic)
    if (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5) {
        isDragging = true;
    }
});

// 3. AL LEVANTAR EL DEDO (Pointer Up) - AQUÍ OCURRE EL CLIC
window.addEventListener('pointerup', (e) => {
    if (!gameStarted) return;

    // Reiniciar rotación automática después de 3 segundos de inactividad
    if (autoRotateTimer) clearTimeout(autoRotateTimer);
    autoRotateTimer = setTimeout(() => {
        controls.autoRotate = true;
    }, 3000);

    // Si fue un arrastre, no hacemos nada más (solo rotamos cámara)
    if (isDragging) return;

    // SI FUE UN TOQUE LIMPIO (CLIC), BUSCAMOS ESTRELLAS
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(memoryObjects);

    if (intersects.length > 0) {
        // ¡ESTRELLA TOCADA!
        const data = intersects[0].object.userData;
        
        // Llenar el modal con la info
        document.getElementById('memory-text').innerText = data.text;
        const imgEl = document.getElementById('memory-img');
        const linkEl = document.getElementById('memory-link');
        
        if(data.img) { imgEl.src = data.img; imgEl.classList.remove('hidden'); } else { imgEl.classList.add('hidden'); }
        if(data.link) { linkEl.href = data.link; linkEl.classList.remove('hidden'); } else { linkEl.classList.add('hidden'); }
        
        // Mostrar modal
        document.getElementById('memory-modal').classList.remove('hidden');
    }
});

// Cerrar modal
document.getElementById('close-modal').onclick = () => {
    document.getElementById('memory-modal').classList.add('hidden');
};

// --- BUCLE DE ANIMACIÓN ---
function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    if (gameStarted) {
        // Zoom suave de entrada (Viaje inicial)
        camera.position.z += (targetZ - camera.position.z) * 0.02;

        // Si la cámara llega a su destino y nadie está tocando, activar rotación inicial
        if (!controls.autoRotate && Math.abs(camera.position.z - targetZ) < 0.5 && !autoRotateTimer) {
             // Solo activar si no hay un temporizador pendiente
             if (!isDragging) controls.autoRotate = true;
        }
    }

    // Rotación lenta del fondo de estrellas
    backgroundStars.rotation.y += 0.0001;

    // Animación de latido y color en la constelación
    memoryObjects.forEach((obj, i) => {
        // Latido
        obj.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.1);
        // Cambio de color suave (Azules y Blancos)
        const hue = 0.55 + Math.sin(time * 0.5 + i) * 0.05; 
        obj.material.color.setHSL(hue, 0.7, 0.8);
    });

    controls.update();
    composer.render();
}
animate();

// Ajuste de ventana
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

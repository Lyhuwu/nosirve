// Escena
const scene = new THREE.Scene();

// Cámara
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 8;

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Luces
const luz = new THREE.PointLight(0xffffff, 1.5);
luz.position.set(5, 5, 5);
scene.add(luz);

const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(luzAmbiente);

// Estrellas clickeables
const estrellas = [];
const geometry = new THREE.SphereGeometry(0.12, 16, 16);
const material = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive: 0xffffff,
  emissiveIntensity: 0.9
});

for (let i = 0; i < 40; i++) {
  const estrella = new THREE.Mesh(geometry, material.clone());

  estrella.position.set(
    (Math.random() - 0.5) * 12,
    (Math.random() - 0.5) * 12,
    (Math.random() - 0.5) * 12
  );

  estrella.mensaje = `Eres mi estrella #${i + 1} 💖`;
  scene.add(estrella);
  estrellas.push(estrella);
}

// Fondo de partículas (galaxia)
const estrellasFondo = new THREE.BufferGeometry();
const cantidad = 1200;
const posiciones = new Float32Array(cantidad * 3);

for (let i = 0; i < cantidad * 3; i++) {
  posiciones[i] = (Math.random() - 0.5) * 60;
}

estrellasFondo.setAttribute(
  "position",
  new THREE.BufferAttribute(posiciones, 3)
);

const materialFondo = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.08,
  transparent: true,
  opacity: 0.8
});

const puntos = new THREE.Points(estrellasFondo, materialFondo);
scene.add(puntos);

// Interacción
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("click", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(estrellas);

  if (intersects.length > 0) {
    mostrar(intersects[0].object.mensaje);
  }
});

// Modal
function mostrar(texto) {
  document.getElementById("texto").innerText = texto;
  document.getElementById("mensaje").classList.remove("oculto");
}

function cerrar() {
  document.getElementById("mensaje").classList.add("oculto");
}

// Animación
function animate() {
  requestAnimationFrame(animate);
  scene.rotation.y += 0.0008;
  puntos.rotation.y += 0.0003;
  renderer.render(scene, camera);
}
animate();

// Responsive
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

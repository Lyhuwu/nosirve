// Escena
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Estrellas
const estrellas = [];
const geometry = new THREE.SphereGeometry(0.05, 16, 16);
const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

for (let i = 0; i < 100; i++) {
  const estrella = new THREE.Mesh(geometry, material);
  estrella.position.set(
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10
  );

  estrella.mensaje = `Eres mi estrella #${i + 1} 💖`;
  scene.add(estrella);
  estrellas.push(estrella);
}

// Click
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
  scene.rotation.y += 0.0005;
  renderer.render(scene, camera);
}
animate();

// --- CONSTELACIÓN PERSONALIZADA "SOFI" ---
// Definimos los puntos para que formen visualmente las letras
const sofPoints = [
    // Letra S
    { pos: [-15, 6, 0], text: "S - Eres mi sueño hecho realidad." },
    { pos: [-18, 4, 0], text: "S - Siempre estaré para ti." },
    { pos: [-15, 2, 0], text: "S - Sonreír es mejor si es contigo." },
    { pos: [-12, 0, 0], text: "S - Solo tú sabes cómo hacerme feliz." },
    { pos: [-15, -2, 0], text: "S - Si te tengo a ti, lo tengo todo." },
    
    // Letra O
    { pos: [-8, 4, 0], text: "O - Oh, qué suerte tuve de encontrarte." },
    { pos: [-4, 4, 0], text: "O - Oro es poco comparado con nuestro amor." },
    { pos: [-4, -2, 0], text: "O - Onrepeat mis pensamientos sobre ti." },
    { pos: [-8, -2, 0], text: "O - Ojalá nuestra historia nunca termine." },
    { pos: [-8, 4, 0], text: "" }, // Conexión para cerrar la O
    
    // Letra F
    { pos: [1, 4, 0], text: "F - Fuiste, eres y serás mi todo." },
    { pos: [1, -2, 0], text: "F - Felicidad rima con nosotros." },
    { pos: [1, 1, 0], text: "F - Favoritos son nuestros momentos." },
    { pos: [5, 1, 0], text: "F - Fue el destino quien nos unió." },
    
    // Letra I
    { pos: [10, 4, 0], text: "I - Increíble es lo que siento por ti." },
    { pos: [10, -2, 0], text: "I - Infinito es el tiempo que quiero estar contigo." },
    { pos: [10, 6, 0], text: "I - Inolvidable cada beso." } // Punto de la i
];

const memoryObjects = [];
const lineMaterial = new THREE.LineBasicMaterial({ 
    color: 0xff69b4, 
    transparent: true, 
    opacity: 0.4,
    blending: THREE.AdditiveBlending 
});

// Crear las estrellas y las líneas que forman las letras
for (let i = 0; i < sofPoints.length; i++) {
    const p = sofPoints[i];
    
    // Crear la estrella (Punto de la constelación)
    if (p.text !== "") { // Solo crear estrella si tiene texto
        const geo = new THREE.SphereGeometry(0.7, 24, 24);
        const mat = new THREE.MeshBasicMaterial({ color: 0xff1493 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...p.pos);
        mesh.userData = { text: p.text };
        scene.add(mesh);
        memoryObjects.push(mesh);
    }

    // Dibujar líneas láser entre puntos para formar las letras
    // (Conectamos puntos consecutivos excepto donde saltamos de letra)
    const saltos = [4, 9, 13]; // Índices donde termina una letra y empieza otra
    if (i < sofPoints.length - 1 && !saltos.includes(i)) {
        const points = [
            new THREE.Vector3(...p.pos), 
            new THREE.Vector3(...sofPoints[i+1].pos)
        ];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeo, lineMaterial);
        scene.add(line);
    }
}

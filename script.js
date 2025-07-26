async function cargarDatos() {
  const canvasRes = await fetch('Ayayayayaay.canvas');
  const canvasData = await canvasRes.json();
  console.log("Datos Canvas cargados:", canvasData);

  const contenedor = document.getElementById('canvas');

  canvasData.nodes.forEach(node => {
    const div = document.createElement('div');
    div.className = 'node';
    div.style.left = `${node.x}px`;
    div.style.top = `${node.y}px`;

    if (node.text) {
      // Si es imagen o GIF
      if (/\.(jpg|jpeg|png|gif|webp)$/i.test(node.text)) {
        const img = document.createElement('img');
        img.src = node.text;
        div.appendChild(img);
      }
      // Si es un link de Spotify
      else if (node.text.includes('open.spotify.com')) {
        const iframe = document.createElement('iframe');
        iframe.src = node.text.replace('open.spotify.com', 'open.spotify.com/embed');
        iframe.width = "300";
        iframe.height = "80";
        iframe.frameBorder = "0";
        iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
        iframe.loading = "lazy";
        div.appendChild(iframe);
      }
      // Si es un link normal
      else if (node.text.startsWith('http')) {
        const a = document.createElement('a');
        a.href = node.text;
        a.textContent = node.text;
        a.target = "_blank";
        div.appendChild(a);
      }
      // Si es texto
      else {
        div.textContent = node.text;
      }
    }

    contenedor.appendChild(div);
  });
}

cargarDatos().catch(error => {
  console.error("Error al cargar los archivos:", error);
});

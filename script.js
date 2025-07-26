// Cargar el archivo canvas
fetch('Ayayayayaay.canvas')
  .then((response) => response.text())
  .then((data) => {
    // Intentamos parsear los datos del canvas
    try {
      const canvasData = JSON.parse(data);

      // Verificamos si hay nodos
      const nodes = canvasData.nodes;
      if (!nodes || nodes.length === 0) {
        console.error("No se encontraron nodos en el canvas.");
        return;
      }

      // Iteramos sobre los nodos
      nodes.forEach((node) => {
        // Crear el div que representará el nodo
        const card = document.createElement("div");
        card.className = "node-card";
        card.style.left = `${node.x}px`;
        card.style.top = `${node.y}px`;

        const content = document.createElement("div");
        content.className = "node-content";

        if (node.text) {
          // Si es un enlace de imagen, lo insertamos como <img>
          if (node.text.match(/\.(gif|jpe?g|png|webp)$/i)) {
            const img = document.createElement("img");
            img.src = node.text;
            img.alt = "Imagen";
            content.appendChild(img);
          } else {
            // Si es texto, lo insertamos como <p>
            const text = document.createElement("p");
            text.textContent = node.text;
            content.appendChild(text);
          }
        }

        // Insertamos el contenido en el div del nodo
        card.appendChild(content);
        document.body.appendChild(card);
      });
    } catch (error) {
      console.error("Error al procesar el canvas:", error);
    }
  })
  .catch((error) => {
    console.error("Error al cargar el canvas:", error);
  });

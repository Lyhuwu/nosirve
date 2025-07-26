// Cargar el archivo JSON
fetch('Ayayayayaay.json')
  .then(response => response.json())
  .then(data => {
    const cards = data.cards;
    if (!cards || cards.length === 0) {
      console.error("No se encontraron nodos en el JSON");
      return;
    }

    const container = document.getElementById('canvas');

    cards.forEach(card => {
      const el = document.createElement('div');
      el.className = 'node';
      el.innerHTML = card.name;
      el.style.position = 'absolute';
      el.style.left = card.x + 'px';
      el.style.top = card.y + 'px';
      el.style.width = (card.width || 200) + 'px';
      el.style.height = (card.height || 100) + 'px';
      el.style.background = card.backgroundColor || '#f9f9f9';
      el.style.border = '2px solid pink';
      el.style.padding = '10px';
      el.style.borderRadius = '12px';
      el.style.color = 'white';
      el.style.overflow = 'hidden';

      container.appendChild(el);
    });
  })
  .catch(error => {
    console.error("Error cargando el JSON:", error);
  });


document.addEventListener("click", () => {
  const llamas = document.querySelectorAll(".flame-wrap");
  llamas.forEach(llama => {
    llama.style.animation = "none";           // Detiene el parpadeo
    llama.style.backgroundColor = "#7a3c00"; // Color más apagado
    llama.style.opacity = "0.6";              // Llama más tenue
  });
});

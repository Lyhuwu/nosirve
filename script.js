document.addEventListener("click", () => {
  const llamas = document.querySelectorAll(".flame-wrap");
  llamas.forEach(llama => {
    llama.classList.toggle("off"); // Apaga/enciende la vela sin desaparecer
  });
});

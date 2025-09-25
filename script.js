document.addEventListener("click", () => {
  const llamas = document.querySelectorAll(".flame");
  llamas.forEach(llama => {
    llama.classList.add("off"); // Apaga las llamas
  });
});

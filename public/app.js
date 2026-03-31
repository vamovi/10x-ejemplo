const btn = document.querySelector("#btn");
const out = document.querySelector("#out");

btn.addEventListener("click", () => {
  out.textContent = `Click recibido: ${new Date().toLocaleString()}`;
});


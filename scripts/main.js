// scripts/main.js

console.log("BetBros cargado correctamente.");

function showRegister() {
  window.location.href = "register.html";
}

function goTo(page) {
  window.location.href = page;
}

function loadInicio() {
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault(); 

      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden.");
        return;
      }

      const newUser = { username, email, password };
      localStorage.setItem("betbros_user", JSON.stringify(newUser));

      alert("¡Registro exitoso!");
      window.location.href = "login.html"; 
    });
  }
});

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

function logout() {
  localStorage.removeItem("betbros_user");
  alert("Sesión cerrada correctamente.");
  window.location.href = "index.html"; // Redirige al inicio
}

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{4,}$/;

  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault(); 

      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (!passwordRegex.test(password)) {
      alert("La contraseña debe tener al menos 4 caracteres, una mayúscula y un número.");
      return;
    }

      if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden.");
        return;
    }

      const newUser = { username, email, password };

      // Enviar el nuevo usuario al backend con fetch
      fetch('http://localhost:3010/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === 'Usuario registrado correctamente.') {
          alert("¡Registro exitoso!");
          window.location.href = "login.html"; // Redirigir al login
        } else {
          alert(data.message);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Hubo un problema al registrar el usuario.');
      });
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault(); 

      const identifier = document.getElementById("identifier").value.trim();  // Nombre de usuario o correo
      const password = document.getElementById("password").value;

      const loginData = { identifier, password };

      // Enviar datos al backend para validar el login
      fetch('http://localhost:3010/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message)
        if (data.message.trim() === 'Login exitoso.') {
          localStorage.setItem("betbros_user", JSON.stringify({ username: identifier }));
          alert("¡Login exitoso!");
          window.location.href = "dashboard.html";  // Redirigir a la página de bienvenida
        } else {
          alert(data.message);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Hubo un problema al iniciar sesión.');
      });
    });
  }
  // Bienvenida personalizada en dashboard
  const welcomeEl = document.getElementById("welcomeUser");
  const user = JSON.parse(localStorage.getItem("betbros_user"));

  if (welcomeEl && user) {
    welcomeEl.textContent = ` ${user.username}`;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const createGroupForm = document.getElementById("createGroupForm");

if (createGroupForm) {
  createGroupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("groupName").value.trim();
    const description = document.getElementById("groupDescription").value.trim();
    const image = document.getElementById("groupImage").value.trim();
    const user = JSON.parse(localStorage.getItem("betbros_user"));

    if (!user || !user.username) {
      alert("No se ha podido identificar al usuario.");
      return;
    }

    if (name.length > 15) {
      alert("El nombre del grupo no puede tener más de 15 caracteres.");
      return;
    }

    if (description.length > 100) {
      alert("La descripción no puede tener más de 100 caracteres.");
      return;
    }

    fetch('http://localhost:3010/create-group', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        image,
        creator: user.username
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.message === "Grupo privado creado correctamente.") {
        alert("¡Grupo creado con éxito!");
        window.location.href = "dashboard.html";
      } else {
        alert(data.message);
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('Hubo un problema al crear el grupo.');
    });
  });
}
});




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

function deleteGroup(groupName) {
  const user = JSON.parse(localStorage.getItem("betbros_user"));
  if (!confirm(`¿Estás segur@ de que quieres eliminar el grupo "${groupName}"?`)) return;

  fetch(`http://localhost:3010/delete-group`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: groupName, username: user?.username})
  })
    .then(response => response.json())
    .then(data => {
      if (data.message === "Solicitud de eliminación enviada.") {
        alert("Tu solicitud para eliminar el grupo ha sido enviada. Será revisada por el equipo de BetBros.");
      } else {
        alert(data.message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Hubo un problema al eliminar el grupo.');
    });
}

function joinGroup() {
  const code = document.getElementById("inviteCode").value.trim();
  const user = JSON.parse(localStorage.getItem("betbros_user"));

  if (!user || !user.username) {
    alert("No se ha podido identificar al usuario.");
    return;
  }

  if (!code) {
    alert("Por favor, introduce un código de invitación.");
    return;
  }

  fetch('http://localhost:3010/join-group', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invitationCode: code, username: user.username })
  })
  .then(async (response) => {
    const data = await response.json(); // <- extraemos la respuesta JSON

    alert(data.message); // Mostramos el mensaje del servidor

    if (response.ok) {
      window.location.href = "myGroups.html"; // redirige solo si fue exitoso
    }
  })
  .catch(error => {
    console.error("Error:", error);
    alert("No se pudo unir al grupo.");
  });
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
      const user = JSON.parse(localStorage.getItem("betbros_user"));
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
        if (data.message.trim() === 'Login exitoso.') {
          localStorage.setItem("betbros_user", JSON.stringify({ username: data.username }));
          alert("¡Login exitoso!");
          window.location.href = "dashboard.html";
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
    document.addEventListener("DOMContentLoaded", () => {
  const groupsList = document.getElementById("groupsList");

  // Solo ejecutar si estamos en la página de Mis Grupos
  if (!groupsList) return;

  const user = JSON.parse(localStorage.getItem("betbros_user"));

  if (!user || !user.username) {
    alert("No se ha podido identificar al usuario.");
    window.location.href = "index.html";
    return;
  }

  fetch(`http://localhost:3010/my-groups?username=${user.username}`)
    .then(response => response.json())
    .then(groups => {
      if (groups.length === 0) {
        groupsList.innerHTML = '<p class="text-center">No tienes grupos creados.</p>';
      } else {
        groups.forEach(group => {
          const groupCard = document.createElement("div");
          groupCard.classList.add("col-12", "mb-3");
          groupCard.innerHTML = `
            <div class="card h-100 p-3 d-flex flex-row align-items-center justify-content-between">
              <div class="d-flex align-items-center">
                <img src="${group.image || 'https://via.placeholder.com/120'}" class="rounded me-3" alt="${group.name}" style="width: 100px; height: 100px; object-fit: cover;">
                <div>
                  <h5 class="mb-1">
                    <a href="group-detail.html?group=${group.name}" class="fw-bold text-verde-betbros">
                      ${group.name}
                    </a>
                    ${group.pendingDeletion ? '<span class="badge bg-warning text-dark">Eliminación pendiente</span>' : ''}
                  </h5>
                  <p class="mb-1 text-muted">${group.description}</p>
                  <small class="text-secondary">Creador: ${group.creator}</small><br>
                  <small class="text-secondary">Apuestas en curso: <b>${group.bets || 0}</b></small><br>
                  <small class="text-secondary">Participantes: <b>${group.members || 1}</b></small>
                </div>
              </div>
              <div class="dropdown">
                <button class="btn btn-mas-info dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Más información
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <a class="dropdown-item delete-option" href="#" onclick="event.preventDefault(); deleteGroup('${group.name}')">
                      Eliminar grupo
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          `;
          groupsList.appendChild(groupCard);
        });
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Hubo un problema al cargar los grupos.');
    });
});

document.addEventListener("DOMContentLoaded", () => {
  const joinGroupForm = document.getElementById("joinGroupForm");

  if (joinGroupForm) {
    joinGroupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      joinGroup(); // llama a tu función central
    });
  }
});

function joinGroup() {
  const code = document.getElementById("inviteCode").value.trim();
  const user = JSON.parse(localStorage.getItem("betbros_user"));

  if (!user || !user.username) {
    alert("No se ha podido identificar al usuario.");
    return;
  }

  if (!code) {
    alert("Por favor, introduce un código de invitación.");
    return;
  }

  fetch('http://localhost:3010/join-group', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invitationCode: code, username: user.username })
  })
  .then(async (response) => {
    const data = await response.json();
    alert(data.message);
    if (response.ok) {
      window.location.href = "myGroups.html";
    }
  })
  .catch(error => {
    console.error("Error:", error);
    alert("No se pudo unir al grupo.");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Mostrar el nombre de usuario si tienes login cargado
  const welcomeUser = document.getElementById("welcomeUser");
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (user) {
    welcomeUser.textContent = user.username;
  }

  // Función para añadir nueva opción de apuesta
  const addOptionBtn = document.getElementById("addOptionBtn");
  const optionsContainer = document.getElementById("optionsContainer");

  if (addOptionBtn && optionsContainer) {
    addOptionBtn.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "form-control mb-2";
      input.placeholder = `Opción ${optionsContainer.children.length + 1}`;
      optionsContainer.appendChild(input);
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const crearBtn = document.getElementById('crearApuestaBtn');
  if (crearBtn) {
    crearBtn.addEventListener('click', async () => {
      const username = localStorage.getItem('username');
      const groupCode = localStorage.getItem('selectedGroupCode'); // asegúrate de guardar este valor cuando se selecciona un grupo
      const nombre = document.getElementById('betTitle').value.trim();
      const tipo = document.getElementById('multipleChoiceSwitch').checked ? 'multiple' : 'single';
      const fechaLimite = document.getElementById('deadline').value;
      const opcionesInputs = document.querySelectorAll('#optionsContainer input');
      const opciones = Array.from(opcionesInputs)
        .map(input => input.value.trim())
        .filter(text => text.length > 0);

      const apuesta = {
        groupCode,
        username,
        nombre,
        tipo,
        fechaLimite,
        opciones
      };

      try {
        const response = await fetch('http://localhost:3010/save-bet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(apuesta)
        });

        const data = await response.json();
        alert(data.message);
        window.location.href = 'dashboard.html'; // redirige después de guardar
      } catch (error) {
        console.error('Error al guardar la apuesta:', error);
        alert('Ocurrió un error al guardar la apuesta.');
      }
    });
  }
});





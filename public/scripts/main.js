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
      localStorage.setItem("currentGroupCode", code);  // Guarda el código del grupo
      window.location.href = "myGroups.html"; // redirige solo si fue exitoso
    }
  })
  .catch(error => {
    console.error("Error:", error);
    alert("No se pudo unir al grupo.");
  });
}

function confirmarEliminacion() {
  if (confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción será revisada por el equipo de BetBros.")) {
    const user = JSON.parse(localStorage.getItem("betbros_user"));
    if (!user || !user.username) {
      alert("No se ha podido identificar al usuario.");
      return;
    }

    fetch('http://localhost:3010/request-account-deletion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user.username })
    })
      .then(response => response.json())
      .then(data => {
        alert(data.message);
      })
      .catch(error => {
        console.error("Error:", error);
        alert("Hubo un problema al enviar la solicitud.");
      });
  }
}

function setGroupAndRedirect(groupCode) {
  localStorage.setItem("currentGroupCode", groupCode);
  window.location.href = "makeBet.html";
}

function cambiarNotificaciones(estado) {
  if (estado) {
    alert("Notificaciones activadas.");
  } else {
    alert("Notificaciones desactivadas.");
  }
}

function cambiarCorreo(estado) {
  if (estado) {
    alert("Ahora recibirás información por correo.");
  } else {
    alert("Ya no recibirás información por correo.");
  }
}

function cambiarIdioma(estado) {
  if (estado === "es") {
    alert("Idioma cambiado a español.");
  } else {
    alert("De momento no está disponible el idioma inglés. Estamos trabajando en ello.");
  }
}

function leaveGroup(groupName) {
  const user = JSON.parse(localStorage.getItem("betbros_user"));

  if (!confirm(`¿Estás segur@ de que quieres abandonar el grupo "${groupName}"?`)) return;

  fetch('http://localhost:3010/request-leave-group', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupName, username: user.username })
  })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Hubo un problema al solicitar abandonar el grupo.');
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{4,}$/;

  // --- AVATAR CAROUSEL LOGIC ---
  // Si existe el input hidden y el carrusel, sincroniza el valor del avatar seleccionado
  const selectedAvatarInput = document.getElementById("selectedAvatar");
  const avatarImg = document.getElementById("currentAvatarImg");
  if (selectedAvatarInput && avatarImg) {
    // Actualiza el input hidden cada vez que cambia la imagen del carrusel
    const observer = new MutationObserver(() => {
      // El valor debe ser la ruta completa, no solo el nombre
      selectedAvatarInput.value = avatarImg.getAttribute("src");
    });
    observer.observe(avatarImg, { attributes: true, attributeFilter: ["src"] });
    // Inicializa el valor al cargar
    selectedAvatarInput.value = avatarImg.getAttribute("src");
  }

  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault(); 

      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      // Obtener avatar seleccionado del input hidden o del radio (compatibilidad)
      let avatar = "";
      if (selectedAvatarInput) {
        avatar = selectedAvatarInput.value;
      } else {
        const avatarRadio = document.querySelector('input[name="avatar"]:checked');
        avatar = avatarRadio ? avatarRadio.value : "";
      }

      if (!passwordRegex.test(password)) {
        alert("La contraseña debe tener al menos 4 caracteres, una mayúscula y un número.");
        return;
      }

      if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden.");
        return;
      }

      if (!avatar) {
        alert("Por favor, selecciona un avatar.");
        return;
      }

      const newUser = { username, email, password, avatar };

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
          window.location.href = "login.html";
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
          localStorage.setItem("betbros_user", JSON.stringify({ username: data.username, avatar: data.avatar || "" }));
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

  console.log("Usuario actual:", user);
if (welcomeEl && user) {
  welcomeEl.innerHTML = `
    <img src="${user.avatar || 'images/avatar/gato.png'}" alt="Avatar" class="me-2 rounded-circle" style="width: 64px; height: 64px;">
    ${user.username}
  `;
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
           const isAdmin = group.creator === user.username;
            const abandonOption = !isAdmin ? `
              <li>
                <a class="dropdown-item" href="#" onclick="event.preventDefault(); leaveGroup('${group.name}')">
                  Abandonar grupo
                </a>
              </li>
            ` : '';
          const groupCard = document.createElement("div");
          groupCard.classList.add("col-12", "mb-3");
          groupCard.innerHTML = `
            <div class="card h-100 p-3 d-flex flex-row align-items-center justify-content-between">
              <div class="d-flex align-items-center">
                <img src="${group.image || 'https://via.placeholder.com/120'}" class="rounded me-3" alt="${group.name}" style="width: 100px; height: 100px; object-fit: cover;">
                <div>
                  <h5 class="mb-1">
                   <a href="#" class="fw-bold text-verde-betbros" onclick="setGroupAndRedirect('${group.invitationCode}')">
                    ${group.name}
                  </a>
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
                  ${abandonOption}
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
  if (addOptionBtn) {
    addOptionBtn.addEventListener("click", () => {
      const newOption = document.createElement("input");
      newOption.type = "text";
      newOption.className = "form-control mb-2";
      newOption.placeholder = "Opción de apuesta";
      optionsContainer.appendChild(newOption);
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const createBetForm = document.getElementById('createBetForm');
  const user = JSON.parse(localStorage.getItem("betbros_user"));

  if (createBetForm) {
    createBetForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const groupCode = localStorage.getItem("currentGroupCode");

      const username = user.username;
      const title = document.getElementById('betTitle').value.trim();
      const description = document.getElementById('betDescription').value.trim();
      const multipleChoice = document.getElementById('multipleChoiceSwitch').checked;
      const limitDate = document.getElementById('deadline').value;
      const options = Array.from(document.querySelectorAll('#optionsContainer input[type="text"]'))
                          .map(input => input.value.trim())
                          .filter(value => value !== "");

      if (!groupCode || !title || !description || !limitDate || options.length === 0) {
        alert("Por favor, completa todos los campos obligatorios.");
        return;
      }

      const apuesta = {
        groupCode,
        username,
        title,
        description,
        multipleChoice,
        limitDate,
        options
      };

      try {
        const response = await fetch(`http://localhost:3010/save-bet?groupCode=${groupCode}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apuesta)
        });

        const data = await response.json();
        alert(data.message);
        if (response.ok) {
          window.location.href = "myGroups.html";
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Hubo un problema al crear la apuesta.');
      }
    });
  }
});





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

function joinCommunityGroup(groupName) {
  const user = JSON.parse(localStorage.getItem("betbros_user"));
  if (!user || !user.username) {
    alert("Debes iniciar sesión para unirte a un grupo.");
    return;
  }
  fetch('http://localhost:3010/join-community', { // También fíjate que el endpoint es '/join-community', no 'join-community-group'
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: groupName, username: user.username })
  })
  .then(response => response.json())
  .then(data => {
    if (data.message && data.message.includes("Te has unido a la comunidad")) {
      alert("Te has unido al grupo correctamente.");
      window.location.href = "myCommunities.html";
    } else {
      alert(data.message || "Hubo un problema al unirte al grupo.");
    }
  })
  .catch(error => {
    console.error("Error:", error);
    alert("Hubo un problema al unirte al grupo.");
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
  window.location.href = "betsGroup.html";
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

function leaveCommunity(communityName) {
  const user = JSON.parse(localStorage.getItem("betbros_user"));
  if (!user || !user.username) {
    alert("No se ha podido identificar al usuario.");
    return;
  }
  if (!confirm(`¿Estás segur@ de que quieres abandonar la comunidad "${communityName}"?`)) return;
  fetch('http://localhost:3010/leave-community', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: communityName, username: user.username })
  })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      if (data.message.includes("abandonado")) {
        window.location.href = "myCommunities.html"; // Redirige a la página de comunidades
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Hubo un problema al abandonar la comunidad.');
    });
}

function deleteBet(betId) {
  const user = JSON.parse(localStorage.getItem("betbros_user"));
  const groupCode = localStorage.getItem("currentGroupCode");

  if (!user || !user.username || !groupCode) {
    alert("No se ha podido identificar al usuario o grupo.");
    return;
  }

  fetch(`http://localhost:3010/delete-bet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ betId, username: user.username, groupCode })
  })
    .then(response => {
      return response.json().then(data => ({
        status: response.status,
        ok: response.ok,
        body: data
      }));
    })
    .then(({ ok, body }) => {
      alert(body.message);
      if (ok) {
        location.reload();
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Hubo un problema al eliminar la apuesta.');
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
  const communitiesList = document.getElementById("communitiesList");
  if (!communitiesList) return; // Nos aseguramos de estar en la página correcta

  const userData = localStorage.getItem("betbros_user");
  if (!userData) {
    alert("No se ha podido identificar al usuario.");
    window.location.href = "index.html";
    return;
  }

  const user = JSON.parse(userData);
  if (!user || !user.username) {
    alert("No se ha podido identificar al usuario.");
    window.location.href = "index.html";
    return;
  }

  fetch(`http://localhost:3010/my-communities?username=${user.username}`)
    .then(response => response.json())
    .then(communities => {
      if (communities.length === 0) {
        communitiesList.innerHTML = '<p class="text-center">No tienes comunidades.</p>';
      } else {
        communities.forEach(community => {
          const communityCard = document.createElement("div");
          communityCard.classList.add("col-12", "mb-3");
          communityCard.innerHTML = `
            <div class="card h-100 p-3 d-flex flex-row align-items-center justify-content-between">
              <div class="d-flex align-items-center">
                <img src="${community.image || 'https://via.placeholder.com/120'}" class="rounded me-3" alt="${community.name}" style="width: 100px; height: 100px; object-fit: cover;">
                <div>
                  <h5 class="mb-1">
                    <a href="#" class="fw-bold text-verde-betbros" onclick="setGroupAndRedirect('${community.invitationCode}')">
                    ${community.name}
                    </a>
                  </h5>
                  <p class="mb-1 text-muted">${community.description}</p>
                  <small class="text-secondary">Creador: ${community.creator}</small><br>
                  <small class="text-secondary">Apuestas en curso: <b>${community.bets || 0}</b></small><br>
                  <small class="text-secondary">Participantes: <b>${community.members.length}</b></small>
                </div>
              </div>
              <div class="dropdown">
                <button class="btn btn-mas-info dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Más información
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <a class="dropdown-item delete-option" href="#" onclick="event.preventDefault(); leaveCommunity('${community.name}')">
                      Abandonar comunidad
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          `;
          communitiesList.appendChild(communityCard);
        });
      }
    })
    .catch(error => {
      console.error('Error:', error);
      communitiesList.innerHTML = '<p class="text-center text-danger">Error al cargar las comunidades.</p>';
    });
});

document.addEventListener("DOMContentLoaded", () => {
  // Mostrar el nombre de usuario si tienes login cargado
  const welcomeUser = document.getElementById("welcomeUser");
  const user = JSON.parse(localStorage.getItem("betbros_user"));
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

document.addEventListener("DOMContentLoaded", () => {
  const betsList = document.getElementById("betsList");
  const groupTitle = document.getElementById("groupTitle");
  const groupCode = localStorage.getItem("currentGroupCode");

  if (betsList && groupTitle && groupCode) {
    fetch(`http://localhost:3010/group-bets?groupCode=${groupCode}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
          return;
        }

        groupTitle.textContent = data.groupName;

        if (data.bets.length === 0) {
          betsList.innerHTML = `<p class="text-center">No hay apuestas en este grupo.</p>`;
          return;
        }

        data.bets.forEach(bet => {
        const betCard = document.createElement("div");
        betCard.classList.add("col-12");
        betCard.innerHTML = `
          <div class="card p-3">
            <h5 class="text-verde-betbros">
              <a href="betDetails.html?betId=${bet.id}&groupCode=${groupCode}" class="text-verde-betbros">
                ${bet.title}
              </a>
            </h5>
            <p>${bet.description}</p>
            <p><b>Fecha límite:</b> ${new Date(bet.limitDate).toLocaleString()}</p>
            <p><b>Opciones:</b> ${bet.options.join(", ")}</p>
            <small class="text-muted">Creador: ${bet.username}</small>
            <div class="d-flex flex-column align-items-end">
              <button class="btn btn-danger mt-2" onclick="deleteBet('${bet.id}')">Eliminar apuesta</button>
            </div>
          </div>
        `;
        betsList.appendChild(betCard);
});
      })
      .catch(err => {
        console.error("Error al obtener apuestas:", err);
        betsList.innerHTML = `<p class="text-center text-danger">Error al cargar apuestas.</p>`;
      });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const betTitle = document.getElementById('betTitle');
  const betDescription = document.getElementById('betDescription');
  const optionSelect = document.getElementById('optionSelect');
  const betForm = document.getElementById('placeBetForm');
  const amountInput = document.getElementById('amountInput');
  const responseMessage = document.getElementById('message');

  const params = new URLSearchParams(window.location.search);
  const betId = params.get('betId');
  const groupCode = params.get('groupCode');
  const user = JSON.parse(localStorage.getItem('betbros_user'));
  const username = user?.username;

  
  if (!betId || !groupCode || !username) {
    console.log(username, betId, groupCode);
    responseMessage.textContent = 'Faltan datos para mostrar la apuesta.';
    return;
  }

  // ✅ Cargar la apuesta correspondiente
  fetch(`/group-bets?groupCode=${groupCode}`)
    .then(res => res.json())
    .then(data => {
      const bet = data.bets.find(b => b.id === betId);

      if (!bet) {
        responseMessage.textContent = 'Apuesta no encontrada.';
        return;
      }

      betTitle.textContent = bet.title;
      betDescription.textContent = bet.description;

      bet.options.forEach(optionText => {
        const option = document.createElement('option');
        option.value = optionText;
        option.textContent = optionText;
        optionSelect.appendChild(option);
      });
    })
    .catch(err => {
      console.error(err);
      responseMessage.textContent = 'Error al cargar los detalles de la apuesta.';
    });

  // ✅ Enviar apuesta
  betForm?.addEventListener('submit', async e => {
    e.preventDefault();

    const selectedOption = optionSelect.value;
    const amount = amountInput.value;

    const res = await fetch('http://localhost:3010/place-bet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        betId,
        groupCode,
        username,
        selectedOption,
        amount
      })
    });

    const data = await res.json();
    responseMessage.textContent = data.message;
  });
});

 const publicGroups = [
    { name: "Apuestas Champions", image: "images/groups/champions.png", members: 124, bets: 37 },
    { name: "Liga Española", image: "images/groups/laliga.png", members: 89, bets: 22 },
    { name: "NBA Fans", image: "images/groups/nba.png", members: 56, bets: 15 },
    { name: "Premier League", image: "images/groups/premier.png", members: 102, bets: 29 },
    { name: "Grupo Fútbol", image: "images/groups/futbol.png", members: 75, bets: 18 },
    { name: "Grupo NBA", image: "images/groups/nba2.png", members: 42, bets: 9 }
  ];

  function createGroupCard(group) {
    return `
      <div class="col-md-6 col-lg-4 public-group-list-item">
        <div class="card equal-card mb-3 w-100">
          <img src="${group.image}" class="card-img-top" alt="${group.name}" style="height:180px;object-fit:cover;">
          <div class="card-body d-flex flex-column bg-dark text-white">
            <h5 class="card-title fw-bold">${group.name}</h5>
            <p class="card-text mb-1"><strong>Personas:</strong> ${group.members}</p>
            <p class="card-text mb-3"><strong>Apuestas:</strong> ${group.bets}</p>
            <button class="btn btn-primary mt-auto w-100 join-group-button" data-group-name="${group.name}">Unirse</button>
          </div>
        </div>
      </div>`;
  }

  function renderGroups() {
    const topGroups = publicGroups.slice(0, 3);
    const allGroups = publicGroups.slice(3, 6);

    document.getElementById('topGroupsList').innerHTML = topGroups.map(createGroupCard).join('');
    document.getElementById('allGroupsList').innerHTML = allGroups.map(createGroupCard).join('');
  }

  function filterGroups(query) {
    return publicGroups.filter(group => group.name.toLowerCase().includes(query.toLowerCase()));
  }

  document.getElementById('searchGroupInput').addEventListener('input', function() {
    const query = this.value.trim();
    const defaultSection = document.getElementById('defaultGroups');
    const filteredSection = document.getElementById('filteredGroups');

    if (query === '') {
      defaultSection.classList.remove('d-none');
      filteredSection.classList.add('d-none');
    } else {
      const results = filterGroups(query);
      filteredSection.innerHTML = results.map(createGroupCard).join('');
      defaultSection.classList.add('d-none');
      filteredSection.classList.remove('d-none');
    }
  });

  document.addEventListener('click', function(event) {
    if (event.target.classList.contains('join-group-button')) {
      const groupName = event.target.getAttribute('data-group-name');
      const user = JSON.parse(localStorage.getItem("betbros_user"));
      if (!user || !user.username) {
        alert("Debes iniciar sesión para unirte a un grupo.");
        return;
      }
      joinCommunityGroup(groupName);
    }
  }
  );
document.addEventListener('DOMContentLoaded', renderGroups);


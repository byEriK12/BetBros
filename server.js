const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path= require('path');

const app = express();
const PORT = 3010;
const USERS_DB = path.join(__dirname, 'db', 'users.json');
const GROUPS_DB = path.join(__dirname, 'db', 'groups.json');
const betsFilePath = path.join(__dirname, 'db', 'bets.json');
const activityFilePath = path.join(__dirname, 'db', 'betsActivity.json');
const COMMUNITIES_DB = path.join(__dirname, 'db', 'communities.json');

// Añade esto al inicio con las demás constantes
const isBetActive = (limitDate) => {
  try {
    const now = new Date();
    const deadline = new Date(limitDate);
    
    // Validación adicional para fechas inválidas
    if (isNaN(deadline.getTime())) {
      console.error(`Fecha inválida recibida: ${limitDate}`);
      return false;
    }
    
    return now <= deadline;
  } catch (error) {
    console.error(`Error al verificar fecha: ${error}`);
    return false;
  }
};

// Función para actualizar estados (añadir con las demás funciones)
const updateBetsStatus = () => {
  try {
    console.log('Ejecutando actualización de estados de apuestas...');
    
    const betsData = fs.readFileSync(betsFilePath, 'utf8');
    const bets = JSON.parse(betsData);
    
    let changesMade = false;
    
    const updatedBets = bets.map(bet => {
      const newStatus = isBetActive(bet.limitDate);
      
      if (bet.isActive !== newStatus) {
        console.log(`Actualizando apuesta ${bet.id}: ${bet.isActive} -> ${newStatus}`);
        changesMade = true;
        return { ...bet, isActive: newStatus };
      }
      return bet;
    });
    
    if (changesMade) {
      fs.writeFileSync(betsFilePath, JSON.stringify(updatedBets, null, 2));
      console.log('Cambios guardados correctamente');
    } else {
      console.log('No se requirieron cambios');
    }
  } catch (error) {
    console.error('Error crítico al actualizar estados:', error);
  }
};

setInterval(updateBetsStatus, 30000);

app.use(bodyParser.json());

app.post('/register', (req, res) => {
    const { username, email, password, avatar } = req.body; // avatar incluido

    if (!username || !email || !password || !avatar) {
        return res.status(400).json({ message: 'Faltan datos para el registro.' });
    }
  
  const users = JSON.parse(fs.readFileSync(USERS_DB, 'utf8'));

  const userExists = users.some(
    (user) => user.username === username || user.email === email
  );

  if (userExists) {
    return res.status(400).json({ message: 'Usuario o correo ya registrado.' });
  }

    users.push({ username, email, password, avatar, creditos: 100 }); // Guardar avatar
    fs.writeFileSync(USERS_DB, JSON.stringify(users, null, 2));

  res.status(201).json({ message: 'Usuario registrado correctamente.' });
});

app.post('/login', (req, res) => {
  const { identifier, password } = req.body;

  const users = JSON.parse(fs.readFileSync(USERS_DB, 'utf8'));

  const user = users.find(
    (u) =>
      (u.username === identifier || u.email === identifier) &&
      u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: 'Credenciales incorrectas.' });
  }

  res.status(200).json({ message: 'Login exitoso.', username: user.username ,avatar: user.avatar });
});


const crypto = require('crypto'); // Al inicio de server.js

app.post('/create-group', (req, res) => {
  try {
    const { name, description, image, creator } = req.body;

    const groups = JSON.parse(fs.readFileSync(GROUPS_DB, 'utf8'));

    // Verificar que no exista grupo con el mismo nombre
    if (groups.some(g => g.name === name)) {
      return res.status(400).json({ message: 'El nombre del grupo ya existe.' });
    }

    // Generar código de invitación random (por ejemplo, 8 caracteres alfanuméricos)
    const invitationCode = crypto.randomBytes(4).toString('hex');

    const newGroup = {
      name,
      description,
      image,
      creator,
      isPublic: false,  // grupo privado por defecto si quieres
      invitationCode,
      members: [creator],
      bets: 0,
      pendingDeletion: false
    };

    groups.push(newGroup);

    fs.writeFileSync(GROUPS_DB, JSON.stringify(groups, null, 2));

    res.status(201).json({ message: 'Grupo privado creado correctamente.', invitationCode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear grupo.' });
  }
});

app.get('/my-groups', (req, res) => {
  const { username } = req.query; 

  const groups = JSON.parse(fs.readFileSync(GROUPS_DB, 'utf8'));
  const userGroups = groups.filter(group => group.members.includes(username));

  res.status(200).json(userGroups);
});

app.post('/delete-group', (req, res) => {
  const { name, username } = req.body;

  if (!name || !username) {
    return res.status(400).json({ message: "Faltan datos para solicitar la eliminación del grupo." });
  }

  const groups = JSON.parse(fs.readFileSync(GROUPS_DB, 'utf8'));
  const group = groups.find(g => g.name === name);

  if (!group) {
    return res.status(404).json({ message: "El grupo no existe." });
  }

  if (group.creator !== username) {
    return res.status(403).json({ message: "Solo el creador puede solicitar la eliminación." });
  }

  group.pendingDeletion = true;
  fs.writeFileSync(GROUPS_DB, JSON.stringify(groups, null, 2));

  res.json({ message: "Solicitud de eliminación enviada." });
});

app.post('/join-group', (req, res) => {
  const { invitationCode, username } = req.body;

  if (!invitationCode || !username) {
    return res.status(400).json({ message: "Faltan datos para unirse al grupo." });
  }

  const groups = JSON.parse(fs.readFileSync(GROUPS_DB, 'utf8'));
  const group = groups.find(g => g.invitationCode === invitationCode);

  if (!group) {
    return res.status(404).json({ message: "Código de invitación inválido." });
  }

  if (group.members.includes(username)) {
    return res.status(400).json({ message: "Ya eres miembro de este grupo." });
  }

  group.members.push(username);
  fs.writeFileSync(GROUPS_DB, JSON.stringify(groups, null, 2));

  res.status(200).json({ message: `Te has unido al grupo "${group.name}".` });
});

app.post('/create-community', (req, res) => {
  const { name, description, image, creator } = req.body;

  const communities = JSON.parse(fs.readFileSync(COMMUNITIES_DB, 'utf8'));

  // Verificar que no exista comunidad con el mismo nombre
  if (communities.some(c => c.name === name)) {
    return res.status(400).json({ message: 'El nombre de la comunidad ya existe.' });
  }

  const newCommunity = {
    name,
    description,
    image,
    creator,
    members: [creator],
    pendingDeletion: false
  };

  communities.push(newCommunity);

  fs.writeFileSync(COMMUNITIES_DB, JSON.stringify(communities, null, 2));

  res.status(201).json({ message: 'Comunidad creada correctamente.' });
});

app.get('/my-communities', (req, res) => {
  const { username } = req.query; 

  const communities = JSON.parse(fs.readFileSync(COMMUNITIES_DB, 'utf8'));
  const userCommunities = communities.filter(community => community.members.includes(username));
  console.log("Buscando comunidades para:", username);
  console.log("Todas las comunidades:", communities);


  res.status(200).json(userCommunities);
});

app.post('/delete-community', (req, res) => {
  const { name, username } = req.body;

  if (!name || !username) {
    return res.status(400).json({ message: "Faltan datos para solicitar la eliminación de la comunidad." });
  }

  const communities = JSON.parse(fs.readFileSync(COMMUNITIES_DB, 'utf8'));
  const community = communities.find(c => c.name === name);

  if (!community) {
    return res.status(404).json({ message: "La comunidad no existe." });
  }

  if (community.creator !== username) {
    return res.status(403).json({ message: "Solo el creador puede solicitar la eliminación." });
  }

  community.pendingDeletion = true;
  fs.writeFileSync(COMMUNITIES_DB, JSON.stringify(communities, null, 2));

  res.json({ message: "Solicitud de eliminación enviada." });
});

app.post('/join-community', (req, res) => {
  const { name, username } = req.body;

  if (!name || !username) {
    return res.status(400).json({ message: "Faltan datos para unirse a la comunidad." });
  }

  const communities = JSON.parse(fs.readFileSync(COMMUNITIES_DB, 'utf8'));
  const community = communities.find(c => c.name === name);

  if (!community) {
    return res.status(404).json({ message: "Comunidad no encontrada." });
  }

  if (community.members.includes(username)) {
    return res.status(400).json({ message: "Ya eres miembro de esta comunidad." });
  }

  community.members.push(username);
  fs.writeFileSync(COMMUNITIES_DB, JSON.stringify(communities, null, 2));

  res.status(200).json({ message: `Te has unido a la comunidad "${community.name}".` });
});

app.post('/save-bet', (req, res) => {

  const generatedId = crypto.randomBytes(4).toString('hex'); // Generar un ID único para la apuesta
  req.body.id = generatedId; // Agregar el ID al cuerpo de la solicitud

  try {
    const bets = JSON.parse(fs.readFileSync(betsFilePath, 'utf8'));
    const { username, title, description, multipleChoice, limitDate, options } = req.body;
    const { groupCode } = req.query; // Obtener el código del grupo desde la query
    if (!groupCode) {
      return res.status(400).json({ message: "Falta el código del grupo." });
    }
    if (!username || !title || !description || !limitDate || !options) {
      return res.status(400).json({ message: "Faltan datos para guardar la apuesta." });
    }
    if (multipleChoice && options.length < 2) {
      return res.status(400).json({ message: "Se requieren al menos 2 opciones para una apuesta de opción múltiple." });
    }

    const newBet = {
      id: generatedId,
      groupCode,
      username,
      title,
      description,
      multipleChoice,
      limitDate,
      options,
      isActive: true,
      correctAnswer: null
    };

    bets.push(newBet);

    fs.writeFileSync(betsFilePath, JSON.stringify(bets, null, 2));

    // Actualizar contador de apuestas en el grupo
    const groups = JSON.parse(fs.readFileSync(GROUPS_DB, 'utf8'));
    const group = groups.find(g => g.invitationCode === groupCode);
    if (group) {
      group.bets = (group.bets || 0) + 1;
      fs.writeFileSync(GROUPS_DB, JSON.stringify(groups, null, 2));
    }

    res.status(201).json({ message: "Apuesta guardada correctamente." });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ message: "Error interno al guardar la apuesta." });
  }
});

app.get('/get-bets', (req, res) => {
  try {
    updateBetsStatus(); // Actualiza estados antes de devolverlas
    const bets = JSON.parse(fs.readFileSync(betsFilePath, 'utf8'));
    res.status(200).json(bets);
  } catch (error) {
    // Manejo de errores...
  }
});

app.post('/set-correct-answer', (req, res) => {
  try {
    const { betId, correctAnswer, username } = req.body;
    const groups = JSON.parse(fs.readFileSync(GROUPS_DB, 'utf8'));
    const bets = JSON.parse(fs.readFileSync(betsFilePath, 'utf8'));

    // Encontrar la apuesta
    const betIndex = bets.findIndex(b => b.id === betId);
    if (betIndex === -1) {
      return res.status(404).json({ message: "Apuesta no encontrada" });
    }

    const bet = bets[betIndex];

    // Verificar que el usuario es el creador de la apuesta
    if (bet.username !== username) {
      return res.status(403).json({ message: "Solo el creador puede marcar la respuesta correcta" });
    }

    // Verificar que la apuesta no está activa
    if (isBetActive(bet.limitDate)) {
      return res.status(400).json({ message: "La apuesta aún está activa" });
    }

    // Verificar que la respuesta existe en las opciones
    if (!bet.options.includes(correctAnswer)) {
      return res.status(400).json({ message: "La respuesta no coincide con las opciones de la apuesta" });
    }

    // Actualizar la apuesta
    bets[betIndex].correctAnswer = correctAnswer;
    fs.writeFileSync(betsFilePath, JSON.stringify(bets, null, 2));

    res.status(200).json({ message: "Respuesta correcta actualizada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar la respuesta correcta" });
  }
});

app.post('/request-account-deletion', (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: 'Nombre de usuario requerido.' });
  }

  const users = JSON.parse(fs.readFileSync(USERS_DB, 'utf8'));
  const userIndex = users.findIndex(u => u.username === username);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'Usuario no encontrado.' });
  }

  users[userIndex].pendingDeletion = true;

  fs.writeFileSync(USERS_DB, JSON.stringify(users, null, 2));
  return res.status(200).json({ message: 'La solicitud de eliminación de cuenta ha sido enviada. Será revisada por el equipo de BetBros.' });
});

app.post('/request-leave-group', (req, res) => {
  const { groupName, username } = req.body;

  if (!groupName || !username) {
    return res.status(400).json({ message: 'Faltan datos para abandonar el grupo.' });
  }

  const groups = JSON.parse(fs.readFileSync(GROUPS_DB, 'utf8'));

  const groupIndex = groups.findIndex(g => g.name === groupName);
  if (groupIndex === -1) {
    return res.status(404).json({ message: 'El grupo no fue encontrado.' });
  }

  const group = groups[groupIndex];

  // Evitar que el creador abandone su propio grupo
  if (group.creator === username) {
    return res.status(403).json({ message: 'El creador no puede abandonar su propio grupo.' });
  }

  // Filtrar al usuario de la lista de miembros
  group.members = group.members.filter(member => member !== username);

  fs.writeFileSync(GROUPS_DB, JSON.stringify(groups, null, 2));

  res.json({ message: `Has abandonado el grupo "${groupName}".` });
});

app.post('/leave-community', (req, res) => {
  const { name, username } = req.body;
  console.log(`Intentando salir de comunidad: ${name}, usuario: ${username}`);

  if (!name || !username) {
    return res.status(400).json({ message: 'Faltan datos' });
  }

  const communities = JSON.parse(fs.readFileSync(COMMUNITIES_DB, 'utf-8'));
  const community = communities.find(c => c.name === name);
  if (!community) {
    return res.status(404).json({ message: 'Comunidad no encontrada' });
  }

  if (!community.members.includes(username)) {
    return res.status(400).json({ message: 'No eres miembro de esta comunidad' });
  }

  console.log(`Miembros antes: ${community.members}`);
  community.members = community.members.filter(member => member !== username);
  console.log(`Miembros después: ${community.members}`);

  try {
    fs.writeFileSync(COMMUNITIES_DB, JSON.stringify(communities, null, 2));
    console.log("Archivo communities.json actualizado");
    res.json({ message: `Has abandonado la comunidad "${name}".` });
  } catch (err) {
    console.error("Error al guardar el archivo:", err);
    res.status(500).json({ message: 'Error al guardar los cambios' });
  }
});

app.get('/group-bets', (req, res) => {
  const groupCode = req.query.groupCode;

  if (!groupCode) {
    return res.status(400).json({ error: 'Falta el código del grupo.' });
  }

  const groups = JSON.parse(fs.readFileSync(GROUPS_DB, 'utf8'));
  const group = groups.find(g => g.invitationCode === groupCode);

  if (!group) {
    return res.status(404).json({ error: 'Grupo no encontrado.' });
  }

  const allBets = JSON.parse(fs.readFileSync(betsFilePath, 'utf8'));
  const groupBets = allBets.filter(b => b.groupCode === groupCode);

  res.json({
    groupName: group.name,
    bets: groupBets
  });
});

app.post('/delete-bet', (req, res) => {
  const { betId, username, groupCode } = req.body;

  if (!betId || !username || !groupCode) {
    return res.status(400).json({ message: 'Datos incompletos.' });
  }

  const bets = JSON.parse(fs.readFileSync(betsFilePath, 'utf8'));

  // Buscar el índice de la apuesta en el array original
  const betIndex = bets.findIndex(
    bet => bet.groupCode === groupCode && bet.id === betId && bet.username === username
  );

  if (betIndex === -1) {
    return res.status(404).json({ message: 'No se encontró la apuesta o no tienes permiso para eliminarla.' });
  }

  // Eliminar la apuesta del array original
  bets.splice(betIndex, 1);

  // Guardar el array actualizado en el archivo
  fs.writeFileSync(betsFilePath, JSON.stringify(bets, null, 2));

  res.json({ message: 'Apuesta eliminada correctamente.' });
});

app.post('/place-bet', (req, res) => {
  const { betId, groupCode, username, selectedOption, amount } = req.body;

  if (!betId || !groupCode || !username || !selectedOption || !amount) {
    return res.status(400).json({ message: 'Datos incompletos.' });
  }

  // Leer el archivo de apuestas y verificar si la apuesta está activa
  const bets = JSON.parse(fs.readFileSync(betsFilePath, 'utf8'));
  const betIndex = bets.findIndex(
    bet => bet.groupCode === groupCode && bet.id === betId 
  );

  const currentDate = new Date();
  const betDeadline = new Date(bets[betIndex].deadline);

  if (currentDate > betDeadline) {
    return res.status(400).json({ message: 'La fecha límite de la apuesta ha pasado. Ya no se puede apostar.' });
  }

  if (betIndex === -1 || !bets[betIndex].isActive) {
    return res.status(400).json({ message: 'Estas apuesta ya no está activa. Se está procesando la respuesta correcta.' });
  }

  // Leer el archivo de usuarios y restar créditos
  const users = JSON.parse(fs.readFileSync(USERS_DB, 'utf8'));
  const userIndex = users.findIndex(user => user.username === username);

  if (userIndex === -1) {
    return res.status(400).json({ message: 'Usuario no encontrado.' });
  }

  if (users[userIndex].creditos < amount) {
    return res.status(400).json({ message: 'Créditos insuficientes para realizar la apuesta.' });
  }

  users[userIndex].creditos -= amount;
  fs.writeFileSync(USERS_DB, JSON.stringify(users, null, 2));

  const newActivity = {
    betId,
    groupCode,
    username,
    selectedOption,
    amount
  };

  let activities = [];
  if (fs.existsSync(activityFilePath)) {
    activities = JSON.parse(fs.readFileSync(activityFilePath, 'utf8'));
  }

  activities.push(newActivity);

  fs.writeFileSync(activityFilePath, JSON.stringify(activities, null, 2));

  res.json({ message: 'Apuesta registrada correctamente.' });
});


app.post('/set-result', (req, res) => {
  const { groupCode, betId, correctAnswer } = req.body;

  if (!groupCode || !betId || !correctAnswer) {
    return res.status(400).json({ message: 'Faltan datos para establecer el resultado.' });
  }

  fs.readFile(betsFilePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error al leer las apuestas.' });

    const bets = JSON.parse(data);
    const betIndex = bets.findIndex(b => b.id === betId && b.groupCode === groupCode);

    if (betIndex === -1) {
      return res.status(404).json({ message: 'Apuesta no encontrada.' });
    }

    bets[betIndex].correctAnswer = correctAnswer;

    fs.writeFile(betsFilePath, JSON.stringify(bets, null, 2), (err) => {
      if (err) return res.status(500).json({ message: 'Error al guardar el resultado.' });

      // ---- Reparto de recompensas ----
      const activities = JSON.parse(fs.readFileSync(activityFilePath, 'utf8'));
      const relevantActivities = activities.filter(
        a => a.betId === betId && a.groupCode === groupCode
      );

      const totalPot = relevantActivities.reduce((sum, a) => sum + Number(a.amount), 0);
      const correctBets = relevantActivities.filter(a => a.selectedOption === correctAnswer);
      const totalCorrectAmount = correctBets.reduce((sum, a) => sum + Number(a.amount), 0);

      if (correctBets.length === 0 || totalCorrectAmount === 0) {
        return res.json({ message: 'Resultado guardado. Nadie acertó la apuesta.' });
      }

      const users = JSON.parse(fs.readFileSync(USERS_DB, 'utf8'));

      // Solo se reparte el bote de los que fallaron como ganancia
      const potFromLosers = totalPot - totalCorrectAmount;

      correctBets.forEach(bet => {
        const userIndex = users.findIndex(u => u.username === bet.username);
        if (userIndex !== -1) {
          const proportion = Number(bet.amount) / totalCorrectAmount;
          const extraReward = Math.round(potFromLosers * proportion);
          const totalReward = Number(bet.amount) + extraReward;

          users[userIndex].creditos += totalReward;
        }
      });

      fs.writeFileSync(USERS_DB, JSON.stringify(users, null, 2));

      return res.json({ message: 'Resultado guardado y recompensas distribuidas correctamente.' });
    });
  });
});

app.post('/get-user', (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: 'Nombre de usuario requerido.' });
  }

  const users = JSON.parse(fs.readFileSync(USERS_DB, 'utf8'));
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado.' });
  }

  res.json(user);
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => {
  res.status(404).send("Página no encontrada");
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3010;
const USERS_DB = path.join(__dirname, 'db', 'users.json');
const GROUPS_DB = path.join(__dirname, 'db', 'groups.json');
const betsFilePath = path.join(__dirname, 'db', 'bets.json');

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

    users.push({ username, email, password, avatar }); // Guardar avatar
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
      options
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

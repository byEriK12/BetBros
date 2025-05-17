const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3010;
const USERS_DB = path.join(__dirname, 'db', 'users.json');
const GROUPS_DB = path.join(__dirname, 'db', 'groups.json');

app.use(bodyParser.json());

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    const users = JSON.parse(fs.readFileSync(USERS_DB, 'utf8'));

    const userExists = users.some(
        (user) => user.username === username || user.email === email
    );

    if (userExists) {
        return res.status(400).json({ message: 'Usuario o correo ya registrado.' });
    }

    users.push({ username, email, password });
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

  res.status(200).json({ message: 'Login exitoso.', username: user.username });
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

  const userGroups = groups.filter(group => group.creator === username); 

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

// Obtener grupos públicos
app.get('/public-groups', (req, res) => {
  try {
    const groups = JSON.parse(fs.readFileSync(GROUPS_DB, 'utf8'));
    const publicGroups = groups.filter(group => group.isPublic === true);
    res.json(publicGroups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al cargar grupos públicos.' });
  }
});

// Unirse a grupo público
app.post('/join-public-group', (req, res) => {
  const { groupName, username } = req.body;

  if (!groupName || !username) {
    return res.status(400).json({ message: "Faltan datos", success: false });
  }

  const groups = JSON.parse(fs.readFileSync(GROUPS_DB, 'utf8'));
  const group = groups.find(g => g.name === groupName);

  if (!group) {
    return res.status(404).json({ message: "Grupo no encontrado", success: false });
  }

  if (!group.members.includes(username)) {
    group.members.push(username);
    fs.writeFileSync(GROUPS_DB, JSON.stringify(groups, null, 2));
  }

  res.json({ message: "Unido al grupo público con éxito.", success: true });
});

// Unirse a grupo privado (por código)
app.post('/join-private-group', (req, res) => {
  const { code, username } = req.body;

  if (!code || !username) {
    return res.status(400).json({ message: "Faltan datos", success: false });
  }

  const groups = JSON.parse(fs.readFileSync(GROUPS_DB, 'utf8'));
  const group = groups.find(g => g.inviteCode === code); // Asegúrate de tener esta propiedad

  if (!group) {
    return res.status(404).json({ message: "Código inválido.", success: false });
  }

  if (!group.members.includes(username)) {
    group.members.push(username);
    fs.writeFileSync(GROUPS_DB, JSON.stringify(groups, null, 2));
  }

  res.json({ message: "Unido al grupo privado con éxito.", success: true });
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => {
  res.status(404).send('Página no encontrada');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

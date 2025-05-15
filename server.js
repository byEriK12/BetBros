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

    res.status(200).json({ message: 'Login exitoso.' });
});

app.post('/create-group', (req, res) => {
  const { name, description, image, creator } = req.body;

  if (name.length > 15) {
    return res.status(400).json({ message: 'El nombre del grupo no puede superar los 15 caracteres.' });
  }

  if (description.length > 100) {
    return res.status(400).json({ message: 'La descripción no puede superar los 100 caracteres.' });
  }

  if (!creator) {
    return res.status(400).json({ message: 'No se ha proporcionado el creador del grupo.' });
  }

  const groups = JSON.parse(fs.readFileSync(GROUPS_DB, 'utf8'));
  const nameExists = groups.some(group => group.name === name);

  if (nameExists) {
    return res.status(400).json({ message: 'Ya existe un grupo con ese nombre.' });
  }

  const newGroup = {
    name,
    description,
    image: image || "", // se puede dejar vacío si no se proporciona
    creator,
    members: [creator],
    createdAt: new Date().toISOString()
  };

  groups.push(newGroup);
  fs.writeFileSync(GROUPS_DB, JSON.stringify(groups, null, 2));

  res.status(201).json({ message: 'Grupo privado creado correctamente.' });
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

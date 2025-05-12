const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3010;
const USERS_DB = path.join(__dirname, 'db', 'users.json');

app.use(bodyParser.json());
app.use(express.static(__dirname));  

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    const users = JSON.parse(fs.readFileSync(USERS_DB, 'utf8'));

    const userExists = users.some(
        (user) => user.username === username || user.email === email
    );

    if (userExists) {
        return res.status(400).json({ message: 'Usuario o correo ya registrado' });
    }

    users.push({ username, email, password });
    fs.writeFileSync(USERS_DB, JSON.stringify(users, null, 2));

    res.status(201).json({ message: 'Usuario registrado correctamente' });
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
        return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    res.status(200).json({ message: 'Login exitoso' });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

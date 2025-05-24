const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// DB Setup
const DB_FILE = path.join(__dirname, 'db.sqlite');
if (!fs.existsSync(DB_FILE)) {
  const db = new sqlite3.Database(DB_FILE);
  db.serialize(() => {
    db.run(`CREATE TABLE users (username TEXT, password TEXT);`);
    db.run(`INSERT INTO users (username, password) VALUES ('admin', 'southend');`);
    db.run(`CREATE TABLE markers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, x REAL, y REAL, floor TEXT);`);
  });
  db.close();
}

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Auth
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  req.db.get(`SELECT * FROM users WHERE username=? AND password=?`, [username, password], (err, row) => {
    if (row) res.cookie('session', 'valid').json({ success: true });
    else res.status(401).json({ error: 'Invalid credentials' });
  });
});

app.use('/api/*', (req, res, next) => {
  if (req.cookies.session === 'valid') return next();
  res.status(403).json({ error: 'Unauthorized' });
});

// Marker API
app.get('/api/markers', (req, res) => {
  req.db.all(`SELECT * FROM markers`, [], (err, rows) => {
    res.json(rows);
  });
});

app.post('/api/markers', (req, res) => {
  const { name, x, y, floor } = req.body;
  req.db.run(`INSERT INTO markers (name, x, y, floor) VALUES (?, ?, ?, ?)`, [name, x, y, floor], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
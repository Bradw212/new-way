const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3001;

const DB_FILE = path.join(__dirname, 'db.sqlite');
if (!fs.existsSync(DB_FILE)) {
  const dbInit = new sqlite3.Database(DB_FILE);
  dbInit.serialize(() => {
    dbInit.run(`CREATE TABLE users (username TEXT, password TEXT);`);
    dbInit.run(`INSERT INTO users (username, password) VALUES ('admin', 'southend');`);
    dbInit.run(`CREATE TABLE markers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      x REAL,
      y REAL,
      floor TEXT
    );`);
  });
  dbInit.close();
}

const db = new sqlite3.Database(DB_FILE);

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username=? AND password=?`, [username, password], (err, row) => {
    if (row) {
      res.cookie('session', 'valid', { httpOnly: true }).json({ success: true });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

app.use('/api/*', (req, res, next) => {
  if (req.cookies.session === 'valid') return next();
  res.status(403).json({ error: 'Unauthorized' });
});

app.get('/api/markers', (req, res) => {
  db.all(`SELECT * FROM markers`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/markers', (req, res) => {
  const { name, x, y, floor } = req.body;
  db.run(`INSERT INTO markers (name, x, y, floor) VALUES (?, ?, ?, ?)`, [name, x, y, floor], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.put('/api/markers/:id', (req, res) => {
  const { name, x, y, floor } = req.body;
  db.run(`UPDATE markers SET name=?, x=?, y=?, floor=? WHERE id=?`, [name, x, y, floor, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.delete('/api/markers/:id', (req, res) => {
  db.run(`DELETE FROM markers WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

const upload = multer({ dest: path.join(frontendPath, 'maps/') });
app.post('/api/upload-map', upload.single('map'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send('No file uploaded');
  res.json({ filename: file.filename, originalname: file.originalname });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
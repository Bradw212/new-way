const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const db = new sqlite3.Database('markers.db');

// Create table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS markers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    x INTEGER,
    y INTEGER,
    floor TEXT
  )`);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Admin login form
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

// Handle login
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'southend') {
    req.session.user = 'admin';
    res.redirect('/admin/dashboard');
  } else {
    res.send('Invalid credentials');
  }
});

// Admin dashboard
app.get('/admin/dashboard', (req, res) => {
  if (req.session.user === 'admin') {
    res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
  } else {
    res.redirect('/admin');
  }
});

// Logout
app.post('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin');
});

// API: Get all markers
app.get('/api/markers', (req, res) => {
  db.all('SELECT * FROM markers', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// API: Add marker
app.post('/api/markers', (req, res) => {
  if (req.session.user !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  const { name, x, y, floor } = req.body;
  db.run(
    'INSERT INTO markers (name, x, y, floor) VALUES (?, ?, ?, ?)',
    [name, x, y, floor],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, x, y, floor });
    }
  );
});

// API: Update marker
app.put('/api/markers/:id', (req, res) => {
  if (req.session.user !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  const { name, x, y, floor } = req.body;
  db.run(
    'UPDATE markers SET name = ?, x = ?, y = ?, floor = ? WHERE id = ?',
    [name, x, y, floor, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// API: Delete marker
app.delete('/api/markers/:id', (req, res) => {
  if (req.session.user !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  db.run('DELETE FROM markers WHERE id = ?', req.params.id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Upload PNG floor maps
const upload = multer({ dest: path.join(__dirname, '../frontend/maps') });
app.post('/api/upload', upload.single('map'), (req, res) => {
  if (req.session.user !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  const floor = req.body.floor || '';
  let targetName = req.file.originalname;
  if (floor) {
    const ext = path.extname(req.file.originalname);
    targetName = floor + ext;
  }
  fs.renameSync(req.file.path, path.join(req.file.destination, targetName));
  res.json({ file: targetName });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

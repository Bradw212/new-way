const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const db = new sqlite3.Database('markers.db');

// Create tables if they don't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    floor TEXT,
    zone TEXT,
    qr_alias TEXT UNIQUE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS markers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    location_id INTEGER,
    x INTEGER,
    y INTEGER,
    floor TEXT,
    FOREIGN KEY(location_id) REFERENCES locations(id)
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

// Admin login
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'southend') {
    req.session.user = 'admin';
    res.redirect('/admin/dashboard');
  } else {
    res.send('Invalid credentials');
  }
});

app.get('/admin/dashboard', (req, res) => {
  if (req.session.user === 'admin') {
    res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
  } else {
    res.redirect('/admin');
  }
});

app.post('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin');
});

// ---- LOCATION API ----

// Get all locations
app.get('/api/locations', (req, res) => {
  db.all('SELECT * FROM locations', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add a new location
app.post('/api/locations', (req, res) => {
  if (req.session.user !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  const { name, floor, zone, qr_alias } = req.body;
  db.run(
    `INSERT INTO locations (name, floor, zone, qr_alias) VALUES (?, ?, ?, ?)`,
    [name, floor, zone, qr_alias],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, floor, zone, qr_alias });
    }
  );
});

// Update a location
app.put('/api/locations/:id', (req, res) => {
  if (req.session.user !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  const { name, floor, zone, qr_alias } = req.body;
  db.run(
    `UPDATE locations SET name = ?, floor = ?, zone = ?, qr_alias = ? WHERE id = ?`,
    [name, floor, zone, qr_alias, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Delete a location
app.delete('/api/locations/:id', (req, res) => {
  if (req.session.user !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  db.run(`DELETE FROM locations WHERE id = ?`, req.params.id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ---- MARKER API ----

// Get all markers
app.get('/api/markers', (req, res) => {
  db.all(`SELECT markers.id, locations.name, markers.x, markers.y, markers.floor, markers.location_id
          FROM markers
          LEFT JOIN locations ON markers.location_id = locations.id`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add a marker (linked to location_id)
app.post('/api/markers', (req, res) => {
  if (req.session.user !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  const { location_id, x, y, floor } = req.body;
  db.run(
    'INSERT INTO markers (location_id, x, y, floor) VALUES (?, ?, ?, ?)',
    [location_id, x, y, floor],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, location_id, x, y, floor });
    }
  );
});

// Update a marker
app.put('/api/markers/:id', (req, res) => {
  if (req.session.user !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  const { location_id, x, y, floor } = req.body;
  db.run(
    `UPDATE markers SET location_id = ?, x = ?, y = ?, floor = ? WHERE id = ?`,
    [location_id, x, y, floor, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Delete a marker
app.delete('/api/markers/:id', (req, res) => {
  if (req.session.user !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  db.run('DELETE FROM markers WHERE id = ?', req.params.id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ---- FILE UPLOAD ----
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

// ---- START SERVER ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

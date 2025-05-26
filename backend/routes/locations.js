// backend/routes/locations.js
const express = require('express');
const router = express.Router();

let locations = [];
let idCounter = 1;

// GET all locations
router.get('/', (req, res) => {
  res.json(locations);
});

// POST single location
router.post('/', (req, res) => {
  const { name, floor, zone, qr_alias } = req.body;
  const newLocation = { id: idCounter++, name, floor, zone, qr_alias, mapped: false };
  locations.push(newLocation);
  res.json(newLocation);
});

// BULK upload
router.post('/bulk', (req, res) => {
  const incoming = req.body;
  incoming.forEach(loc => {
    if (loc.name) {
      locations.push({
        id: idCounter++,
        name: loc.name,
        floor: loc.floor || '',
        zone: loc.zone || '',
        qr_alias: loc.qr_alias || '',
        mapped: false
      });
    }
  });
  res.json({ success: true, count: incoming.length });
});

// DELETE location
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  locations = locations.filter(loc => loc.id !== id);
  res.json({ success: true });
});

module.exports = router;

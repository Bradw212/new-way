// backend/routes/pins.js
const express = require('express');
const router = express.Router();

let pins = []; // stores all pin markers
const locations = require('./locations'); // for reference update

// POST /api/pins — Add a pin to the map
router.post('/', (req, res) => {
  const { location_id, x, y, floor } = req.body;

  // Update the mapped flag in the in-memory locations
  const loc = locations.locations?.find(l => l.id === location_id);
  if (loc) loc.mapped = true;

  pins.push({ id: pins.length + 1, location_id, x, y, floor });
  res.json({ success: true });
});

// GET /api/pins — Get all pins
router.get('/', (req, res) => {
  res.json(pins);
});

// DELETE /api/pins/:id — Remove pin and unmap location
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const pin = pins.find(p => p.id === id);
  if (pin) {
    // Remove pin
    pins = pins.filter(p => p.id !== id);
    // Unmap location
    const loc = locations.locations?.find(l => l.id === pin.location_id);
    if (loc) loc.mapped = false;
  }
  res.json({ success: true });
});

module.exports = router;

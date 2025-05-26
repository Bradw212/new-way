// backend/routes/maps.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('map'), (req, res) => {
  const floor = req.body.floor;
  const mapFile = req.file;

  const targetPath = path.join(__dirname, '../public/maps', `${floor}.png`);

  fs.rename(mapFile.path, targetPath, (err) => {
    if (err) return res.status(500).json({ error: 'File move failed' });
    return res.json({ url: `/maps/${floor}.png` });
  });
});

module.exports = router;

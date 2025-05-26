const express = require('express');
const router = express.Router();

// Stub A* pathfinding logic for demonstration
router.post('/path', (req, res) => {
  const { start, end, blocked } = req.body;

  const path = [start];
  let [x, y] = start;
  while (x !== end[0] || y !== end[1]) {
    if (x < end[0]) x++; else if (x > end[0]) x--;
    if (y < end[1]) y++; else if (y > end[1]) y--;
    if (!blocked.some(([bx, by]) => bx === x && by === y)) {
      path.push([x, y]);
    } else {
      break;
    }
  }

  res.json({ path });
});

module.exports = router;
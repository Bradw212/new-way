const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/maps', express.static(path.join(__dirname, 'public/maps')));

const mapsRoute = require('./routes/maps');
const locationsRoute = require('./routes/locations');
const pinsRoute = require('./routes/pins');

app.use('/api/maps', mapsRoute);
app.use('/api/locations', locationsRoute);
app.use('/api/pins', pinsRoute);

app.get('/', (req, res) => {
  res.send('Hospital Wayfinder API is running.');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
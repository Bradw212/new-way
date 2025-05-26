import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapsPage from './pages/MapsPage';
import WayfindingPage from './pages/WayfindingPage';
import './styles.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
const query = new URLSearchParams(window.location.search);
const qrStart = query.get("qr");

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/admin/maps" element={<MapsPage />} />
        <Route path="/map" element={<WayfindingPage qrStart={qrStart} />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { MapPin, Map } from 'lucide-react';
import LocationsPage from './pages/LocationsPage';
import MapsPage from './pages/MapsPage';

function AdminHome() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/admin/locations" className="bg-white shadow-md rounded-2xl p-8 w-64 h-48 flex flex-col items-center justify-center hover:bg-blue-100 transition">
          <MapPin className="w-12 h-12 text-blue-600 mb-3" />
          <span className="text-lg font-semibold">Manage Locations</span>
        </Link>
        <Link to="/admin/maps" className="bg-white shadow-md rounded-2xl p-8 w-64 h-48 flex flex-col items-center justify-center hover:bg-green-100 transition">
          <Map className="w-12 h-12 text-green-600 mb-3" />
          <span className="text-lg font-semibold">Manage Maps</span>
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/locations" element={<LocationsPage />} />
        <Route path="/admin/maps" element={<MapsPage />} />
      </Routes>
    </Router>
  );
}

export default App;

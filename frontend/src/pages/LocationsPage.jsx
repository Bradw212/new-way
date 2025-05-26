import React, { useEffect, useState } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';

function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({ name: '', floor: '', zone: '', qr_alias: '' });

  const fetchLocations = async () => {
    const res = await fetch('/api/locations');
    const data = await res.json();
    setLocations(data);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setFormData({ name: '', floor: '', zone: '', qr_alias: '' });
    fetchLocations();
  };

  const handleDelete = async (id) => {
    await fetch(`/api/locations/${id}`, { method: 'DELETE' });
    fetchLocations();
  };

  const handleFileUpload = (e) => {
    Papa.parse(e.target.files[0], {
      header: true,
      complete: async function (results) {
        await fetch('/api/locations/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(results.data)
        });
        fetchLocations();
      }
    });
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="flex items-center justify-between mb-6">
        <Link to="/admin" className="text-blue-600 flex items-center">
          <ArrowLeft className="mr-1" /> Back
        </Link>
        <label className="flex items-center cursor-pointer">
          <Upload className="mr-2" /> Import CSV
          <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      <h2 className="text-2xl font-bold mb-4">Manage Locations</h2>

      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required className="border p-2" />
        <input name="floor" value={formData.floor} onChange={handleChange} placeholder="Floor" className="border p-2" />
        <input name="zone" value={formData.zone} onChange={handleChange} placeholder="Zone" className="border p-2" />
        <input name="qr_alias" value={formData.qr_alias} onChange={handleChange} placeholder="QR Alias" className="border p-2" />
        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded col-span-1">Add Location</button>
      </form>

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Floor</th>
            <th className="border p-2">Zone</th>
            <th className="border p-2">QR Alias</th>
            <th className="border p-2">Mapped</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((loc, index) => (
            <tr key={index}>
              <td className="border p-2">{loc.name}</td>
              <td className="border p-2">{loc.floor}</td>
              <td className="border p-2">{loc.zone}</td>
              <td className="border p-2">{loc.qr_alias}</td>
              <td className="border p-2">{loc.mapped ? '✅' : '❌'}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleDelete(loc.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LocationsPage;

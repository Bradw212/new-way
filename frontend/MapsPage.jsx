import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

function MapsPage() {
  const [floor, setFloor] = useState('');
  const [mapSrc, setMapSrc] = useState('');
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    fetch('/api/locations').then(res => res.json()).then(setLocations);
  }, []);

  const handleMapUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('map', file);
    formData.append('floor', floor);
    const res = await fetch('/api/maps', { method: 'POST', body: formData });
    const data = await res.json();
    setMapSrc(data.url);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setFilteredLocations(
      locations.filter(loc => loc.name.toLowerCase().includes(term.toLowerCase()))
    );
  };

  const handleCanvasClick = async (e) => {
    if (!selectedLocation) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    await fetch('/api/pins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location_id: selectedLocation.id, x, y, floor })
    });
    setSelectedLocation(null);
    alert(`Pin placed for ${selectedLocation.name}`);
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="flex items-center justify-between mb-6">
        <Link to="/admin" className="text-blue-600 flex items-center">
          <ArrowLeft className="mr-1" /> Back
        </Link>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Floor (e.g. 1 or Ground)"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            className="border px-2 py-1"
          />
          <label className="flex items-center cursor-pointer">
            <Upload className="mr-2" /> Upload Map
            <input type="file" accept=".png" onChange={handleMapUpload} className="hidden" />
          </label>
        </div>
      </div>

      {mapSrc && (
        <div className="mb-6">
          <div className="mb-2">
            <input
              type="text"
              placeholder="Search location to place pin"
              value={searchTerm}
              onChange={handleSearch}
              className="border px-2 py-1 w-full md:w-1/2"
            />
            {filteredLocations.length > 0 && (
              <ul className="bg-white border max-h-40 overflow-y-auto w-full md:w-1/2">
                {filteredLocations.map(loc => (
                  <li
                    key={loc.id}
                    className="p-2 hover:bg-blue-100 cursor-pointer"
                    onClick={() => setSelectedLocation(loc)}
                  >
                    {loc.name} ({loc.floor})
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative border inline-block">
            <img
              ref={imgRef}
              src={mapSrc}
              alt="Uploaded Map"
              className="max-w-full"
            />
            <canvas
              ref={canvasRef}
              width={imgRef.current?.width || 800}
              height={imgRef.current?.height || 600}
              onClick={handleCanvasClick}
              className="absolute top-0 left-0 z-10"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default MapsPage;

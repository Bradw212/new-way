import React, { useState, useRef } from 'react';
import './MapsPage.css';

export default function MapsPage() {
  const [pins, setPins] = useState([]);
  const [draggedPin, setDraggedPin] = useState(null);
  const mapRef = useRef(null);

  const handleClick = (e) => {
    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newPin = { id: Date.now(), x, y };
    setPins([...pins, newPin]);
  };

  const handleMouseDown = (e, id) => {
    e.stopPropagation();
    setDraggedPin(id);
  };

  const handleMouseMove = (e) => {
    if (draggedPin !== null) {
      const rect = mapRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setPins(pins.map(pin => pin.id === draggedPin ? { ...pin, x, y } : pin));
    }
  };

  const handleMouseUp = () => setDraggedPin(null);

  return (
    <div onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <div className="map-container" onClick={handleClick} ref={mapRef}>
        <img src="/maps/floor1.png" alt="Map" className="map-img" />
        {pins.map(pin => (
          <div key={pin.id}
               className="map-pin"
               onMouseDown={(e) => handleMouseDown(e, pin.id)}
               style={{ left: pin.x, top: pin.y }}>
            📍
          </div>
        ))}
      </div>
    </div>
  );
}
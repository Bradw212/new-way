import React, { useEffect, useState } from 'react';

export default function WayfindingPage({ qrStart }) {
  const [path, setPath] = useState([]);

  useEffect(() => {
    fetch('/api/routing/path', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start: qrStart === 'entrance' ? [0, 0] : [1, 1],
        end: [5, 5],
        blocked: [[2, 2]]
      })
    })
    .then(res => res.json())
    .then(data => setPath(data.path || []));
  }, [qrStart]);

  return (
    <div>
      <h2>Route</h2>
      <pre>{JSON.stringify(path, null, 2)}</pre>
    </div>
  );
}
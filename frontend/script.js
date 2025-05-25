let locations = [];

window.addEventListener('DOMContentLoaded', () => {
  fetch('/api/locations')
    .then(res => res.json())
    .then(data => {
      locations = data;

      const startList = document.getElementById('startList');
      const destList = document.getElementById('destList');
      startList.innerHTML = '';
      destList.innerHTML = '';

      locations.forEach(loc => {
        const opt1 = document.createElement('option');
        opt1.value = loc.name;
        startList.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = loc.name;
        destList.appendChild(opt2);
      });

      // Auto-fill origin if QR param is in URL
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('qr')) {
        const qr = urlParams.get('qr');
        const match = locations.find(l => l.qr_alias === qr);
        if (match) {
          document.getElementById('startInput').value = match.name;
        }
      }
    });
});

// Handle QR scanning
document.getElementById('scanBtn').addEventListener('click', () => {
  document.getElementById('reader').style.display = 'block';
  const html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
  html5QrcodeScanner.render((decodedText) => {
    const match = locations.find(l => l.qr_alias === decodedText);
    if (match) {
      document.getElementById('startInput').value = match.name;
    } else {
      alert("QR code not recognised.");
    }
    html5QrcodeScanner.clear();
    document.getElementById('reader').style.display = 'none';
  }, () => {});
});

// Route logic
document.getElementById('routeBtn').addEventListener('click', () => {
  const startName = document.getElementById('startInput').value;
  const destName = document.getElementById('destInput').value;

  const start = locations.find(l => l.name === startName);
  const dest = locations.find(l => l.name === destName);

  if (!start || !dest) {
    alert('Please select valid start and destination.');
    return;
  }

  if (start.floor !== dest.floor) {
    alert('Start and destination are on different floors.');
    return;
  }

  const canvas = document.getElementById('mapCanvas');
  const ctx = canvas.getContext('2d');
  const mapImage = new Image();
  mapImage.src = '/maps/' + start.floor + '.png';
  mapImage.onload = () => {
    canvas.width = mapImage.width;
    canvas.height = mapImage.height;
    ctx.drawImage(mapImage, 0, 0);

    fetch('/api/markers')
      .then(res => res.json())
      .then(markers => {
        const startMarker = markers.find(m => m.name === start.name);
        const destMarker = markers.find(m => m.name === dest.name);

        if (!startMarker || !destMarker) {
          alert('Markers missing for selected locations.');
          return;
        }

        ctx.beginPath();
        ctx.moveTo(startMarker.x, startMarker.y);
        ctx.lineTo(destMarker.x, destMarker.y);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(startMarker.x, startMarker.y, 5, 0, 2 * Math.PI);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(destMarker.x, destMarker.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      });
  };
});

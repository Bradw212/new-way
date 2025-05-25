let markers = [];

window.addEventListener('DOMContentLoaded', () => {
  fetch('/api/markers')
    .then(res => res.json())
    .then(data => {
      markers = data;
      const startList = document.getElementById('startList');
      const destList = document.getElementById('destList');
      markers.forEach(m => {
        const opt1 = document.createElement('option');
        opt1.value = m.name;
        startList.appendChild(opt1);
        const opt2 = document.createElement('option');
        opt2.value = m.name;
        destList.appendChild(opt2);
      });

      // Check URL param for start
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('start')) {
        document.getElementById('startInput').value = urlParams.get('start');
      }
    })
    .catch(err => console.error('Error loading markers:', err));
});

// QR code scanning
document.getElementById('scanBtn').addEventListener('click', () => {
  document.getElementById('reader').style.display = 'block';
  const html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
  html5QrcodeScanner.render((decodedText, decodedResult) => {
    document.getElementById('startInput').value = decodedText;
    html5QrcodeScanner.clear();
    document.getElementById('reader').style.display = 'none';
  }, error => {
    // Ignore scan errors
  });
});

// Route finder
document.getElementById('routeBtn').addEventListener('click', () => {
  const startName = document.getElementById('startInput').value;
  const destName = document.getElementById('destInput').value;
  const startMarker = markers.find(m => m.name === startName);
  const destMarker = markers.find(m => m.name === destName);

  if (!startMarker || !destMarker) {
    alert('Please select valid start and destination.');
    return;
  }

  if (startMarker.floor !== destMarker.floor) {
    alert('Start and destination are on different floors.');
    return;
  }

  const canvas = document.getElementById('mapCanvas');
  const ctx = canvas.getContext('2d');
  const mapImage = new Image();
  mapImage.src = '/maps/' + startMarker.floor + '.png';
  mapImage.onload = () => {
    canvas.width = mapImage.width;
    canvas.height = mapImage.height;
    ctx.drawImage(mapImage, 0, 0);

    // Draw route line
    ctx.beginPath();
    ctx.moveTo(startMarker.x, startMarker.y);
    ctx.lineTo(destMarker.x, destMarker.y);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw start and end circles
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(startMarker.x, startMarker.y, 5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(destMarker.x, destMarker.y, 5, 0, 2 * Math.PI);
    ctx.fill();
  };
});
let canvas = document.getElementById('mapCanvas');
let ctx = canvas.getContext('2d');
let markers = [];
let selected = null;
let isAdmin = false;
let imageLoaded = false;
let image = new Image();
image.onload = () => {
  ctx.drawImage(image, 0, 0);
  imageLoaded = true;
  drawMarkers();
};

function uploadMap() {
  const file = document.getElementById('mapUpload').files[0];
  const formData = new FormData();
  formData.append('map', file);

  fetch('/api/upload-map', { method: 'POST', body: formData, credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      image.src = '/maps/' + data.filename;
      document.getElementById('mapResult').textContent = 'Map uploaded: ' + data.originalname;
    });
}

function showLogin() {
  document.getElementById('login-box').style.display = 'block';
}

function adminLogin() {
  const username = document.getElementById('user').value;
  const password = document.getElementById('pass').value;
  fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include'
  }).then(res => {
    if (res.ok) {
      alert('Admin logged in');
      isAdmin = true;
      document.getElementById('admin-panel').style.display = 'block';
      loadMarkers();
    } else {
      alert('Invalid login');
    }
  });
}

function drawMarkers() {
  if (!imageLoaded) return;
  ctx.drawImage(image, 0, 0);
  markers.forEach(marker => {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(marker.x, marker.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.fillText(marker.name, marker.x + 10, marker.y + 4);
  });
}

function route() {
  const origin = document.getElementById('origin').value;
  const dest = document.getElementById('destination').value;
  const start = markers.find(m => m.name === origin);
  const end = markers.find(m => m.name === dest);
  if (start && end) {
    drawMarkers();
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  } else {
    alert('Start or end marker not found');
  }
}

canvas.onclick = (e) => {
  if (!isAdmin) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  document.getElementById('markerX')?.value = x.toFixed(0);
  document.getElementById('markerY')?.value = y.toFixed(0);
  selected = { x, y };
};

function saveMarker() {
  const name = document.getElementById('markerName').value;
  const floor = document.getElementById('markerFloor').value;
  if (!selected || !name) {
    alert('Click map and name the marker');
    return;
  }
  fetch('/api/markers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, x: selected.x, y: selected.y, floor }),
    credentials: 'include'
  }).then(res => res.json()).then(() => {
    loadMarkers();
    selected = null;
  });
}

function loadMarkers() {
  fetch('/api/markers', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      markers = data;
      drawMarkers();
      const list = document.getElementById('markerList');
      list.innerHTML = '';
      markers.forEach(m => {
        const li = document.createElement('li');
        li.textContent = `${m.name} (${m.floor})`;
        list.appendChild(li);
      });
    });
}
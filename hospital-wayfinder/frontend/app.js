function route() {
  const origin = document.getElementById('origin').value;
  const dest = document.getElementById('destination').value;
  alert(`Routing from ${origin} to ${dest}`);
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
      document.getElementById('admin-panel').style.display = 'block';
      loadMarkers();
    } else {
      alert('Invalid login');
    }
  });
}

function addMarker() {
  const name = document.getElementById('markerName').value;
  const x = parseFloat(document.getElementById('markerX').value);
  const y = parseFloat(document.getElementById('markerY').value);
  const floor = document.getElementById('markerFloor').value;

  fetch('/api/markers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, x, y, floor }),
    credentials: 'include'
  }).then(res => res.json()).then(loadMarkers);
}

function deleteMarker(id) {
  fetch('/api/markers/' + id, {
    method: 'DELETE',
    credentials: 'include'
  }).then(loadMarkers);
}

function loadMarkers() {
  fetch('/api/markers', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('markerList');
      list.innerHTML = '';
      data.forEach(marker => {
        const li = document.createElement('li');
        li.textContent = `${marker.name} (${marker.x}, ${marker.y}, Floor: ${marker.floor})`;
        const btn = document.createElement('button');
        btn.textContent = 'Delete';
        btn.onclick = () => deleteMarker(marker.id);
        li.appendChild(btn);
        list.appendChild(li);
      });
    });
}

function uploadMap() {
  const fileInput = document.getElementById('mapUpload');
  const formData = new FormData();
  formData.append('map', fileInput.files[0]);

  fetch('/api/upload-map', {
    method: 'POST',
    body: formData,
    credentials: 'include'
  }).then(res => res.json())
    .then(data => {
      document.getElementById('mapResult').textContent = 'Map uploaded: ' + data.originalname;
    });
}
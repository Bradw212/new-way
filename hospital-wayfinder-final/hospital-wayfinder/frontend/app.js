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
    } else {
      alert('Invalid login');
    }
  });
}
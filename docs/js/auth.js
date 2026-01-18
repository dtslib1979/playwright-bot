// Staff Office Authentication
(function() {
  const ACCESS_CODE = '1126';
  const SESSION_KEY = 'staff_access';

  // Check if already authenticated
  if (sessionStorage.getItem(SESSION_KEY) === 'granted') {
    window.location.href = 'office/index.html';
    return;
  }

  const form = document.getElementById('loginForm');
  const input = document.getElementById('passInput');
  const errorMsg = document.getElementById('errorMsg');

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const code = input.value.trim();

    if (code === ACCESS_CODE) {
      sessionStorage.setItem(SESSION_KEY, 'granted');
      window.location.href = 'office/index.html';
    } else {
      errorMsg.textContent = 'Invalid access code';
      input.value = '';
      input.focus();

      // Shake animation
      form.style.animation = 'shake 0.5s';
      setTimeout(() => form.style.animation = '', 500);
    }
  });

  // Focus input on load
  input.focus();
})();

// Shake animation
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
`;
document.head.appendChild(style);

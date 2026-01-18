// Staff Office - Main App
(function() {
  const SESSION_KEY = 'staff_access';

  // Auth check
  if (sessionStorage.getItem(SESSION_KEY) !== 'granted') {
    window.location.href = '../index.html';
    return;
  }

  // Tab switching
  const tabs = document.querySelectorAll('.office-tab');
  const contents = document.querySelectorAll('.office-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });

  // Load gallery
  window.loadGallery = async function() {
    const grid = document.getElementById('galleryGrid');

    try {
      const res = await fetch('../screenshots/index.json');
      const data = await res.json();

      if (!data.screenshots || data.screenshots.length === 0) {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column: 1/-1;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <p>No screenshots yet</p>
            <p style="margin-top:8px;font-size:12px;">Run: node screenshot.js &lt;URL&gt;</p>
          </div>
        `;
        return;
      }

      // Sort by date descending
      const sorted = data.screenshots.sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
      );

      grid.innerHTML = sorted.map(shot => `
        <div class="gallery-item" onclick="openModal('../screenshots/${shot.filename}')">
          <img src="../screenshots/${shot.filename}" alt="${shot.url}" loading="lazy">
          <div class="gallery-item-info">
            <div class="gallery-item-title">${shot.url}</div>
            <div class="gallery-item-meta">${formatDate(shot.timestamp)}</div>
          </div>
        </div>
      `).join('');

      // Update stats
      updateStats(data);

    } catch (err) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>Could not load screenshots</p>
          <p style="margin-top:8px;font-size:12px;">Create screenshots/index.json first</p>
        </div>
      `;
    }
  };

  function updateStats(data) {
    const total = data.screenshots.length;
    document.getElementById('totalShots').textContent = total;

    if (total > 0) {
      const latest = data.screenshots.sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
      )[0];
      document.getElementById('lastCapture').textContent = formatDate(latest.timestamp);

      // Calculate total size
      const totalBytes = data.screenshots.reduce((sum, s) => sum + (s.size || 0), 0);
      document.getElementById('totalSize').textContent = formatSize(totalBytes);
    }

    // Update logs
    updateLogs(data.screenshots);
  }

  function updateLogs(screenshots) {
    const logList = document.getElementById('logList');
    const sorted = screenshots.sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    ).slice(0, 10);

    logList.innerHTML = sorted.map(shot => `
      <div class="log-entry">
        <span class="log-time">${formatTime(shot.timestamp)}</span>
        <span class="log-msg success">Captured: ${shot.url}</span>
      </div>
    `).join('');
  }

  function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // Modal
  window.openModal = function(src) {
    document.getElementById('modalImg').src = src;
    document.getElementById('modal').classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeModal = function() {
    document.getElementById('modal').classList.remove('active');
    document.body.style.overflow = '';
  };

  // Close modal on escape or click outside
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Logout
  window.logout = function() {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = '../index.html';
  };

  // Initial load
  loadGallery();
})();

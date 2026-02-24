// Cursor
(function() {
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (!cursor || !ring) return;
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
  });
  function animate() {
    rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animate);
  }
  animate();
})();

// Mobile nav
(function() {
  const ham = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (ham && links) ham.addEventListener('click', () => links.classList.toggle('open'));
})();

// Scroll reveal
(function() {
  const els = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), e.target.dataset.delay || 0);
      }
    });
  }, { threshold: 0.08 });
  els.forEach(el => obs.observe(el));
})();

// Stagger grids
document.querySelectorAll('.promo-grid,.benefits-grid,.plans-grid,.wash-cards,.fam-grid,.fleet-stats,.stat-blocks,.testi-track').forEach(grid => {
  grid.querySelectorAll('.reveal').forEach((child, i) => {
    child.dataset.delay = i * 100;
  });
});

// Nav scroll effect
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  if (nav) nav.style.borderBottomColor = window.scrollY > 50 ? 'rgba(0,245,255,0.15)' : 'rgba(0,245,255,0.08)';
});

// Cursor
(function() {
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (!cursor || !ring) return;
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
  });
  function animate() {
    rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animate);
  }
  animate();
})();

// Mobile nav
(function() {
  const ham = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (ham && links) ham.addEventListener('click', () => links.classList.toggle('open'));
})();

// Scroll reveal
(function() {
  const els = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), e.target.dataset.delay || 0);
      }
    });
  }, { threshold: 0.08 });
  els.forEach(el => obs.observe(el));
})();

// Stagger grids
document.querySelectorAll('.promo-grid,.benefits-grid,.plans-grid,.wash-cards,.fam-grid,.fleet-stats,.stat-blocks,.testi-track').forEach(grid => {
  grid.querySelectorAll('.reveal').forEach((child, i) => {
    child.dataset.delay = i * 100;
  });
});

// Nav scroll effect
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  if (nav) nav.style.borderBottomColor = window.scrollY > 50 ? 'rgba(0,245,255,0.15)' : 'rgba(0,245,255,0.08)';
});

// Wash card tilt
document.querySelectorAll('.wash-card,.plan-card,.promo-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(700px) rotateY(${x*8}deg) rotateX(${-y*8}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

// Auth & Subscribe with Backend Integration
(function() {
  // API base: prefer window.__API_BASE__ (set by hosting), else use localhost for dev,
  // otherwise use relative paths so deployed frontend talks to same origin.
  // If opening files directly (file:), assume local backend on port 3000.
  const isLocalFile = location.protocol === 'file:';
  const isLocalHost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  const API = (window.__API_BASE__ || (isLocalFile || isLocalHost ? 'http://localhost:3000' : '')).replace(/\/$/, '');

  function api(path) {
    const p = path.startsWith('/') ? path : '/' + path;
    return (API ? API : '') + '/api' + p;
  }
  let currentUser = null;

  // Load user from sessionStorage
  const savedUser = sessionStorage.getItem('currentUser');
  if (savedUser) currentUser = JSON.parse(savedUser);

  // Update Sign-in UI
  function updateSigninUI() {
    const signin = document.querySelector('.nav-signin');
    if (!signin) return;
    if (currentUser) {
      signin.textContent = currentUser.email.split('@')[0];
      signin.style.color = 'var(--cyan)';
    } else {
      signin.textContent = 'Sign In';
      signin.style.color = '';
    }
  }
  updateSigninUI();

  // Sign-in modal removed. Clicking the Sign In link now navigates to the sign-up page when not signed in.
  document.body.addEventListener('click', e => {
    const signin = e.target.closest('.nav-signin');
    if (!signin) return;
    if (currentUser) {
      // Sign out
      currentUser = null;
      sessionStorage.removeItem('currentUser');
      updateSigninUI();
      alert('Signed out');
    } else {
      // Redirect to the standalone signup/signin page
      window.location.href = 'signup.html';
    }
  });

  // Subscribe modal
  const subModal = document.createElement('div');
  subModal.id = 'subscribeModal';
  subModal.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);z-index:20000;visibility:hidden;opacity:0;transition:opacity 0.2s,visibility 0.2s;';
  subModal.innerHTML = `
    <div style="background:var(--panel);border:1px solid var(--border);padding:2rem;border-radius:10px;min-width:340px;max-width:500px;">
      <h3 id="subTitle" style="color:white;margin-bottom:0.5rem;font-family:Orbitron,monospace;"></h3>
      <p id="subAmount" style="color:var(--text);margin-bottom:1.5rem;"></p>
      <div class="form-group" style="margin-bottom:1rem;">
        <label style="display:block;font-size:0.8rem;color:var(--cyan);margin-bottom:0.4rem;">Billing Period</label>
        <select id="subBilling" style="width:100%;padding:0.7rem;border:1px solid rgba(0,245,255,0.2);background:rgba(0,0,0,0.3);color:white;font-family:Rajdhani,sans-serif;"><option value="monthly">Monthly</option><option value="yearly">Yearly (20% off)</option></select>
      </div>
      <div style="display:flex;gap:0.6rem;justify-content:flex-end;">
        <button id="subClose" style="background:transparent;border:1px solid var(--border);padding:0.6rem 0.9rem;color:var(--text);cursor:none;">Cancel</button>
        <button id="subConfirm" style="background:linear-gradient(135deg,var(--blue),var(--cyan));border:none;padding:0.6rem 0.9rem;color:var(--dark);font-weight:700;cursor:none;">Subscribe</button>
      </div>
    </div>
  `;
  document.body.appendChild(subModal);

  function showSub(show, plan, amount) {
    if (show && !currentUser) return alert('Please sign in first');
    document.getElementById('subTitle').textContent = plan || 'Subscribe';
    document.getElementById('subAmount').textContent = amount ? 'Price: ' + amount : '';
    subModal.style.visibility = show ? 'visible' : 'hidden';
    subModal.style.opacity = show ? '1' : '0';
  }

  document.getElementById('subClose').addEventListener('click', () => showSub(false));
  document.getElementById('subConfirm').addEventListener('click', async () => {
    const plan = document.getElementById('subTitle').textContent;
    const billing = document.getElementById('subBilling').value;
    const amountText = document.getElementById('subAmount').textContent;
    const amount = amountText.match(/₦([\d,]+)/)?.[1]?.replace(/,/g, '') || '0';

    try {
      const res = await fetch(api('/subscribe'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, plan, amount: parseFloat(amount), billing })
      });
      const data = await res.json();
      if (data.success) {
        showSub(false);
        alert('Thank you! You are now subscribed to ' + plan);
      } else {
        alert('Subscription failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });

  // Wire plan buttons
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.plan-btn');
    if (!btn) return;
    const plan = btn.dataset.plan || btn.textContent.trim();
    const card = btn.closest('.plan-card');
    let amount = '';
    if (card) {
      const a = card.querySelector('.amount');
      if (a) amount = a.textContent;
    }
    showSub(true, plan, amount);
  });
})();

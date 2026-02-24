const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Database setup
const db = new sqlite3.Database('./aura.db', (err) => {
  if (err) console.error('DB open error:', err);
  else console.log('Connected to SQLite DB');
});

// Create tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL,
      plan TEXT NOT NULL,
      amount REAL NOT NULL,
      billing TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);
});

// Sign up
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const hashedPw = await bcrypt.hash(password, 10);
  db.run(
    'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
    [email, hashedPw, name || ''],
    (err) => {
      if (err) return res.status(400).json({ error: 'Email already exists' });
      res.json({ success: true, message: 'Account created' });
    }
  );
});

// Sign in
app.post('/api/auth/signin', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'User not found' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid password' });
    
    res.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
  });
});

// Subscribe
app.post('/api/subscribe', (req, res) => {
  const { user_id, plan, amount, billing } = req.body;
  if (!user_id || !plan || !amount) return res.status(400).json({ error: 'Missing fields' });

  db.run(
    'INSERT INTO subscriptions (user_id, plan, amount, billing) VALUES (?, ?, ?, ?)',
    [user_id, plan, amount, billing || 'monthly'],
    function(err) {
      if (err) return res.status(400).json({ error: 'Subscription failed' });
      res.json({ success: true, subscription_id: this.lastID });
    }
  );
});

// Get user subscriptions
app.get('/api/subscriptions/:user_id', (req, res) => {
  db.all(
    'SELECT * FROM subscriptions WHERE user_id = ?',
    [req.params.user_id],
    (err, rows) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json(rows || []);
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aurawash';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Schemas
const { Schema } = mongoose;

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
});

const SubscriptionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, required: true },
  amount: { type: Number, required: true },
  billing: { type: String, default: 'monthly' },
  status: { type: String, default: 'active' },
  created_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Subscription = mongoose.model('Subscription', SubscriptionSchema);

// Simple file-backed fallback when MongoDB is not available
const fs = require('fs');
const STORE_PATH = path.join(__dirname, 'data', 'store.json');
function ensureStore() {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(STORE_PATH)) fs.writeFileSync(STORE_PATH, JSON.stringify({ users: [], subscriptions: [] }, null, 2));
}

function readStore() { ensureStore(); return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8')); }
function writeStore(obj) { ensureStore(); fs.writeFileSync(STORE_PATH, JSON.stringify(obj, null, 2)); }

async function adapterFindUserByEmail(email) {
  if (mongoose.connection.readyState === 1) return User.findOne({ email }).lean();
  const store = readStore();
  return store.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase()) || null;
}

async function adapterCreateUser({ email, password, name }) {
  if (mongoose.connection.readyState === 1) {
    const u = new User({ email, password, name });
    await u.save();
    return { id: u._id.toString(), email: u.email, name: u.name };
  }
  const store = readStore();
  const id = `local_${Date.now()}_${Math.floor(Math.random()*10000)}`;
  const user = { id, email, password, name: name || '', created_at: new Date().toISOString() };
  store.users.push(user);
  writeStore(store);
  return { id: user.id, email: user.email, name: user.name };
}

async function adapterFindUserById(id) {
  if (mongoose.connection.readyState === 1) return User.findById(id).lean();
  const store = readStore();
  return store.users.find(u => u.id === id) || null;
}

async function adapterCreateSubscription({ user_id, plan, amount, billing }) {
  if (mongoose.connection.readyState === 1) {
    const sub = new Subscription({ user: user_id, plan, amount, billing });
    await sub.save();
    return { id: sub._id.toString() };
  }
  const store = readStore();
  const id = `local_sub_${Date.now()}_${Math.floor(Math.random()*10000)}`;
  const sub = { id, user: user_id, plan, amount, billing: billing || 'monthly', status: 'active', created_at: new Date().toISOString() };
  store.subscriptions.push(sub);
  writeStore(store);
  return { id: sub.id };
}

async function adapterFindSubscriptionsByUser(user_id) {
  if (mongoose.connection.readyState === 1) return Subscription.find({ user: user_id }).sort({ created_at: -1 }).lean();
  const store = readStore();
  return store.subscriptions.filter(s => s.user === user_id);
}

// Sign up
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const normEmail = email.toLowerCase().trim();
    const existing = await adapterFindUserByEmail(normEmail);
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const hashedPw = await bcrypt.hash(password, 10);
    const created = await adapterCreateUser({ email: normEmail, password: hashedPw, name: name || '' });

    res.json({ success: true, message: 'Account created', user: { id: created.id, email: created.email, name: created.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Sign in
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const normEmail = email.toLowerCase().trim();
    const user = await adapterFindUserByEmail(normEmail);
    if (!user) return res.status(400).json({ error: 'User not found' });

    const storedPw = user.password || user.passwordHash || user.password;
    const valid = await bcrypt.compare(password, storedPw);
    if (!valid) return res.status(400).json({ error: 'Invalid password' });

    res.json({ success: true, user: { id: (user._id || user.id || user._id && user._id.toString()), email: user.email, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Subscribe
app.post('/api/subscribe', async (req, res) => {
  try {
    const { user_id, plan, amount, billing } = req.body;
    if (!user_id || !plan || !amount) return res.status(400).json({ error: 'Missing fields' });
    const user = await adapterFindUserById(user_id);
    if (!user) return res.status(400).json({ error: 'User not found' });

    const created = await adapterCreateSubscription({ user_id: user_id, plan, amount, billing: billing || 'monthly' });
    res.json({ success: true, subscription_id: created.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Subscription failed' });
  }
});

// Get user subscriptions
app.get('/api/subscriptions/:user_id', async (req, res) => {
  try {
    const subs = await adapterFindSubscriptionsByUser(req.params.user_id);
    res.json(subs || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  const state = mongoose.connection.readyState; // 0 = disconnected, 1 = connected
  res.json({ ok: true, mongodb_state: state });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

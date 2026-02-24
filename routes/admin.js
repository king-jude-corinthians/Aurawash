const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const User = require('../models/User');
const ContactRequest = require('../models/ContactRequest');
const { isAdmin } = require('../middleware/auth');

// GET /admin/login - Show login page (NO AUTH REQUIRED)
router.get('/login', (req, res) => {
  res.render('pages/admin-login', { title: 'Admin Login — AURA WASH', error: null });
});

// POST /admin/login - Handle login (NO AUTH REQUIRED)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find admin by username
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.render('pages/admin-login', { title: 'Admin Login — AURA WASH', error: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.render('pages/admin-login', { title: 'Admin Login — AURA WASH', error: 'Invalid credentials' });
    }

    // Set session
    req.session.isAdmin = true;
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    res.render('pages/admin-login', { title: 'Admin Login — AURA WASH', error: 'Login failed' });
  }
});

// GET /admin/logout - Logout (AUTH REQUIRED)
router.get('/logout', isAdmin, (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Session destroy error:', err);
    res.redirect('/admin/login');
  });
});

// GET /admin/dashboard - Dashboard (AUTH REQUIRED)
router.get('/dashboard', isAdmin, async (req, res) => {
  try {
    const totalSignups = await User.countDocuments();
    const newSignups = await User.countDocuments({ status: 'new' });
    const totalContacts = await ContactRequest.countDocuments();
    const unreadContacts = await ContactRequest.countDocuments({ status: 'unread' });

    res.render('pages/admin-dashboard', {
      title: 'Admin Dashboard — AURA WASH',
      totalSignups,
      newSignups,
      totalContacts,
      unreadContacts
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send('Error loading dashboard');
  }
});

// GET /admin/signups - View all signups (AUTH REQUIRED)
router.get('/signups', isAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.render('pages/admin-signups', {
      title: 'User Signups — AURA WASH',
      users
    });
  } catch (error) {
    console.error('Signups error:', error);
    res.status(500).send('Error loading signups');
  }
});

// POST /admin/signups/:id/status - Update signup status (AUTH REQUIRED)
router.post('/signups/:id/status', isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    await User.findByIdAndUpdate(req.params.id, { status });
    res.redirect('/admin/signups');
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).send('Error updating status');
  }
});

// DELETE /admin/signups/:id - Delete signup (AUTH REQUIRED)
router.delete('/signups/:id', isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.redirect('/admin/signups');
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).send('Error deleting signup');
  }
});

// GET /admin/contacts - View all contacts (AUTH REQUIRED)
router.get('/contacts', isAdmin, async (req, res) => {
  try {
    const contacts = await ContactRequest.find().sort({ createdAt: -1 });
    res.render('pages/admin-contacts', {
      title: 'Contact Requests — AURA WASH',
      contacts
    });
  } catch (error) {
    console.error('Contacts error:', error);
    res.status(500).send('Error loading contacts');
  }
});

// POST /admin/contacts/:id/status - Update contact status (AUTH REQUIRED)
router.post('/contacts/:id/status', isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    await ContactRequest.findByIdAndUpdate(req.params.id, { status });
    res.redirect('/admin/contacts');
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).send('Error updating status');
  }
});

// DELETE /admin/contacts/:id - Delete contact (AUTH REQUIRED)
router.delete('/contacts/:id', isAdmin, async (req, res) => {
  try {
    await ContactRequest.findByIdAndDelete(req.params.id);
    res.redirect('/admin/contacts');
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).send('Error deleting contact');
  }
});

module.exports = router;

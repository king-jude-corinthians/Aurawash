const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /signup
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, plan } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.redirect('/signup?error=true');
    }

    // Create and save new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      phone: phone || '',
      plan: plan || ''
    });

    await newUser.save();
    res.redirect('/signup?success=true');
  } catch (error) {
    console.error('Signup error:', error);
    res.redirect('/signup?error=true');
  }
});

module.exports = router;

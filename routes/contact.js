const express = require('express');
const router = express.Router();
const ContactRequest = require('../models/ContactRequest');

// POST /contact
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.redirect('/contact?error=true');
    }

    // Create and save new contact request
    const newContact = new ContactRequest({
      name,
      email,
      phone: phone || '',
      subject: subject || '',
      message
    });

    await newContact.save();
    res.redirect('/contact?success=true');
  } catch (error) {
    console.error('Contact error:', error);
    res.redirect('/contact?error=true');
  }
});

module.exports = router;

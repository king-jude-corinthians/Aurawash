const express = require('express');
const router = express.Router();

// All public pages
router.get('/', (req, res) => {
  res.render('pages/home', { title: 'AURA WASH — Future of Clean' });
});

router.get('/about', (req, res) => {
  res.render('pages/about', { title: 'About Us — AURA WASH' });
});

router.get('/services', (req, res) => {
  res.render('pages/services', { title: 'Washes — AURA WASH' });
});

router.get('/memberships', (req, res) => {
  res.render('pages/memberships', { title: 'Memberships — AURA WASH' });
});

router.get('/locations', (req, res) => {
  res.render('pages/locations', { title: 'Locations — AURA WASH' });
});

router.get('/contact', (req, res) => {
  res.render('pages/contact', {
    title: 'Contact Us — AURA WASH',
    success: req.query.success === 'true',
    error: req.query.error === 'true'
  });
});

router.get('/careers', (req, res) => {
  res.render('pages/careers', { title: 'Careers — AURA WASH' });
});

router.get('/gift-cards', (req, res) => {
  res.render('pages/gift-cards', { title: 'Gift Cards — AURA WASH' });
});

router.get('/family-plan', (req, res) => {
  res.render('pages/family-plan', { title: 'Family Plan — AURA WASH' });
});

router.get('/fleet', (req, res) => {
  res.render('pages/fleet', { title: 'Fleet Accounts — AURA WASH' });
});

router.get('/aaa-discount', (req, res) => {
  res.render('pages/aaa-discount', { title: 'AAA Discount — AURA WASH' });
});

router.get('/impact', (req, res) => {
  res.render('pages/impact', { title: 'Our Impact — AURA WASH' });
});

router.get('/signup', (req, res) => {
  res.render('pages/signup', {
    title: 'Sign Up — AURA WASH',
    success: req.query.success === 'true',
    error: req.query.error === 'true'
  });
});

module.exports = router;

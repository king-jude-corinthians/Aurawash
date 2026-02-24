// Middleware to check if admin is logged in
const isAdmin = (req, res, next) => {
  if (req.session && req.session.isAdmin === true) {
    return next();
  }
  res.redirect('/admin/login');
};

module.exports = { isAdmin };

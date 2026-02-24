const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const methodOverride = require('method-override');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aurawash', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✓ Connected to MongoDB'))
.catch((err) => console.error('✗ MongoDB connection error:', err));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('./public'));
app.use(methodOverride('_method'));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'aurawash_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

// Routes
const indexRouter = require('./routes/index');
const signupRouter = require('./routes/signup');
const contactRouter = require('./routes/contact');
const adminRouter = require('./routes/admin');

app.use('/', indexRouter);
app.use('/signup', signupRouter);
app.use('/contact', contactRouter);
app.use('/admin', adminRouter);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚗 AURA WASH server running on http://localhost:${PORT}`);
  console.log(`🔐 Admin login: http://localhost:${PORT}/admin/login\n`);
});

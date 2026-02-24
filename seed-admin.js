const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aurawash', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✓ Connected to MongoDB'))
.catch((err) => {
  console.error('✗ MongoDB connection error:', err);
  process.exit(1);
});

// Admin Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', adminSchema);

// Seed function
async function seedAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('✓ Admin account already exists');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin
    const admin = new Admin({
      username: 'admin',
      password: hashedPassword
    });

    await admin.save();
    console.log('✓ Admin account created successfully!');
    console.log('✓ Username: admin');
    console.log('✓ Password: admin123');
    console.log('\n⚠️  IMPORTANT: Change your password immediately after first login!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error creating admin account:', error);
    process.exit(1);
  }
}

seedAdmin();

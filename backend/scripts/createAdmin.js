/**
 * Create an admin user. Run: node scripts/createAdmin.js
 * Usage: node scripts/createAdmin.js [email] [password] [name]
 * Example: node scripts/createAdmin.js admin@example.com secret123 "Admin User"
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const email = process.argv[2] || 'admin@example.com';
const password = process.argv[3] || 'admin123';
const name = process.argv[4] || 'Admin';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/project_management');
  let user = await User.findOne({ email });
  if (user) {
    user.role = 'admin';
    user.password = password; // will be re-hashed by pre-save
    await user.save();
    console.log('Updated existing user to admin:', email);
  } else {
    user = await User.create({ name, email, password, role: 'admin' });
    console.log('Created admin user:', email);
  }
  console.log('Done. You can login with this email and password.');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

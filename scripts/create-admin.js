// scripts/create-admin.js
import mongoose from 'mongoose';
import User from '../backend/models/User.js';

async function createAdmin() {
  await mongoose.connect('mongodb://localhost:27017/mep-projects');
  
  const admin = new User({
    email: 'admin@mep-projects.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'MEP',
    role: 'admin'
  });
  
  await admin.save();
  console.log('✅ Admin creado: admin@mep-projects.com / admin123');
  process.exit(0);
}

createAdmin();
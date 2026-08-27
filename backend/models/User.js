const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['student', 'lecturer', 'security', 'admin'] },
  email: { type: String, required: true },
  contact: { type: String, default: '' },
  registrationNo: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

module.exports = mongoose.model('User', UserSchema);

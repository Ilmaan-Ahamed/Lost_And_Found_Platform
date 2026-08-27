const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: String, required: true },
  type: { type: String, required: true, enum: ['lost', 'found'] },
  photoUrl: { type: String, default: '' },
  reportedBy: { type: String, required: true },
  reportedByName: { type: String, required: true },
  status: { type: String, default: 'available' },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

module.exports = mongoose.model('Item', ItemSchema);

const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  itemId: { type: String, required: true },
  itemTitle: { type: String, default: '' },
  claimedBy: { type: String, required: true },
  claimedByName: { type: String, required: true },
  verificationProof: { type: String, required: true },
  status: { type: String, default: 'pending' },
  rejectReason: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

module.exports = mongoose.model('Claim', ClaimSchema);

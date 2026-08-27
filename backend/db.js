const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Item = require('./models/Item');
const Claim = require('./models/Claim');
const Notification = require('./models/Notification');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // We won't exit here so server.js can decide, but functions should fail if not connected.
}

const hashPassword = (password) => bcrypt.hashSync(password, 10);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const connect = async () => {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set in environment variables');
  }

  await mongoose.connect(MONGODB_URI, { dbName: undefined });

  // Ensure indexes
  await Promise.all([
    User.init(),
    Item.init(),
    Claim.init(),
    Notification.init()
  ]);

  await seedInitialData();
};

const seedInitialData = async () => {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    await User.insertMany([
      { id: 'u1', username: 'admin', password: hashPassword('admin123'), role: 'admin', email: 'admin@sltc.lk', contact: '+94 77 123 4567', registrationNo: 'ADM-001', createdAt: new Date().toISOString() },
      { id: 'u2', username: 'student1', password: hashPassword('student123'), role: 'student', email: 'student1@sltc.lk', contact: '+94 71 987 6543', registrationNo: 'CIT-24-01-0369', createdAt: new Date().toISOString() },
      { id: 'u3', username: 'lecturer1', password: hashPassword('lecturer123'), role: 'lecturer', email: 'lecturer1@sltc.lk', contact: '+94 72 456 7890', registrationNo: 'LEC-022', createdAt: new Date().toISOString() },
      { id: 'u4', username: 'security', password: hashPassword('security123'), role: 'security', email: 'security@sltc.lk', contact: '+94 75 111 2222', registrationNo: 'SEC-101', createdAt: new Date().toISOString() }
    ]);
  }

  const itemCount = await Item.countDocuments();
  if (itemCount === 0) {
    await Item.insertMany([
      { id: 'i1', title: 'Student ID Card', description: 'Found a student ID card on the main desk of the central library. Belongs to MJ.Ilmaan Ahamed.', category: 'Documents', location: 'Library', date: '2026-07-15', type: 'found', photoUrl: '', reportedBy: 'u4', reportedByName: 'security', status: 'available', createdAt: new Date(Date.now() - 24 * 3600000).toISOString() },
      { id: 'i2', title: 'Dell Laptop Charger', description: 'Lost my Dell laptop charger (65W, black) probably in Hall B during the morning lecture.', category: 'Electronics', location: 'Lecture Hall B', date: '2026-07-16', type: 'lost', photoUrl: '', reportedBy: 'u2', reportedByName: 'student1', status: 'available', createdAt: new Date().toISOString() },
      { id: 'i3', title: 'Stainless Steel Water Bottle', description: 'Silver thermos bottle found in the university gymnasium near the treadmills. It has a green sticker.', category: 'Personal Accessories', location: 'Gymnasium', date: '2026-07-14', type: 'found', photoUrl: '', reportedBy: 'u3', reportedByName: 'lecturer1', status: 'available', createdAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString() },
      { id: 'i4', title: 'Keys with Red Keychain', description: 'Lost my hostel/room keys with a red SLTC circular keychain. Might have dropped them walking from Hostel A to Canteen.', category: 'Keys', location: 'Pathway/Canteen', date: '2026-07-16', type: 'lost', photoUrl: '', reportedBy: 'u2', reportedByName: 'student1', status: 'available', createdAt: new Date().toISOString() }
    ]);
  }

  const notificationCount = await Notification.countDocuments();
  if (notificationCount === 0) {
    await Notification.create({ id: 'n1', userId: 'u2', message: 'Welcome to the SLTC Lost & Found portal! You can now report lost or found items.', type: 'system', isRead: false, createdAt: new Date().toISOString() });
  }
};

module.exports = {
  connect,
  getUsers: async () => User.find({}).lean(),
  getUserById: async (id) => User.findOne({ id }).lean(),
  getUserByUsername: async (username) => User.findOne({ username: new RegExp(`^${escapeRegex(username)}$`, 'i') }).lean(),
  createUser: async (user) => {
    const newUser = {
      id: 'u_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      ...user,
      password: hashPassword(user.password)
    };
    const doc = await User.create(newUser);
    return doc.toObject();
  },
  getItems: async () => Item.find({}).lean(),
  getItemById: async (id) => Item.findOne({ id }).lean(),
  createItem: async (item) => {
    const newItem = {
      id: 'i_' + Math.random().toString(36).substr(2, 9),
      status: 'available',
      createdAt: new Date().toISOString(),
      ...item
    };
    const created = await Item.create(newItem);

    if (newItem.type === 'found') {
      const lostMatches = await Item.find({ type: 'lost', status: 'available', category: new RegExp(`^${escapeRegex(newItem.category)}$`, 'i'), reportedBy: { $ne: newItem.reportedBy } }).lean();
      for (const match of lostMatches) {
        await Notification.create({ id: 'n_' + Math.random().toString(36).substr(2, 9), userId: match.reportedBy, message: `A found item matching your lost "${match.title}" has been reported: "${newItem.title}" at ${newItem.location}.`, type: 'match_alert', isRead: false, createdAt: new Date().toISOString() });
      }
    }

    return created.toObject();
  },
  updateItem: async (id, updates) => {
    const item = await Item.findOne({ id }).lean();
    if (!item) return null;
    const updated = await Item.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    return updated;
  },
  deleteItem: async (id) => {
    await Item.deleteOne({ id });
    return true;
  },
  getClaims: async () => Claim.find({}).lean(),
  getClaimById: async (id) => Claim.findOne({ id }).lean(),
  createClaim: async (claim) => {
    const newClaim = {
      id: 'c_' + Math.random().toString(36).substr(2, 9),
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...claim
    };
    const created = await Claim.create(newClaim);

    const item = await Item.findOne({ id: claim.itemId });
    if (item) {
      await Item.updateOne({ id: claim.itemId }, { $set: { status: 'claimed' } });
    }

    const admins = await User.find({ role: { $in: ['admin', 'security'] } }).lean();
    for (const admin of admins) {
      await Notification.create({ id: 'n_' + Math.random().toString(36).substr(2, 9), userId: admin.id, message: `New claim request submitted by ${claim.claimedByName} for "${item?.title || 'Item'}".`, type: 'claim_alert', isRead: false, createdAt: new Date().toISOString() });
    }

    return created.toObject();
  },
  updateClaimStatus: async (claimId, status, rejectReason = '') => {
    const claim = await Claim.findOne({ id: claimId }).lean();
    if (!claim) return null;

    const updates = { status };
    if (rejectReason) updates.rejectReason = rejectReason;

    await Claim.updateOne({ id: claimId }, { $set: updates });

    const item = await Item.findOne({ id: claim.itemId }).lean();
    if (status === 'approved') {
      if (item) await Item.updateOne({ id: claim.itemId }, { $set: { status: 'returned' } });

      await Notification.create({ id: 'n_' + Math.random().toString(36).substr(2, 9), userId: claim.claimedBy, message: `Your claim for "${item ? item.title : 'item'}" has been APPROVED! Please visit the Security office to collect your item.`, type: 'claim_update', isRead: false, createdAt: new Date().toISOString() });

      const otherPendingClaims = await Claim.find({ itemId: claim.itemId, id: { $ne: claimId }, status: 'pending' }).lean();
      for (const pendingClaim of otherPendingClaims) {
        await Claim.updateOne({ id: pendingClaim.id }, { $set: { status: 'rejected', rejectReason: 'Item has been returned to another claimant.' } });
        await Notification.create({ id: 'n_' + Math.random().toString(36).substr(2, 9), userId: pendingClaim.claimedBy, message: `Your claim for "${item ? item.title : 'item'}" was rejected. Item has been returned to another claimant.`, type: 'claim_update', isRead: false, createdAt: new Date().toISOString() });
      }
    } else if (status === 'rejected') {
      const otherPendingClaims = await Claim.countDocuments({ itemId: claim.itemId, id: { $ne: claimId }, status: 'pending' });
      if (item && otherPendingClaims === 0) {
        await Item.updateOne({ id: claim.itemId }, { $set: { status: 'available' } });
      }

      await Notification.create({ id: 'n_' + Math.random().toString(36).substr(2, 9), userId: claim.claimedBy, message: `Your claim for "${item ? item.title : 'item'}" has been REJECTED. Reason: ${rejectReason || 'Insufficient proof.'}`, type: 'claim_update', isRead: false, createdAt: new Date().toISOString() });
    }

    return { ...claim, ...updates };
  },
  getNotifications: async (userId) => Notification.find({ userId }).sort({ createdAt: -1 }).lean(),
  markNotificationAsRead: async (id) => {
    const res = await Notification.updateOne({ id }, { $set: { isRead: true } });
    return res.modifiedCount > 0;
  },
  clearNotifications: async (userId) => {
    await Notification.deleteMany({ userId });
    return true;
  }
};

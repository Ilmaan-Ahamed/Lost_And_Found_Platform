const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sltc-lost-and-found';

let client;
let database;
let connectPromise;

const hashPassword = (password) => bcrypt.hashSync(password, 10);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const connectToDatabase = async () => {
  if (database) {
    return database;
  }

  if (!connectPromise) {
    connectPromise = (async () => {
      client = new MongoClient(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000
      });

      await client.connect();
      database = client.db();

      await Promise.all([
        database.collection('users').createIndex({ username: 1 }, { unique: true }),
        database.collection('users').createIndex({ id: 1 }, { unique: true }),
        database.collection('items').createIndex({ id: 1 }, { unique: true }),
        database.collection('claims').createIndex({ id: 1 }, { unique: true }),
        database.collection('notifications').createIndex({ id: 1 }, { unique: true })
      ]);

      await seedInitialData();
      return database;
    })().catch((error) => {
      connectPromise = null;
      throw error;
    });
  }

  return connectPromise;
};

const seedInitialData = async () => {
  const users = database.collection('users');
  const items = database.collection('items');
  const notifications = database.collection('notifications');

  const userCount = await users.countDocuments();
  if (userCount === 0) {
    await users.insertMany([
      {
        id: 'u1',
        username: 'admin',
        password: hashPassword('admin123'),
        role: 'admin',
        email: 'admin@sltc.lk',
        contact: '+94 77 123 4567',
        registrationNo: 'ADM-001',
        createdAt: new Date().toISOString()
      },
      {
        id: 'u2',
        username: 'student1',
        password: hashPassword('student123'),
        role: 'student',
        email: 'student1@sltc.lk',
        contact: '+94 71 987 6543',
        registrationNo: 'CIT-24-01-0369',
        createdAt: new Date().toISOString()
      },
      {
        id: 'u3',
        username: 'lecturer1',
        password: hashPassword('lecturer123'),
        role: 'lecturer',
        email: 'lecturer1@sltc.lk',
        contact: '+94 72 456 7890',
        registrationNo: 'LEC-022',
        createdAt: new Date().toISOString()
      },
      {
        id: 'u4',
        username: 'security',
        password: hashPassword('security123'),
        role: 'security',
        email: 'security@sltc.lk',
        contact: '+94 75 111 2222',
        registrationNo: 'SEC-101',
        createdAt: new Date().toISOString()
      }
    ]);
  }

  const itemCount = await items.countDocuments();
  if (itemCount === 0) {
    await items.insertMany([
      {
        id: 'i1',
        title: 'Student ID Card',
        description: 'Found a student ID card on the main desk of the central library. Belongs to MJ.Ilmaan Ahamed.',
        category: 'Documents',
        location: 'Library',
        date: '2026-07-15',
        type: 'found',
        photoUrl: '',
        reportedBy: 'u4',
        reportedByName: 'security',
        status: 'available',
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
      },
      {
        id: 'i2',
        title: 'Dell Laptop Charger',
        description: 'Lost my Dell laptop charger (65W, black) probably in Hall B during the morning lecture.',
        category: 'Electronics',
        location: 'Lecture Hall B',
        date: '2026-07-16',
        type: 'lost',
        photoUrl: '',
        reportedBy: 'u2',
        reportedByName: 'student1',
        status: 'available',
        createdAt: new Date().toISOString()
      },
      {
        id: 'i3',
        title: 'Stainless Steel Water Bottle',
        description: 'Silver thermos bottle found in the university gymnasium near the treadmills. It has a green sticker.',
        category: 'Personal Accessories',
        location: 'Gymnasium',
        date: '2026-07-14',
        type: 'found',
        photoUrl: '',
        reportedBy: 'u3',
        reportedByName: 'lecturer1',
        status: 'available',
        createdAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString()
      },
      {
        id: 'i4',
        title: 'Keys with Red Keychain',
        description: 'Lost my hostel/room keys with a red SLTC circular keychain. Might have dropped them walking from Hostel A to Canteen.',
        category: 'Keys',
        location: 'Pathway/Canteen',
        date: '2026-07-16',
        type: 'lost',
        photoUrl: '',
        reportedBy: 'u2',
        reportedByName: 'student1',
        status: 'available',
        createdAt: new Date().toISOString()
      }
    ]);
  }

  const notificationCount = await notifications.countDocuments();
  if (notificationCount === 0) {
    await notifications.insertOne({
      id: 'n1',
      userId: 'u2',
      message: 'Welcome to the SLTC Lost & Found portal! You can now report lost or found items.',
      type: 'system',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }
};

const getCollection = async (name) => {
  const db = await connectToDatabase();
  return db.collection(name);
};

module.exports = {
  connect: connectToDatabase,
  getUsers: async () => {
    const users = await getCollection('users');
    return users.find({}).toArray();
  },
  getUserById: async (id) => {
    const users = await getCollection('users');
    return users.findOne({ id });
  },
  getUserByUsername: async (username) => {
    const users = await getCollection('users');
    return users.findOne({
      username: { $regex: `^${escapeRegex(username)}$`, $options: 'i' }
    });
  },
  createUser: async (user) => {
    const users = await getCollection('users');
    const newUser = {
      id: 'u_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      ...user,
      password: hashPassword(user.password)
    };
    await users.insertOne(newUser);
    return newUser;
  },
  getItems: async () => {
    const items = await getCollection('items');
    return items.find({}).toArray();
  },
  getItemById: async (id) => {
    const items = await getCollection('items');
    return items.findOne({ id });
  },
  createItem: async (item) => {
    const items = await getCollection('items');
    const notifications = await getCollection('notifications');
    const users = await getCollection('users');

    const newItem = {
      id: 'i_' + Math.random().toString(36).substr(2, 9),
      status: 'available',
      createdAt: new Date().toISOString(),
      ...item
    };

    await items.insertOne(newItem);

    if (newItem.type === 'found') {
      const lostMatches = await items.find({
        type: 'lost',
        status: 'available',
        category: { $regex: `^${escapeRegex(newItem.category)}$`, $options: 'i' },
        reportedBy: { $ne: newItem.reportedBy }
      }).toArray();

      for (const match of lostMatches) {
        await notifications.insertOne({
          id: 'n_' + Math.random().toString(36).substr(2, 9),
          userId: match.reportedBy,
          message: `A found item matching your lost "${match.title}" has been reported: "${newItem.title}" at ${newItem.location}.`,
          type: 'match_alert',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    }

    return newItem;
  },
  updateItem: async (id, updates) => {
    const items = await getCollection('items');
    const item = await items.findOne({ id });
    if (!item) {
      return null;
    }

    const updatedItem = { ...item, ...updates };
    await items.updateOne({ id }, { $set: updatedItem });
    return updatedItem;
  },
  deleteItem: async (id) => {
    const items = await getCollection('items');
    await items.deleteOne({ id });
    return true;
  },
  getClaims: async () => {
    const claims = await getCollection('claims');
    return claims.find({}).toArray();
  },
  getClaimById: async (id) => {
    const claims = await getCollection('claims');
    return claims.findOne({ id });
  },
  createClaim: async (claim) => {
    const claims = await getCollection('claims');
    const items = await getCollection('items');
    const notifications = await getCollection('notifications');
    const users = await getCollection('users');

    const newClaim = {
      id: 'c_' + Math.random().toString(36).substr(2, 9),
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...claim
    };

    await claims.insertOne(newClaim);

    const item = await items.findOne({ id: claim.itemId });
    if (item) {
      await items.updateOne({ id: claim.itemId }, { $set: { status: 'claimed' } });
    }

    const admins = await users.find({ role: { $in: ['admin', 'security'] } }).toArray();
    for (const admin of admins) {
      await notifications.insertOne({
        id: 'n_' + Math.random().toString(36).substr(2, 9),
        userId: admin.id,
        message: `New claim request submitted by ${claim.claimedByName} for "${item?.title || 'Item'}".`,
        type: 'claim_alert',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    return newClaim;
  },
  updateClaimStatus: async (claimId, status, rejectReason = '') => {
    const claims = await getCollection('claims');
    const items = await getCollection('items');
    const notifications = await getCollection('notifications');

    const claim = await claims.findOne({ id: claimId });
    if (!claim) {
      return null;
    }

    const updates = { status };
    if (rejectReason) {
      updates.rejectReason = rejectReason;
    }

    await claims.updateOne({ id: claimId }, { $set: updates });

    const item = await items.findOne({ id: claim.itemId });
    if (status === 'approved') {
      if (item) {
        await items.updateOne({ id: claim.itemId }, { $set: { status: 'returned' } });
      }

      await notifications.insertOne({
        id: 'n_' + Math.random().toString(36).substr(2, 9),
        userId: claim.claimedBy,
        message: `Your claim for "${item ? item.title : 'item'}" has been APPROVED! Please visit the Security office to collect your item.`,
        type: 'claim_update',
        isRead: false,
        createdAt: new Date().toISOString()
      });

      const otherPendingClaims = await claims.find({
        itemId: claim.itemId,
        id: { $ne: claimId },
        status: 'pending'
      }).toArray();

      for (const pendingClaim of otherPendingClaims) {
        await claims.updateOne({ id: pendingClaim.id }, { $set: { status: 'rejected', rejectReason: 'Item has been returned to another claimant.' } });
        await notifications.insertOne({
          id: 'n_' + Math.random().toString(36).substr(2, 9),
          userId: pendingClaim.claimedBy,
          message: `Your claim for "${item ? item.title : 'item'}" was rejected. Item has been returned to another claimant.`,
          type: 'claim_update',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    } else if (status === 'rejected') {
      const otherPendingClaims = await claims.countDocuments({
        itemId: claim.itemId,
        id: { $ne: claimId },
        status: 'pending'
      });

      if (item && otherPendingClaims === 0) {
        await items.updateOne({ id: claim.itemId }, { $set: { status: 'available' } });
      }

      await notifications.insertOne({
        id: 'n_' + Math.random().toString(36).substr(2, 9),
        userId: claim.claimedBy,
        message: `Your claim for "${item ? item.title : 'item'}" has been REJECTED. Reason: ${rejectReason || 'Insufficient proof.'}`,
        type: 'claim_update',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    return { ...claim, ...updates };
  },
  getNotifications: async (userId) => {
    const notifications = await getCollection('notifications');
    return notifications.find({ userId }).sort({ createdAt: -1 }).toArray();
  },
  markNotificationAsRead: async (id) => {
    const notifications = await getCollection('notifications');
    const result = await notifications.updateOne({ id }, { $set: { isRead: true } });
    return result.modifiedCount > 0;
  },
  clearNotifications: async (userId) => {
    const notifications = await getCollection('notifications');
    await notifications.deleteMany({ userId });
    return true;
  }
};

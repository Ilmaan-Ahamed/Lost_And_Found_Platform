const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default state
const defaultDb = {
  users: [],
  items: [],
  claims: [],
  notifications: []
};

// Helper to hash password synchronously
const hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

// Initialize DB if empty
if (!fs.existsSync(DATA_FILE)) {
  // Pre-populate with admin, student, security users and some mock lost/found items
  const initialUsers = [
    {
      id: "u1",
      username: "admin",
      password: hashPassword("admin123"),
      role: "admin",
      email: "admin@sltc.lk",
      contact: "+94 77 123 4567",
      registrationNo: "ADM-001",
      createdAt: new Date().toISOString()
    },
    {
      id: "u2",
      username: "student1",
      password: hashPassword("student123"),
      role: "student",
      email: "student1@sltc.lk",
      contact: "+94 71 987 6543",
      registrationNo: "CIT-24-01-0369",
      createdAt: new Date().toISOString()
    },
    {
      id: "u3",
      username: "lecturer1",
      password: hashPassword("lecturer123"),
      role: "lecturer",
      email: "lecturer1@sltc.lk",
      contact: "+94 72 456 7890",
      registrationNo: "LEC-022",
      createdAt: new Date().toISOString()
    },
    {
      id: "u4",
      username: "security",
      password: hashPassword("security123"),
      role: "security",
      email: "security@sltc.lk",
      contact: "+94 75 111 2222",
      registrationNo: "SEC-101",
      createdAt: new Date().toISOString()
    }
  ];

  const initialItems = [
    {
      id: "i1",
      title: "Student ID Card",
      description: "Found a student ID card on the main desk of the central library. Belongs to MJ.Ilmaan Ahamed.",
      category: "Documents",
      location: "Library",
      date: "2026-07-15",
      type: "found",
      photoUrl: "",
      reportedBy: "u4",
      reportedByName: "security",
      status: "available",
      createdAt: new Date(Date.now() - 24 * 3600000).toISOString() // 1 day ago
    },
    {
      id: "i2",
      title: "Dell Laptop Charger",
      description: "Lost my Dell laptop charger (65W, black) probably in Hall B during the morning lecture.",
      category: "Electronics",
      location: "Lecture Hall B",
      date: "2026-07-16",
      type: "lost",
      photoUrl: "",
      reportedBy: "u2",
      reportedByName: "student1",
      status: "available",
      createdAt: new Date().toISOString()
    },
    {
      id: "i3",
      title: "Stainless Steel Water Bottle",
      description: "Silver thermos bottle found in the university gymnasium near the treadmills. It has a green sticker.",
      category: "Personal Accessories",
      location: "Gymnasium",
      date: "2026-07-14",
      type: "found",
      photoUrl: "",
      reportedBy: "u3",
      reportedByName: "lecturer1",
      status: "available",
      createdAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString() // 2 days ago
    },
    {
      id: "i4",
      title: "Keys with Red Keychain",
      description: "Lost my hostel/room keys with a red SLTC circular keychain. Might have dropped them walking from Hostel A to Canteen.",
      category: "Keys",
      location: "Pathway/Canteen",
      date: "2026-07-16",
      type: "lost",
      photoUrl: "",
      reportedBy: "u2",
      reportedByName: "student1",
      status: "available",
      createdAt: new Date().toISOString()
    }
  ];

  const initialDb = {
    users: initialUsers,
    items: initialItems,
    claims: [],
    notifications: [
      {
        id: "n1",
        userId: "u2",
        message: "Welcome to the SLTC Lost & Found portal! You can now report lost or found items.",
        type: "system",
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ]
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(initialDb, null, 2));
}

// Database helper functions
const readData = () => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return defaultDb;
  }
};

const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

module.exports = {
  // User operations
  getUsers: () => readData().users,
  getUserById: (id) => readData().users.find(u => u.id === id),
  getUserByUsername: (username) => readData().users.find(u => u.username.toLowerCase() === username.toLowerCase()),
  createUser: (user) => {
    const data = readData();
    const newUser = {
      id: 'u_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      ...user,
      password: hashPassword(user.password)
    };
    data.users.push(newUser);
    writeData(data);
    return newUser;
  },

  // Item operations
  getItems: () => readData().items,
  getItemById: (id) => readData().items.find(i => i.id === id),
  createItem: (item) => {
    const data = readData();
    const newItem = {
      id: 'i_' + Math.random().toString(36).substr(2, 9),
      status: 'available',
      createdAt: new Date().toISOString(),
      ...item
    };
    data.items.push(newItem);
    writeData(data);
    
    // Check if we need to auto-generate a notification for matching items
    // (e.g. if someone reported a found item of same category, alert users with matching lost items)
    if (newItem.type === 'found') {
      const lostMatches = data.items.filter(i => 
        i.type === 'lost' && 
        i.status === 'available' &&
        i.category.toLowerCase() === newItem.category.toLowerCase() &&
        i.reportedBy !== newItem.reportedBy
      );
      
      lostMatches.forEach(match => {
        const notification = {
          id: 'n_' + Math.random().toString(36).substr(2, 9),
          userId: match.reportedBy,
          message: `A found item matching your lost "${match.title}" has been reported: "${newItem.title}" at ${newItem.location}.`,
          type: 'match_alert',
          isRead: false,
          createdAt: new Date().toISOString()
        };
        data.notifications.push(notification);
      });
      writeData(data);
    }

    return newItem;
  },
  updateItem: (id, updates) => {
    const data = readData();
    const index = data.items.findIndex(i => i.id === id);
    if (index !== -1) {
      data.items[index] = { ...data.items[index], ...updates };
      writeData(data);
      return data.items[index];
    }
    return null;
  },
  deleteItem: (id) => {
    const data = readData();
    data.items = data.items.filter(i => i.id !== id);
    writeData(data);
    return true;
  },

  // Claim operations
  getClaims: () => readData().claims,
  getClaimById: (id) => readData().claims.find(c => c.id === id),
  createClaim: (claim) => {
    const data = readData();
    const newClaim = {
      id: 'c_' + Math.random().toString(36).substr(2, 9),
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...claim
    };
    data.claims.push(newClaim);
    
    // Update item claim state
    const itemIndex = data.items.findIndex(i => i.id === claim.itemId);
    if (itemIndex !== -1) {
      data.items[itemIndex].status = 'claimed'; // change to claimed (meaning verification pending)
    }

    // Add alert notification for Admin and Security
    const admins = data.users.filter(u => u.role === 'admin' || u.role === 'security');
    admins.forEach(admin => {
      data.notifications.push({
        id: 'n_' + Math.random().toString(36).substr(2, 9),
        userId: admin.id,
        message: `New claim request submitted by ${claim.claimedByName} for "${data.items[itemIndex]?.title || 'Item'}".`,
        type: 'claim_alert',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    });

    writeData(data);
    return newClaim;
  },
  updateClaimStatus: (claimId, status, rejectReason = '') => {
    const data = readData();
    const claimIndex = data.claims.findIndex(c => c.id === claimId);
    if (claimIndex === -1) return null;
    
    const claim = data.claims[claimIndex];
    claim.status = status;
    if (rejectReason) claim.rejectReason = rejectReason;
    
    const itemIndex = data.items.findIndex(i => i.id === claim.itemId);
    const item = data.items[itemIndex];
    
    if (status === 'approved') {
      if (item) {
        item.status = 'returned'; // item is officially returned
      }
      
      // Notify the claimant
      data.notifications.push({
        id: 'n_' + Math.random().toString(36).substr(2, 9),
        userId: claim.claimedBy,
        message: `Your claim for "${item ? item.title : 'item'}" has been APPROVED! Please visit the Security office to collect your item.`,
        type: 'claim_update',
        isRead: false,
        createdAt: new Date().toISOString()
      });

      // Reject all other pending claims for this item
      data.claims.forEach(c => {
        if (c.itemId === claim.itemId && c.id !== claimId && c.status === 'pending') {
          c.status = 'rejected';
          c.rejectReason = 'Item has been returned to another claimant.';
          
          data.notifications.push({
            id: 'n_' + Math.random().toString(36).substr(2, 9),
            userId: c.claimedBy,
            message: `Your claim for "${item ? item.title : 'item'}" was rejected. ${c.rejectReason}`,
            type: 'claim_update',
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }
      });
    } else if (status === 'rejected') {
      // If rejected, set item back to available so other users can see it,
      // UNLESS there are other pending claims? Let's check.
      const otherPendingClaims = data.claims.some(c => c.itemId === claim.itemId && c.id !== claimId && c.status === 'pending');
      if (item && !otherPendingClaims) {
        item.status = 'available';
      }
      
      // Notify claimant
      data.notifications.push({
        id: 'n_' + Math.random().toString(36).substr(2, 9),
        userId: claim.claimedBy,
        message: `Your claim for "${item ? item.title : 'item'}" has been REJECTED. Reason: ${rejectReason || 'Insufficient proof.'}`,
        type: 'claim_update',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }
    
    writeData(data);
    return claim;
  },

  // Notification operations
  getNotifications: (userId) => {
    const all = readData().notifications;
    return all.filter(n => n.userId === userId).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  markNotificationAsRead: (id) => {
    const data = readData();
    const index = data.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      data.notifications[index].isRead = true;
      writeData(data);
      return true;
    }
    return false;
  },
  clearNotifications: (userId) => {
    const data = readData();
    data.notifications = data.notifications.filter(n => n.userId !== userId);
    writeData(data);
    return true;
  }
};

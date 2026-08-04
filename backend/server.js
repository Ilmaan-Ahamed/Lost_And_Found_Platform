require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'sltc_secret_key_123_abc';

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

// Enable CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup file uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded images statically
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, 'img_' + Math.random().toString(36).substr(2, 9) + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    if (ext && mime) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed (JPEG, JPG, PNG, WEBP, GIF)'));
  }
});

// --- Middleware ---

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await db.getUserById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const isAdminOrSecurity = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'security') {
    return res.status(403).json({ message: 'Access denied: Admin or Security role required' });
  }
  next();
};

// --- Auth Routes ---

app.post('/api/auth/register', asyncHandler(async (req, res) => {
  const { username, password, email, role, contact, registrationNo } = req.body;

  if (!username || !password || !email || !role) {
    return res.status(400).json({ message: 'Username, password, email, and role are required' });
  }

  if (await db.getUserByUsername(username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  const user = await db.createUser({
    username,
    password,
    email,
    role,
    contact: contact || '',
    registrationNo: registrationNo || ''
  });

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  const { password: _, ...userWithoutPassword } = user;
  res.status(201).json({ token, user: userWithoutPassword });
}));

app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const user = await db.getUserByUsername(username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ message: 'Invalid username or password' });
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  const { password: _, ...userWithoutPassword } = user;
  res.json({ token, user: userWithoutPassword });
}));

app.get('/api/auth/me', authenticate, asyncHandler(async (req, res) => {
  const { password: _, ...userWithoutPassword } = req.user;
  res.json(userWithoutPassword);
}));

// --- Items Routes ---

app.get('/api/items', asyncHandler(async (req, res) => {
  let items = await db.getItems();
  const { search, category, location, status, type } = req.query;

  if (search) {
    const q = search.toLowerCase();
    items = items.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  }

  if (category) {
    items = items.filter((item) => item.category.toLowerCase() === category.toLowerCase());
  }

  if (location) {
    items = items.filter((item) => item.location.toLowerCase() === location.toLowerCase());
  }

  if (status) {
    items = items.filter((item) => item.status.toLowerCase() === status.toLowerCase());
  }

  if (type) {
    items = items.filter((item) => item.type.toLowerCase() === type.toLowerCase());
  }

  items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(items);
}));

app.get('/api/items/:id', asyncHandler(async (req, res) => {
  const item = await db.getItemById(req.params.id);
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }
  res.json(item);
}));

app.post('/api/items', authenticate, upload.single('photo'), asyncHandler(async (req, res) => {
  const { title, description, category, location, date, type } = req.body;

  if (!title || !description || !category || !location || !date || !type) {
    return res.status(400).json({ message: 'Title, description, category, location, date, and type are required' });
  }

  let photoUrl = '';
  if (req.file) {
    photoUrl = `/uploads/${req.file.filename}`;
  }

  const newItem = await db.createItem({
    title,
    description,
    category,
    location,
    date,
    type,
    photoUrl,
    reportedBy: req.user.id,
    reportedByName: req.user.username
  });

  res.status(201).json(newItem);
}));

app.put('/api/items/:id', authenticate, asyncHandler(async (req, res) => {
  const item = await db.getItemById(req.params.id);
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  if (item.reportedBy !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'security') {
    return res.status(403).json({ message: 'Not authorized to modify this item' });
  }

  const updatedItem = await db.updateItem(req.params.id, req.body);
  res.json(updatedItem);
}));

app.delete('/api/items/:id', authenticate, asyncHandler(async (req, res) => {
  const item = await db.getItemById(req.params.id);
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  if (item.reportedBy !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'security') {
    return res.status(403).json({ message: 'Not authorized to delete this item' });
  }

  await db.deleteItem(req.params.id);
  res.json({ message: 'Item deleted successfully' });
}));

// --- Claims Routes ---

app.post('/api/claims', authenticate, asyncHandler(async (req, res) => {
  const { itemId, verificationProof } = req.body;

  if (!itemId || !verificationProof) {
    return res.status(400).json({ message: 'itemId and verificationProof are required' });
  }

  const item = await db.getItemById(itemId);
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  if (item.status !== 'available') {
    return res.status(400).json({ message: 'This item is not available for claims' });
  }

  if (item.reportedBy === req.user.id) {
    return res.status(400).json({ message: 'You cannot submit a claim for an item you reported yourself' });
  }

  const claim = await db.createClaim({
    itemId,
    itemTitle: item.title,
    claimedBy: req.user.id,
    claimedByName: req.user.username,
    verificationProof
  });

  res.status(201).json(claim);
}));

app.get('/api/claims', authenticate, asyncHandler(async (req, res) => {
  const claims = await db.getClaims();

  if (req.user.role === 'admin' || req.user.role === 'security') {
    res.json(claims.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } else {
    const userClaims = claims.filter((c) => c.claimedBy === req.user.id);
    res.json(userClaims.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }
}));

app.post('/api/claims/:id/review', authenticate, isAdminOrSecurity, asyncHandler(async (req, res) => {
  const { status, rejectReason } = req.body;
  if (!status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Valid status (approved/rejected) is required' });
  }

  const claim = await db.getClaimById(req.params.id);
  if (!claim) {
    return res.status(404).json({ message: 'Claim not found' });
  }

  if (claim.status !== 'pending') {
    return res.status(400).json({ message: 'Claim has already been reviewed' });
  }

  const updatedClaim = await db.updateClaimStatus(req.params.id, status, rejectReason);
  res.json(updatedClaim);
}));

// --- Notifications Routes ---

app.get('/api/notifications', authenticate, asyncHandler(async (req, res) => {
  res.json(await db.getNotifications(req.user.id));
}));

app.put('/api/notifications/:id/read', authenticate, asyncHandler(async (req, res) => {
  const success = await db.markNotificationAsRead(req.params.id);
  if (!success) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  res.json({ message: 'Notification marked as read' });
}));

app.delete('/api/notifications', authenticate, asyncHandler(async (req, res) => {
  await db.clearNotifications(req.user.id);
  res.json({ message: 'Notifications cleared successfully' });
}));

async function startServer() {
  try {
    await db.connect();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

startServer();

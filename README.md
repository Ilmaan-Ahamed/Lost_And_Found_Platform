# 🎒 SLTC Lost & Found Platform

A full-stack web application that helps students, lecturers, and campus security report, search, and reclaim lost or found items across the SLTC campus.

---

## 📖 Overview

Losing a phone, ID card, or wallet on campus is stressful — and sorting through a scattered lost-and-found box is worse. This platform gives the SLTC community a single place to:

- Report an item they've **lost** or **found**
- Search and filter existing reports
- Submit a **claim** with verification proof to reclaim an item
- Let **admins/security** review claims and manage listings

## ✨ Features

- 🔐 **Authentication** — JWT-based register/login with role-based access (`student`, `lecturer`, `security`, `admin`)
- 📝 **Report Items** — Submit lost/found items with a title, description, category, location, date, and an optional photo upload
- 🔍 **Search & Filter** — Browse all reported items, filtered by keyword, category, location, status, or type (lost/found)
- 📬 **Claims Workflow** — Users submit a claim with verification proof; admins/security approve or reject it
- 🛡️ **Admin Panel** — Admin/security roles can manage items and review pending claims
- 🔔 **Notifications** — In-app notifications for claim updates
- 🎨 **Modern UI** — React frontend with light/dark theme toggle and animated visuals

## 🛠️ Tech Stack

**Frontend**
- React 18 + React Router 6
- Vite
- GSAP & Three.js (animations/visuals)
- lucide-react (icons)

**Backend**
- Node.js + Express
- JWT (`jsonwebtoken`) for authentication
- `bcryptjs` for password hashing
- `multer` for image uploads
 - `multer` + Cloudinary for image uploads
 - MongoDB (Mongoose) for persistent storage (MongoDB Atlas recommended)

## 📁 Project Structure

```
Lost_And_Found_Platform/
├── backend/
│   ├── server.js          # Express app & API routes
│   ├── db.js               # JSON file-based data layer (users, items, claims, notifications)
│   ├── data/                # Persisted JSON data
│   ├── uploads/              # Uploaded item photos
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/           # Home, Login, Dashboard, ReportItem, SearchItems, AdminPanel
    │   ├── components/       # Navbar, Footer, FloatingLines
    │   ├── context/          # AuthContext (auth state)
    │   ├── App.jsx            # Routes & route guards
    │   └── main.jsx
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm

### 1. Clone the repository
```bash
git clone https://github.com/Ilmaan-Ahamed/Lost_And_Found_Platform.git
cd Lost_And_Found_Platform
```

### 2. Set up the backend
```bash
cd backend
npm install
npm start
```
The API server runs on `http://localhost:5000` by default.

### Backend configuration

- Create a `.env` file in the `backend/` folder. Copy `backend/.env.example` and fill in the values.
- You will need a MongoDB Atlas connection string for `MONGODB_URI` and a Cloudinary account for image uploads. Also set `JWT_SECRET` and `FRONTEND_URL` (e.g. `http://localhost:5173`).

When deploying to Render/Koyeb, set the same environment variables in the service dashboard. The platform will provide `PORT` automatically.

### 3. Set up the frontend
```bash
cd frontend
npm install
npm run dev
```
The app runs on `http://localhost:5173` by default.

> ⚠️ The backend CORS configuration expects the frontend to run on `http://localhost:5173`. Update `backend/server.js` if you use a different port.

## 🔑 Default Accounts

On first run, the backend seeds the database with sample accounts you can use to explore each role:

| Role      | Username     | Password       |
|-----------|--------------|----------------|
| Admin     | `admin`      | `admin123`     |
| Student   | `student1`   | `student123`   |
| Lecturer  | `lecturer1`  | `lecturer123`  |
| Security  | *(see `backend/data/db.json` after first run)* | |

## 📡 API Overview

| Method | Endpoint                         | Description                             | Auth Required |
|--------|-----------------------------------|------------------------------------------|----------------|
| POST   | `/api/auth/register`              | Register a new user                       | No             |
| POST   | `/api/auth/login`                  | Log in and receive a JWT                   | No             |
| GET    | `/api/auth/me`                     | Get current user profile                    | Yes            |
| GET    | `/api/items`                       | List/search/filter items                    | No             |
| GET    | `/api/items/:id`                   | Get a single item                            | No             |
| POST   | `/api/items`                       | Report a new item (with optional photo)       | Yes            |
| PUT    | `/api/items/:id`                   | Update an item (owner or admin/security)        | Yes            |
| DELETE | `/api/items/:id`                   | Delete an item (owner or admin/security)         | Yes            |
| POST   | `/api/claims`                      | Submit a claim for an item                        | Yes            |
| GET    | `/api/claims`                      | List claims (own claims, or all for admin/security) | Yes            |
| POST   | `/api/claims/:id/review`           | Approve/reject a claim (admin/security only)          | Yes            |
| GET    | `/api/notifications`               | Get notifications for current user                     | Yes            |
| PUT    | `/api/notifications/:id/read`      | Mark a notification as read                              | Yes            |
| DELETE | `/api/notifications`               | Clear all notifications                                    | Yes            |

## 👥 Team

| Name | GitHub |
|------|--------|
| Ilmaan Ahamed | [Ilmaan-Ahamed](https://github.com/Ilmaan-Ahamed) |
| Mohamed Afrith| [MhoAfrith](https://github.com/MhoAfrith)         |
| Mohamed Aasim | [MOHAMED-AASIM](https://github.com/MOHAMED-AASIM) |
| Mohamed Himas | [himasRm](https://github.com/himasRm)              |


## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to your fork and open a pull request

## 📄 License

This project currently has no explicit license. Contact the repository owner for usage permissions.
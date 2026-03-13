# 🎨 Lumina — University Multimedia Exhibition Platform

A full-stack web platform for university student art exhibitions with a Van Gogh / Starry Night aesthetic.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm

### Installation

```bash
# 1. Unzip and enter the project folder
cd lumina

# 2. Install dependencies
npm install

# 3. Start the server
npm start
```

Open your browser at: **http://localhost:3000**

---

## 🔐 Default Admin Account

| Email | Password |
|-------|----------|
| admin@lumina.edu | admin123 |

> ⚠️ Change the admin password after first login in production!

---

## 📁 Project Structure

```
lumina/
├── server.js              # Express server entry point
├── database.js            # SQLite schema + seeding
├── package.json
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── routes/
│   ├── auth.js            # Register, login, profile
│   ├── artworks.js        # Artwork CRUD, likes, comments, upload
│   └── api.js             # Events, artists, admin endpoints
└── public/
    ├── index.html         # Landing page
    ├── auth.html          # Login / Sign Up
    ├── gallery.html       # Full gallery with filters
    ├── dashboard.html     # Student dashboard
    ├── admin.html         # Admin panel
    ├── artist.html        # Artist profile page
    ├── css/
    │   └── theme.css      # Shared CSS theme
    ├── js/
    │   └── app.js         # Shared JS utilities
    └── uploads/           # Uploaded artwork images (auto-created)
```

---

## 🌐 Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with featured works, gallery, artists, events |
| `/gallery` | Full masonry gallery with search & filters |
| `/auth` | Login and Sign Up |
| `/dashboard` | Student — submit & manage artworks |
| `/admin` | Admin — review submissions, manage events & users |
| `/artist/:uuid` | Public artist profile |

---

## 🔌 API Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | Public | Register student |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | JWT | Get current user |
| PUT | `/api/auth/profile` | JWT | Update profile |

### Artworks
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/artworks` | Public | List approved artworks |
| GET | `/api/artworks/:uuid` | Public | Get single artwork |
| POST | `/api/artworks` | JWT | Submit new artwork |
| PUT | `/api/artworks/:uuid` | JWT/Admin | Update artwork |
| DELETE | `/api/artworks/:uuid` | JWT/Admin | Delete artwork |
| POST | `/api/artworks/:uuid/like` | JWT | Toggle like |
| GET | `/api/artworks/:uuid/comments` | Public | Get comments |
| POST | `/api/artworks/:uuid/comments` | JWT | Post comment |
| GET | `/api/artworks/user/mine` | JWT | My artworks |

### Public
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/events` | List all events |
| GET | `/api/artists` | List all artists |
| GET | `/api/artists/:uuid` | Artist + their works |

### Admin (requires admin role)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/stats` | Platform statistics |
| GET | `/api/admin/artworks` | All artworks with filters |
| GET | `/api/admin/users` | All users |
| PATCH | `/api/admin/artworks/:id/status` | Approve/reject/feature |
| DELETE | `/api/admin/users/:id` | Remove student |
| POST | `/api/events` | Create event |
| PUT | `/api/events/:id` | Update event |
| DELETE | `/api/events/:id` | Delete event |

---

## ⚙️ Environment Variables

Create a `.env` file (optional):
```
PORT=3000
JWT_SECRET=your_secret_key_here
```

---

## 🎨 Features

- **Van Gogh / Starry Night** aesthetic with animated starfield, golden orbs, glassmorphism
- **Student Registration** — sign up, create profile, submit artwork
- **Artwork Submissions** — image upload (JPG, PNG, GIF, WebP, up to 20MB)
- **Admin Review** — approve, reject, or feature artworks
- **Gallery** — masonry grid with search, category filters, sorting
- **Lightbox** — detailed view with likes & comments
- **Events Calendar** — manage and display exhibition events
- **Artist Profiles** — public pages with portfolio
- **JWT Authentication** — secure token-based auth (7-day expiry)
- **SQLite Database** — zero-config, file-based persistence

---

## 🏭 Production Notes

1. Set a strong `JWT_SECRET` environment variable
2. Use a reverse proxy (nginx) in front of Node.js
3. Consider using a CDN for uploaded images
4. The SQLite database file `lumina.db` is created automatically

---

Built with ❤️ by Lumina Exhibition Platform

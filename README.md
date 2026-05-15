# TaskTrek – Team Task Manager

> A full-stack project & task management web application with role-based access control, built with React, Node.js, Express, and PostgreSQL. Deployed live on Railway.

🌐 **Live Demo:** https://tasktrek-production-1e34.up.railway.app
📦 **GitHub:** https://github.com/piyushb03/TaskTrek

---

## 📸 Features at a Glance

| Feature | Description |
|---------|-------------|
| 🔐 Authentication | Signup & Login with JWT (permanent sessions), bcrypt hashed passwords |
| 👥 Role-Based Access | Global roles (Admin / Member) + per-project roles |
| 📁 Project Management | Create, update, delete projects; track progress |
| 🧑‍🤝‍🧑 Team Management | Add/remove members by email, promote to Admin |
| ✅ Task Tracking | Create tasks, assign to members, set priority & due date |
| 📋 Kanban Board | Visual 4-column board: To Do → In Progress → Review → Done |
| 📊 Dashboard | Personal stats: assigned, in-progress, completed, overdue |
| 🌐 REST API | 15+ endpoints with validation, error handling, RBAC |

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Vanilla CSS (dark-mode design system) |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **Authentication** | JSON Web Tokens (JWT) + bcryptjs |
| **Deployment** | Railway (auto-deploy from GitHub) |
| **HTTP Client** | Axios (with JWT interceptor) |

---

## 🗂️ Project Structure

```
TaskTrek/
├── client/                        # React + Vite Frontend
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx               # React entry point
│       ├── App.jsx                # Router + protected routes
│       ├── index.css              # Full design system (dark mode)
│       ├── api/
│       │   └── axios.js           # Axios instance with JWT interceptor
│       ├── context/
│       │   └── AuthContext.jsx    # Global auth state + login/logout/signup
│       ├── components/
│       │   └── Layout.jsx         # Sidebar + navigation shell
│       └── pages/
│           ├── Login.jsx          # Login page
│           ├── Signup.jsx         # Signup page with role selection
│           ├── Dashboard.jsx      # Stats + my tasks + recent projects
│           ├── Projects.jsx       # Projects grid + create modal
│           └── ProjectDetail.jsx  # Kanban board + list view + members tab
│
├── server/                        # Node.js + Express Backend
│   ├── package.json
│   └── src/
│       ├── index.js               # App entry: middleware, routes, DB init, static serving
│       ├── db/
│       │   ├── pool.js            # PostgreSQL connection pool
│       │   └── schema.sql         # Auto-run schema (tables + triggers)
│       ├── middleware/
│       │   └── auth.js            # JWT verify + requireAdmin guard
│       ├── controllers/
│       │   ├── authController.js  # signup, login, getMe, listUsers
│       │   ├── projectController.js # CRUD projects + member management
│       │   └── taskController.js  # CRUD tasks + dashboard aggregation
│       └── routes/
│           ├── auth.js            # /api/auth/*
│           ├── projects.js        # /api/projects/*
│           └── tasks.js           # /api/tasks/*
│
├── package.json                   # Root scripts (build + start for Railway)
├── railway.json                   # Railway deployment config
├── .gitignore
└── README.md
```

---

## 🗃️ Database Schema

```sql
users          — id, name, email, password_hash, role (admin|member), created_at
projects       — id, name, description, owner_id, created_at
project_members— project_id, user_id, role (admin|member), joined_at
tasks          — id, title, description, project_id, assignee_id, created_by,
                 status (todo|in_progress|review|done),
                 priority (low|medium|high|urgent), due_date, created_at, updated_at
```

- Schema is **auto-initialized** on first server boot — no manual migration needed.
- `updated_at` on tasks is auto-updated via a PostgreSQL trigger.

---

## 📡 REST API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | None | Register new user |
| POST | `/api/auth/login` | None | Login, receive JWT |
| GET | `/api/auth/me` | JWT | Get current user |
| GET | `/api/auth/users` | Admin JWT | List all users |

### Projects
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/projects` | JWT | List user's projects |
| POST | `/api/projects` | JWT | Create project (auto-adds creator as admin) |
| GET | `/api/projects/:id` | Member JWT | Project details + members |
| PATCH | `/api/projects/:id` | Admin JWT | Update project |
| DELETE | `/api/projects/:id` | Admin JWT | Delete project + all tasks |
| POST | `/api/projects/:id/members` | Admin JWT | Add member by email |
| DELETE | `/api/projects/:id/members/:uid` | Admin JWT | Remove member |
| PATCH | `/api/projects/:id/members/:uid/role` | Admin JWT | Change member role |

### Tasks
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/projects/:id/tasks` | Member JWT | List project tasks (sorted by priority) |
| POST | `/api/projects/:id/tasks` | Member JWT | Create task |
| PATCH | `/api/tasks/:id` | Member JWT | Update task (status, assignee, etc.) |
| DELETE | `/api/tasks/:id` | Member/Creator JWT | Delete task |
| GET | `/api/tasks/dashboard` | JWT | Personal stats + assigned tasks |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

---

## 🔐 Role-Based Access Control

### Global Roles
| Role | Can Do |
|------|--------|
| **Admin** | Create projects, view all users (via API) |
| **Member** | Join projects, manage assigned tasks |

### Per-Project Roles
| Role | Can Do |
|------|--------|
| **Admin** | Edit/delete project, add/remove members, delete any task |
| **Member** | Create tasks, update status, edit own tasks |

> A user can be a global `member` but a project-level `admin` within a specific project.

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js ≥ 18
- PostgreSQL (local or cloud)

### 1. Clone the Repository
```bash
git clone https://github.com/piyushb03/TaskTrek.git
cd TaskTrek
```

### 2. Install All Dependencies
```bash
npm run install:all
# or manually:
cd server && npm install
cd ../client && npm install
```

### 3. Configure Environment
```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/tasktrek
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:5173
```

Create the database:
```sql
CREATE DATABASE tasktrek;
```
> The schema (tables, triggers) is auto-created on first server start.

### 4. Run Development Servers
```bash
# Terminal 1 – Backend (port 5000)
npm run dev:server

# Terminal 2 – Frontend (port 5173)
npm run dev:client
```

Open: http://localhost:5173

---

## 🌐 Railway Deployment

### How It Works
Railway runs these two commands automatically:
```
Build:  npm run build   →  cd client && npm install && npm run build
Start:  npm start       →  cd server && node src/index.js
```
Express serves the compiled React app as static files in production.

### Environment Variables (set in Railway dashboard)
| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | your secret string |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (auto-linked) |

### Steps to Deploy Your Own Copy
1. Fork the repo on GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
3. Select your fork
4. Click **+ New** → **Database** → **PostgreSQL**
5. In web service **Variables**, add the 3 vars above
6. In **Settings** → **Networking** → **Generate Domain**
7. ✅ Done — live in ~2 minutes

---

## 🔑 Authentication Flow

```
User signs up/logs in
       ↓
Server validates → issues JWT (100-year expiry = permanent)
       ↓
Token stored in localStorage
       ↓
Every API request → Axios interceptor injects: Authorization: Bearer <token>
       ↓
Server middleware verifies token → attaches user to req.user
       ↓
Controllers check project membership + role before any action
```

---

## 🎨 Frontend Design System

- **Theme:** Dark mode with deep navy/charcoal palette
- **Accent:** Purple (`#6c63ff`) with glow effects
- **Typography:** Inter (Google Fonts)
- **Components:** Cards, Kanban board, modals, badges, stat cards
- **Animations:** Fade-in, slide-up, hover transforms, spinner
- **Responsive:** Sidebar hides on mobile, grid adapts to screen size

---

## 👤 Author

**Piyush Baghel** — [GitHub @piyushb03](https://github.com/piyushb03)

---

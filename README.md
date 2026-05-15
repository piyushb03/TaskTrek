# TaskTrek – Team Task Manager

A full-stack project & task management application with role-based access control.

## 🚀 Tech Stack

| Layer     | Technology                     |
|-----------|-------------------------------|
| Frontend  | React 18 + Vite + Vanilla CSS |
| Backend   | Node.js + Express             |
| Database  | PostgreSQL                    |
| Auth      | JWT + bcryptjs                |
| Deploy    | Railway                       |

## ✨ Features

- **Authentication** – Signup/Login with JWT sessions
- **Role-Based Access** – Admin and Member roles (project & global)
- **Projects** – Create, view, update, delete projects
- **Team Management** – Add/remove members, assign roles
- **Task Tracking** – Create tasks, assign to members, set status & priority
- **Kanban Board** – Visual task columns (To Do → In Progress → Review → Done)
- **Dashboard** – Personal stats, overdue alerts, recent projects
- **REST API** – Full CRUD with proper validations

## 🗂️ Project Structure

```
TaskTrek/
├── client/          # React + Vite frontend
│   └── src/
│       ├── api/
│       ├── context/
│       ├── components/
│       └── pages/
├── server/          # Express backend
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       └── db/
├── railway.json
└── package.json
```

## ⚙️ Local Setup

### 1. Clone & Install
```bash
git clone https://github.com/piyushb03/TaskTrek.git
cd TaskTrek
npm run install:all
```

### 2. Configure Environment
```bash
cp server/.env.example server/.env
# Edit server/.env with your PostgreSQL credentials
```

### 3. Run Development
```bash
# Terminal 1 – Backend
npm run dev:server

# Terminal 2 – Frontend
npm run dev:client
```

## 🌐 Railway Deployment

1. Push to GitHub
2. Create new Railway project → "Deploy from GitHub repo"
3. Add **PostgreSQL** plugin in Railway
4. Set environment variables:
   - `DATABASE_URL` → auto-provided by Railway PostgreSQL
   - `JWT_SECRET` → your secret string
   - `NODE_ENV` → `production`
5. Railway auto-runs `npm run build && npm start`

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Project details |
| PATCH | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/projects/:id/members` | Add member |
| DELETE | `/api/projects/:id/members/:uid` | Remove member |
| GET | `/api/projects/:id/tasks` | List tasks |
| POST | `/api/projects/:id/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/tasks/dashboard` | Dashboard data |

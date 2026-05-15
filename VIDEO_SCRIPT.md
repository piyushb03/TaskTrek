# 🎬 TaskTrek — Video Presentation Script
### Duration: ~4 minutes | Tone: Confident, clear, professional

---

## 🎙️ [INTRO — 0:00 to 0:30]

*(Open with the live site on screen — https://tasktrek-production-1e34.up.railway.app)*

> "Hey everyone — in this video I'm going to walk you through **TaskTrek**, a full-stack team task management application that I built from scratch.

> TaskTrek allows teams to create projects, assign tasks, and track progress — all with role-based access control, so admins and members have different levels of permissions.

> The app is fully deployed and live on Railway, let me show you everything."

---

## 🔐 [SECTION 1: Authentication — 0:30 to 1:00]

*(Stay on the Login page)*

> "Let's start with authentication. TaskTrek has a complete signup and login system. Users can register with their name, email, and password — and importantly, they choose a **role** at signup: either **Admin** or **Member**."

*(Click 'Create one' to show Signup page)*

> "The role selection is right here on the signup form. If you're an Admin, you can create and manage projects. If you're a Member, you can be added to projects and work on tasks."

*(Come back to login, log in with credentials)*

> "Passwords are securely hashed using **bcrypt**, and sessions are managed with **JWT tokens**. Once you log in, you stay logged in permanently — no annoying session timeouts."

---

## 📊 [SECTION 2: Dashboard — 1:00 to 1:40]

*(After login, now on the Dashboard)*

> "After logging in, you land on the **Dashboard**. This gives you a personal overview of your work."

*(Point to the 4 stat cards)*

> "At the top, we have four stat cards — your total assigned tasks, how many are in progress, how many are completed, and how many are **overdue**. The overdue count turns red as a visual alert."

*(Scroll down to the tables)*

> "Below that, on the left, is your personal task list — all tasks assigned to you, across all your projects. You can see the task title, which project it belongs to, its status, priority, and due date. You can click any task to jump straight to that project."

> "On the right, you have your **Recent Projects** — each showing member count, total tasks, and a progress bar showing how much of the work is done."

---

## 📁 [SECTION 3: Projects — 1:40 to 2:20]

*(Click 'Projects' in the sidebar)*

> "Now let's look at the Projects page. This is where all your projects live."

*(Show the grid of project cards)*

> "Each project card shows the project name, your role in that project — admin or member — the number of members and tasks, and a progress bar. You can click any card to open it."

*(Click '+ New Project' button)*

> "Creating a project is simple — just give it a name and an optional description. When you create a project, you're automatically added as the **project admin**."

*(Fill in and create a project if needed)*

---

## 📋 [SECTION 4: Project Detail — Kanban Board — 2:20 to 3:10]

*(Open a project, land on the Kanban Board)*

> "Inside a project, you get three views. First, the **Kanban Board**."

*(Point to the 4 columns)*

> "The board has four columns — **To Do**, **In Progress**, **Review**, and **Done**. Every task card shows the title, its priority badge — low, medium, high, or urgent — the due date, and the assigned team member."

*(Click on a task card)*

> "Clicking a task opens the task modal where you can edit everything — change the title, description, status, priority, assignee, and due date. The changes save instantly."

*(Click '+ New Task')*

> "And creating a new task is just as easy — fill in the form, pick who to assign it to from the project members, set a priority and due date, and hit Add Task."

---

## 📄 [SECTION 5: List View + Members — 3:10 to 3:40]

*(Click the 'List' tab)*

> "If you prefer a table view, switch to the **List tab**. Here you can also change a task's status directly from the dropdown without even opening the task — really quick for bulk updates."

*(Click the 'Members' tab)*

> "The **Members tab** shows everyone on this project and their role. As a project admin, I can add new members by email — they just need to have a TaskTrek account — and I can remove them or change their role between admin and member."

*(Click '+ Add Member', show the modal)*

> "So for example, if I want to invite a teammate, I type their email, pick their role, and they're immediately added to the project."

---

## ⚙️ [SECTION 6: Tech Stack & Architecture — 3:40 to 4:10]

*(Switch to code editor or show a slide / README)*

> "Let me quickly walk through the tech stack."

> "The **frontend** is built with React 18 and Vite, using Vanilla CSS — a fully custom dark-mode design system with animations, modals, and a Kanban board — no UI library, everything hand-crafted."

> "The **backend** is Node.js with Express. It exposes a clean REST API with over 15 endpoints. Authentication uses JWT tokens, and every route is protected with middleware that checks both the token and the user's role."

> "The **database** is PostgreSQL. The schema — users, projects, project members, and tasks — is automatically initialized on first boot, so there's no manual migration needed."

> "And the entire app is deployed on **Railway** — the backend serves the compiled React build as static files, so it's a single unified service."

---

## 🎯 [OUTRO — 4:10 to 4:30]

*(Back to the live site)*

> "So to summarize — TaskTrek is a production-ready team task manager with:
> - Full authentication and role-based access control
> - Project and team management
> - Task creation with priority, status, and due dates
> - A Kanban board and list view
> - A personal dashboard with overdue tracking
> - And it's fully deployed and live right now."

> "The code is open-source on GitHub at **github.com/piyushb03/TaskTrek**. Thanks for watching!"

---

## 📝 SPEAKER NOTES

**Things to demo live (in order):**
1. Open https://tasktrek-production-1e34.up.railway.app
2. Show login page → click Signup → show role dropdown → go back to login
3. Log in → Dashboard → point to stat cards + task table + recent projects
4. Click Projects → show grid → click + New Project → create one
5. Open a project → Kanban board → click a task → show edit modal
6. Click + New Task → fill and save
7. Switch to List tab → change a status via dropdown
8. Switch to Members tab → show Add Member modal
9. Final shot on the live app

**Tips:**
- Keep energy up — speak with confidence
- Don't rush — 4 mins is comfortable, no need to speed-talk
- Have a test account ready with some pre-existing tasks so the board isn't empty
- Keep browser zoom at ~90% so everything fits nicely on screen

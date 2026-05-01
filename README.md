# 🚀 TaskFlow | Full-Stack Task Management Platform

TaskFlow is a full-stack, role-based task management web application built with **FastAPI** and **React**. It features a clean, intuitive UI, JWT-secured authentication, and real-time project and task tracking — all deployed on Railway.

---

## ✨ Features

- **Intuitive Dashboard:** A centralized command view displaying all tasks grouped by status, with overdue task tracking at a glance.
- **Role-Based Access Control (RBAC):**
  - **Admins:** Full control to create projects, manage members, assign tasks, and delete records.
  - **Members:** Access to project boards with the ability to track their assigned work.
- **Project Management:** Create and organize projects, add team members, and manage project lifecycles.
- **Task Management:** Create tasks, assign them to users, and move them across three clear stages:
  `To Do` → `In Progress` → `Done`
- **Secure Authentication:** User signup and login powered by **JWT tokens** and **Bcrypt** password hashing.

---

## 🛠️ Tech Stack

- **Backend:** Python / FastAPI
- **Database:** SQLAlchemy (SQLite)
- **Frontend:** React (Vite), JavaScript, CSS
- **Deployment:** Railway

---

## 🌐 Live Links

- **Application:** https://task-manager-production-686e.up.railway.app
- **API Docs (Swagger):** https://task-manager-production-6a5c.up.railway.app/docs

---

## 🚀 Installation & Local Setup

**1. Clone the repository:**

```bash
git clone https://github.com/SaniyaAfzali/task-manager.git
cd task-manager
```

**2. Set up and run the backend:**

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at: `http://localhost:8000`  
API docs available at: `http://localhost:8000/docs`

**3. Set up and run the frontend:**

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

**4. Configure environment:**

Create a `.env` file inside the `frontend/` directory:

```env
VITE_API_URL=http://localhost:8000
```

---

## 🌐 Deployment

This project is configured for seamless deployment on **Railway**.

1. Push your code to GitHub.
2. Connect your repository to Railway.
3. Set the `VITE_API_URL` environment variable to your deployed backend URL.
4. Generate a domain in Railway Settings — and you're live!

---

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 👩‍💻 Author

**Saniya Afzali**  
[github.com/SaniyaAfzali](https://github.com/SaniyaAfzali)

🚀 TaskFlow – Full Stack Task Management Application
TaskFlow is a full‑stack project and task management web application built as part of a technical assignment.
It allows teams to create projects, assign tasks, manage members, and track progress through a simple dashboard.

🌐 Live Demo

Frontend: https://task-manager-production-686e.up.railway.app

Backend API: https://task-manager-production-6a5c.up.railway.app/docs#/


✨ Features
🔐 Authentication & Authorization
User Signup & Login

JWT based authentication

Secure password hashing

Role based access (Admin & Member)

📁 Project Management
Create new projects

View all projects

Delete projects

Add members to projects

View project members

✅ Task Management
Create tasks under projects

Assign tasks to users

Update task status

Todo

In Progress

Done

Delete tasks

Filter tasks by project

📊 Dashboard
Overview of all tasks

Tasks grouped by status

Overdue tasks tracking

🛠️ Tech Stack
Frontend
React (Vite)

JavaScript

CSS

Backend
FastAPI

SQLAlchemy ORM

SQLite Database

JWT Authentication

Deployment
Frontend: Railway

Backend: Railway


VITE_API_URL= https://task-manager-production-6a5c.up.railway.app/docs#/

💻 Running Locally

1️⃣ Clone Repository

git clone https://github.com/SaniyaAfzali/task-manager

cd taskflow

2️⃣ Run Backend

cd backend

pip install -r requirements.txt

uvicorn main:app --reload

Backend runs at:


http://localhost:8000

3️⃣ Run Frontend

cd frontend

npm install

npm run dev

Frontend runs at:

http://localhost:5173


🎯 Assignment Note

This project was developed as part of a technical assignment to demonstrate full‑stack development skills including API design, authentication, database management, and deployment.


👩‍💻 Author

Saniya Afzali


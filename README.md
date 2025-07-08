# 🧠 Productivity OS – A Full-Stack MERN Productivity Suite

[![MERN](https://img.shields.io/badge/Stack-MERN-informational?style=flat&logo=mongodb&logoColor=white&color=47A248)](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/MERN)
[![Live Demo](https://img.shields.io/badge/Demo-Live-success?logo=vercel&logoColor=white)](https://productivity-os.vercel.app/)

**Productivity OS** is a clean and modern full-stack productivity platform built with the **MERN** stack. It enables users to:

- ✅ Manage daily tasks
- 🔁 Track habits with streaks
- 📝 Take notes with tags
- ⏱️ Stay focused with a Pomodoro-style timer
- 📊 Analyze productivity via a dashboard

> A real-world resume-level app to showcase your **full-stack** capabilities including **auth**, **CRUD**, **state management**, **API architecture**, and **deployment**.

---

## 🚀 Features

- 🔐 **Secure Authentication** using JWT & bcrypt
- 🧠 **Modules**: Tasks, Habits, Notes, Focus Timer, Dashboard
- 🌐 **RESTful API** with Express.js
- 🎨 **Modern UI** using React + Tailwind
- 📈 **Data Visualization** for analytics
- 🛡️ **Security**: Helmet, Rate Limiting, CORS

---

## 🧰 Tech Stack

| Frontend                      | Backend                   | Deployment                |
|------------------------------|---------------------------|---------------------------|
| React + Vite + TypeScript    | Node.js + Express         | Vercel (Frontend)         |
| Context API + Axios          | MongoDB via Mongoose      | Render (Backend + DB)     |
| Tailwind CSS                 | JWT Auth + REST APIs      |                           |

---
## 🔐 Environment Variables

### 🔹 Backend `.env` example

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-super-secret-key
CLIENT_URL=https://productivity-os.vercel.app
```
### 🔹 Frontend .env example
```
VITE_API_URL=https://productivity-os.onrender.com
```
## 🛠️ Local Development Setup

### 1️⃣ Clone the Repo
```
git clone https://github.com/EthanxSK/productivity-os.git
cd productivity-os
```
### 2️⃣ Setup Backend
```
cd backend
npm install
# Create your .env file using the sample above
npm run dev
```
### 3️⃣ Setup Frontend
```
cd ../client
npm install
# Create your .env file using the sample above
npm run dev
```
### 🔗 App should now be running locally at:
## 👉 http://localhost:5173

## 🚀 Production Deployment
| Layer                      | Platform        | 
|------------------------------|---------------|
| Front-End                  | Vercel          |          
| Back-End                   | Render          |  
| DataBase                   | MongoDb Altas   |                           


### 🧠 Key Learnings:
- Full MERN stack architecture

- Token-based authentication & protected routes

- Frontend-backend integration using Axios & Context API

- CORS setup, security (Helmet), and rate limiting

- Managing environment variables across environments

- Scalable deployment pipelines

## 🔗 Live site:
👉 https://productivity-os.vercel.app/

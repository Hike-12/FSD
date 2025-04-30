# 🚀 FSD

> Full-Stack Development Project for Sem 4

---

## 📌 Problem Statement

Building a robust full-stack web application to manage **[brief description of functionality]**.

---

## 🎯 Objective

FSD aims to provide users with an intuitive interface for **[key functionality, e.g., content management, e-commerce, dashboards]**, backed by a scalable RESTful API and a responsive frontend.

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Framer Motion (animations)

### Backend
- Django
- Node.js/Express


### Database
- Sqlite
- MongoDb

### Real-time & Integrations
- WebSockets
- WebRTC

---

## ✨ Key Features

- **User Authentication:** Signup, login, password resets  
- **CRUD Operations:** Create, read, update, delete resources  
- **Responsive UI:** Mobile-first design using Tailwind  
- **Real-time Updates:** Live data sync with WebSockets  
- **Role-based Access:** Admin vs. regular user permissions  
- **Search & Filters:** Advanced querying in listings  

---

## 📽️ Demo

[![Demo Video Placeholder](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://youtu.be/VIDEO_ID)

*Replace `VIDEO_ID` with your YouTube demo link.*

---

## 📸 Screenshots

<!-- Add your actual image paths/screenshots here -->
![img1](./image/img1.png)
![img2](./image/img2.png)
![img3](./image/img3.png)
![img4](./image/img4.png)
![img5](./image/img5.png)
![img6](./image/img6.png)
![img7](./image/img7.png)
![img8](./image/img8.png)
![img9](./image/img9.png)
![img10](./image/img10.png)
![img11](./image/img11.png)

---

## 🧪 How to Run the Project

### Prerequisites
- Node.js v18+ (for React)
- Python 3.9+ & pip (for Django)
- Sqlite
- `.env` files for secrets (see `.env.example`)

### Local Setup

```bash
# Clone the repo
git clone https://github.com/Hike-12/FSD.git
cd FSD

# Backend setup (Django)
cd backend
pip install -r requirements.txt
# configure your DB credentials in .env
python manage.py migrate
python manage.py runserver

# Backend setup (Node)
cd chat-server
npm install
npm run dev

# Frontend setup (React)
cd ../frontend
npm install
npm run dev

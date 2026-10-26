# Saarthi v42 🏛️
### Civic Grievance Portal — Punjab, India

A web-based platform that helps citizens submit grievances, track complaints, and connect with public administration.

**🔗 Links:** [Live Website](https://saarthi-c2lm.onrender.com) · [API Health](https://saarthi-c2lm.onrender.com/api/health) · [GitHub](https://github.com/pranjal070/Saarthi)

**Tech Stack:** Node.js · Express.js · MongoDB · Mongoose · HTML · CSS · JavaScript

### ✨ Features
- 📝 Grievance registration and complaint tracking
- 👥 Role-based access for citizens and officials
- 🔐 JWT authentication and password hashing
- 📧 Email verification and grievance notifications
- ⏱️ SLA-based grievance escalation
- 📎 File uploads and secure API middleware

### 🏗️ Project Structure
```text
Saarthi/
├── backend/     # API, controllers, models, services
├── frontend/    # HTML, CSS, JavaScript
├── docs/        # API collection and viva preparation
└── README.md
```

### ⚙️ Run Locally
```bash
git clone https://github.com/pranjal070/Saarthi.git
cd Saarthi/backend
npm install
```

Configure your `.env` file using `.env.example`, then run:

```bash
npm run seed
npm start
```

Open `http://localhost:3000`.

### 🚀 Deployment
Hosted on Render with MongoDB Atlas.

*Note: The free Render service may sleep when idle, making the first request slower. Uploaded files on ephemeral storage may not persist across deployments.*

### 👨‍💻 Team
- **Pranjal Thakur** — Backend Development & Email Integration
- **Shehjeet Singh** — Backend Development & Email Integration
- **Parv Sood** — Frontend Development & UI/UX Design

---

<p align="center">
  Built with ❤️ to make civic services more accessible.
</p>

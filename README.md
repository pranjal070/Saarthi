# \# 🚀 SAARTHI v42

# \### Digital Civic Grievance \& Public Service Portal — Punjab, India

# 

# <p align="center">

# &#x20; <strong>🏛️ One Platform. Every Grievance. Better Governance.</strong>

# </p>

# 

# <p align="center">

# &#x20; A civic grievance management platform designed to connect citizens with public administration through complaint registration, tracking, notifications, and escalation workflows.

# </p>

# 

# <p align="center">

# &#x20; <a href="https://saarthi-c2lm.onrender.com">🌐 Live Demo</a> •

# &#x20; <a href="https://saarthi-c2lm.onrender.com/api/health">💚 API Health</a> •

# &#x20; <a href="https://github.com/pranjal070/Saarthi">📂 GitHub Repository</a>

# </p>

# 

# <p align="center">

# &#x20; <img src="https://img.shields.io/badge/SAARTHI-v42-2563EB?style=for-the-badge" alt="Saarthi v42"/>

# &#x20; <img src="https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge\&logo=nodedotjs\&logoColor=white" alt="Node.js"/>

# &#x20; <img src="https://img.shields.io/badge/API-Express-111827?style=for-the-badge\&logo=express\&logoColor=white" alt="Express.js"/>

# &#x20; <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge\&logo=mongodb\&logoColor=white" alt="MongoDB"/>

# &#x20; <img src="https://img.shields.io/badge/Architecture-MVC-7C3AED?style=for-the-badge" alt="MVC"/>

# </p>

# 

# \---

# 

# \## 🌟 About Saarthi

# 

# \*\*Saarthi\*\* is a digital civic grievance portal that helps citizens report public issues and track their progress through a structured administrative workflow.

# 

# The platform brings together citizens, officers, councillors, and administrative authorities in one system, supporting organized grievance handling and greater accountability.

# 

# \### 🎯 Our Mission

# 

# To make civic grievance reporting more accessible, transparent, and efficient through technology.

# 

# \### ✨ Key Features

# 

# | Feature | Description |

# |---|---|

# | 📝 Grievance Management | Register and manage civic complaints |

# | 🔍 Complaint Tracking | Track grievance progress through the tracking workflow |

# | 👥 Role-Based Access | Different access levels for citizens and administrative roles |

# | 🔐 Secure Authentication | JWT authentication and bcrypt password hashing |

# | ✉️ Email Notifications | Emails for registration, grievance submission, status changes, and escalation |

# | ⏱️ SLA Escalation | Scheduled checks for overdue grievances |

# | 📎 File Uploads | Upload support using Multer |

# | 🪪 Aadhaar Privacy | Keyed one-way hashing and retention of the last four digits |

# | 🛡️ API Protection | Helmet, CORS allow-list, request-size limits, and rate limiting |

# | 🔑 Account Protection | Account lockout after repeated incorrect password attempts |

# 

# \---

# 

# \## 🧰 Technology Stack

# 

# <p align="center">

# &#x20; <img src="https://skillicons.dev/icons?i=nodejs,express,mongodb,js,html,css,git,github" alt="Saarthi technology stack"/>

# </p>

# 

# | Component | Technology |

# |---|---|

# | Frontend | HTML5, CSS3, Vanilla JavaScript |

# | Backend | Node.js, Express.js |

# | Database | MongoDB |

# | ODM | Mongoose |

# | Authentication | JSON Web Tokens (JWT) |

# | Password Security | bcrypt |

# | Email Integration | Nodemailer and SMTP |

# | File Uploads | Multer |

# | Security Middleware | Helmet, CORS, rate limiting |

# | Deployment | Render |

# | API Testing | Postman / Thunder Client |

# | Version Control | Git and GitHub |

# 

# \---

# 

# \## 🏗️ System Architecture — MVC

# 

# Saarthi follows the \*\*Model–View–Controller (MVC)\*\* architecture with a service layer for reusable business logic.

# 

# ```text

# &#x20;                   ┌─────────────────────────┐

# &#x20;                   │       FRONTEND          │

# &#x20;                   │   HTML · CSS · JS       │

# &#x20;                   └────────────┬────────────┘

# &#x20;                                │

# &#x20;                                │ HTTP / JSON

# &#x20;                                ▼

# &#x20;                   ┌─────────────────────────┐

# &#x20;                   │     EXPRESS ROUTES      │

# &#x20;                   └────────────┬────────────┘

# &#x20;                                ▼

# &#x20;                   ┌─────────────────────────┐

# &#x20;                   │ MIDDLEWARE \& SECURITY   │

# &#x20;                   │ JWT · CORS · Rate Limit │

# &#x20;                   └────────────┬────────────┘

# &#x20;                                ▼

# &#x20;                   ┌─────────────────────────┐

# &#x20;                   │      CONTROLLERS        │

# &#x20;                   │ Auth · Data · Tracking  │

# &#x20;                   └────────────┬────────────┘

# &#x20;                                ▼

# &#x20;                   ┌─────────────────────────┐

# &#x20;                   │     SERVICE LAYER       │

# &#x20;                   │ Policy · Email · SLA    │

# &#x20;                   └────────────┬────────────┘

# &#x20;                                ▼

# &#x20;                   ┌─────────────────────────┐

# &#x20;                   │   MODELS / MONGOOSE     │

# &#x20;                   └────────────┬────────────┘

# &#x20;                                ▼

# &#x20;                   ┌─────────────────────────┐

# &#x20;                   │        MONGODB          │

# &#x20;                   └─────────────────────────┘

# ```

# 

# \### 🔄 Request Lifecycle

# 

# `Browser → Routes → Middleware → Controller → Service → Model → MongoDB`

# 

# The application processes requests through the backend layers and returns responses as JSON. Errors are passed to the centralized error handler.

# 

# \### 📁 Project Structure

# 

# ```text

# Saarthi/

# │

# ├── backend/

# │   ├── server.js

# │   ├── app.js

# │   │

# │   ├── config/

# │   │   └── env.js

# │   │

# │   ├── models/

# │   │   ├── Rec.js

# │   │   ├── Meta.js

# │   │   └── Token.js

# │   │

# │   ├── controllers/

# │   │   ├── authController.js

# │   │   ├── dataController.js

# │   │   ├── trackController.js

# │   │   ├── uploadController.js

# │   │   └── adminController.js

# │   │

# │   ├── routes/

# │   ├── middleware/

# │   ├── services/

# │   ├── utils/

# │   └── scripts/

# │

# ├── frontend/

# │   ├── HTML pages

# │   ├── css/

# │   └── js/

# │

# ├── docs/

# │   ├── Saarthi.postman\_collection.json

# │   └── VIVA\_PREP.md

# │

# └── README.md

# ```

# 

# \---

# 

# \## ⚙️ Installation \& Local Setup

# 

# Follow these steps to run Saarthi locally on Windows, VS Code, or another supported development environment.

# 

# \### 1. Prerequisites

# 

# Install or prepare:

# 

# \- \[Node.js LTS](https://nodejs.org/)

# \- \[MongoDB Atlas](https://www.mongodb.com/atlas) or another compatible MongoDB instance

# \- \[Git](https://git-scm.com/)

# \- \[Visual Studio Code](https://code.visualstudio.com/) (recommended)

# 

# \### 2. Clone the Repository

# 

# ```bash

# git clone https://github.com/pranjal070/Saarthi.git

# cd Saarthi

# ```

# 

# \### 3. Install Dependencies

# 

# ```bash

# cd backend

# npm install

# ```

# 

# \### 4. Configure Environment Variables

# 

# Copy `.env.example` to `.env` inside the `backend/` directory and configure the required values.

# 

# Typical settings include:

# 

# ```env

# MONGO\_URI=your\_mongodb\_connection\_string

# JWT\_SECRET=your\_strong\_jwt\_secret

# ADMIN\_PASSWORD=your\_admin\_password

# AADHAAR\_PEPPER=your\_private\_pepper

# MAIL\_HOST=

# MAIL\_PORT=

# MAIL\_USER=

# MAIL\_PASS=

# MAIL\_FROM=

# NODE\_ENV=development

# PUBLIC\_URL=http://localhost:3000

# ```

# 

# Use the exact variable names and requirements defined in the project's `.env.example` and configuration files.

# 

# > 🔒 \*\*Important:\*\* Never commit `.env` or expose database credentials, authentication secrets, email passwords, or other private environment values.

# 

# \### 5. Seed the Database

# 

# ```bash

# npm run seed

# ```

# 

# Run the seed command once for the database you intend to use.

# 

# To reset and reload seed data:

# 

# ```bash

# npm run seed -- --reset

# ```

# 

# \*\*Warning:\*\* The reset option is destructive. Use it only when you intentionally want to wipe and reload the seed data.

# 

# \### 6. Start the Server

# 

# ```bash

# npm start

# ```

# 

# Open the application:

# 

# \*\*http://localhost:3000\*\*

# 

# The Express backend also serves the frontend, so a separate frontend server is not required for the default setup.

# 

# \---

# 

# \## ☁️ Deployment — Render

# 

# Saarthi is deployed on Render with MongoDB configured separately.

# 

# \### Deployment Steps

# 

# 1\. Push the project repository to GitHub.

# 2\. Open \[Render](https://render.com/).

# 3\. Create a new Web Service and connect the repository.

# 4\. Set the \*\*Root Directory\*\* to `backend`.

# 5\. Set the build command to `npm install`.

# 6\. Set the start command to `npm start`.

# 7\. Configure all required environment variables.

# 8\. Set `PUBLIC\_URL` to the deployed service URL.

# 9\. Configure MongoDB Atlas network access for the deployed service.

# 10\. Seed the intended database once using the correct environment.

# 

# \### 🔗 Live Resources

# 

# | Resource | URL |

# |---|---|

# | 🌐 Live Website | https://saarthi-c2lm.onrender.com |

# | 💚 API Health Check | https://saarthi-c2lm.onrender.com/api/health |

# | 📂 GitHub Repository | https://github.com/pranjal070/Saarthi |

# 

# \### Frontend API Configuration

# 

# The default deployment serves the frontend and backend from the same service. The frontend can call the API using `/api`.

# 

# If the frontend is hosted separately, configure the API base URL before `js/api.js` loads:

# 

# ```javascript

# window.SAARTHI\_API = "https://your-service.onrender.com/api";

# ```

# 

# Set `PUBLIC\_URL` and the CORS allow-list according to the actual deployment configuration.

# 

# > \*\*Render free-tier note:\*\* The service may sleep after inactivity. The first request after idle time can take up to a minute. Scheduled escalation checks may also pause while the service is asleep.

# 

# \---

# 

# \## 🧪 API Testing

# 

# The project includes a Postman collection for testing API endpoints.

# 

# \### How to Test

# 

# 1\. Open Postman or Thunder Client.

# 2\. Import `docs/Saarthi.postman\_collection.json`.

# 3\. Configure the `baseUrl` variable for local or deployed use.

# 4\. Configure the `adminPassword` variable.

# 5\. Run \*\*Login – supreme admin\*\* to obtain an authentication token.

# 6\. Execute the other requests using the configured environment.

# 

# \*\*Production API:\*\* `https://saarthi-c2lm.onrender.com/api`

# 

# \---

# 

# \## ✉️ Email Integration \& Notifications

# 

# Saarthi uses \*\*Nodemailer with SMTP\*\* for email-related workflows.

# 

# Email notifications are configured for events such as:

# 

# \- Account registration

# \- Grievance submission

# \- Grievance status changes

# \- Grievance escalation

# \- Email verification and password reset flows

# 

# When `MAIL\_HOST` is empty, the application can operate in test mode and save generated emails to `backend/outbox/`, according to the current implementation.

# 

# For production, configure a valid SMTP provider and secure credentials.

# 

# \---

# 

# \## 🔐 Security \& Privacy

# 

# The current implementation includes several security-related controls:

# 

# \- \*\*JWT authentication\*\* for protected routes

# \- \*\*bcrypt password hashing\*\*

# \- Strong-password rules

# \- Rate limiting and account lockout after five incorrect password attempts

# \- Role-based authorization

# \- Helmet security headers

# \- CORS allow-list

# \- Request-size limits

# \- Token expiry support for email links

# \- Keyed one-way Aadhaar hashing and storage of the last four digits

# 

# Security depends on correct configuration and implementation. Verify the deployed environment and permissions before using the portal with real citizen data.

# 

# \---

# 

# \## ⚠️ Known Limitations

# 

# We believe in documenting limitations honestly.

# 

# | Limitation | Details |

# |---|---|

# | 📱 SMS | SMS notifications are not implemented |

# | 💾 File Storage | Uploaded files on Render's ephemeral free disk can be lost during redeployment |

# | 💤 Free-Tier Sleep | The service sleeps when idle, potentially interrupting scheduled escalation checks |

# | 🪪 Aadhaar Validation | Checksum and duplicate protection do not prove that an Aadhaar number is genuine |

# | ⚙️ Workflow Logic | Some grievance workflow rules remain in browser code and are reused by server-side escalation logic |

# | 🔑 Demo Credentials | Default demo passwords must be changed before a public demonstration |

# 

# \---

# 

# \## 🚀 Future Improvements

# 

# Possible next steps for the project include:

# 

# \- ☁️ Persistent object storage for grievance attachments

# \- ⏰ Reliable background workers for SLA escalation

# \- 📱 SMS and additional notification channels

# \- 🛡️ Stronger server-side workflow validation

# \- 🌐 Improved multilingual accessibility

# \- 🧪 Automated tests and continuous integration

# \- 📊 Monitoring, logging, and deployment alerts

# \- ♿ Improved accessibility and responsive design

# \- 📈 Reporting and analytics for grievance resolution

# 

# \---

# 

# \## 👨‍💻 Meet the Team

# 

# Built with dedication by a team focused on civic technology, backend engineering, and user experience.

# 

# <table>

# &#x20; <tr>

# &#x20;   <td align="center">

# &#x20;     <strong>Pranjal Thakur</strong><br/>

# &#x20;     ⚙️ Backend Development<br/>

# &#x20;     ✉️ Email Integration

# &#x20;   </td>

# &#x20;   <td align="center">

# &#x20;     <strong>Shehjeet Singh</strong><br/>

# &#x20;     ⚙️ Backend Development<br/>

# &#x20;     ✉️ Email Integration

# &#x20;   </td>

# &#x20;   <td align="center">

# &#x20;     <strong>Parv Sood</strong><br/>

# &#x20;     🎨 Frontend Development<br/>

# &#x20;     🖌️ UI/UX Design

# &#x20;   </td>

# &#x20; </tr>

# </table>

# 

# <p align="center">

# &#x20; <a href="https://github.com/pranjal070/Saarthi">📂 Explore the Repository</a>

# </p>

# 

# \---

# 

# \## 💙 Our Vision

# 

# <p align="center">

# &#x20; <strong>🏛️ SAARTHI</strong>

# &#x20; <br/>

# &#x20; <em>Technology that connects citizens with public service.</em>

# &#x20; <br/><br/>

# &#x20; One platform. Stronger accountability. A better civic experience.

# </p>




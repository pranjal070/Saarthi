<div align="center">

# 🏛️ SAARTHII
### *One Nation · One Portal — Smart Civic Grievance & Resolution Platform*

[![Govt of Punjab](https://img.shields.io/badge/Govt.%20of-Punjab%20Initiative-orange?style=for-the-badge&logo=india&logoColor=white)](https://github.com/pranjal070/Saarthi)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Status](https://img.shields.io/badge/Status-Active%20Production-success?style=for-the-badge)](https://github.com/pranjal070/Saarthi)

<p align="center">
  <b>Empowering governance through technology in Rajpura, Punjab.</b><br>
  A modern, high-performance civic grievance portal connecting citizens, department officials, municipal councillors, and city administrators in real time.
</p>

---

</div>

## ✨ Key Innovations & Features

### 👁️ 1. Interactive Eyeball Creatures Auth Stage
- **360° Mouse Pupil Tracking**: Real-time 60 FPS physics engine tracking cursor movement using `Math.atan2` and `Math.hypot`.
- **😮 Surprised Mouth Typing Reaction**: Creature 4 (Yellow Sunshine Pill) morphs its mouth into a surprised open state (`😮`) whenever a user types in any input or select field.
- **🎵 Password-Peek Whistling Animation**: Toggling password visibility (👁️) triggers Creature 4 to whistle floating music notes while all 4 creatures glance left!
- **Stationary Layout**: Fixed column positioning ensuring zero overlap with branding logos across all login tabs.

### 📊 2. Multi-Role Dashboard Ecosystem
- **👤 Citizen Portal**: File grievances with photos, track SLA status, view ward councillor contacts, and inspect filing trends.
- **👮 Department Officer Portal**: Filter, assign, investigate, and dispose of grievances across Police, Fire Services, Water & Sanitation, Electricity, and Roads.
- **🏛️ Municipal Councillor (MC) Portal**: Ward-level grievance monitoring, citizen communication, and department forwarding.
- **🖥️ City Administration Portal**: Executive overview for Deputy Commissioner (Patiala), Executive Officer (MC Rajpura), and Chief Minister's Office (CMO).

### ⚡ 3. Animated Gliding Laser Progress Track
- Real-time scroll-based horizontal neon orange laser line gliding across step cards, igniting step circles (`1`, `2`, `3`, `4`) into solid orange glowing spheres sequentially.

### 🗺️ 4. Geo-Tagged Map & India Post API
- **Interactive Leaflet Map**: Geo-referenced grievance tracking with heatmap distribution across Rajpura wards.
- **India Post REST API**: Automatic city and locality verification from 6-digit pincodes.

### 🌐 5. Internationalization (i18n) & Theme Engine
- **Multi-Language**: Instant switching between English (🇬🇧), Punjabi (🇵🇧), and Hindi (🇮🇳).
- **Vibrant Theme System**: Signature primary orange (`#f25100`), navy dark (`#0b1320`), light paper, and dark mode engine.

---

## 🎨 Design System

| Element | Specification |
| :--- | :--- |
| **Primary Accent** | `#f25100` *(Vibrant Orange)* |
| **Primary Hover** | `#d94800` *(Deep Orange)* |
| **Dark Navy** | `#0b1320` *(Rich Navy)* |
| **Typography** | `Plus Jakarta Sans`, `Caveat` *(Script Annotation)* |
| **Icons** | Clean Vector SVGs |

---

## 📁 Repository Structure

```tree
Saarthi/
├── 📄 index.html              # Landing Page (Hero, Dept Cards, How It Works, Stats)
├── 🔑 login.html              # Interactive Eyeball Creatures Login Page
├── 📝 signup.html             # Centered Citizen Registration Page
├── 📊 citizen.html            # Citizen Dashboard & Grievance Tracker
├── 👮 officer.html            # Department Officer Grievance Disposal Workspace
├── 🏛️ mc.html                 # Municipal Councillor Ward Dashboard
├── 🖥️ authority.html          # City-wide Administration Portal
├── 📞 directory.html          # Emergency Contacts & Department Directory
├── 🎨 css/
│   └── style.css              # Core Design System, Animations & Responsive Grid
└── ⚙️ js/
    ├── app.js                 # Session Management, Auth & Grievance DB Engine
    ├── data.js                # Department, Officer & Ward Data Stores
    ├── i18n.js                # Multi-language Translation System
    ├── notify.js              # Real-Time Toast Notifications
    └── charts.js              # Analytics Visualization Engine
```

---

## 🚀 Quick Start Guide

### 1. Clone the Repository
```bash
git clone https://github.com/pranjal070/Saarthi.git
cd Saarthi
```

### 2. Launch Local Server
No build tools or node dependencies required! Run any static HTTP server:

```bash
# Using Python (Built-in)
python -m http.server 3000

# Or using Node.js npx
npx serve .
```

Open your browser at **[http://localhost:3000](http://localhost:3000)**.

---

## 🔑 Demo Account Credentials

| Portal Role | Username / Identifier | Demo Password |
| :--- | :--- | :--- |
| **Citizen** | Register new or use active mobile | User Password |
| **Dept. Officer** | Select Department & Officer | `officer@123` |
| **Municipal Councillor** | Select Ward Number | `mc@123` |
| **Administration** | Deputy Commissioner / EO Rajpura | `dc@123` · `eo@123` |

---

## 👤 Author & Contributor

Designed and developed with ❤️ by **[parvvsood](https://github.com/parvvsood)**.

---

<div align="center">
  <sub>Built for the citizens of Rajpura, Punjab · 🏛️ SAARTHII Civic Tech Platform</sub>
</div>

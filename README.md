# 💎 Aura Jewels: High-End MERN E-Commerce Architecture

A production-grade, full-stack e-commerce solution engineered for luxury jewellery retail. This platform demonstrates a modern migration from legacy infrastructure to a scalable MERN (MongoDB, Express, React, Node.js) architecture, featuring real-time market-driven pricing and secure administrative controls.

---

## 🚀 Architectural Highlights

### 1. Dynamic Market Pricing Engine
The platform implements a real-time pricing algorithm that calculates product costs on-the-fly based on live market rates (Gold/Silver) managed via the Administrative Portal.
*   **Formula**: `(Metal Weight × Live Market Rate) + Making Charges + GST`.
*   **Live Ticker**: A high-performance simulation engine on the frontend provides sub-second price fluctuations to create a premium, "live market" user experience.

### 2. Security & Authentication
*   **JWT & Secure Cookies**: Authentication is handled via JSON Web Tokens with HTTP-Only cookies to mitigate XSS and CSRF risks.
*   **RBAC (Role-Based Access Control)**: Strict separation of concerns between standard customers and administrative users.
*   **Data Protection**: Advanced password hashing using `bcryptjs` and request sanitization using `helmet.js`.

### 3. Modern Frontend State Management
*   Built with **React.js** and **Vite** for optimized build performance.
*   Utilizes **Redux Toolkit** for centralized state management, ensuring a seamless and fast shopping experience.

---

## 🛠️ Tech Stack
*   **Frontend**: React, Redux Toolkit, Recharts (Analytical Trends), Vanilla CSS.
*   **Backend**: Node.js, Express.js, JWT.
*   **Database**: MongoDB (Mongoose ODM).
*   **Infrastructure**: Helmet.js (Security Headers), Express-Rate-Limit.

---

## 📋 Evaluator's Quick-Start

### Admin Dashboard Access
To test the administrative features (Inventory Management, Live Rate Control, Order Tracking):
1.  Navigate to the **Management Portal** link in the footer or visit `/login`.
2.  **Credentials**:
    *   **User**: `admin@aurajewels.com`
    *   **Password**: `Admin@123`

### Local Development
```bash
# Install dependencies
npm install

# Initialize cloud database
npm run seed

# Launch development environment
npm start
```

---

## 🌐 Deployment Architecture
The project is architected for zero-config deployment on modern cloud platforms:
*   **Backend**: Optimized for Render/Railway (Node/Express).
*   **Frontend**: Optimized for Vercel/Netlify (Vite/React).
*   **Database**: MongoDB Atlas (Cloud Cluster).

---

## 📜 Professional Disclaimer
**Project Origin**: This platform was originally developed as a professional freelance project for a luxury retail client. 

**Privacy & Security Compliance**: In accordance with NDAs and best practices for public portfolio sharing, all sensitive client information, proprietary business data, and production database credentials have been **completely removed**. The current repository utilizes a secure, mock-data environment and sanitized API endpoints. Permission was obtained from the original client to showcase the technical architecture and UI/UX design as a professional case study.

---
*Developed by Sajal Shukla | Full-Stack Engineering Showcase*

## 🛡️ Security & Credentials Management
This project follows the **"Zero-Knowledge" security principle**:
- **Environment Variables**: All sensitive keys (MongoDB URI, JWT Secret) are stored in `.env` and are strictly ignored by Git.
- **Deployment Security**: Credentials are never pushed to GitHub. They must be configured directly within the hosting provider's (Render/Vercel) secure dashboard.
- **Database Protection**: The production database utilizes IP whitelisting and Role-Based Access Control (RBAC) to ensure only the application server can modify the data.

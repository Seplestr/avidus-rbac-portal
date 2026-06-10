# Avidus RBAC & User Activity Portal

A professional full-stack web application designed to manage and monitor user access permissions and track system activity logs. This portal provides clean, simplified workflows for standard users to manage their individual tasks, while granting administrators complete oversight over user accounts, task metrics, and system-wide audit feeds.

---

## 🚀 Key Features

### 1. Role-Based Access Control (RBAC)
- **Protected Routing:** Strict frontend route guarding (using React Router DOM wrappers) and backend route protection (using Express middlewares).
- **Status Audits:** Real-time account status checks (Active/Inactive) that instantly restrict API and page access for deactivated users.
- **User Role:** Create and manage individual tasks only.
- **Admin Role:** Complete control panel access to oversee all accounts and tasks.

### 2. User Dashboard (My Tasks)
- Sleek, list-based task tracker styled with a clean flat monochrome theme.
- Inline checklist checkboxes to quickly toggle completion status.
- Text-based search bar and status filter buttons (`All`, `Pending`, `Completed`).
- Data isolation: users can only view, edit, and delete their own tasks.

### 3. Admin Control Panel
- **Analytics Metrics:** Dashboard widget displaying counts for total users, total tasks, completed tasks, and pending tasks.
- **User Management:** Oversee registered accounts, toggle active status (`Active`/`Inactive`), and delete users.
- **Task Monitoring:** View and track all tasks in the system, with the option to delete any task.
- **System Logs:** A chronological audit timeline of all logins, task creation, status updates, and deletions in the application.

---

## 🛠️ Technology Stack
- **Backend:** Node.js, Express, MongoDB (via Mongoose), JSON Web Tokens (JWT) for authentication, and bcryptjs for password hashing.
- **Frontend:** React.js (Vite), React Router DOM.
- **Styling:** Custom flat monochrome CSS using the *Inter* typeface, optimized for maximum text legibility and contrast.

---

## ⚙️ Installation & Running Locally

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster URL (or a local MongoDB running database)

### Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory and configure the variables:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_jwt_secret_key
   ```
4. Start the backend dev server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` or set environment variables:
   - Make sure to point `VITE_API_URL` to your backend server (e.g. `http://localhost:5000/api`).
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:5173` in your browser.

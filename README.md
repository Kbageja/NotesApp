# HD Notes 📝

A modern, full-stack notes application with Google OAuth authentication, built with React and Node.js. Create, organize, and manage your notes with a clean and intuitive interface.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Scripts](#scripts)
- [Contributing](#contributing)

## 🎯 Overview

HD Notes is a full-stack notes application that allows users to securely create, edit, and manage their personal notes. The application features Google OAuth integration for seamless authentication, providing a modern and user-friendly experience.

## ✨ Features

- 🔐 **Google OAuth Authentication** - Sign in/up with Google via Clerk
- 📝 **Create & Edit Notes** - Rich note creation and editing capabilities
- 🗂️ **Organize Notes** - Keep your thoughts organized
- 🔒 **Secure Backend** - JWT-based authentication and authorization
- 📱 **Responsive Design** - Works seamlessly on all devices
- ⚡ **Fast Performance** - Built with Vite for lightning-fast load times
- 🎨 **Modern UI** - Clean interface with Tailwind CSS
- 🔄 **Real-time Updates** - TanStack Query for optimal data synchronization
- 📧 **Email Notifications** - Nodemailer integration for email services
- 🛡️ **Security First** - Rate limiting, CORS, and Helmet protection

## 🚀 Tech Stack

### Frontend
- **React 19** - Modern UI library
- **Vite 7** - Next-generation build tool
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Clerk** - Authentication provider (Google OAuth)
- **React Router DOM 7** - Client-side routing
- **TanStack Query 5** - Powerful data synchronization
- **Axios** - HTTP client
- **React Hot Toast** - Elegant notifications
- **Lucide React** - Beautiful icons
- **Headless UI** - Unstyled, accessible components

### Backend
- **Node.js** - JavaScript runtime
- **Express 5** - Fast web framework
- **TypeScript** - Type safety
- **MongoDB/Mongoose** - NoSQL database
- **JWT** - Secure token authentication
- **Bcrypt.js** - Password hashing
- **Google OAuth 2.0** - Third-party authentication
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logging
- **Express Rate Limit** - API rate limiting
- **Express Validator & Joi** - Input validation
- **Nodemailer** - Email service

## 📁 Project Structure

```
.
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and helpers
│   │   └── App.tsx        # Root component
│   ├── public/
│   └── package.json
│
└── backend/               # Node.js backend API
    ├── src/
    │   ├── controllers/   # Request handlers
    │   ├── models/        # Database models
    │   ├── routes/        # API routes
    │   ├── middleware/    # Custom middleware
    │   ├── config/        # Configuration files
    │   └── app.ts         # Express app setup
    ├── dist/              # Compiled JavaScript
    └── package.json
```

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or Atlas)
- Google OAuth credentials
- Clerk account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hd-notes.git
   cd hd-notes
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Create a database named `NotesAssignment`

5. **Configure Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs

6. **Configure Clerk**
   - Sign up at [Clerk](https://clerk.com/)
   - Create a new application
   - Enable Google OAuth provider
   - Copy your publishable key

7. **Set up environment variables**
   
   Create `.env` file in the **backend** directory:
   ```env
   # Server Configuration
   PORT=8080
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb://localhost:27017/NotesAssignment

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_EXPIRES_IN=7d

   # CORS
   FRONTEND_URL=http://localhost:5173

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_FROM=HD Notes <your-email@gmail.com>
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-specific-password
   ```

   Create `.env` file in the **frontend** directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   VITE_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
   ```

8. **Run the application**

   **Start Backend** (from backend directory):
   ```bash
   npm run dev
   ```
   Backend will run on `http://localhost:8080`

   **Start Frontend** (from frontend directory):
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

9. **Access the application**
   
   Open your browser and navigate to `http://localhost:5173`

## 🔐 Environment Variables

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `8080` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/NotesAssignment` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key` |
| `JWT_EXPIRES_IN` | JWT token expiration | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | From Google Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | From Google Console |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_FROM` | From email address | `HD Notes <your@email.com>` |
| `EMAIL_USER` | SMTP username | `your@email.com` |
| `EMAIL_PASS` | SMTP password/app password | Gmail app-specific password |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8080/api` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | From Clerk dashboard |

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user

### Notes
- `GET /api/notes` - Get all notes for user
- `POST /api/notes` - Create new note
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

## 📜 Scripts

### Frontend Scripts
```bash
npm run dev       # Start Vite dev server (port 5173)
npm run build     # Build for production (TypeScript + Vite)
npm run lint      # Run ESLint for code quality
npm run preview   # Preview production build locally
```

### Backend Scripts
```bash
npm run dev       # Start development server with nodemon
npm run build     # Compile TypeScript to JavaScript (dist/)
npm start         # Run production build from dist/
npm run clean     # Remove compiled dist folder
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Helmet security headers
- Input validation and sanitization
- Environment variable protection

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👥 Author

Created with ❤️ by [Your Name]

## 🙏 Acknowledgments

- [Clerk](https://clerk.com/) for authentication
- [MongoDB](https://www.mongodb.com/) for database
- [Vite](https://vitejs.dev/) for blazing fast builds
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

⭐ If you find this project helpful, please give it a star!

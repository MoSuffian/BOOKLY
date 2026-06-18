# Bookly - Library Management System

Bookly is an elegant, scholarly-themed digital library platform. It provides a seamless experience for students to browse and borrow books, and a comprehensive suite of tools for administrators to manage the catalog, oversee user roles, and view analytics.

## Features

### For Students
- **Curated Catalog:** Browse a rich, searchable collection organized by title, author, and category.
- **Seamless Borrowing:** Borrow and return books easily.
- **My Borrowings:** Track all active loans, return history, and overdue books in a dedicated, polished dashboard.

### For Admins
- **Manage Books:** Add, edit, and remove titles from the library inventory. Real-time updates to availability.
- **Manage Users:** Promote students to admins, manage access levels, or remove users.
- **Rich Analytics:** View borrowing trends, popular genres, return rates, and active loans.
- **Borrowing Capabilities:** Admins can also borrow and return books just like students.

### General
- **Dynamic Landing Page:** Real-time statistics (total titles, return rate) and covers from recently added books using OpenLibrary / Google Books APIs.
- **Responsive Design:** A beautifully crafted, minimal, and warm UI (Japandi/Scandi aesthetics) that works on desktop and mobile.
- **Chatbot Integration:** AI-powered assistant to help users with their library inquiries.

## File Structure

```text
Library_Management_System/
├── client/                     # React Frontend
│   ├── public/
│   │   ├── index.html
│   │   ├── bookly-logo.png
│   │   └── hero-bg.png         # Elegant hero background
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Navbar.css
│   │   │   └── BookCover.jsx   # Shared dynamic book cover fetcher
│   │   ├── pages/              # Application views
│   │   │   ├── Landing.jsx     # Landing page
│   │   │   ├── Landing.css
│   │   │   ├── Login.jsx       # Auth pages
│   │   │   ├── Register.jsx
│   │   │   ├── Auth.css
│   │   │   ├── Dashboard.jsx   # Main user/admin dashboard
│   │   │   ├── Dashboard.css
│   │   │   ├── Books.jsx       # Library catalog
│   │   │   ├── Books.css
│   │   │   ├── Chatbot.jsx     # AI assistant
│   │   │   ├── Chatbot.css
│   │   │   ├── ManageBooks.jsx # Admin tools
│   │   │   ├── ManageBooks.css
│   │   │   ├── ManageUsers.jsx
│   │   │   ├── Analysis.jsx    # Analytics dashboard
│   │   │   ├── MyBorrowings.jsx# Student/Admin borrow tracking
│   │   │   └── MyBorrowings.css
│   │   ├── services/
│   │   │   └── api.js          # Axios API configuration
│   │   ├── App.js              # Route configuration
│   │   └── index.js
│   └── package.json
└── server/                     # Node.js + Express Backend
    ├── controllers/            # Business logic
    │   ├── authController.js
    │   ├── bookController.js
    │   ├── borrowController.js
    │   ├── chatController.js
    │   └── userController.js
    ├── models/                 # Mongoose schemas
    │   ├── Book.js
    │   ├── Borrow.js
    │   └── User.js
    ├── routes/                 # API endpoints
    │   ├── authRoutes.js
    │   ├── bookRoutes.js
    │   ├── borrowRoutes.js
    │   ├── chatRoutes.js
    │   └── userRoutes.js
    ├── middleware/
    │   └── auth.js             # JWT authentication
    ├── server.js               # Express server entry point
    └── package.json
```

## Tech Stack
- **Frontend:** React, React Router, CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB, Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **External APIs:** Google Books API, OpenLibrary API (for book covers)

## Getting Started

1. Clone the repository.
2. Setup the server:
   ```bash
   cd server
   npm install
   # Create a .env file with PORT, MONGO_URI, JWT_SECRET, and GEMINI_API_KEY
   npm start
   ```
3. Setup the client:
   ```bash
   cd client
   npm install
   npm start
   ```

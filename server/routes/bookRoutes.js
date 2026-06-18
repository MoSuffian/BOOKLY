const express = require("express");
const router = express.Router();

const {
    addBook,
    getBooks,
    updateBook,
    deleteBook,
    getUserBorrowingAnalytics,
    getLandingStats
} = require("../controllers/bookController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

// Public Route
router.get("/", getBooks);
router.get("/landing-stats", getLandingStats);

//Protected Route
router.get("/analytics/borrowing", protect, getUserBorrowingAnalytics);

// Admin Routes
router.post(
    "/",
    protect,
    adminOnly,
    addBook
);

router.put(
    "/:id",
    protect,
    adminOnly,
    updateBook
);

router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteBook
);

module.exports = router;
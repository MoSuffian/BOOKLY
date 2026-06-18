const express = require("express");
const router = express.Router();

const {
    borrowBook,
    returnBook,
    getBorrowHistory,
    getMyBorrowings
} = require("../controllers/borrowController");

const protect = require("../middleware/authMiddleware");

// Borrow book
router.post("/", protect, borrowBook);

// Return book
router.put("/:id", protect, returnBook);

router.get("/my", protect, getMyBorrowings);

// Borrow history
router.get("/", protect, getBorrowHistory);


module.exports = router;
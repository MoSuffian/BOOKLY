const express = require("express");
const router = express.Router();

const { getAllUsers, updateUserRole } = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

// Admin-only routes
router.get("/", protect, adminOnly, getAllUsers);
router.patch("/:id/role", protect, adminOnly, updateUserRole);

module.exports = router;

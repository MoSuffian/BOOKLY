const User = require("../models/User");

// GET /api/users — list all users (admin only)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, "-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH /api/users/:id/role — promote/demote a user (admin only)
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!["admin", "student"].includes(role)) {
            return res.status(400).json({ message: "Invalid role. Must be 'admin' or 'student'." });
        }

        // Prevent an admin from demoting themselves
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: "You cannot change your own role." });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, select: "-password" }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json({ message: `User role updated to '${role}'.`, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllUsers, updateUserRole };

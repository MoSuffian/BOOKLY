const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.send("Auth Route Working");
});

const { 
    registerUser, 
    loginUser } = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
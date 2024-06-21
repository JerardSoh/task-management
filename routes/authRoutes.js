const express = require("express");
const router = express.Router();
const { login, logout } = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");

// Route for logging in
router.post("/login", login);

// Route for logging out (requires authentication)
router.post("/logout", authenticateToken, logout);

module.exports = router;

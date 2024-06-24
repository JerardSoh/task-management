const express = require("express");
const router = express.Router();
const {
    login,
    logout,
    checkAuth,
    isAdmin,
} = require("../controllers/authController");
const { authenticateToken, checkGroup } = require("../middleware/auth");

// Route for logging in
router.post("/login", login);

// Route for checking authentication status
router.get("/auth", authenticateToken, checkAuth);

// Route for logging out (requires authentication)
router.post("/logout", authenticateToken, logout);

// Route for checking admin status (requires authentication)
router.get("/admin", authenticateToken, checkGroup("admin"), isAdmin);

module.exports = router;

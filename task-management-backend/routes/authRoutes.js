const express = require("express");
const router = express.Router();
const {
    login,
    logout,
    checkAuth,
    isAdmin,
    isProjectLead,
} = require("../controllers/authController");
const { authenticateToken, requireGroup } = require("../middleware/auth");

// Route for logging in
router.post("/login", login);

// Route for checking authentication status
router.get("/auth", authenticateToken, checkAuth);

// Route for logging out (requires authentication)
router.post("/logout", authenticateToken, logout);

// Route for checking admin status (requires authentication)
router.get("/admin", authenticateToken, requireGroup("admin"), isAdmin);

// Route for checking project lead status (requires authentication)
router.get("/projectlead", authenticateToken, isProjectLead);

module.exports = router;

const express = require("express");
const router = express.Router();
const { login, logout } = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");

// Route for logging in
router.post("/login", login);

// Route for checking authentication status
router.get("/checkAuth", authenticateToken, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Authenticated",
        user: req.user,
    });
});

// Route for logging out (requires authentication)
router.post("/logout", authenticateToken, logout);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
    createUser,
    getUsers,
    viewMyProfile,
    updateUserEmail,
    updateUserPassword,
    updateUserDetails,
} = require("../controllers/userController");
const { requireGroup } = require("../middleware/auth");

// Admin-protected routes
router.post("/new", requireGroup("admin"), createUser); // Create a new user
router.get("/all", requireGroup("admin"), getUsers); // Get all users
router.put("/:username/update", requireGroup("admin"), updateUserDetails); // Update user details

// User self-service routes
router.get("/me", viewMyProfile); // View own profile
router.put("/me/email", updateUserEmail); // Update own email
router.put("/me/password", updateUserPassword); // Update own password

module.exports = router;

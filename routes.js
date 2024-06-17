const express = require("express");
const authMiddleware = require("./middleware/auth");
const router = express.Router();
const {
    login,
    createUser,
    createGroup,
    getGroups,
    getUsers,
    viewProfile,
    updateUserEmail,
    updateUserPassword,
    updateUserStatus,
    assignGroup,
} = require("./controllers/userController");

router.post("/login", login);
router.post("/user/new", createUser);
router.post("/group/new", authMiddleware, createGroup);
router.get("/users", authMiddleware, getUsers);
router.get("/groups", authMiddleware, getGroups);
router.get("/user/:username", authMiddleware, viewProfile);
router.put("/user/:username/email", authMiddleware, updateUserEmail);
router.put("/user/:username/password", authMiddleware, updateUserPassword);
router.put("/user/:username/status", authMiddleware, updateUserStatus);
router.post("/user/:username/group", authMiddleware, assignGroup);

module.exports = router;

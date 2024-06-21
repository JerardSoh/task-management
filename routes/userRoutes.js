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
const { checkAdmin } = require("../middleware/auth");

router.post("/new", createUser);

router.get("/all", checkAdmin, getUsers);
router.get("/me", viewMyProfile);
router.put("/me/email", updateUserEmail);
router.put("/me/password", updateUserPassword);
router.put("/:username/update", checkAdmin, updateUserDetails);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
    createUser,
    getUsers,
    viewMyProfile,
    viewUserProfile,
    updateUserEmail,
    updateUserPassword,
    updateUserDetails,
} = require("../controllers/userController");

router.post("/new", createUser);

router.get("/all", getUsers);
router.get("/me", viewMyProfile);
router.get("/:username", viewUserProfile);
router.put("/:username/email", updateUserEmail);
router.put("/:username/password", updateUserPassword);
router.put("/:username/update", updateUserDetails);

module.exports = router;

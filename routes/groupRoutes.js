const express = require("express");
const router = express.Router();
const { createGroup, getGroups } = require("../controllers/groupController");
const authToken = require("../middleware/auth");

router.get("/all", authToken, getGroups);
router.post("/new", authToken, createGroup);

module.exports = router;

const express = require("express");
const router = express.Router();
const { createGroup, getGroups } = require("../controllers/groupController");

// Get all groups
router.get("/all", getGroups);

// Create a new group
router.post("/new", requireGroup("admin"), createGroup);

module.exports = router;

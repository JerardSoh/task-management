const express = require("express");
const router = express.Router();
const { getApps, createApp } = require("../controllers/appController");
const { requireGroup } = require("../middleware/auth");

// Get all apps
router.get("/all", getApps);

// Create a new app
//router.post("/new", requireGroup("projectlead"), createApp);
router.post("/new", createApp);

module.exports = router;

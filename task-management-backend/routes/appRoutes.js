const express = require("express");
const router = express.Router();
const {
    getApps,
    createApp,
    editApp,
    getAppDetails,
} = require("../controllers/appController");
const { requireGroup } = require("../middleware/auth");

// Get all apps
router.get("/all", getApps);

// Create a new app
router.post("/new", createApp);
//router.post("/new", createApp);

// Update an app
router.put("/:App_Acronym/edit", editApp);
//router.put("/:App_Acronym/edit", editApp);

// Get app details
router.get("/:App_Acronym", getAppDetails);

module.exports = router;

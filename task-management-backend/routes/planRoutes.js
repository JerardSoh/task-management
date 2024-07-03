const express = require("express");
const router = express.Router();
const {
    getPlans,
    createPlan,
    getPlanDetails,
} = require("../controllers/planController");
const { requireGroup } = require("../middleware/auth");

// Get all plans
router.get("/:App_Acronym/all", getPlans);

// Create a new plan
//router.post("/new", requireGroup("projectlead"), plan);
router.post("/:App_Acronym/new", createPlan);

// Get plan details
router.get("/:App_Acronym/:Plan_MVP_Name", getPlanDetails);

module.exports = router;

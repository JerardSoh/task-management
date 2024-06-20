const express = require("express");
const router = express.Router();
const { createGroup, getGroups } = require("../controllers/groupController");

router.get("/all", getGroups);
router.post("/new", createGroup);

module.exports = router;

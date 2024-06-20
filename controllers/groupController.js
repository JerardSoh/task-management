const db = require("../db");
const HttpError = require("../utils/httpError");
const asyncHandler = require("../utils/asyncHandler");

// Get all groups route: /group/all
const getGroups = asyncHandler(async (req, res, next) => {
    const [groups] = await db.execute("SELECT * FROM `groups`");
    res.status(200).json({ success: true, groups });
});

// Create new group route: /group/new
const createGroup = asyncHandler(async (req, res, next) => {
    const { groupname } = req.body;

    // Check if group already exists
    const [existingGroup] = await db.execute(
        "SELECT groupname FROM `groups` WHERE groupname = ?",
        [groupname]
    );
    if (existingGroup.length > 0) {
        throw new HttpError("Group already exists", 409);
    }
    // Create group
    await db.execute("INSERT INTO `groups` (groupname) VALUES (?)", [
        groupname,
    ]);

    res.status(201).json({
        success: true,
        message: "Group created successfully",
    });
});

module.exports = { getGroups, createGroup };

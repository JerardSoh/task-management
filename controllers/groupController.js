const db = require("../db");
const HttpError = require("../utils/httpError");
const asyncHandler = require("../utils/asyncHandler");

// Constants for HTTP status codes
const STATUS_OK = 200;
const STATUS_CREATED = 201;
const STATUS_CONFLICT = 409;

// Get all groups route: /group/all
const getGroups = asyncHandler(async (req, res, next) => {
    const [groups] = await db.execute("SELECT * FROM `groups`");
    res.status(STATUS_OK).json({ success: true, groups });
});

// Create new group route: /group/new
const createGroup = asyncHandler(async (req, res, next) => {
    const { groupname } = req.body;

    if (
        !groupname ||
        typeof groupname !== "string" ||
        groupname.trim() === ""
    ) {
        throw new HttpError("Invalid group name", STATUS_CONFLICT);
    }

    // Check if group already exists
    const [existingGroup] = await db.execute(
        "SELECT groupname FROM `groups` WHERE groupname = ?",
        [groupname.trim()]
    );
    if (existingGroup.length > 0) {
        throw new HttpError("Group already exists", STATUS_CONFLICT);
    }
    // Create group
    await db.execute("INSERT INTO `groups` (groupname) VALUES (?)", [
        groupname.trim(),
    ]);

    res.status(STATUS_CREATED).json({
        success: true,
        message: "Group created successfully",
    });
});

module.exports = { getGroups, createGroup };

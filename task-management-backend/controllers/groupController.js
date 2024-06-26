const db = require("../db");
const HttpError = require("../utils/httpError");
const asyncHandler = require("../utils/asyncHandler");

// Constants for HTTP status codes
const STATUS_OK = 200;
const STATUS_CREATED = 201;
const STATUS_CONFLICT = 409;

// Get all groups route: /group/all
const getGroups = asyncHandler(async (req, res, next) => {
    const [groups] = await db.execute("SELECT groupname FROM `groups`");
    res.status(STATUS_OK).json({
        success: true,
        groups: groups.map((group) => group.groupname),
    });
});

// Create new group route: /group/new
const createGroup = asyncHandler(async (req, res, next) => {
    const { groupname } = req.body;

    // Validate group name
    if (!groupname) {
        throw new HttpError("Group name is required", STATUS_CONFLICT);
    }

    if (typeof groupname !== "string") {
        throw new HttpError("Group name must be a string", STATUS_CONFLICT);
    }

    if (groupname.trim() === "") {
        throw new HttpError(
            "Group name cannot be empty or just whitespace",
            STATUS_CONFLICT
        );
    }

    if (!/^[a-zA-Z0-9_]+$/.test(groupname)) {
        throw new HttpError(
            "Invalid group name. Group name can only contain alphanumeric characters and underscores.",
            STATUS_CONFLICT
        );
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

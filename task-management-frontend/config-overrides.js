const path = require("path");

module.exports = function override(config, env) {
    // Modify the entry point
    config.entry = path.resolve(__dirname, "src/f_index.js"); // Change this to your new entry file
    return config;
};

// This file is used to override the default configuration of the Create React App.
// It is used to change the entry point of the application to src/index.js.
const path = require("path");

module.exports = {
    paths: (paths, env) => {
        paths.appIndexJs = path.resolve(__dirname, "src/index.js");
        return paths;
    },
};

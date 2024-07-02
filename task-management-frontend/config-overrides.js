const path = require("path");

module.exports = {
    paths: (paths, env) => {
        paths.appIndexJs = path.resolve(__dirname, "src/index.js");
        return paths;
    },
};

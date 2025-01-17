import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        files: ["**/*.js"],
        languageOptions: {
            sourceType: "commonjs", // Use CommonJS modules (require, module.exports)
            globals: {
                ...globals.node, // Include Node.js globals (require, process, __dirname, etc.)
            },
        },
    },
    pluginJs.configs.recommended, // Use recommended ESLint rules
];

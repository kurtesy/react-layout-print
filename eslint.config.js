import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
    {
        ignores: ["lib/"],
    },
    {
        files: ["**/*.{js,jsx}"],
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            react: pluginReact,
            "react-hooks": pluginReactHooks,
            "jsx-a11y": pluginJsxA11y,
        },
        settings: {
            react: {
                version: "detect",
            },
        },
        rules: {
            ...pluginJs.configs.recommended.rules,
            ...pluginReact.configs.recommended.rules,
            ...pluginReactHooks.configs.recommended.rules,
            ...pluginJsxA11y.configs.recommended.rules,
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off"
        },
    },
    eslintConfigPrettier,
];
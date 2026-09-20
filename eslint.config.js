import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import { reactRefresh } from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default defineConfig(
    globalIgnores(["**/dist/", "**/coverage/", "apps/server/src/generated/"]),
    js.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        rules: {
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
        },
    },
    {
        files: ["apps/web/**/*.{ts,tsx}", "apps/site/**/*.{ts,tsx}", "packages/ui/**/*.{ts,tsx}"],
        extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite()],
    },
    {
        files: ["**/*.js", "**/*.config.ts"],
        extends: [tseslint.configs.disableTypeChecked],
    },
);

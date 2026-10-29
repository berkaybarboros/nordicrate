import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// A warn-only list of sixteen files lived here from 2026-09-28, so that
// `npm run lint` could be a pass/fail gate while the React Compiler findings
// were worked through. All of them are fixed: the fetch-in-effect pages moved to
// useFetchJson, the storage reads to useStorageItem/useMinuteClock, and
// HeroSearch — the one static-components offender, and dead code besides — is
// gone. Checked on 2026-10-30 by running both rules at error over the old list.
//
// No rule is downgraded now. If one fires, fix the code; bringing the list back
// is how twenty-seven unread errors happened the first time.

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

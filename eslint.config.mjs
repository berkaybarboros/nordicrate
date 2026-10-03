import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Known debt, frozen on 2026-09-28 so `npm run lint` can be a pass/fail gate in CI
// instead of a wall of pre-existing errors nobody reads.
//
// Two React Compiler rules fire across the pages written before the rules existed:
//   - set-state-in-effect: the "fetch in useEffect, setState in the callback" pattern.
//     It works, but it costs an extra render pass and belongs in a server component
//     or a fetch-on-event handler instead.
//   - static-components: HeroSearch declares child components inside its own body,
//     so they remount and lose state on every parent render.
//
// These files are warn-only. Every other file gets the error, so new code cannot
// join the list. Fix a file, then delete it from here — never add one.
const LINT_DEBT = {
  'set-state-in-effect': [
    'app/deposits/DepositsContent.tsx',
    'app/insurance/casco/CascoContent.tsx',
    'app/insurance/health/HealthContent.tsx',
    'app/insurance/home/HomeInsuranceContent.tsx',
    'app/insurance/life/LifeInsuranceContent.tsx',
    'app/insurance/motor/MotorInsuranceContent.tsx',
    'app/insurance/travel/TravelInsuranceContent.tsx',
    'app/loans/car/CarLoansContent.tsx',
    'app/loans/personal/PersonalLoansContent.tsx',
    'components/AIProductSection.tsx',
    'components/ConsentBanner.tsx',
    'components/PageFeedback.tsx',
    'components/RateFreshness.tsx',
    'components/SmartRateWidget.tsx',
    'contexts/LanguageContext.tsx',
  ],
  'static-components': ['components/HeroSearch.tsx'],
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...Object.entries(LINT_DEBT).map(([rule, files]) => ({
    files,
    rules: { [`react-hooks/${rule}`]: 'warn' },
  })),
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

export { en } from "./en";
export { et } from "./et";
export { fi } from "./fi";
export { lv } from "./lv";
export type { Translations } from "./en";

export type Locale = "en" | "et" | "fi" | "lv";

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  et: "Eesti",
  fi: "Suomi",
  lv: "Latviešu",
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  en: "🇬🇧",
  et: "🇪🇪",
  fi: "🇫🇮",
  lv: "🇱🇻",
};

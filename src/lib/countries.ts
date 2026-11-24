import hebrewCountries from "i18n-iso-countries/langs/he.json";

const familiarNames: Record<string, string> = {
  GB: "בריטניה",
  US: "ארצות הברית",
  KR: "דרום קוריאה",
  CL: "צ׳ילה",
};

export const countries = Object.entries(hebrewCountries.countries)
  .map(([code, name]) => {
    const value = familiarNames[code] ?? (Array.isArray(name) ? name[0] : name);
    return { value, label: value, flag: code.toLowerCase() };
  })
  .sort((first, second) => first.label.localeCompare(second.label, "he"));
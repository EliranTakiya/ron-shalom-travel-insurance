"use client";

import { useState } from "react";

type SearchFormProps = {
  destination: string;
  setDestination: (value: string) => void;
  onContinue: () => void;
};

const countries = [
  { value: "צרפת", label: "צרפת", flag: "fr" },
  { value: "איטליה", label: "איטליה", flag: "it" },
  { value: "ספרד", label: "ספרד", flag: "es" },
  { value: "גרמניה", label: "גרמניה", flag: "de" },
  { value: "יוון", label: "יוון", flag: "gr" },
  { value: "פורטוגל", label: "פורטוגל", flag: "pt" },
  { value: "בריטניה", label: "בריטניה", flag: "gb" },
  { value: "הולנד", label: "הולנד", flag: "nl" },
  { value: "אוסטריה", label: "אוסטריה", flag: "at" },
  { value: "שווייץ", label: "שווייץ", flag: "ch" },
  { value: "ארצות הברית", label: "ארצות הברית", flag: "us" },
  { value: "קנדה", label: "קנדה", flag: "ca" },
  { value: "מקסיקו", label: "מקסיקו", flag: "mx" },
  { value: "תאילנד", label: "תאילנד", flag: "th" },
  { value: "יפן", label: "יפן", flag: "jp" },
  { value: "סין", label: "סין", flag: "cn" },
  { value: "דרום קוריאה", label: "דרום קוריאה", flag: "kr" },
  { value: "אוסטרליה", label: "אוסטרליה", flag: "au" },
  { value: "ניו זילנד", label: "ניו זילנד", flag: "nz" },
  { value: "ברזיל", label: "ברזיל", flag: "br" },
  { value: "ארגנטינה", label: "ארגנטינה", flag: "ar" },
  { value: "צ׳ילה", label: "צ׳ילה", flag: "cl" },
  { value: "פרו", label: "פרו", flag: "pe" },
  { value: "דרום אפריקה", label: "דרום אפריקה", flag: "za" },
  { value: "מצרים", label: "מצרים", flag: "eg" },
  { value: "מרוקו", label: "מרוקו", flag: "ma" },
];

const popularCountries = [
  "יוון",
  "איטליה",
  "צרפת",
  "ספרד",
  "ארצות הברית",
  "בריטניה",
  "תאילנד",
  "קפריסין",
];

const extraCountries = [
  { value: "קפריסין", label: "קפריסין", flag: "cy" },
];

export default function SearchForm({
  destination,
  setDestination,
  onContinue,
}: SearchFormProps) {
  const [searchText, setSearchText] = useState("");
  const [showAllCountries, setShowAllCountries] = useState(false);

  const selectedCountries = destination
    ? destination
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  const allCountries = [...countries, ...extraCountries];

  const toggleCountry = (countryValue: string) => {
    if (selectedCountries.includes(countryValue)) {
      const updated = selectedCountries.filter(
        (country) => country !== countryValue
      );

      setDestination(updated.join(", "));
    } else {
      const updated = [...selectedCountries, countryValue];

      setDestination(updated.join(", "));
    }

    setSearchText("");
  };

  const getCountry = (countryValue: string) => {
    return allCountries.find(
      (country) => country.value === countryValue
    );
  };

  const filteredCountries = allCountries.filter((country) =>
    country.label.toLowerCase().includes(searchText.toLowerCase().trim())
  );

  const visiblePopularCountries = popularCountries
    .map((value) => getCountry(value))
    .filter(Boolean);

  const shouldShowSearchResults =
    searchText.trim().length > 0;

  return (
    <div className="rounded-2xl bg-white p-6 pb-28 shadow-xl">
      <h2 className="text-2xl font-bold text-gray-900">
        בחירת יעד
      </h2>

      <p className="mt-2 text-gray-500">
        בחרו מדינה אחת או יותר שאליה אתם טסים
      </p>

      {/* חיפוש */}
      <div className="mt-6">
        <label className="mb-3 block font-medium text-gray-700">
          לאן אתם טסים?
        </label>

        <div className="relative">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="חיפוש מדינה..."
            dir="rtl"
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-4 pr-12 text-right text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xl text-gray-400">
            🔍
          </span>
        </div>
      </div>

      {/* תוצאות חיפוש */}
      {shouldShowSearchResults && (
        <div className="mt-6">
          <div className="mb-3 font-bold text-gray-800">
            תוצאות חיפוש
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {filteredCountries.map((country) => {
              const isSelected = selectedCountries.includes(
                country.value
              );

              return (
                <button
                  key={country.value}
                  type="button"
                  onClick={() =>
                    toggleCountry(country.value)
                  }
                  className={`flex items-center gap-3 rounded-xl border p-3 text-right transition ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                      isSelected
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {isSelected ? "✓" : ""}
                  </span>

                  <img
                    src={`https://flagcdn.com/w80/${country.flag}.png`}
                    alt={`דגל ${country.label}`}
                    className="h-6 w-9 rounded object-cover"
                  />

                  <span
                    className={`flex-1 ${
                      isSelected
                        ? "font-bold text-blue-700"
                        : "text-gray-900"
                    }`}
                  >
                    {country.label}
                  </span>
                </button>
              );
            })}
          </div>

          {filteredCountries.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-center text-gray-500">
              לא נמצאה מדינה התואמת לחיפוש
            </div>
          )}
        </div>
      )}

      {/* יעדים פופולריים */}
      {!shouldShowSearchResults && !showAllCountries && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-bold text-gray-800">
              יעדים פופולריים
            </span>

            <span className="text-sm text-gray-400">
              הבחירה הנפוצה
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {visiblePopularCountries.map((country) => {
              if (!country) return null;

              const isSelected = selectedCountries.includes(
                country.value
              );

              return (
                <button
                  key={country.value}
                  type="button"
                  onClick={() =>
                    toggleCountry(country.value)
                  }
                  className={`flex min-h-[82px] flex-col items-center justify-center rounded-xl border-2 p-3 transition ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-gray-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  <img
                    src={`https://flagcdn.com/w80/${country.flag}.png`}
                    alt={`דגל ${country.label}`}
                    className="mb-2 h-7 w-10 rounded object-cover shadow-sm"
                  />

                  <div
                    className={`text-sm font-bold ${
                      isSelected
                        ? "text-blue-700"
                        : "text-gray-800"
                    }`}
                  >
                    {country.label}
                  </div>

                  {isSelected && (
                    <div className="mt-1 text-xs font-bold text-blue-600">
                      ✓ נבחר
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* הצגת כל המדינות */}
          <button
            type="button"
            onClick={() => setShowAllCountries(true)}
            className="mt-5 w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-4 font-bold text-gray-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
          >
            🌍 הצג את כל המדינות
          </button>
        </div>
      )}

      {/* כל המדינות */}
      {!shouldShowSearchResults && showAllCountries && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-bold text-gray-800">
              כל המדינות
            </span>

            <button
              type="button"
              onClick={() => setShowAllCountries(false)}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              חזרה ליעדים פופולריים
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {filteredCountries.map((country) => {
              const isSelected = selectedCountries.includes(
                country.value
              );

              return (
                <button
                  key={country.value}
                  type="button"
                  onClick={() =>
                    toggleCountry(country.value)
                  }
                  className={`flex items-center gap-3 rounded-xl border p-3 text-right transition ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                      isSelected
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {isSelected ? "✓" : ""}
                  </span>

                  <img
                    src={`https://flagcdn.com/w80/${country.flag}.png`}
                    alt={`דגל ${country.label}`}
                    className="h-6 w-9 rounded object-cover"
                  />

                  <span
                    className={`flex-1 ${
                      isSelected
                        ? "font-bold text-blue-700"
                        : "text-gray-900"
                    }`}
                  >
                    {country.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* היעדים שנבחרו */}
      {selectedCountries.length > 0 && (
        <div className="mt-6 rounded-xl bg-blue-50 p-4">
          <p className="mb-3 font-medium text-gray-700">
            היעדים שנבחרו:
          </p>

          <div className="flex flex-wrap gap-2">
            {selectedCountries.map((countryValue) => {
              const country = getCountry(countryValue);

              if (!country) return null;

              return (
                <button
                  key={country.value}
                  type="button"
                  onClick={() =>
                    toggleCountry(country.value)
                  }
                  className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-red-50 hover:text-red-600"
                  title="לחץ להסרה"
                >
                  <img
                    src={`https://flagcdn.com/w80/${country.flag}.png`}
                    alt=""
                    className="h-4 w-6 rounded object-cover"
                  />

                  {country.label} ×
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* כפתור המשך דביק */}
      {selectedCountries.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.12)] backdrop-blur">
          <button
            type="button"
            onClick={onContinue}
            className="mx-auto block w-full max-w-5xl rounded-xl bg-green-500 py-4 text-lg font-bold text-white transition hover:bg-green-600"
          >
            המשך למתי נוסעים →
          </button>
        </div>
      )}
    </div>
  );
}
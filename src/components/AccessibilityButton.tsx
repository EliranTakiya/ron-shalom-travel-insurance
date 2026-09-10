
"use client";

import { useState } from "react";

export default function AccessibilityButton() {
  const [open, setOpen] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [underlineLinks, setUnderlineLinks] = useState(false);

  const toggleLargeText = () => {
    setLargeText((prev) => !prev);

    document.documentElement.classList.toggle("accessibility-large-text");
  };

  const toggleHighContrast = () => {
    setHighContrast((prev) => !prev);

    document.documentElement.classList.toggle(
      "accessibility-high-contrast"
    );
  };

  const toggleUnderlineLinks = () => {
    setUnderlineLinks((prev) => !prev);

    document.documentElement.classList.toggle(
      "accessibility-underline-links"
    );
  };

  const resetAccessibility = () => {
    setLargeText(false);
    setHighContrast(false);
    setUnderlineLinks(false);

    document.documentElement.classList.remove(
      "accessibility-large-text",
      "accessibility-high-contrast",
      "accessibility-underline-links"
    );
  };

  return (
    <>
      {/* כפתור נגישות */}
      <button
        type="button"
        aria-label="אפשרויות נגישות"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-24 right-5 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-3xl text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        ♿
      </button>

      {/* תפריט נגישות */}
      {open && (
        <div
          dir="rtl"
          className="fixed bottom-40 right-5 z-[90] w-72 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              אפשרויות נגישות
            </h2>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="סגור"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-lg font-bold text-gray-600 hover:bg-gray-200"
            >
              ×
            </button>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={toggleLargeText}
              className={`w-full rounded-xl border-2 p-3 text-right font-bold transition ${
                largeText
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-800 hover:border-blue-300"
              }`}
            >
              🔠 הגדלת טקסט
            </button>

            <button
              type="button"
              onClick={toggleHighContrast}
              className={`w-full rounded-xl border-2 p-3 text-right font-bold transition ${
                highContrast
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-800 hover:border-blue-300"
              }`}
            >
              ◐ ניגודיות גבוהה
            </button>

            <button
              type="button"
              onClick={toggleUnderlineLinks}
              className={`w-full rounded-xl border-2 p-3 text-right font-bold transition ${
                underlineLinks
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-800 hover:border-blue-300"
              }`}
            >
              🔗 הדגשת קישורים
            </button>

            <button
              type="button"
              onClick={resetAccessibility}
              className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 p-3 text-center font-bold text-gray-700 transition hover:bg-gray-100"
            >
              ↺ איפוס הגדרות
            </button>
          </div>
        </div>
      )}
    </>
  );
}


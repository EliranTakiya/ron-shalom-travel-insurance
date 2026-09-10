
"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type InsuranceCompany = {
  name: string;
  price: number;
  color: string;
  recommended: boolean;
  details: {
    medical: string;
    baggage: string;
    phone: string;
    cancellation: string;
    service: string;
  };
};

const insuranceCompanies: InsuranceCompany[] = [
  {
    name: "PassportCard",
    price: 89,
    color: "bg-blue-600",
    recommended: true,
    details: {
      medical: "כיסוי רפואי בהתאם לתנאי הפוליסה",
      baggage: "כיסוי לכבודה בהתאם לתנאי הפוליסה",
      phone: "הרחבת טלפון נייד בהתאם לתנאי הפוליסה",
      cancellation: "כיסוי לביטול וקיצור נסיעה",
      service: "שירות 24/7",
    },
  },
  {
    name: "הראל",
    price: 94,
    color: "bg-red-600",
    recommended: false,
    details: {
      medical: "כיסוי רפואי בהתאם לתנאי הפוליסה",
      baggage: "כיסוי לכבודה בהתאם לתנאי הפוליסה",
      phone: "הרחבת טלפון נייד בהתאם לתנאי הפוליסה",
      cancellation: "כיסוי לביטול וקיצור נסיעה",
      service: "שירות 24/7",
    },
  },
  {
    name: "כלל",
    price: 91,
    color: "bg-orange-500",
    recommended: false,
    details: {
      medical: "כיסוי רפואי בהתאם לתנאי הפוליסה",
      baggage: "כיסוי לכבודה בהתאם לתנאי הפוליסה",
      phone: "הרחבת טלפון נייד בהתאם לתנאי הפוליסה",
      cancellation: "כיסוי לביטול וקיצור נסיעה",
      service: "שירות 24/7",
    },
  },
  {
    name: "הפניקס",
    price: 87,
    color: "bg-purple-600",
    recommended: false,
    details: {
      medical: "כיסוי רפואי בהתאם לתנאי הפוליסה",
      baggage: "כיסוי לכבודה בהתאם לתנאי הפוליסה",
      phone: "הרחבת טלפון נייד בהתאם לתנאי הפוליסה",
      cancellation: "כיסוי לביטול וקיצור נסיעה",
      service: "שירות 24/7",
    },
  },
  {
    name: "מנורה",
    price: 96,
    color: "bg-green-600",
    recommended: false,
    details: {
      medical: "כיסוי רפואי בהתאם לתנאי הפוליסה",
      baggage: "כיסוי לכבודה בהתאם לתנאי הפוליסה",
      phone: "הרחבת טלפון נייד בהתאם לתנאי הפוליסה",
      cancellation: "כיסוי לביטול וקיצור נסיעה",
      service: "שירות 24/7",
    },
  },
  {
    name: "מגדל",
    price: 92,
    color: "bg-cyan-600",
    recommended: false,
    details: {
      medical: "כיסוי רפואי בהתאם לתנאי הפוליסה",
      baggage: "כיסוי לכבודה בהתאם לתנאי הפוליסה",
      phone: "הרחבת טלפון נייד בהתאם לתנאי הפוליסה",
      cancellation: "כיסוי לביטול וקיצור נסיעה",
      service: "שירות 24/7",
    },
  },
];

const addonNames: Record<string, string> = {
  phone: "טלפון",
  baggage: "כבודה",
  pregnancy: "הריון",
  extremeSports: "ספורט אתגרי",
  ski: "סקי וספורט חורף",
  medical: "מצב רפואי קיים",
  cancellation: "ביטול וקיצור נסיעה",
};

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const destination = searchParams.get("destination") || "";
  const departure = searchParams.get("departure") || "";
  const returnDate = searchParams.get("returnDate") || "";

  const adults = Number(searchParams.get("adults") || 1);
  const children = Number(searchParams.get("children") || 0);
  const babies = Number(searchParams.get("babies") || 0);

  const totalPassengers = adults + children + babies;

  const adultAgesParam = searchParams.get("adultAges") || "";
  const childAgesParam = searchParams.get("childAges") || "";
  const babyAgesParam = searchParams.get("babyAges") || "";

  const adultAges = adultAgesParam
    ? adultAgesParam.split(",").filter(Boolean).map(Number)
    : [];

  const childAges = childAgesParam
    ? childAgesParam.split(",").filter(Boolean).map(Number)
    : [];

  const babyAges = babyAgesParam
    ? babyAgesParam.split(",").filter(Boolean).map(Number)
    : [];

  const addonsParam = searchParams.get("addons") || "";

  const selectedAddons = addonsParam
    ? addonsParam.split(",").filter(Boolean)
    : [];

  // מבוטחים שנבחרו לכיסוי כבודה
  const baggagePassengersParam =
    searchParams.get("baggagePassengers") || "";

  const baggagePassengers = baggagePassengersParam
    ? baggagePassengersParam.split("|").filter(Boolean)
    : [];

  const countries = [
    { value: "צרפת", flag: "fr" },
    { value: "איטליה", flag: "it" },
    { value: "ספרד", flag: "es" },
    { value: "גרמניה", flag: "de" },
    { value: "יוון", flag: "gr" },
    { value: "פורטוגל", flag: "pt" },
    { value: "בריטניה", flag: "gb" },
    { value: "הולנד", flag: "nl" },
    { value: "אוסטריה", flag: "at" },
    { value: "שווייץ", flag: "ch" },
    { value: "ארצות הברית", flag: "us" },
    { value: "קנדה", flag: "ca" },
    { value: "מקסיקו", flag: "mx" },
    { value: "תאילנד", flag: "th" },
    { value: "יפן", flag: "jp" },
    { value: "סין", flag: "cn" },
    { value: "דרום קוריאה", flag: "kr" },
    { value: "אוסטרליה", flag: "au" },
    { value: "ניו זילנד", flag: "nz" },
    { value: "ברזיל", flag: "br" },
    { value: "ארגנטינה", flag: "ar" },
    { value: "צ׳ילה", flag: "cl" },
    { value: "פרו", flag: "pe" },
    { value: "דרום אפריקה", flag: "za" },
    { value: "מצרים", flag: "eg" },
    { value: "מרוקו", flag: "ma" },
  ];

  // תמיכה גם במספר מדינות
  const selectedCountries = destination
    .split(",")
    .map((country) => country.trim())
    .filter(Boolean)
    .map((countryName) =>
      countries.find((country) => country.value === countryName)
    )
    .filter(Boolean);

  const [selectedCompany, setSelectedCompany] =
    useState<InsuranceCompany | null>(null);

  const formatDate = (date: string) => {
    if (!date) return "לא נבחר";

    const parts = date.split("-");

    if (parts.length !== 3) return date;

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const buildCheckoutParams = (company: InsuranceCompany) => {
    return new URLSearchParams({
      company: company.name,
      price: company.price.toString(),

      destination,
      departure,
      returnDate,

      adults: adults.toString(),
      children: children.toString(),
      babies: babies.toString(),

      adultAges: adultAges.join(","),
      childAges: childAges.join(","),
      babyAges: babyAges.join(","),

      addons: selectedAddons.join(","),

      // מעביר את כל המבוטחים לכבודה
      baggagePassengers: baggagePassengers.join("|"),
    });
  };

  return (
    <main className="min-h-screen bg-slate-50" dir="rtl">

      {/* Title */}
      <section className="bg-blue-700 py-10 text-white">
        <div className="mx-auto max-w-6xl px-6">

          <button
            type="button"
            onClick={() => window.history.back()}
            className="mb-6 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
          >
            ← חזרה לשינוי פרטים
          </button>

          <h1 className="text-3xl font-bold">
            תוצאות השוואת הביטוחים
          </h1>

          <p className="mt-2 text-blue-100">
            מצאנו אפשרויות שמתאימות לנתוני הנסיעה שלך
          </p>

        </div>
      </section>

      {/* Trip summary */}
      <section className="mx-auto max-w-6xl px-6 py-6">

        <div className="rounded-xl bg-white p-5 shadow-sm">

          <h2 className="mb-5 text-lg font-bold text-gray-900">
            פרטי הנסיעה שלך
          </h2>

          <div className="grid gap-5 text-sm md:grid-cols-4">

            {/* יעד */}
            <div>
              <div className="text-gray-500">
                יעד
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3">

                {selectedCountries.map((country) =>
                  country ? (
                    <img
                      key={country.value}
                      src={`https://flagcdn.com/w80/${country.flag}.png`}
                      alt={`דגל ${country.value}`}
                      title={country.value}
                      className="h-7 w-10 rounded object-cover"
                    />
                  ) : null
                )}

                <span className="font-bold text-gray-900">
                  {destination || "לא נבחר"}
                </span>

              </div>
            </div>

            {/* תאריכים */}
            <div>
              <div className="text-gray-500">
                תאריכים
              </div>

              <span
                className="font-bold text-gray-900"
                style={{
                  direction: "ltr",
                  unicodeBidi: "isolate",
                }}
              >
                {formatDate(departure)} - {formatDate(returnDate)}
              </span>
            </div>

            {/* נוסעים */}
            <div>
              <div className="text-gray-500">
                נוסעים
              </div>

              <div className="mt-1 font-bold text-gray-900">
                {totalPassengers} נוסעים
              </div>

              <div className="mt-1 text-xs text-gray-500">

                {adults > 0 && (
                  <div>
                    {adults} מבוגרים
                  </div>
                )}

                {adultAges.length > 0 && (
                  <div>
                    גילאי מבוגרים: {adultAges.join(", ")}
                  </div>
                )}

                {children > 0 && (
                  <div>
                    {children} ילדים
                  </div>
                )}

                {childAges.length > 0 && (
                  <div>
                    גילאי ילדים: {childAges.join(", ")}
                  </div>
                )}

                {babies > 0 && (
                  <div>
                    {babies} תינוקות
                  </div>
                )}

                {babyAges.length > 0 && (
                  <div>
                    גילאי תינוקות:{" "}
                    {babyAges
                      .map((age) =>
                        age === 0 ? "פחות משנה" : "שנה"
                      )
                      .join(", ")}
                  </div>
                )}

              </div>
            </div>

            {/* הרחבות */}
            <div>
              <div className="text-gray-500">
                הרחבות
              </div>

              {selectedAddons.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-1">

                  {selectedAddons.map((addon) => (
                    <span
                      key={addon}
                      className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
                    >
                      {addonNames[addon] || addon}
                    </span>
                  ))}

                </div>
              ) : (
                <div className="mt-1 font-bold text-gray-900">
                  ללא הרחבות
                </div>
              )}

              {/* כבודה למבוטחים */}
              {selectedAddons.includes("baggage") &&
                baggagePassengers.length > 0 && (
                  <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3">

                    <div className="text-xs font-medium text-green-700">
                      כיסוי כבודה עבור:
                    </div>

                    <div className="mt-2 space-y-1">
                      {baggagePassengers.map((passenger) => (
                        <div
                          key={passenger}
                          className="text-sm font-bold text-green-900"
                        >
                          🧳 {passenger}
                        </div>
                      ))}
                    </div>

                  </div>
                )}

            </div>

          </div>

        </div>

      </section>

      {/* Results */}
      <section className="mx-auto max-w-6xl px-6 pb-16">

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {insuranceCompanies.map((company) => (

            <div
              key={company.name}
              className="relative rounded-2xl bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
            >

              {/* Recommended */}
              {company.recommended && (
                <div className="absolute -top-3 right-5 rounded-full bg-yellow-400 px-4 py-1 text-sm font-bold text-yellow-900">
                  ⭐ מומלץ
                </div>
              )}

              {/* Company */}
              <div className="flex items-center gap-4">

                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-xl ${company.color} text-xs font-bold text-white`}
                >
                  LOGO
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {company.name}
                  </h2>

                  <p className="text-sm text-gray-500">
                    ביטוח נסיעות לחו״ל
                  </p>
                </div>

              </div>

              {/* Price */}
              <div className="mt-6 border-t pt-5">

                <div className="text-sm text-gray-500">
                  מחיר משוער
                </div>

                <div className="mt-1 text-4xl font-extrabold text-blue-700">
                  ₪{company.price}
                </div>

              </div>

              {/* Coverage */}
              <div className="mt-5 space-y-2 text-sm text-gray-700">

                <div>
                  ✓ כיסוי רפואי
                </div>

                {selectedAddons.includes("phone") && (
                  <div>
                    ✓ כיסוי לטלפון נייד
                  </div>
                )}

                {selectedAddons.includes("baggage") && (
                  <div>
                    ✓ כיסוי כבודה
                  </div>
                )}

                {selectedAddons.includes("pregnancy") && (
                  <div>
                    ✓ הרחבת הריון
                  </div>
                )}

                {selectedAddons.includes("extremeSports") && (
                  <div>
                    ✓ ספורט אתגרי
                  </div>
                )}

                {selectedAddons.includes("ski") && (
                  <div>
                    ✓ סקי וספורט חורף
                  </div>
                )}

                {selectedAddons.includes("medical") && (
                  <div>
                    ✓ מצב רפואי קיים
                  </div>
                )}

                {selectedAddons.includes("cancellation") && (
                  <div>
                    ✓ ביטול וקיצור נסיעה
                  </div>
                )}

                <div>
                  ✓ שירות 24/7
                </div>

              </div>

              {/* Buttons */}
              <div className="mt-6 flex gap-3">

                <button
                  type="button"
                  onClick={() => setSelectedCompany(company)}
                  className="flex-1 rounded-lg border border-gray-300 py-3 font-medium hover:bg-gray-50"
                >
                  פרטים
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const params = buildCheckoutParams(company);

                    router.push(
                      `/checkout?${params.toString()}`
                    );
                  }}
                  className="flex-1 rounded-lg bg-orange-500 py-3 font-bold text-white hover:bg-orange-600"
                >
                  לרכישה
                </button>

              </div>

            </div>

          ))}

        </div>

      </section>

      {/* Details Modal */}
      {selectedCompany && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedCompany(null)}
        >

          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCompany.name}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  פרטי הכיסוי
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCompany(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-600 hover:bg-gray-200"
              >
                ×
              </button>

            </div>

            <div className="mt-6 space-y-3">

              <div className="rounded-xl bg-gray-50 p-4">
                <div className="font-bold text-gray-900">
                  🏥 כיסוי רפואי
                </div>

                <div className="mt-1 text-sm text-gray-600">
                  {selectedCompany.details.medical}
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <div className="font-bold text-gray-900">
                  🧳 כבודה
                </div>

                <div className="mt-1 text-sm text-gray-600">
                  {selectedCompany.details.baggage}
                </div>

                {selectedAddons.includes("baggage") &&
                  baggagePassengers.length > 0 && (
                    <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm font-bold text-green-800">
                      הכיסוי נבחר עבור:
                      <div className="mt-1">
                        {baggagePassengers.join(" | ")}
                      </div>
                    </div>
                  )}

              </div>

              {selectedAddons.includes("phone") && (
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="font-bold text-gray-900">
                    📱 טלפון נייד
                  </div>

                  <div className="mt-1 text-sm text-gray-600">
                    {selectedCompany.details.phone}
                  </div>
                </div>
              )}

              {selectedAddons.includes("cancellation") && (
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="font-bold text-gray-900">
                    ✈️ ביטול וקיצור נסיעה
                  </div>

                  <div className="mt-1 text-sm text-gray-600">
                    {selectedCompany.details.cancellation}
                  </div>
                </div>
              )}

              <div className="rounded-xl bg-blue-50 p-4">
                <div className="font-bold text-blue-900">
                  ☎️ שירות
                </div>

                <div className="mt-1 text-sm text-blue-700">
                  {selectedCompany.details.service}
                </div>
              </div>

            </div>

            <button
              type="button"
              onClick={() => setSelectedCompany(null)}
              className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700"
            >
              סגור
            </button>

          </div>

        </div>
      )}

    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <main
          className="flex min-h-screen items-center justify-center bg-slate-50"
          dir="rtl"
        >
          <div className="text-lg font-bold text-gray-700">
            טוען...
          </div>
        </main>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}


"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { calculateMigdalQuote } from "@/lib/migdal-pricing";
import {
  calculateInsurerQuote,
  type InsurerId,
  type InsurerQuote,
} from "@/lib/insurer-pricing";

type Quote = ReturnType<typeof calculateMigdalQuote> | InsurerQuote;

type InsuranceCompany = {
  id: string;
  name: string;
  price: number;
  quote: Quote;
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

const migdalCompanyDetails = {
  medical: "כיסוי רפואי בהתאם לתנאי הפוליסה של מגדל",
  baggage: "כיסוי מטען אישי בהתאם להרחבה שנבחרה",
  phone: "כיסוי טלפון נייד/GPS עד $1,000 ובהשתתפות עצמית $30",
  cancellation: "כיסוי עד $6,000, בכפוף לתנאי הפוליסה",
  service: "שירות בהתאם לתנאי הפוליסה של מגדל",
};

const addonNames: Record<string, string> = {
  phone: "טלפון",
  baggage: "כבודה",
  laptop: "טאבלט או מחשב נייד",
  pregnancy: "הריון",
  extremeSports: "ספורט אתגרי",
  ski: "סקי וספורט חורף",
  competitiveSports: "ספורט תחרותי",
  rentalCar: "ביטול השתתפות עצמית לרכב שכור",
  medical: "מצב רפואי קיים",
  cancellation: "ביטול וקיצור נסיעה",
  "harel:valuableItem": "הראל · פריט יקר ערך",
  "harel:personalAccident": "הראל · תאונות אישיות",
  "harel:extremeSportsAccident": "הראל · תאונות אישיות בספורט אתגרי",
  "harel:cancellation10k": "הראל · ביטול/קיצור עד $10,000",
  "harel:bicycle2500": "הראל · אופניים עד $2,500",
  "harel:bicycle4500": "הראל · אופניים עד $4,500",
  "harel:bicycle6000": "הראל · אופניים עד $6,000",
  "harel:rentalCarEnhanced": "הראל · רכב שכור מוגדל",
  "clal:competitiveSports2": "כלל · ספורט תחרותי דרגה 2",
  "phoenix:experienceTicket": "הפניקס · כרטיסי חוויה",
  "phoenix:camera": "הפניקס · מצלמה",
  "phoenix:israelMedical": "הפניקס · הוצאות רפואיות בישראל",
  "phoenix:rentalCarJeep": "הפניקס · ג׳יפ/קרוון שכור",
  "passportcard:valuableItem": "פספורטכארד · פריט יקר ערך",
  "passportcard:phone1600": "פספורטכארד · טלפון עד $1,600",
  "passportcard:laptop1500": "פספורטכארד · מחשב/מצלמה עד $1,500",
  "passportcard:laptop2000": "פספורטכארד · מחשב/מצלמה עד $2,000",
  "passportcard:personalAccident": "פספורטכארד · תאונות אישיות",
  "passportcard:operationalCancellation": "פספורטכארד · ביטול עקב פעילות מבצעית",
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
    ? adultAgesParam.split(",").filter((age) => age !== "").map(Number)
    : [];

  const childAges = childAgesParam
    ? childAgesParam.split(",").filter((age) => age !== "").map(Number)
    : [];

  const babyAges = babyAgesParam
    ? babyAgesParam.split(",").filter((age) => age !== "").map(Number)
    : [];

  const addonsParam = searchParams.get("addons") || "";

  const selectedAddons = addonsParam
    ? addonsParam.split(",").filter(Boolean)
    : [];

  // מבוטחים שנבחרו לכיסוי כבודה
  const baggagePassengersParam = searchParams.get("baggagePassengers") || "";

  const baggagePassengers = baggagePassengersParam
    ? baggagePassengersParam.split("|").filter(Boolean)
    : [];

  const passengerAges = [...adultAges, ...childAges, ...babyAges];
  const quoteInput = {
    destination,
    departure,
    returnDate,
    ages: passengerAges,
    selectedAddons,
    baggagePassengerCount: baggagePassengers.length,
  };
  const migdalQuote = calculateMigdalQuote(quoteInput);
  const insurerIds: InsurerId[] = [
    "harel",
    "menora",
    "passportcard",
    "clal",
    "phoenix",
  ];
  const quotesById: Record<string, Quote> = {
    migdal: migdalQuote,
    ...Object.fromEntries(
      insurerIds.map((id) => [id, calculateInsurerQuote(id, quoteInput)]),
    ),
  };
  const companyConfigs = [
    { id: "migdal", name: "מגדל", color: "bg-cyan-600" },
    { id: "harel", name: "הראל", color: "bg-red-700" },
    { id: "menora", name: "מנורה", color: "bg-blue-800" },
    { id: "passportcard", name: "פספורטכארד", color: "bg-rose-600" },
    { id: "clal", name: "כלל", color: "bg-indigo-700" },
    { id: "phoenix", name: "הפניקס", color: "bg-orange-600" },
  ];
  const insuranceCompanies: InsuranceCompany[] = companyConfigs.flatMap(
    ({ id, name, color }) => {
      const companyQuote = quotesById[id];
      if (companyQuote.price === null) return [];
      const lineDescription = (lineId: string, fallback: string) =>
        companyQuote.priceLines?.find((line) => line.id === lineId)?.description ?? fallback;
      return [{
        id,
        name,
        price: companyQuote.price,
        quote: companyQuote,
        color,
        recommended: false,
        details: {
          medical: `כיסוי רפואי בהתאם לתנאי הפוליסה של ${name}`,
          baggage: lineDescription("baggage", "כיסוי מטען אישי בהתאם לתנאי הפוליסה"),
          phone: lineDescription("phone", lineDescription("devices", "כיסוי למכשירים בהתאם להרחבות שנבחרו")),
          cancellation: lineDescription("cancellation", "כיסוי ביטול וקיצור בהתאם להרחבות שנבחרו"),
          service: `שירות בהתאם לתנאי הפוליסה של ${name}`,
        },
      }];
    },
  );
  const unavailableQuotes = companyConfigs.flatMap(({ id, name }) => {
    const companyQuote = quotesById[id];
    return companyQuote.price === null && companyQuote.error
      ? [{ id, name, error: companyQuote.error }]
      : [];
  });
  const tripDurationDays = migdalQuote.durationDays;

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
      countries.find((country) => country.value === countryName),
    )
    .filter(Boolean);

  const [selectedCompany, setSelectedCompany] =
    useState<InsuranceCompany | null>(null);

  useEffect(() => {
    if (!selectedCompany) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedCompany(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedCompany]);

  const formatDate = (date: string) => {
    if (!date) return "לא נבחר";

    const parts = date.split("-");

    if (parts.length !== 3) return date;

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const buildCheckoutParams = (company: InsuranceCompany) => {
    return new URLSearchParams({
      companyId: company.id,
      company: company.name,
      price: company.price.toString(),
      currency: "USD",

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

          <h1 className="text-3xl font-bold">תוצאות השוואת הביטוחים</h1>

          <p className="mt-2 text-blue-100">
            מצאנו אפשרויות שמתאימות לנתוני הנסיעה שלך
          </p>
        </div>
      </section>

      {/* Trip summary */}

                {selectedAddons.includes("laptop") && (
                  <div>
                    ✓ טאבלט או מחשב נייד
                  </div>
                )}
      <section className="mx-auto max-w-6xl px-6 py-6">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-gray-900">
            פרטי הנסיעה שלך
          </h2>

          <div className="grid gap-5 text-sm md:grid-cols-4">
            {/* יעד */}
            <div>
              <div className="text-gray-500">יעד</div>

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
                  ) : null,
                )}

                <span className="font-bold text-gray-900">
                  {destination || "לא נבחר"}
                </span>
              </div>
            </div>

            {/* תאריכים */}

                {selectedAddons.includes("competitiveSports") && (
                  <div>
                    ✓ ספורט תחרותי
                  </div>
                )}

                {selectedAddons.includes("rentalCar") && (
                  <div>
                    ✓ ביטול השתתפות עצמית לרכב שכור
                  </div>
                )}
            <div>
              <div className="text-gray-500">תאריכים</div>

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
              <div className="text-gray-500">נוסעים</div>

              <div className="mt-1 font-bold text-gray-900">
                {totalPassengers} נוסעים
              </div>

              <div className="mt-1 text-xs text-gray-500">
                {adults > 0 && <div>{adults} מבוגרים</div>}

                {adultAges.length > 0 && (
                  <div>גילאי מבוגרים: {adultAges.join(", ")}</div>
                )}

                {children > 0 && <div>{children} ילדים</div>}

                {childAges.length > 0 && (
                  <div>גילאי ילדים: {childAges.join(", ")}</div>
                )}

                {babies > 0 && <div>{babies} תינוקות</div>}

                {babyAges.length > 0 && (
                  <div>
                    גילאי תינוקות:{" "}
                    {babyAges
                      .map((age) => (age === 0 ? "פחות משנה" : "שנה"))
                      .join(", ")}
                  </div>
                )}
              </div>
            </div>

            {/* הרחבות */}
            <div>
              <div className="text-gray-500">הרחבות</div>

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
                <div className="mt-1 font-bold text-gray-900">ללא הרחבות</div>
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
        <div className="mb-5 text-sm text-gray-600">
          {tripDurationDays !== null && (
            <span>
              הצעות מחיר עבור {tripDurationDays} ימי נסיעה.
              המחירים בדולר ארצות הברית.
            </span>
          )}
        </div>

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

                  <p className="text-sm text-gray-500">ביטוח נסיעות לחו״ל</p>
                </div>
              </div>

              {/* Price */}
              <div className="mt-6 border-t pt-5">
                <div className="text-sm text-gray-500">מחיר משוער</div>

                <div className="mt-1 text-4xl font-extrabold text-blue-700">
                  ${company.price.toFixed(2)}
                </div>
                {company.quote.durationDays !== null && (
                  <div className="mt-3 space-y-1 text-xs text-gray-500">
                    <div>
                      מחיר בסיס: ${company.quote.basePremium?.toFixed(2) ?? "0.00"}
                    </div>
                    <div>
                      הרחבות שנבחרו: ${company.quote.addOnsPremium?.toFixed(2) ?? "0.00"}
                    </div>
                    {company.quote.coveragePremium !== undefined && company.quote.coveragePremium > 0 && (
                      <div>כיסויים נוספים: ${company.quote.coveragePremium.toFixed(2)}</div>
                    )}
                  </div>
                )}
                {company.quote.warnings.map((warning) => (
                  <p key={warning} className="mt-2 text-xs text-amber-700">{warning}</p>
                ))}
              </div>

              {/* Coverage */}
              <div className="mt-5 space-y-2 text-sm text-gray-700">
                <div>✓ כיסוי רפואי</div>

                {selectedAddons.includes("phone") && (
                    <div>✓ כיסוי לטלפון נייד</div>
                  )}

                {selectedAddons.includes("baggage") && (
                    <div>✓ כיסוי כבודה</div>
                  )}

                {selectedAddons.includes("pregnancy") && (
                    <div>✓ הרחבת הריון</div>
                  )}

                {selectedAddons.includes("extremeSports") && (
                    <div>✓ ספורט אתגרי</div>
                  )}

                {selectedAddons.includes("ski") && (
                    <div>✓ סקי וספורט חורף</div>
                  )}

                {selectedAddons.includes("medical") && (
                    <div>✓ מצב רפואי קיים</div>
                  )}

                {selectedAddons.includes("cancellation") && (
                    <div>✓ ביטול וקיצור נסיעה</div>
                  )}

                <div>✓ שירות 24/7</div>
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

                    router.push(`/checkout?${params.toString()}`);
                  }}
                  className="flex-1 rounded-lg bg-orange-500 py-3 font-bold text-white hover:bg-orange-600"
                >
                  לרכישה
                </button>
              </div>
            </div>
          ))}
        </div>
        {unavailableQuotes.length > 0 && (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h2 className="font-bold text-amber-950">הצעות שלא ניתן לחשב מהתעריפון</h2>
            <ul className="mt-2 space-y-1 text-sm text-amber-900">
              {unavailableQuotes.map((item) => (
                <li key={item.id}><strong>{item.name}:</strong> {item.error}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Details Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <button
            type="button"
            aria-label="סגירת חלון פרטי הכיסוי"
            className="absolute inset-0 h-full w-full cursor-default bg-black/60"
            onClick={() => setSelectedCompany(null)}
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="company-details-title"
            className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
            dir="rtl"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
              <div>
                <h2 id="company-details-title" className="text-2xl font-bold text-gray-900">
                  {selectedCompany.name}
                </h2>

                <p className="mt-1 text-sm text-gray-500">פרטי הכיסוי</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCompany(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-600 hover:bg-gray-200"
              >
                ×
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <h3 className="font-bold text-blue-950">פירוט המחיר</h3>
                <div className="mt-3 space-y-3">
                  {selectedCompany.quote.priceLines?.map((line) => (
                    <div
                      key={line.id}
                      className="flex items-start justify-between gap-4 border-b border-blue-100 pb-2 last:border-0 last:pb-0"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {line.name}
                        </div>
                        {line.description && (
                          <div className="mt-0.5 text-xs text-gray-600">
                            {line.description}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 text-left font-bold text-gray-900">
                        {line.includedInBase
                          ? line.amount > 0
                            ? `כלול · $${line.amount.toFixed(2)}`
                            : "כלול ללא תוספת"
                          : `$${line.amount.toFixed(2)}`}
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-blue-200 pt-3 font-extrabold text-blue-950">
                    <span>סה״כ לתקופת הנסיעה</span>
                    <span>${(selectedCompany.quote.price ?? 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500">{("sourceNote" in selectedCompany.quote) ? selectedCompany.quote.sourceNote : "תעריף מגדל לפי מחירון 2026 כפי שהוגדר במערכת."}</p>

              <div className="rounded-xl bg-gray-50 p-4">
                <div className="font-bold text-gray-900">🏥 כיסוי רפואי</div>

                <div className="mt-1 text-sm text-gray-600">
                  {selectedCompany.details.medical}
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <div className="font-bold text-gray-900">🧳 כבודה</div>

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
                  <div className="font-bold text-gray-900">📱 טלפון נייד</div>

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
                <div className="font-bold text-blue-900">☎️ שירות</div>

                <div className="mt-1 text-sm text-blue-700">
                  {selectedCompany.details.service}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCompany(null)}
              className="mx-5 mb-5 mt-1 w-[calc(100%-2.5rem)] shrink-0 rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mx-6 sm:w-[calc(100%-3rem)]"
            >
              סגור
            </button>
          </section>
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
          <div className="text-lg font-bold text-gray-700">טוען...</div>
        </main>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}

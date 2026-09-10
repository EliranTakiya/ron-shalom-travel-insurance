
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const addonNames: Record<string, string> = {
    phone: "טלפון נייד",
    baggage: "כבודה",
    pregnancy: "הריון",
    extremeSports: "ספורט אתגרי",
    ski: "סקי וספורט חורף",
    medical: "מצב רפואי קיים",
    cancellation: "ביטול וקיצור נסיעה",
};

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

function CheckoutContent() {
    const searchParams = useSearchParams();

    const company = searchParams.get("company") || "לא נבחרה חברה";
    const price = searchParams.get("price") || "0";

    const destination = searchParams.get("destination") || "";
    const departure = searchParams.get("departure") || "";
    const returnDate = searchParams.get("returnDate") || "";

    const adults = Number(searchParams.get("adults") || 0);
    const children = Number(searchParams.get("children") || 0);
    const babies = Number(searchParams.get("babies") || 0);

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

    // נוסעים שנבחרו לכיסוי כבודה
    const baggagePassengersParam =
        searchParams.get("baggagePassengers") || "";

    const baggagePassengers = baggagePassengersParam
        ? baggagePassengersParam.split("|").filter(Boolean)
        : [];

    // תמיכה במספר יעדים
    const selectedCountries = destination
        .split(",")
        .map((country) => country.trim())
        .filter(Boolean)
        .map((countryName) =>
            countries.find((country) => country.value === countryName)
        )
        .filter(Boolean);

    const destinationNames = destination
        .split(",")
        .map((country) => country.trim())
        .filter(Boolean);

    const destinationName =
        destinationNames.length > 0
            ? destinationNames.join(", ")
            : "לא נבחר";

    const formatDate = (date: string) => {
        if (!date) return "לא נבחר";

        const parts = date.split("-");

        if (parts.length !== 3) return date;

        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    return (
        <main className="min-h-screen bg-slate-50" dir="rtl">

            {/* Title */}
            <section className="bg-blue-700 py-10 text-white">
                <div className="mx-auto max-w-4xl px-6">

                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="mb-5 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/20"
                    >
                        ← חזרה לתוצאות
                    </button>

                    <h1 className="text-3xl font-bold">
                        אישור בחירת הביטוח
                    </h1>

                    <p className="mt-2 text-blue-100">
                        בדקו את הפרטים לפני המשך להצעה
                    </p>

                </div>
            </section>

            {/* Main */}
            <section className="mx-auto max-w-4xl px-6 py-8">

                <div className="space-y-6">

                    {/* Company */}
                    <div className="rounded-2xl bg-white p-6 shadow-xl">

                        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                            <div>
                                <p className="text-sm text-gray-500">
                                    חברת הביטוח שנבחרה
                                </p>

                                <h2 className="mt-1 text-2xl font-extrabold text-gray-900">
                                    {company}
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    ביטוח נסיעות לחו״ל
                                </p>
                            </div>

                            <div className="text-right md:text-left">
                                <div className="text-sm text-gray-500">
                                    מחיר משוער
                                </div>

                                <div className="text-3xl font-extrabold text-blue-700">
                                    ₪{price}
                                </div>
                            </div>

                        </div>

                    </div>

                    {/* Trip details */}
                    <div className="rounded-2xl bg-white p-6 shadow-md">

                        <h2 className="text-xl font-bold text-gray-900">
                            פרטי הנסיעה
                        </h2>

                        <div className="mt-5 grid gap-5 md:grid-cols-2">

                            {/* Destination */}
                            <div className="rounded-xl bg-gray-50 p-4">

                                <div className="text-sm text-gray-500">
                                    יעד
                                </div>

                                <div className="mt-3 flex flex-wrap items-center gap-3">

                                    {selectedCountries.map((country) => (
                                        <div
                                            key={country!.value}
                                            className="flex items-center gap-2 rounded-lg bg-white px-2 py-1 shadow-sm"
                                        >
                                            <img
                                                src={`https://flagcdn.com/w80/${country!.flag}.png`}
                                                alt={`דגל ${country!.value}`}
                                                className="h-6 w-9 rounded object-cover"
                                            />

                                            <span className="font-bold text-gray-900">
                                                {country!.value}
                                            </span>
                                        </div>
                                    ))}

                                    {selectedCountries.length === 0 && (
                                        <span className="font-bold text-gray-900">
                                            {destinationName}
                                        </span>
                                    )}

                                </div>

                            </div>

                            {/* Dates */}
                            <div className="rounded-xl bg-gray-50 p-4 text-right">

                                <div className="text-sm text-gray-500">
                                    תאריכים
                                </div>

                                <div
                                    dir="ltr"
                                    className="mt-2 font-bold text-gray-900"
                                >
                                    {formatDate(departure)} -{" "}
                                    {formatDate(returnDate)}
                                </div>

                            </div>

                        </div>

                    </div>

                    {/* Passengers */}
                    <div className="rounded-2xl bg-white p-6 shadow-md">

                        <h2 className="text-xl font-bold text-gray-900">
                            נוסעים
                        </h2>

                        <div className="mt-5 space-y-4">

                            {adults > 0 && (
                                <div className="rounded-xl bg-gray-50 p-4">

                                    <div className="font-bold text-gray-900">
                                        {adults} מבוגרים
                                    </div>

                                    {adultAges.length > 0 && (
                                        <div className="mt-1 text-sm text-gray-500">
                                            גילאים:{" "}
                                            {adultAges.join(", ")}
                                        </div>
                                    )}

                                </div>
                            )}

                            {children > 0 && (
                                <div className="rounded-xl bg-gray-50 p-4">

                                    <div className="font-bold text-gray-900">
                                        {children} ילדים
                                    </div>

                                    {childAges.length > 0 && (
                                        <div className="mt-1 text-sm text-gray-500">
                                            גילאים:{" "}
                                            {childAges.join(", ")}
                                        </div>
                                    )}

                                </div>
                            )}

                            {babies > 0 && (
                                <div className="rounded-xl bg-gray-50 p-4">

                                    <div className="font-bold text-gray-900">
                                        {babies} תינוקות
                                    </div>

                                    {babyAges.length > 0 && (
                                        <div className="mt-1 text-sm text-gray-500">
                                            גילאים:{" "}
                                            {babyAges
                                                .map((age) =>
                                                    age === 0
                                                        ? "פחות משנה"
                                                        : "שנה"
                                                )
                                                .join(", ")}
                                        </div>
                                    )}

                                </div>
                            )}

                        </div>

                    </div>

                    {/* Baggage passengers */}
                    {selectedAddons.includes("baggage") &&
                        baggagePassengers.length > 0 && (

                            <div className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-md">

                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">
                                        🧳
                                    </span>

                                    <h2 className="text-xl font-bold text-green-900">
                                        כיסוי כבודה
                                    </h2>
                                </div>

                                <p className="mt-2 text-sm text-green-700">
                                    כיסוי הכבודה נבחר עבור הנוסעים הבאים:
                                </p>

                                <div className="mt-4 space-y-2">

                                    {baggagePassengers.map((passenger) => (
                                        <div
                                            key={passenger}
                                            className="rounded-xl bg-white px-4 py-3 font-bold text-green-900 shadow-sm"
                                        >
                                            🧳 {passenger}
                                        </div>
                                    ))}

                                </div>

                            </div>
                        )}

                    {/* Addons */}
                    <div className="rounded-2xl bg-white p-6 shadow-md">

                        <h2 className="text-xl font-bold text-gray-900">
                            הרחבות שנבחרו
                        </h2>

                        {selectedAddons.length > 0 ? (

                            <div className="mt-5 flex flex-wrap gap-3">

                                {selectedAddons.map((addon) => (
                                    <div
                                        key={addon}
                                        className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700"
                                    >
                                        ✓ {addonNames[addon] || addon}
                                    </div>
                                ))}

                            </div>

                        ) : (

                            <p className="mt-4 text-gray-500">
                                לא נבחרו הרחבות
                            </p>

                        )}

                    </div>

                    {/* Continue */}
                    <div className="rounded-2xl bg-white p-6 shadow-md">

                        <button
                            type="button"
                            className="w-full rounded-xl bg-green-500 py-4 text-lg font-bold text-white transition hover:bg-green-600"
                        >
                            המשך להצעה
                        </button>

                        <p className="mt-3 text-center text-xs text-gray-500">
                            המחיר המוצג הוא מחיר משוער ועשוי להשתנות בהתאם לפרטי הביטוח.
                        </p>

                    </div>

                </div>

            </section>

        </main>
    );
}

export default function CheckoutPage() {
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
            <CheckoutContent />
        </Suspense>
    );
}


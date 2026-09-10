
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AddonsFormProps = {
  addons: string[];
  setAddons: (value: string[]) => void;
  destination: string;
  departure: string;
  returnDate: string;
  adults: number;
  children: number;
  babies: number;
  adultAges: (number | null)[];
  childAges: (number | null)[];
  babyAges: (number | null)[];
  onClubMember: () => void;
};

const addonOptions = [
  {
    id: "phone",
    title: "כיסוי לטלפון נייד",
    description: "כיסוי במקרה של גניבה או נזק",
  },
  {
    id: "baggage",
    title: "כיסוי כבודה",
    description: "כיסוי במקרה של אובדן, גניבה או נזק",
  },
  {
    id: "pregnancy",
    title: "הרחבת הריון",
    description: "כיסוי בהתאם לתנאי הפוליסה",
  },
  {
    id: "extremeSports",
    title: "ספורט אתגרי",
    description: "כיסוי לפעילויות ספורט אתגרי",
  },
  {
    id: "ski",
    title: "סקי וספורט חורף",
    description: "כיסוי לפעילויות סקי וספורט חורף",
  },
  {
    id: "medical",
    title: "מצב רפואי קיים",
    description: "הרחבה בהתאם לתנאי הפוליסה",
  },
  {
    id: "cancellation",
    title: "ביטול וקיצור נסיעה",
    description: "כיסוי בהתאם לתנאי הפוליסה",
  },
];

export default function AddonsForm({
  addons,
  setAddons,
  destination,
  departure,
  returnDate,
  adults,
  children,
  babies,
  adultAges,
  childAges,
  babyAges,
  onClubMember,
}: AddonsFormProps) {
  const router = useRouter();

  const [showClubQuestion, setShowClubQuestion] = useState(false);
  const [showBaggageNotice, setShowBaggageNotice] = useState(false);
  const [showBaggagePassenger, setShowBaggagePassenger] = useState(false);

  // עכשיו אפשר לבחור כמה נוסעים לכבודה
  const [baggagePassengers, setBaggagePassengers] = useState<string[]>([]);

  const toggleAddon = (id: string) => {
    if (addons.includes(id)) {
      setAddons(addons.filter((addon) => addon !== id));

      if (id === "baggage") {
        setBaggagePassengers([]);
        setShowBaggagePassenger(false);
        setShowBaggageNotice(false);
      }

      return;
    }

    setAddons([...addons, id]);

    if (id === "baggage") {
      setShowBaggageNotice(true);
    }
  };

  const canCompare =
    destination !== "" &&
    departure !== "" &&
    returnDate !== "" &&
    adults > 0 &&
    adultAges.length === adults &&
    adultAges.every((age) => age !== null) &&
    childAges.length === children &&
    childAges.every((age) => age !== null) &&
    babyAges.length === babies &&
    babyAges.every((age) => age !== null);

  const handleBaggageNoticeConfirm = () => {
    setShowBaggageNotice(false);
    setShowBaggagePassenger(true);
  };

  const getPassengerOptions = () => {
    const passengers: string[] = [];

    for (let i = 0; i < adults; i++) {
      const age = adultAges[i];

      passengers.push(
        age !== null
          ? `מבוגר ${i + 1} — גיל ${age}`
          : `מבוגר ${i + 1}`
      );
    }

    for (let i = 0; i < children; i++) {
      const age = childAges[i];

      passengers.push(
        age !== null
          ? `ילד ${i + 1} — גיל ${age}`
          : `ילד ${i + 1}`
      );
    }

    for (let i = 0; i < babies; i++) {
      const age = babyAges[i];

      let ageText = "";

      if (age === 0) {
        ageText = "פחות משנה";
      } else if (age === 1) {
        ageText = "שנה";
      }

      passengers.push(
        ageText
          ? `תינוק ${i + 1} — ${ageText}`
          : `תינוק ${i + 1}`
      );
    }

    return passengers;
  };

  const toggleBaggagePassenger = (passenger: string) => {
    setBaggagePassengers((current) => {
      if (current.includes(passenger)) {
        return current.filter((item) => item !== passenger);
      }

      return [...current, passenger];
    });
  };

  const goToResults = () => {
    if (!canCompare) return;

    if (
      addons.includes("baggage") &&
      baggagePassengers.length === 0
    ) {
      setShowBaggagePassenger(true);
      return;
    }

    const params = new URLSearchParams({
      destination,
      departure,
      returnDate,

      adults: adults.toString(),
      children: children.toString(),
      babies: babies.toString(),

      adultAges: adultAges
        .map((age) => age?.toString() ?? "")
        .join(","),

      childAges: childAges
        .map((age) => age?.toString() ?? "")
        .join(","),

      babyAges: babyAges
        .map((age) => age?.toString() ?? "")
        .join(","),

      addons: addons.join(","),

      // כל הנוסעים שנבחרו לכבודה
      baggagePassengers: baggagePassengers.join("|"),
    });

    router.push(`/results/?${params.toString()}`);
  };

  const handleCompare = () => {
    if (!canCompare) return;

    if (
      addons.includes("baggage") &&
      baggagePassengers.length === 0
    ) {
      setShowBaggagePassenger(true);
      return;
    }

    setShowClubQuestion(true);
  };

  const handleClubYes = () => {
    setShowClubQuestion(false);
    onClubMember();
  };

  const handleClubNo = () => {
    setShowClubQuestion(false);
    goToResults();
  };

  const passengerOptions = getPassengerOptions();

  return (
    <>
      <div className="mt-6 rounded-2xl bg-white p-6 pb-28 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900">
          הרחבות ביטוח
        </h2>

        <p className="mt-2 text-gray-500">
          בחר את הכיסויים שחשובים לך
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {addonOptions.map((addon) => {
            const selected = addons.includes(addon.id);

            return (
              <button
                key={addon.id}
                type="button"
                onClick={() => toggleAddon(addon.id)}
                className={`rounded-xl border-2 p-4 text-right transition ${
                  selected
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white hover:border-blue-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${
                      selected
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {selected && "✓"}
                  </div>

                  <div>
                    <div className="font-bold text-gray-900">
                      {addon.title}
                    </div>

                    <div className="mt-1 text-sm text-gray-500">
                      {addon.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* הצגת המבוטחים שאליהם משויכת הכבודה */}
        {addons.includes("baggage") &&
          baggagePassengers.length > 0 && (
            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="text-sm font-medium text-green-700">
                הרחבת כבודה משויכת ל:
              </div>

              <div className="mt-2 space-y-1">
                {baggagePassengers.map((passenger) => (
                  <div
                    key={passenger}
                    className="font-bold text-green-900"
                  >
                    🧳 {passenger}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowBaggagePassenger(true)}
                className="mt-3 text-sm font-bold text-blue-600 underline hover:text-blue-800"
              >
                שינוי מבוטחים
              </button>
            </div>
          )}

        <div className="mt-6 rounded-xl bg-blue-50 p-4 text-center">
          <span className="font-bold text-blue-800">
            נבחרו {addons.length} הרחבות
          </span>
        </div>
      </div>

      {/* כפתור השוואה Sticky */}
      {canCompare && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.12)] backdrop-blur">
          <button
            type="button"
            onClick={handleCompare}
            className="mx-auto block w-full max-w-5xl rounded-xl bg-green-600 py-4 text-lg font-bold text-white transition hover:bg-green-700"
          >
            השווה לי ביטוחים →
          </button>
        </div>
      )}

      {/* פופאפ - הודעה חשובה לגבי כבודה */}
      {showBaggageNotice && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowBaggageNotice(false)}
        >
          <div
            dir="rtl"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">
              🧳
            </div>

            <h3 className="mt-4 text-center text-2xl font-extrabold text-gray-900">
              שים לב
            </h3>

            <p className="mt-4 text-center text-lg leading-8 text-gray-700">
              בהרחבת כיסוי כבודה,
              <br />
              <span className="font-extrabold text-gray-900">
                חובה לקשר את המזוודה למבוטח עצמו.
              </span>
            </p>

            <p className="mt-3 text-center text-sm leading-6 text-gray-500">
              בשלב הבא ניתן לבחור עבור איזה מבוטח או מבוטחים
              נרכשת הרחבת הכבודה.
            </p>

            <button
              type="button"
              onClick={handleBaggageNoticeConfirm}
              className="mt-6 w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white transition hover:bg-blue-700"
            >
              הבנתי
            </button>
          </div>
        </div>
      )}

      {/* בחירת המבוטחים לכבודה */}
      {showBaggagePassenger && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowBaggagePassenger(false)}
        >
          <div
            dir="rtl"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">
              🧳
            </div>

            <h3 className="mt-4 text-center text-2xl font-extrabold text-gray-900">
              עבור איזה מבוטחים?
            </h3>

            <p className="mt-2 text-center text-gray-500">
              ניתן לבחור מבוטח אחד או כמה מבוטחים
            </p>

            <div className="mt-6 space-y-3">
              {passengerOptions.map((passenger) => {
                const selected =
                  baggagePassengers.includes(passenger);

                return (
                  <button
                    key={passenger}
                    type="button"
                    onClick={() =>
                      toggleBaggagePassenger(passenger)
                    }
                    className={`w-full rounded-xl border-2 p-4 text-right font-bold transition ${
                      selected
                        ? "border-green-500 bg-green-50 text-green-800"
                        : "border-gray-200 bg-white text-gray-800 hover:border-blue-400 hover:bg-blue-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{passenger}</span>

                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-md border-2 ${
                          selected
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {selected && "✓"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                if (baggagePassengers.length === 0) return;

                setShowBaggagePassenger(false);
              }}
              disabled={baggagePassengers.length === 0}
              className={`mt-5 w-full rounded-xl py-3 font-bold transition ${
                baggagePassengers.length > 0
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "cursor-not-allowed bg-gray-200 text-gray-400"
              }`}
            >
              אישור בחירה
            </button>

            <button
              type="button"
              onClick={() => setShowBaggagePassenger(false)}
              className="mt-3 w-full rounded-xl border-2 border-gray-200 bg-white py-3 font-bold text-gray-700 transition hover:bg-gray-50"
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* חלונית חבר מועדון */}
      {showClubQuestion && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div
            dir="rtl"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h3 className="text-center text-2xl font-bold text-gray-900">
              חבר מועדון
            </h3>

            <p className="mt-4 text-center text-lg text-gray-700">
              האם יש ברשותך כרטיס חבר מועדון לצורך הנחה?
            </p>

            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={handleClubYes}
                className="w-full rounded-xl bg-green-600 py-4 text-lg font-bold text-white transition hover:bg-green-700"
              >
                כן, יש לי כרטיס מועדון
              </button>

              <button
                type="button"
                onClick={handleClubNo}
                className="w-full rounded-xl border-2 border-gray-200 bg-white py-4 text-lg font-bold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
              >
                לא, אין לי
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


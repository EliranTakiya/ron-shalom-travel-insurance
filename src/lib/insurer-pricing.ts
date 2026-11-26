import { coveredAges, type PassengerSelections } from "@/lib/coverage-selection";

export type InsurerId = "harel" | "menora" | "passportcard" | "clal" | "phoenix" | "direct";

export type InsurerQuoteInput = {
  destination: string;
  departure: string;
  returnDate: string;
  ages: number[];
  planSelectionAges?: number[];
  selectedAddons: string[];
  baggagePassengerCount: number;
  passengerSelections?: PassengerSelections;
  extremeSportsStart?: string;
  extremeSportsEnd?: string;
  removeThirdParty?: boolean;
  removeRescue?: boolean;
};

export type InsurerQuote = {
  insurerId: InsurerId;
  companyName: string;
  planName: string;
  durationDays: number | null;
  currency: "USD";
  price: number | null;
  basePremium?: number;
  addOnsPremium?: number;
  coveragePremium?: number;
  priceLines?: {
    id: string;
    name: string;
    description?: string;
    amount: number;
    includedInBase?: boolean;
  }[];
  error: string | null;
  warnings: string[];
  underwritingRequired: boolean;
  sourceNote: string;
};

type AgeBand = {
  from: number;
  to: number | null;
  price: number;
  maxTripDays?: number;
};

type AddonPrice = {
  dailyPrice?: number;
  flatPrice?: number;
  maximumTripPrice?: number;
  coverage: string;
};

const sourceNotes: Record<InsurerId, string> = {
  harel: "תעריפון הראל 2026; תעריף יומי משתנה מהיום ה-15 או ה-21 לפי היעד.",
  menora: "מחירון מנורה 2026; תעריפי בסיס, ביטול/קיצור ומצב רפואי קודם לפי טבלאות הגיל.",
  passportcard:
    "מחירון 2026 של שוק הביטוח הושווה לתעריפון PassportCard הרשמי מנובמבר 2025: מחיר ארה״ב באתר הוא מחיר העולם בתוספת ארה״ב מהיום הראשון בנסיעות של 31 ימים ומעלה.",
  clal: "תעריפי כלל שסופקו: ביטוח בסיס $2.30 ליום בעולם ו-$3.45 ליום בארה״ב; איתור וחילוץ $0.20 ליום לנוסע מתומחר בנפרד.",
  phoenix:
    "מחירון הפניקס 2026 לאחר הנחת רכישה מקוונת של 10% על הכיסוי הבסיסי; איתור וחילוץ נכלל בבסיס, והסרתו מנכה $0.20 ליום לנוסע.",
  direct:
    "תעריפי ביטוח ישיר הוזנו מקובץ האקסל שסופק; הגיליון נקרא travel_costs_09.2023 ונערך לאחרונה ב-2026-08-09. לא צוין תאריך תחולה, לכן המחירים משוערים ודורשים אימות.",
};

const harelWorldBands: AgeBand[] = [
  { from: 0, to: 50, price: 2.5, maxTripDays: 365 },
  { from: 51, to: 60, price: 2.5, maxTripDays: 180 },
  { from: 61, to: 65, price: 3.8, maxTripDays: 120 },
  { from: 66, to: 70, price: 4.8, maxTripDays: 120 },
  { from: 71, to: 75, price: 6.55, maxTripDays: 120 },
  { from: 76, to: 80, price: 11.6, maxTripDays: 60 },
  { from: 81, to: 85, price: 11.6, maxTripDays: 30 },
  { from: 86, to: 95, price: 17.5, maxTripDays: 30 },
];

const harelUsaBands: AgeBand[] = [
  { from: 0, to: 50, price: 3.5, maxTripDays: 365 },
  { from: 51, to: 60, price: 3.5, maxTripDays: 180 },
  { from: 61, to: 65, price: 6.8, maxTripDays: 120 },
  { from: 66, to: 70, price: 9.7, maxTripDays: 120 },
  { from: 71, to: 75, price: 11.6, maxTripDays: 120 },
  { from: 76, to: 80, price: 21.2, maxTripDays: 60 },
  { from: 81, to: 85, price: 21.2, maxTripDays: 30 },
  { from: 86, to: 95, price: 32.5, maxTripDays: 30 },
];

const menoraWorldBands: AgeBand[] = [
  { from: 0, to: 20, price: 1.95, maxTripDays: 180 },
  { from: 21, to: 50, price: 1.95, maxTripDays: 180 },
  { from: 51, to: 60, price: 1.95, maxTripDays: 180 },
  { from: 61, to: 65, price: 3.3, maxTripDays: 120 },
  { from: 66, to: 70, price: 4.5, maxTripDays: 120 },
  { from: 71, to: 75, price: 6.55, maxTripDays: 120 },
  { from: 76, to: 85, price: 11.6, maxTripDays: 60 },
];

const menoraUsaBands: AgeBand[] = [
  { from: 0, to: 20, price: 3.3, maxTripDays: 180 },
  { from: 21, to: 50, price: 3.3, maxTripDays: 180 },
  { from: 51, to: 60, price: 3.3, maxTripDays: 180 },
  { from: 61, to: 65, price: 6.1, maxTripDays: 120 },
  { from: 66, to: 70, price: 9, maxTripDays: 120 },
  { from: 71, to: 75, price: 14, maxTripDays: 120 },
  { from: 76, to: 85, price: 27, maxTripDays: 60 },
];

const clalWorldBands: AgeBand[] = [
  { from: 0, to: 18, price: 2.3 },
  { from: 19, to: 60, price: 2.3 },
  { from: 61, to: 65, price: 2.3 },
  { from: 66, to: 70, price: 2.3 },
  { from: 71, to: 75, price: 2.3 },
  { from: 76, to: 80, price: 2.3 },
  { from: 81, to: 85, price: 2.3 },
  { from: 86, to: null, price: 2.3 },
];

const clalUsaBands: AgeBand[] = [
  { from: 0, to: 60, price: 3.45 },
  { from: 61, to: 65, price: 3.45 },
  { from: 66, to: 70, price: 3.45 },
  { from: 71, to: 75, price: 3.45 },
  { from: 76, to: 80, price: 3.45 },
  { from: 81, to: 85, price: 3.45 },
  { from: 86, to: null, price: 3.45 },
];

const phoenixBands = [
  { from: 0, to: 18, world: 2, americas: 3.3, usa15: 3.9, usaAfter15: 3.9, maxTripDays: 180 },
  { from: 19, to: 60, world: 2.2, americas: 3.3, usa15: 3.9, usaAfter15: 3.9, maxTripDays: 180 },
  { from: 61, to: 65, world: 3.8, americas: 6.1, usa15: 7.4, usaAfter15: 7.4, maxTripDays: 120 },
  { from: 66, to: 70, world: 5, americas: 9, usa15: 10.9, usaAfter15: 10.9, maxTripDays: 120 },
  { from: 71, to: 75, world: 6.55, americas: 15, usa15: 15, usaAfter15: 15, maxTripDays: 120 },
  { from: 76, to: 80, world: 11.6, americas: 28, usa15: 28, usaAfter15: 28, maxTripDays: 60 },
  { from: 81, to: 85, world: 11.6, americas: 28, usa15: 28, usaAfter15: 28, maxTripDays: 30 },
  { from: 86, to: 90, world: 24.57, americas: 33, usa15: 40, usaAfter15: 40, maxTripDays: 30 },
];

const passportWorldBands: AgeBand[] = [
  { from: 0, to: 50, price: 3, maxTripDays: 90 },
  { from: 51, to: 60, price: 3, maxTripDays: 180 },
  { from: 61, to: 65, price: 4.45, maxTripDays: 90 },
  { from: 66, to: 70, price: 5.35, maxTripDays: 90 },
  { from: 71, to: 75, price: 17, maxTripDays: 90 },
  { from: 76, to: 79, price: 26.75, maxTripDays: 30 },
  { from: 80, to: 84, price: 26.75, maxTripDays: 30 },
];

const passportUsaAdditions = [
  { from: 0, to: 50, upTo30Days: 1.25, over30Days: 3.15 },
  { from: 51, to: 60, upTo30Days: 1.25, over30Days: 3.15 },
  { from: 61, to: 65, upTo30Days: 3.6, over30Days: 5.65 },
  { from: 66, to: 70, upTo30Days: 5.85, over30Days: 8.95 },
  { from: 71, to: 75, upTo30Days: 7.1, over30Days: 13.3 },
  { from: 76, to: 79, upTo30Days: 12.3, over30Days: null },
  { from: 80, to: 84, upTo30Days: 12.3, over30Days: null },
];

const dateTimestamp = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return timestamp;
};

const findBand = (age: number, bands: AgeBand[]) =>
  bands.find((band) => age >= band.from && (band.to === null || age <= band.to));

const toCents = (amount: number) => Math.round(amount * 100);

const inclusiveDays = (startDate: string, endDate: string) => {
  const start = dateTimestamp(startDate);
  const end = dateTimestamp(endDate);
  return start !== null && end !== null && end >= start
    ? (end - start) / 86_400_000 + 1
    : null;
};

const isUsaDestination = (destination: string) =>
  destination.split(",").some((country) => country.trim() === "ארצות הברית");

const isAmericasDestination = (destination: string) =>
  destination.split(",").some((country) =>
    ["קנדה", "מקסיקו", "ברזיל", "ארגנטינה", "צ׳ילה", "פרו"].includes(
      country.trim(),
    ),
  );

const errorQuote = (
  insurerId: InsurerId,
  companyName: string,
  durationDays: number | null,
  message: string,
  underwritingRequired = false,
): InsurerQuote => ({
  insurerId,
  companyName,
  planName: "ביטוח נסיעות",
  durationDays,
  currency: "USD",
  price: null,
  error: message,
  warnings: [],
  underwritingRequired,
  sourceNote: sourceNotes[insurerId],
});

const addonPrice = (
  insurerId: InsurerId,
  addon: string,
  age: number,
  isUsa: boolean,
  durationDays: number,
): AddonPrice | null => {
  const byAge = (bands: AgeBand[]) => findBand(age, bands)?.price;
  switch (insurerId) {
    case "harel":
      if (addon === "baggage") return { dailyPrice: 0.39, coverage: "כבודה" };
      if (addon === "phone") return { dailyPrice: 1.6, coverage: "טלפון עד $1,000" };
      if (addon === "laptop") return { dailyPrice: 2, coverage: "מחשב נייד או טאבלט" };
      if (addon === "cancellation") {
        const price = byAge([
          { from: 0, to: 17, price: 0.65 }, { from: 18, to: 40, price: 0.7 },
          { from: 41, to: 50, price: 1 }, { from: 51, to: 60, price: 1 },
          { from: 61, to: 75, price: 1.5 }, { from: 76, to: 85, price: 2.8 },
          { from: 86, to: 95, price: 4.2 },
        ]);
        return price === undefined ? null : { dailyPrice: price, coverage: "ביטול/קיצור עד $5,000" };
      }
      if (addon === "medical") {
        const price = byAge([
          { from: 0, to: 17, price: 3.35 }, { from: 18, to: 60, price: 4.05 },
          { from: 61, to: 65, price: 6.25 }, { from: 66, to: 70, price: 6.5 },
          { from: 71, to: 75, price: 9 }, { from: 76, to: 85, price: 15 },
          { from: 86, to: 95, price: 22 },
        ]);
        return price === undefined ? null : { dailyPrice: price, coverage: "החמרה למצב רפואי קודם; כפוף לחיתום" };
      }
      if (addon === "pregnancy") return age >= 18 && age <= 42 ? { dailyPrice: isUsa ? 10 : 5, coverage: "הריון עד שבוע 32" } : null;
      if (addon === "extremeSports") return age <= 75 ? { dailyPrice: 0.5, coverage: "ספורט אתגרי" } : age <= 85 ? { dailyPrice: 2, coverage: "ספורט אתגרי" } : null;
      if (addon === "ski") return age <= 75 ? { dailyPrice: 9.5, coverage: "ספורט חורף" } : age <= 80 ? { dailyPrice: 13.5, coverage: "ספורט חורף" } : null;
      if (addon === "competitiveSports") return age <= 75 ? { dailyPrice: 2.5, maximumTripPrice: 25, coverage: "ספורט מקצועי עד $25 לנסיעה" } : null;
      if (addon === "rentalCar") return age >= 24 && age <= 75 ? { dailyPrice: 6.5, maximumTripPrice: 88, coverage: "ביטול השתתפות עצמית לרכב שכור" } : null;
      if (addon === "valuableItem") return { dailyPrice: 1, coverage: "פריט יקר ערך; נדרש גם כיסוי כבודה" };
      if (addon === "personalAccident" || addon === "extremeSportsAccident") {
        const prices = addon === "personalAccident"
          ? [{ from: 0, to: 17, price: 0.25 }, { from: 18, to: 40, price: 0.4 }, { from: 41, to: 50, price: 0.7 }, { from: 51, to: 60, price: 0.96 }, { from: 61, to: 70, price: 1.08 }]
          : [{ from: 0, to: 17, price: 0.1 }, { from: 18, to: 40, price: 0.15 }, { from: 41, to: 50, price: 0.25 }, { from: 51, to: 60, price: 0.35 }, { from: 61, to: 70, price: 0.4 }];
        const price = byAge(prices);
        return price === undefined ? null : { dailyPrice: price, coverage: addon === "personalAccident" ? "תאונות אישיות" : "תאונות אישיות בספורט אתגרי" };
      }
      if (addon === "cancellation10k") {
        const price = byAge([
          { from: 0, to: 17, price: 0.9 }, { from: 18, to: 40, price: 1 },
          { from: 41, to: 50, price: 1.7 }, { from: 51, to: 60, price: 2.6 },
          { from: 61, to: 75, price: 3.8 }, { from: 76, to: 85, price: 5.5 },
          { from: 86, to: 95, price: 8 },
        ]);
        return price === undefined ? null : { dailyPrice: price, coverage: "ביטול/קיצור עד $10,000" };
      }
      if (["bicycle2500", "bicycle4500", "bicycle6000"].includes(addon)) {
        if (durationDays > 90) return null;
        const price = { bicycle2500: 1.33, bicycle4500: 2.46, bicycle6000: 3.3 }[addon as "bicycle2500" | "bicycle4500" | "bicycle6000"];
        const limit = addon.slice("bicycle".length);
        return { dailyPrice: price, coverage: `ביטוח אופניים עד $${limit}; עד 90 ימים` };
      }
      if (addon === "rentalCarEnhanced") return null;
      return null;
    case "menora":
      if (addon === "baggage") return { dailyPrice: 0.35, coverage: "כבודה" };
      if (addon === "phone") return { dailyPrice: 1.6, coverage: "טלפון נייד; השתתפות עצמית $200" };
      if (addon === "laptop") return { dailyPrice: 1, coverage: "מחשב נייד" };
      if (addon === "cancellation") {
        const price = byAge([
          { from: 0, to: 50, price: 0.3 }, { from: 51, to: 60, price: 0.5 },
          { from: 61, to: 75, price: 0.8 }, { from: 76, to: 85, price: 1.2 },
        ]);
        return price === undefined ? null : { dailyPrice: price, coverage: "ביטול/קיצור נסיעה" };
      }
      if (addon === "medical") {
        const price = byAge([
          { from: 0, to: 20, price: 3.3 }, { from: 21, to: 50, price: 3.8 },
          { from: 51, to: 60, price: 4 }, { from: 61, to: 65, price: 5.5 },
          { from: 66, to: 70, price: 6 }, { from: 71, to: 75, price: 9.5 },
          { from: 76, to: 85, price: 11.6 },
        ]);
        return price === undefined ? null : { dailyPrice: price, coverage: "מצב בריאות קודם; בכפוף לחיתום" };
      }
      if (addon === "pregnancy") return age >= 18 && age <= 42 ? { dailyPrice: isUsa ? 7.5 : 4, coverage: "הריון" } : null;
      if (addon === "extremeSports") return { dailyPrice: 0.5, coverage: "ספורט אתגרי" };
      if (addon === "ski") return { dailyPrice: 8.47, coverage: "ספורט חורף" };
      if (addon === "rentalCar") return { dailyPrice: 6, coverage: "ביטול השתתפות עצמית לרכב שכור" };
      return null;
    case "clal":
      if (addon === "baggage") return { dailyPrice: 0.36, coverage: "כבודה עד $2,500" };
      if (addon === "phone" || addon === "laptop" || addon === "devices" || addon === "camera") return { dailyPrice: 1.32, coverage: "טלפון, מחשב נייד ומצלמה; עד שתי הרחבות למבוטח" };
      if (addon === "cancellation") {
        const price = byAge([
          { from: 0, to: 30, price: 0.29 }, { from: 31, to: 40, price: 0.46 },
          { from: 41, to: 50, price: 0.86 }, { from: 51, to: 65, price: 2.16 },
          { from: 66, to: 75, price: 2.26 }, { from: 76, to: 80, price: 3.26 },
          { from: 81, to: null, price: 4.26 },
        ]);
        return price === undefined ? null : { dailyPrice: price, coverage: "ביטול/קיצור נסיעה" };
      }
      if (addon === "medical") {
        const price = byAge([
          { from: 0, to: 18, price: 1.4 }, { from: 19, to: 50, price: 2 },
          { from: 51, to: 65, price: 3.7 }, { from: 66, to: 70, price: 6.6 },
          { from: 71, to: 75, price: 7 }, { from: 76, to: 80, price: 12 },
          { from: 81, to: null, price: 14 },
        ]);
        return price === undefined ? null : { dailyPrice: price, coverage: "מצב בריאות קיים יציב; רק אם נדרש בשאלון" };
      }
      if (addon === "pregnancy") return age >= 18 && age <= 50 ? { dailyPrice: 7.5, coverage: "הריון עד שבוע 30" } : null;
      if (addon === "extremeSports") return age <= 75 ? { dailyPrice: 0.46, coverage: "ספורט אתגרי" } : null;
      if (addon === "ski") return age <= 75 ? { dailyPrice: 6.38, coverage: "ספורט חורף" } : null;
      if (addon === "competitiveSports") return age <= 75 ? { dailyPrice: 3.25, coverage: "ספורט תחרותי דרגה 1" } : null;
      if (addon === "rentalCar") return age >= 17 ? { dailyPrice: 8, coverage: "ביטול השתתפות עצמית לרכב שכור" } : null;
      if (addon === "competitiveSports2") return age <= 75 ? { dailyPrice: 4.25, coverage: "ספורט תחרותי דרגה 2" } : null;
      return null;
    case "phoenix":
      if (addon === "baggage") return { dailyPrice: 0.5, coverage: "כבודה עד $2,500" };
      if (addon === "phone") return { dailyPrice: 1, coverage: "טלפון עד $1,000" };
      if (addon === "laptop") return { dailyPrice: 0.8, coverage: "מחשב נייד/טאבלט עד $2,000" };
      if (addon === "cancellation") return age <= 60 ? { dailyPrice: 0.7, maximumTripPrice: 21, coverage: "ביטול/קיצור עד $6,000" } : { dailyPrice: 0.8, maximumTripPrice: 24, coverage: "ביטול/קיצור עד $6,000" };
      if (addon === "medical") {
        const price = byAge([
          { from: 0, to: 60, price: 4 }, { from: 61, to: 70, price: 6 },
          { from: 71, to: 75, price: 9 }, { from: 76, to: 90, price: 15 },
        ]);
        return price === undefined ? null : { dailyPrice: price, coverage: "החמרה למצב רפואי קודם; כפוף לתנאי חיתום" };
      }
      if (addon === "pregnancy") return age >= 18 && age <= 46 ? { dailyPrice: 4, coverage: "הריון עד שבוע 32" } : null;
      if (addon === "extremeSports") return age <= 75 ? { dailyPrice: 0.5, coverage: "ספורט אתגרי" } : null;
      if (addon === "ski") return age <= 75 ? { dailyPrice: 10, coverage: "ספורט חורף" } : null;
      if (addon === "competitiveSports") return age <= 75 ? { flatPrice: 25, coverage: "ספורט תחרותי לכל תקופת הביטוח" } : null;
      if (addon === "rentalCar") return age >= 24 && age <= 75 ? { dailyPrice: 8, coverage: "רכב פרטי; ג׳יפ/קרוון $15 ליום" } : null;
      if (addon === "camera") return { dailyPrice: 1, coverage: "גניבת מצלמה עד $2,000; השתתפות עצמית $100" };
      if (addon === "experienceTicket") return { flatPrice: 5, coverage: "כרטיס חוויה שלא נוצל עקב ביטול/קיצור; עד $750 למבוטח" };
      if (addon === "israelMedical") return { dailyPrice: 0.5, coverage: "הוצאות רפואיות בישראל; גבול הכיסוי לא פורסם במחירון" };
      if (addon === "rentalCarJeep") return age >= 24 && age <= 75 ? { dailyPrice: 15, coverage: "ביטול השתתפות עצמית לג׳יפ/קרוון" } : null;
      return null;
    case "passportcard":
      if (addon === "baggage") return { dailyPrice: 0.5, coverage: "כבודה עד $2,500" };
      if (addon === "phone") return { dailyPrice: 1.6, maximumTripPrice: 89.6, coverage: "טלפון עד $800" };
      if (addon === "laptop") return { dailyPrice: 0.5, coverage: "מחשב נייד/מצלמה עד $750" };
      if (addon === "camera") return { dailyPrice: 0.5, coverage: "מחשב נייד/מצלמה עד $750" };
      if (addon === "cancellation") return { dailyPrice: 0.8, maximumTripPrice: 16, coverage: "ביטול/קיצור עד $4,000" };
      if (addon === "medical") {
        const price = byAge([
          { from: 0, to: 50, price: 3.5 }, { from: 51, to: 60, price: 4.4 },
          { from: 61, to: 70, price: 5 }, { from: 71, to: 84, price: 0 },
        ]);
        return price === undefined ? null : { dailyPrice: price, coverage: "החמרה למצב רפואי קיים עד $350,000; מגיל 71 כלולה" };
      }
      if (addon === "pregnancy") return age >= 18 && age <= 39 ? { dailyPrice: 5, coverage: "הריון עד שבוע 32" } : null;
      if (addon === "extremeSports") return { dailyPrice: durationDays <= 30 ? 0.5 : 1, coverage: "ספורט אתגרי; בתעריף מעל 30 יום החיוב חל מהיום הראשון" };
      if (addon === "ski") return age <= 75 ? { dailyPrice: 10, coverage: "ספורט חורף" } : null;
      if (addon === "rentalCar") return age >= 24 && age <= 80 ? { dailyPrice: 8, coverage: "רכב שכור עד $1,500" } : null;
      if (addon === "valuableItem") return { dailyPrice: 2, coverage: "פריט יקר ערך עד $2,000" };
      if (addon === "phone1600") return { dailyPrice: 2.1, coverage: "טלפון עד $1,600" };
      if (addon === "laptop1500") return { dailyPrice: 1, coverage: "מחשב נייד/מצלמה עד $1,500" };
      if (addon === "laptop2000") return { dailyPrice: 1.5, coverage: "מחשב נייד/מצלמה עד $2,000" };
      if (addon === "personalAccident") return age <= 75 ? { dailyPrice: 0.75, coverage: "תאונות אישיות עד $50,000" } : null;
      if (addon === "operationalCancellation") return { dailyPrice: 0.5, coverage: "ביטול עקב פעילות מבצעית; למשרתי כוחות הביטחון בלבד" };
      return null;
    case "direct":
      return null;
  }
};

const getBaseDailyRate = (
  insurerId: InsurerId,
  age: number,
  durationDays: number,
  isUsa: boolean,
  isAmericas: boolean,
  removeRescue: boolean,
): { dailyRates: number[]; maxTripDays?: number; underwritingRequired: boolean; error?: string } => {
  if (insurerId === "harel") {
    const band = findBand(age, isUsa ? harelUsaBands : harelWorldBands);
    if (!band) return { dailyRates: [], underwritingRequired: false, error: "לא פורסם תעריף הראל לגיל זה." };
    return {
      dailyRates: Array.from({ length: durationDays }, (_, index) =>
        isUsa && index >= 20 ? (age <= 60 ? 3.7 : band.price) :
          !isUsa && index >= 14 && age >= 51 && age <= 60 ? 2.8 : band.price,
      ).map((rate) => removeRescue ? Math.max(0, rate - 0.2) : rate),
      maxTripDays: band.maxTripDays,
      underwritingRequired: false,
    };
  }

  if (insurerId === "menora") {
    const band = findBand(age, isUsa ? menoraUsaBands : menoraWorldBands);
    if (!band) return { dailyRates: [], underwritingRequired: age > 80, error: age > 80 ? "תעריף מעל גיל 80 כפוף לחיתום של מנורה." : "לא פורסם תעריף מנורה לגיל זה." };
    return {
      dailyRates: Array(durationDays).fill(removeRescue ? Math.max(0, band.price - 0.2) : band.price),
      maxTripDays: age > 80 ? 30 : band.maxTripDays,
      underwritingRequired: age > 80,
    };
  }

  if (insurerId === "clal") {
    const band = findBand(age, isUsa ? clalUsaBands : clalWorldBands);
    if (!band) return { dailyRates: [], underwritingRequired: false, error: "לא פורסם תעריף כלל לגיל זה." };
    return {
      dailyRates: Array(durationDays).fill(band.price),
      underwritingRequired: age >= 81,
    };
  }

  if (insurerId === "phoenix") {
    const band = phoenixBands.find((row) => age >= row.from && age <= row.to);
    if (!band) return { dailyRates: [], underwritingRequired: age > 90, error: "מעל גיל 90 נדרש תעריף וחיתום רפואי פרטני בהפניקס." };
    if (!isUsa && isAmericas && durationDays > 15) {
      return { dailyRates: [], maxTripDays: 15, underwritingRequired: false, error: "תעריף אמריקה ונפאל של הפניקס פורסם לנסיעות של עד 15 ימים בלבד." };
    }
    const dailyRate = isUsa
      ? durationDays <= 15 ? band.usa15 : band.usaAfter15
      : isAmericas ? band.americas : band.world;
    return {
      dailyRates: Array(durationDays).fill(dailyRate),
      maxTripDays: Math.min(band.maxTripDays, isUsa || !isAmericas ? band.maxTripDays : 15),
      underwritingRequired: false,
    };
  }

  if (insurerId === "direct") {
    return {
      dailyRates: [],
      underwritingRequired: false,
      error: "יש לחשב הצעת ביטוח ישיר באמצעות התעריפון הייעודי.",
    };
  }

  const worldBand = findBand(age, passportWorldBands);
  if (!worldBand) {
    return { dailyRates: [], underwritingRequired: age >= 85, error: "מגיל 85 נדרש חיתום של PassportCard ולא פורסם מחיר בסיס." };
  }
  let dailyRate = worldBand.price;
  if (isUsa) {
    const addition = passportUsaAdditions.find((band) => age >= band.from && age <= band.to);
    const usaAddition = durationDays <= 30 ? addition?.upTo30Days : addition?.over30Days;
    if (usaAddition === undefined || usaAddition === null) {
      return { dailyRates: [], underwritingRequired: false, error: "לא פורסם תעריף PassportCard לארה״ב למשך או לגיל שנבחר." };
    }
    dailyRate += usaAddition;
  }
  return {
    dailyRates: Array(durationDays).fill(dailyRate),
    maxTripDays: age <= 18 ? 90 : age <= 60 ? 180 : age <= 75 ? 90 : 30,
    underwritingRequired: false,
  };
};

export function calculateInsurerQuote(
  insurerId: InsurerId,
  input: InsurerQuoteInput,
): InsurerQuote {
  const companyNames: Record<InsurerId, string> = {
    harel: "הראל",
    menora: "מנורה",
    passportcard: "פספורטכארד",
    clal: "כלל",
    phoenix: "הפניקס",
    direct: "ביטוח ישיר",
  };
  const companyName = companyNames[insurerId];
  const departure = dateTimestamp(input.departure);
  const returnDate = dateTimestamp(input.returnDate);
  if (departure === null || returnDate === null || returnDate < departure) {
    return errorQuote(insurerId, companyName, null, "תאריכי הנסיעה חסרים או אינם תקינים.");
  }
  const durationDays = (returnDate - departure) / 86_400_000 + 1;
  if (input.ages.length === 0 || input.ages.some((age) => !Number.isInteger(age) || age < 0)) {
    return errorQuote(insurerId, companyName, durationDays, "חסרים גילאים תקינים של הנוסעים.");
  }

  const isUsa = isUsaDestination(input.destination);
  const isAmericas = isAmericasDestination(input.destination);
  const scopedAddons = [...new Set(input.selectedAddons)].flatMap((selection) => {
    const separatorIndex = selection.indexOf(":");
    if (separatorIndex < 0) return [selection];
    if (selection.slice(0, separatorIndex) !== insurerId) return [];
    return [selection.slice(separatorIndex + 1)];
  });
  const selectedAddons = scopedAddons.filter((addon) => {
    if (insurerId === "harel" && addon === "cancellation" && scopedAddons.includes("cancellation10k")) return false;
    if (insurerId === "passportcard" && addon === "phone" && scopedAddons.includes("phone1600")) return false;
    if (insurerId === "passportcard" && addon === "laptop" && scopedAddons.some((item) => ["laptop1500", "laptop2000"].includes(item))) return false;
    return true;
  });
  if (insurerId === "harel" && selectedAddons.includes("valuableItem") && !selectedAddons.includes("baggage")) {
    return errorQuote(insurerId, companyName, durationDays, "כיסוי פריט יקר ערך בהראל מחייב בחירת כיסוי כבודה.");
  }
  const selectedSportsDays = inclusiveDays(
    input.extremeSportsStart || input.departure,
    input.extremeSportsEnd || input.returnDate,
  );
  const sportsStartTimestamp = dateTimestamp(input.extremeSportsStart || input.departure);
  const sportsEndTimestamp = dateTimestamp(input.extremeSportsEnd || input.returnDate);
  const sportsCoverageDays = insurerId === "passportcard" ? durationDays : selectedSportsDays;
  if (
    input.selectedAddons.includes("extremeSports") &&
    insurerId !== "passportcard" &&
    (sportsCoverageDays === null ||
      sportsCoverageDays > durationDays ||
      sportsStartTimestamp === null ||
      sportsEndTimestamp === null ||
      sportsStartTimestamp < departure ||
      sportsEndTimestamp > returnDate)
  ) {
    return errorQuote(insurerId, companyName, durationDays, "טווח תאריכי הספורט האתגרי לא תקין או חורג מתאריכי הנסיעה.");
  }
  const passengerRates = input.ages.map((age) =>
    getBaseDailyRate(insurerId, age, durationDays, isUsa, isAmericas, input.removeRescue ?? false),
  );
  const baseError = passengerRates.find((rate) => rate.error)?.error;
  const underwritingRequired = passengerRates.some((rate) => rate.underwritingRequired);
  if (baseError) return errorQuote(insurerId, companyName, durationDays, baseError, underwritingRequired);
  if (passengerRates.some((rate) => rate.maxTripDays !== undefined && durationDays > rate.maxTripDays)) {
    return errorQuote(insurerId, companyName, durationDays, "משך הנסיעה חורג מתקופת הביטוח המרבית שפורסמה לגיל הנוסעים.", underwritingRequired);
  }

  const ratesWithCoverageRemoval = passengerRates.map((rate) => {
    if (!input.removeRescue || ["harel", "menora", "clal", "direct"].includes(insurerId)) {
      return rate;
    }
    return {
      ...rate,
      dailyRates: rate.dailyRates.map((dailyRate) => Math.max(0, dailyRate - 0.2)),
    };
  });
  let baseCents = ratesWithCoverageRemoval.reduce(
    (sum, rate) => sum + rate.dailyRates.reduce((total, price) => total + toCents(price), 0),
    0,
  );
  const rescueCents =
    insurerId === "clal" && !input.removeRescue
      ? input.ages.length * durationDays * 20
      : 0;
  let addOnsCents = 0;
  const priceLines: NonNullable<InsurerQuote["priceLines"]> = [
    {
      id: "base",
      name: `ביטוח בסיס - ${companyName}`,
      description: [
        isUsa ? "תעריף לארצות הברית" : isAmericas ? "תעריף ליעד באמריקה" : "תעריף לכל היעדים",
        input.removeRescue && ["harel", "menora"].includes(insurerId) ? "איתור וחילוץ הוסר מהתעריף" : "",
      ].filter(Boolean).join("; "),
      amount: baseCents / 100,
    },
  ];
  if (["harel", "menora", "clal", "phoenix", "passportcard"].includes(insurerId)) {
    priceLines.push({
      id: "rescue",
      name: "איתור, חיפוש וחילוץ",
      description:
        insurerId === "clal"
          ? input.removeRescue
            ? "הוסר מהמחיר"
            : "$0.20 ליום לנוסע; מחושב בנפרד מביטוח הבסיס"
          : input.removeRescue
            ? "הוסר ממחיר הבסיס"
            : "כלול במחיר הבסיס; לא נוספה פרמיה נפרדת",
      amount: rescueCents / 100,
      includedInBase: insurerId === "clal" ? false : !input.removeRescue,
    });
  }

  const combinedDevices = insurerId === "clal" && selectedAddons.some((addon) => ["phone", "laptop", "camera"].includes(addon));
  const combinedPassportCamera = insurerId === "passportcard" && selectedAddons.includes("camera") && selectedAddons.includes("laptop");
  const billedAddons = combinedDevices
    ? [...selectedAddons.filter((addon) => !["phone", "laptop", "camera"].includes(addon)), "devices"]
    : combinedPassportCamera ? selectedAddons.filter((addon) => addon !== "laptop") : selectedAddons;
  const warnings: string[] = [];

  for (const addon of billedAddons) {
    const addonDays = addon === "extremeSports" && insurerId !== "passportcard"
      ? sportsCoverageDays ?? durationDays
      : durationDays;
    const addonAges = addon === "devices" && !selectedAddons.includes("camera")
      ? input.ages.filter((_, index) => ["phone", "laptop"].some((id) => selectedAddons.includes(id) && (!input.passengerSelections?.[id as "phone" | "laptop"] || input.passengerSelections[id as "phone" | "laptop"]?.includes(index))))
      : coveredAges(input.ages, addon, input.passengerSelections, input.baggagePassengerCount);
    let addonCents = 0;
    for (const age of addonAges) {
      const price = addonPrice(insurerId, addon, age, isUsa, addonDays);
      if (!price) {
        return errorQuote(
          insurerId,
          companyName,
          durationDays,
          addon === "competitiveSports" && insurerId === "passportcard"
            ? "תעריף ספורט תחרותי ב-PassportCard ניתן דרך מוקד המכירות בלבד."
            : addon === "rentalCarEnhanced" && insurerId === "harel"
              ? "הרחבת הרכב המוגדלת של הראל פורסמה בטווח $26-$88, ללא נוסחת חישוב לפי תקופת הנסיעה; יש לקבל תמחור פרטני."
            : `לא פורסם תעריף ${companyName} להרחבה שנבחרה עבור גיל ${age}.`,
          underwritingRequired,
        );
      }
      const passengerPremium = price.flatPrice !== undefined
        ? toCents(price.flatPrice)
        : toCents(price.dailyPrice ?? 0) * addonDays;
      addonCents += Math.min(
        passengerPremium,
        price.maximumTripPrice === undefined ? passengerPremium : toCents(price.maximumTripPrice),
      );
      if (!price.coverage.includes("כלול") && price.dailyPrice === 0) {
        warnings.push(`${companyName}: ${price.coverage}.`);
      }
    }
    addOnsCents += addonCents;
    const lineId = addon === "devices" ? "devices" : addon;
    const lineName = addon === "devices"
      ? "כיסוי מכשירים אלקטרוניים"
      : ({
          baggage: "כבודה",
          phone: "טלפון נייד",
          laptop: "מחשב נייד או טאבלט",
          pregnancy: "הריון",
          extremeSports: "ספורט אתגרי",
          ski: "ספורט חורף",
          competitiveSports: "ספורט תחרותי",
          rentalCar: "רכב שכור",
          medical: "מצב רפואי קודם",
          cancellation: "ביטול וקיצור נסיעה",
          personalAccident: "תאונות אישיות",
          valuableItem: "פריט יקר ערך",
          camera: "מצלמה",
        } as Record<string, string>)[addon] ?? addon;
    const lineDescription = [
      addonPrice(insurerId, addon, input.ages[0], isUsa, addonDays)?.coverage,
      addon === "extremeSports" && insurerId !== "passportcard" ? `כיסוי ל-${addonDays} ימים` : "",
    ].filter(Boolean).join("; ");
    priceLines.push({
      id: lineId,
      name: lineName,
      description: lineDescription,
      amount: addonCents / 100,
    });
  }

  if (insurerId === "passportcard" && input.ages.some((age) => age >= 71 && age <= 84)) {
    warnings.push("לפי תעריפון PassportCard, הרחבת מצב רפואי קיים כלולה מגיל 71; יש לוודא את תנאי החיתום בעת הרכישה.");
  }
  if (insurerId === "clal" && selectedAddons.includes("competitiveSports")) {
    warnings.push("המחיר חושב לפי ספורט תחרותי דרגה 1; דרגה 2 מתומחרת ב-$4.25 ליום.");
  }
  if (selectedAddons.some((addon) => ["ski", "rentalCar"].includes(addon))) {
    warnings.push("המחיר חושב עבור כל ימי הנסיעה בהרחבה זו.");
  }
  if (selectedAddons.includes("extremeSports") && insurerId === "passportcard") {
    warnings.push("בפספורטכארד תעריף הספורט האתגרי מחושב לכל ימי הנסיעה, ללא בחירת טווח תאריכים.");
  }
  if (insurerId === "phoenix" && isUsa && durationDays > 15) {
    warnings.push("תעריף ארה״ב החל מהיום ה-15 חושב לכל ימי הנסיעה, בהתאם לטבלה.");
  }
  if (underwritingRequired) warnings.push("המחיר משוער בלבד ואחד הנוסעים נדרש לחיתום רפואי.");
  if (input.removeThirdParty) {
    priceLines.push({ id: "thirdPartyRemoved", name: "צד ג׳", description: "הכיסוי הוסר; בחלק מהחברות הוא ניתן ללא תוספת מחיר.", amount: 0 });
  } else if (insurerId === "harel") {
    priceLines.push({ id: "thirdParty", name: "חבות כלפי צד ג׳", description: "כלול ללא תוספת תשלום", amount: 0, includedInBase: true });
  }
  const totalCents = baseCents + rescueCents + addOnsCents;
  return {
    insurerId,
    companyName,
    planName: "ביטוח נסיעות",
    durationDays,
    currency: "USD",
    price: totalCents / 100,
    basePremium: baseCents / 100,
    addOnsPremium: addOnsCents / 100,
    coveragePremium: rescueCents / 100,
    priceLines,
    error: null,
    warnings: [...new Set(warnings)],
    underwritingRequired,
    sourceNote: sourceNotes[insurerId],
  };
}
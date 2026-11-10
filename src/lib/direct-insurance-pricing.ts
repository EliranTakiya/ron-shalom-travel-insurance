import tariff from "@/data/direct-insurance-prices.json";
import type { InsurerQuote, InsurerQuoteInput } from "@/lib/insurer-pricing";

type RateBand = {
  ageFrom: number;
  ageTo: number;
  dailyPrice: number;
};

type AddonTariff =
  | RateBand[]
  | { world: RateBand[]; northAmerica: RateBand[] }
  | { fixedFee: number; rates: RateBand[] };

type DirectAddonId =
  | "baggage"
  | "rescue"
  | "tripShortening"
  | "cancellation"
  | "extremeSports"
  | "ski"
  | "rentalCar"
  | "competitiveSports"
  | "pregnancy"
  | "phone"
  | "laptop"
  | "medical"
  | "basicUpgrade"
  | "specialPreexistingCondition";

const sourceNote = `${tariff.source.note} שם הקובץ: ${tariff.source.fileName}.`;

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

const cents = (amount: number) => Math.round(amount * 100);

const findRate = (age: number, bands: RateBand[]) =>
  bands.find((band) => age >= band.ageFrom && age <= band.ageTo)?.dailyPrice;

const errorQuote = (
  durationDays: number | null,
  message: string,
): InsurerQuote => ({
  insurerId: "direct",
  companyName: "ביטוח ישיר",
  planName: "ביטוח נסיעות לחו״ל",
  durationDays,
  currency: "USD",
  price: null,
  error: message,
  warnings: [],
  underwritingRequired: false,
  sourceNote,
});

export function calculateDirectInsuranceQuote(
  input: InsurerQuoteInput,
): InsurerQuote {
  const departure = dateTimestamp(input.departure);
  const returnDate = dateTimestamp(input.returnDate);
  if (departure === null || returnDate === null || returnDate < departure) {
    return errorQuote(null, "תאריכי הנסיעה חסרים או אינם תקינים.");
  }

  const durationDays = (returnDate - departure) / 86_400_000 + 1;
  const sportsStart = dateTimestamp(input.extremeSportsStart || input.departure);
  const sportsEnd = dateTimestamp(input.extremeSportsEnd || input.returnDate);
  const extremeSportsDays = sportsStart !== null && sportsEnd !== null &&
      sportsStart >= departure && sportsEnd <= returnDate && sportsEnd >= sportsStart
    ? (sportsEnd - sportsStart) / 86_400_000 + 1
    : null;
  if (
    input.ages.length === 0 ||
    input.ages.some((age) => !Number.isInteger(age) || age < 0)
  ) {
    return errorQuote(durationDays, "חסרים גילאים תקינים של הנוסעים.");
  }
  if (
    input.selectedAddons.includes("extremeSports") &&
    (extremeSportsDays === null || extremeSportsDays > durationDays)
  ) {
    return errorQuote(durationDays, "טווח תאריכי הספורט האתגרי לא תקין או חורג מתאריכי הנסיעה.");
  }

  const countries = input.destination.split(",").map((country) => country.trim());
  const isNorthAmerica = countries.some((country) =>
    ["ארצות הברית", "קנדה"].includes(country),
  );
  const region = isNorthAmerica ? "northAmerica" : "world";
  const baseRates = tariff.baseRates[region] as RateBand[];
  const passengerRates = input.ages.map((age) => findRate(age, baseRates));
  if (passengerRates.some((rate) => rate === undefined)) {
    return errorQuote(
      durationDays,
      "לא פורסם בקובץ שסופק תעריף בסיס לביטוח ישיר לאחד מגילי הנוסעים או ליעד שנבחר.",
    );
  }

  const medicalBaseCents = (passengerRates as number[]).reduce(
    (sum, dailyRate) => sum + cents(dailyRate) * durationDays,
    0,
  );
  const rescueRates = tariff.addOns.rescue as RateBand[];
  const removedRescueCents = input.removeRescue
    ? input.ages.reduce((sum, age) => {
        const dailyRate = findRate(age, rescueRates);
        return sum + (dailyRate === undefined ? 0 : cents(dailyRate) * durationDays);
      }, 0)
    : 0;
  const baseCents = medicalBaseCents - removedRescueCents;
  const priceLines: NonNullable<InsurerQuote["priceLines"]> = [
    {
      id: "base",
      name: "ביטוח בסיס - ביטוח ישיר",
      description: [
        isNorthAmerica ? "תעריף לצפון אמריקה" : "תעריף לשאר היעדים",
        input.removeRescue ? "איתור וחילוץ הוסר ממחיר הבסיס" : "כולל איתור וחילוץ",
      ].join("; "),
      amount: baseCents / 100,
    },
    {
      id: "thirdParty",
      name: "חבות כלפי צד שלישי",
      description: input.removeThirdParty ? "הוסר; אינו משנה את המחיר לפי התעריף" : "כלול ללא תוספת תשלום",
      amount: 0,
      includedInBase: !input.removeThirdParty,
    },
    {
      id: "rescue",
      name: "איתור, חיפוש וחילוץ",
      description: input.removeRescue ? "הוסר ממחיר הבסיס" : "כלול במחיר הבסיס",
      amount: 0,
      includedInBase: !input.removeRescue,
    },
  ];

  const selectedAddons = [...new Set(input.selectedAddons)].flatMap((selection) => {
    const separatorIndex = selection.indexOf(":");
    if (separatorIndex < 0) return [selection];
    if (selection.slice(0, separatorIndex) !== "direct") return [];
    const addon = selection.slice(separatorIndex + 1);
    return addon === "rescue" ? [] : [addon];
  });

  const addonDefinitions = tariff.addOns as Record<string, AddonTariff>;
  const addonMetadata: Record<DirectAddonId, { name: string; description: string }> = {
    baggage: { name: "כבודה", description: "כיסוי כבודה לפי התעריף שבקובץ" },
    rescue: { name: "איתור וחילוץ", description: "$0.50 ליום לנוסע" },
    tripShortening: { name: "קיצור נסיעה", description: "עד $5,000" },
    cancellation: { name: "ביטול נסיעה", description: "עד $5,000" },
    extremeSports: { name: "ספורט אתגרי", description: "עד גיל 65 לפי הקובץ" },
    ski: { name: "ספורט חורף", description: "עד גיל 70 לפי הקובץ" },
    rentalCar: { name: "החזר השתתפות עצמית לרכב שכור", description: "עד גיל 75 לפי הקובץ" },
    competitiveSports: { name: "ספורט תחרותי", description: "עד גיל 60 לפי הקובץ" },
    pregnancy: { name: "הריון", description: "$20 קבועים ועוד $2 ליום; עד גיל 42" },
    phone: { name: "טלפון נייד", description: "לפי התעריף שבקובץ" },
    laptop: { name: "מחשב נייד", description: "לפי התעריף שבקובץ" },
    medical: { name: "מצב רפואי קודם", description: "הרחבה לפי מדרגת גיל" },
    basicUpgrade: { name: "שדרוג רובד בסיסי", description: "תוספת יומית לפי מדרגת גיל" },
    specialPreexistingCondition: {
      name: "מצב רפואי קודם מיוחד",
      description: "תעריף משתנה לפי גיל ויעד",
    },
  };

  let addOnsCents = 0;
  for (const addonId of selectedAddons) {
    const definition = addonMetadata[addonId as DirectAddonId];
    const tariffValue = addonDefinitions[addonId];
    if (!definition || !tariffValue) {
      return errorQuote(
        durationDays,
        `לא נמצא בקובץ תעריף ביטוח ישיר להרחבה ${addonId}.`,
      );
    }

    const fixedFee = !Array.isArray(tariffValue) && "fixedFee" in tariffValue
      ? tariffValue.fixedFee
      : 0;
    const rates = Array.isArray(tariffValue)
      ? tariffValue
      : "rates" in tariffValue
        ? tariffValue.rates
        : tariffValue[region];
    const coveredPassengers = addonId === "baggage"
      ? Math.min(input.ages.length, input.baggagePassengerCount || input.ages.length)
      : input.ages.length;
    let addonCents = 0;

    for (let index = 0; index < coveredPassengers; index += 1) {
      const dailyRate = findRate(input.ages[index], rates);
      if (dailyRate === undefined) {
        return errorQuote(
          durationDays,
          `לא פורסם בקובץ תעריף ביטוח ישיר להרחבת ${definition.name} עבור גיל ${input.ages[index]}.`,
        );
      }
      const addonDurationDays = addonId === "extremeSports" ? extremeSportsDays ?? durationDays : durationDays;
      addonCents += cents(dailyRate) * addonDurationDays + cents(fixedFee);
    }

    addOnsCents += addonCents;
    priceLines.push({
      id: addonId,
      name: definition.name,
      description: addonId === "extremeSports"
        ? `${definition.description}; תעריף עבור ${extremeSportsDays} ימי כיסוי`
        : definition.description,
      amount: addonCents / 100,
    });
  }

  return {
    insurerId: "direct",
    companyName: "ביטוח ישיר",
    planName: "ביטוח נסיעות לחו״ל",
    durationDays,
    currency: "USD",
    price: (baseCents + addOnsCents) / 100,
    basePremium: baseCents / 100,
    addOnsPremium: addOnsCents / 100,
    coveragePremium: 0,
    priceLines,
    error: null,
    warnings: [],
    underwritingRequired: false,
    sourceNote,
  };
}

import priceLists from "@/data/price-lists.json";
// https://shukabit.co.il/migdal-lowcost/prices
type DailyRate = {
  ageFrom: number;
  ageTo: number | null;
  price: number;
  maxTripDays: number;
  maxTripDaysNote?: string;
  underwritingRequired?: boolean;
};

type AgeRate = {
  ageFrom: number;
  ageTo: number | null;
  dailyPrice: number;
};

type BasePlan = {
  id: string;
  name: string;
  dailyRates: DailyRate[];
};

type AddOn = {
  id: string;
  name: string;
  coverage?: string;
  dailyPrice?: number;
  dailyRatesByAge?: AgeRate[];
  maximumTripPrice?: number;
};

type IncludedCoverage = {
  name: string;
  dailyValue?: number;
  includedAtNoAdditionalCost?: boolean;
};

type MigdalPriceList = {
  basePlans: (BasePlan & { includedCoverage?: IncludedCoverage[] })[];
  addOns: AddOn[];
};

type MigdalQuoteInput = {
  destination: string;
  departure: string;
  returnDate: string;
  ages: number[];
  selectedAddons: string[];
  baggagePassengerCount: number;
};

export type MigdalQuote = {
  planName: string;
  durationDays: number | null;
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
};

const tariff = priceLists.priceLists[0] as MigdalPriceList;

const addonIds: Record<string, string> = {
  phone: "phone-gps",
  baggage: "baggage",
  laptop: "tablet-laptop",
  pregnancy: "pregnancy",
  extremeSports: "extreme-sports",
  ski: "winter-sports",
  competitiveSports: "competitive-sports",
  rentalCar: "rental-car-deductible",
  medical: "preexisting-condition",
  cancellation: "trip-cancellation-shortening",
};

const verifiedLowcostAddons = new Set([
  "phone",
  "baggage",
  "extremeSports",
  "cancellation",
]);

const parseDate = (value: string) => {
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

const ageMatches = (
  age: number,
  range: { ageFrom: number; ageTo: number | null },
) => age >= range.ageFrom && (range.ageTo === null || age <= range.ageTo);

const toCents = (amount: number) => Math.round(amount * 100);

export function calculateMigdalQuote(input: MigdalQuoteInput): MigdalQuote {
  const departure = parseDate(input.departure);
  const returnDate = parseDate(input.returnDate);

  if (departure === null || returnDate === null || returnDate < departure) {
    return {
      planName: "",
      durationDays: null,
      price: null,
      error: "לא ניתן לחשב את המחיר: תאריכי הנסיעה חסרים או אינם תקינים.",
      warnings: [],
      underwritingRequired: false,
    };
  }

  const durationDays = (returnDate - departure) / 86_400_000 + 1;
  const ages = input.ages;

  if (
    ages.length === 0 ||
    ages.some((age) => !Number.isInteger(age) || age < 0)
  ) {
    return {
      planName: "",
      durationDays,
      price: null,
      error: "לא ניתן לחשב את המחיר: חסרים גילאים תקינים של הנוסעים.",
      warnings: [],
      underwritingRequired: false,
    };
  }

  const includesUs = input.destination
    .split(",")
    .some((country) => country.trim() === "ארצות הברית");
  const lowcostSupportsAllAges = ages.every((age) => age <= 60);
  const useLowcost = durationDays <= 14 && lowcostSupportsAllAges;
  const planId = useLowcost
    ? includesUs
      ? "lowcost-usa"
      : "lowcost-world"
    : includesUs
      ? "platinum-usa"
      : "platinum-world";
  const plan = tariff.basePlans.find((item) => item.id === planId);

  if (!plan) {
    return {
      planName: "",
      durationDays,
      price: null,
      error: "לא נמצא תעריף מתאים במחירון.",
      warnings: [],
      underwritingRequired: false,
    };
  }

  const baseRates = ages.map((age) =>
    plan.dailyRates.find((rate) => ageMatches(age, rate)),
  );

  if (baseRates.some((rate) => !rate)) {
    return {
      planName: plan.name,
      durationDays,
      price: null,
      error: "לא פורסם במחירון תעריף למסלול הזה עבור אחד מגילי הנוסעים.",
      warnings: [],
      underwritingRequired: false,
    };
  }

  const rates = baseRates as DailyRate[];
  const requires365DayApproval =
    plan.id.startsWith("platinum-") &&
    durationDays > 180 &&
    ages.every((age) => age <= 50);
  const exceedsMaxDuration = rates.some(
    (rate) => durationDays > rate.maxTripDays,
  );

  if (exceedsMaxDuration && !(durationDays <= 365 && requires365DayApproval)) {
    return {
      planName: plan.name,
      durationDays,
      price: null,
      error:
        "משך הנסיעה חורג מתקופת הביטוח המרבית שמופיעה במחירון עבור גיל הנוסעים.",
      warnings: [],
      underwritingRequired: false,
    };
  }

  const basePremiumCents = rates.reduce(
    (sum, rate) => sum + toCents(rate.price) * durationDays,
    0,
  );
  let addOnsPremiumCents = 0;
  let coveragePremiumCents = 0;
  let totalCents = basePremiumCents;
  const priceLines: NonNullable<MigdalQuote["priceLines"]> = [
    {
      id: "base",
      name: `ביטוח בסיס - ${plan.name}`,
      amount: basePremiumCents / 100,
    },
  ];
  const warnings: string[] = [];
  const isLowcost = plan.id.startsWith("lowcost-");

  for (const coverage of plan.includedCoverage ?? []) {
    const amount = coverage.dailyValue === undefined
      ? 0
      : toCents(coverage.dailyValue) * durationDays * ages.length / 100;
    const isAdditionalCharge = isLowcost && amount > 0;
    if (isAdditionalCharge) {
      const amountCents = Math.round(amount * 100);
      coveragePremiumCents += amountCents;
      totalCents += amountCents;
    }
    priceLines.push({
      id: `included-${coverage.name}`,
      name: coverage.name,
      description: isAdditionalCharge
        ? `$${coverage.dailyValue?.toFixed(2)} ליום לנוסע`
        : coverage.includedAtNoAdditionalCost
        ? "כלול ללא תוספת תשלום"
        : "כלול במחיר הבסיס",
      amount,
      includedInBase: !isAdditionalCharge,
    });
  }

  if (durationDays <= 14 && !lowcostSupportsAllAges) {
    warnings.push(
      "נבחר מסלול פלטינום גם לנסיעה קצרה, כי במחירון לא מופיע תעריף LOWCOST לגיל מעל 60.",
    );
  }

  const selectedAddons = input.selectedAddons.filter((addon) => !addon.includes(":"));
  const hasUnverifiedLowcostAddons = selectedAddons.some(
    (addon) => !verifiedLowcostAddons.has(addon),
  );

  if (isLowcost && hasUnverifiedLowcostAddons) {
    warnings.push(
      "המחיר חושב לפי LOWCOST בתוספת תעריפי ההרחבות שמפורסמים במחירון תחת פלטינום. יש לוודא מול מגדל שההרחבות זמינות גם ב-LOWCOST.",
    );
  }

  if (input.selectedAddons.some((addon) => addon.includes(":"))) {
    warnings.push("הרחבות המשויכות לחברות אחרות אינן כלולות בהצעת מגדל.");
  }

  for (const selectedAddon of selectedAddons) {
    const addonId = addonIds[selectedAddon];
    const addon = tariff.addOns.find((item) => item.id === addonId);
    if (!addon) continue;

    if (addon.dailyRatesByAge) {
      const addonRates = ages.map((age) =>
        addon.dailyRatesByAge?.find((rate) => ageMatches(age, rate)),
      );
      if (addonRates.some((rate) => !rate)) {
        return {
          planName: plan.name,
          durationDays,
          price: null,
          error:
            "לא פורסם במחירון תעריף להרחבה שנבחרה עבור אחד מגילי הנוסעים.",
          warnings,
          underwritingRequired: rates.some(
            (rate) => rate.underwritingRequired,
          ),
        };
      }

      const addonPremiumCents = (addonRates as AgeRate[]).reduce((sum, rate) => {
        const premium = toCents(rate.dailyPrice) * durationDays;
        return (
          sum + Math.min(premium, toCents(addon.maximumTripPrice ?? Infinity))
        );
      }, 0);
      addOnsPremiumCents += addonPremiumCents;
      totalCents += addonPremiumCents;
      priceLines.push({
        id: addon.id,
        name: addon.name,
        description: addon.coverage,
        amount: addonPremiumCents / 100,
      });
    } else if (addon.dailyPrice !== undefined) {
      const coveredCount =
        selectedAddon === "baggage"
          ? input.baggagePassengerCount || ages.length
          : ages.length;
      const premium = toCents(addon.dailyPrice) * durationDays * coveredCount;
      const maximum =
        addon.maximumTripPrice === undefined
          ? premium
          : toCents(addon.maximumTripPrice) * coveredCount;
      const addonPremiumCents = Math.min(premium, maximum);
      addOnsPremiumCents += addonPremiumCents;
      totalCents += addonPremiumCents;
      priceLines.push({
        id: addon.id,
        name: addon.name,
        description: addon.coverage,
        amount: addonPremiumCents / 100,
      });
    }
  }

  if (
    selectedAddons.some(
      (addon) =>
        addon === "ski" || addon === "extremeSports" || addon === "rentalCar",
    )
  ) {
    warnings.push(
      "המחיר חושב עבור כל ימי הנסיעה בהרחבה זו. במחירון ניתן לבחור ימים מסוימים לכיסוי.",
    );
  }

  if (selectedAddons.includes("pregnancy") && durationDays > 60) {
    return {
      planName: plan.name,
      durationDays,
      price: null,
      error: "הרחבת ההריון מוגבלת במחירון לתקופה מרבית של 60 ימים.",
      warnings,
      underwritingRequired: rates.some((rate) => rate.underwritingRequired),
    };
  }

  if (requires365DayApproval) {
    warnings.push(
      "נסיעה מעל 180 ימים ועד 365 ימים מחייבת אישור מראש לפי מחירון המקור.",
    );
  }

  return {
    planName: plan.name,
    durationDays,
    price: totalCents / 100,
    basePremium: basePremiumCents / 100,
    addOnsPremium: addOnsPremiumCents / 100,
    coveragePremium: coveragePremiumCents / 100,
    priceLines,
    error: null,
    warnings,
    underwritingRequired: rates.some((rate) => rate.underwritingRequired),
  };
}

import { calculateDirectInsuranceQuote } from "@/lib/direct-insurance-pricing";
import {
  calculateInsurerQuote,
  type InsurerId,
  type InsurerQuoteInput,
} from "@/lib/insurer-pricing";
import { calculateMigdalQuote, type MigdalQuote } from "@/lib/migdal-pricing";

export type ClubId =
  | "hever"
  | "hot"
  | "doctors"
  | "adif"
  | "teachers"
  | "mami"
  | "uniq"
  | "hitechzone"
  | "diners_cal"
  | "elal";
export type ClubInsurerId = InsurerId | "migdal";
export type ClubBenefitFlags = {
  calConfirmed?: boolean;
  clubCardConfirmed?: boolean;
  elalEligible?: boolean;
};
export type ClubBenefitMessage = {
  status: "applied" | "conditional" | "unimplemented" | "not_applicable";
  message: string;
  savings?: number;
};
export type ClubBenefits = {
  clubId: ClubId;
  savings: number;
  messages: ClubBenefitMessage[];
  gifts: ClubGift[];
};
export type ClubGift = {
  id: string;
  name: string;
  passengerIndexes: number[];
  startDate: string | null;
  endDate: string | null;
};
export type ClubQuote = MigdalQuote & { insurerId?: InsurerId };

const cents = (amount: number) => Math.round(amount * 100);
const dollars = (amount: number) => amount / 100;

function quoteFor(
  insurerId: ClubInsurerId,
  input: InsurerQuoteInput,
): ClubQuote {
  if (insurerId === "migdal") return calculateMigdalQuote(input);
  if (insurerId === "direct") return calculateDirectInsuranceQuote(input);
  return calculateInsurerQuote(insurerId, input);
}

function sameQuote(
  original: ClubQuote,
  calculated: ClubQuote,
  insurerId: ClubInsurerId,
): boolean {
  if (original.insurerId && original.insurerId !== insurerId) return false;
  if (
    original.price === null ||
    calculated.price === null ||
    original.error ||
    calculated.error
  )
    return false;
  if (
    original.durationDays !== calculated.durationDays ||
    original.planName !== calculated.planName ||
    original.price !== calculated.price
  )
    return false;
  if (
    original.basePremium !== calculated.basePremium ||
    original.addOnsPremium !== calculated.addOnsPremium ||
    original.coveragePremium !== calculated.coveragePremium
  )
    return false;
  const lines = original.priceLines;
  const expected = calculated.priceLines;
  if (!lines || !expected || lines.length !== expected.length) return false;
  if (
    !lines.every(
      (line, index) =>
        line.id === expected[index].id &&
        line.amount === expected[index].amount &&
        !!line.includedInBase === !!expected[index].includedInBase,
    )
  )
    return false;
  return (
    lines.every(
      (line) =>
        Number.isFinite(line.amount) &&
        line.amount >= 0 &&
        Math.abs(cents(line.amount) - line.amount * 100) < 1e-7,
    ) &&
    lines.reduce(
      (sum, line) => sum + (line.includedInBase ? 0 : cents(line.amount)),
      0,
    ) === cents(original.price)
  );
}

export function calculateClubBenefits<Quote extends ClubQuote>(
  insurerId: ClubInsurerId,
  original: Quote,
  input: InsurerQuoteInput,
  clubId: ClubId | null | undefined,
  flags: ClubBenefitFlags = {},
): Quote & { benefits?: ClubBenefits } {
  if (!clubId) return original;
  const messages: ClubBenefitMessage[] = [];
  const benefits: ClubBenefits = { clubId, savings: 0, messages, gifts: [] };
  const result = { ...original, benefits };
  const note = (
    status: ClubBenefitMessage["status"],
    message: string,
    savings?: number,
  ) => {
    messages.push(
      savings === undefined
        ? { status, message }
        : { status, message, savings: dollars(savings) },
    );
  };
  if (clubId === "teachers")
    note(
      "conditional",
      "Teachers additional-traveler benefit: the card holder and all eligible additional travelers must be family. The first adult is the card holder; up to two other adults and all children under 18 are eligible.",
    );
  if (
    original.price === null ||
    original.durationDays === null ||
    !original.priceLines ||
    !sameQuote(original, quoteFor(insurerId, input), insurerId)
  ) {
    note(
      "unimplemented",
      "The quote does not match the current pricing engine or has inconsistent line items; no club discounts were calculated.",
    );
    return result;
  }

  const lines = original.priceLines.map((line) => ({ ...line }));
  const base = lines.find((line) => line.id === "base");
  const duration = original.durationDays;
  let totalSavings = 0;
  const indexes = (ids: string[]) =>
    lines.flatMap((line, index) =>
      !line.includedInBase && ids.includes(line.id) ? [index] : [],
    );
  const paidIndexes = () =>
    lines.flatMap((line, index) =>
      !line.includedInBase && line.amount > 0 ? [index] : [],
    );
  const addonIndexes = () =>
    paidIndexes().filter(
      (index) => !["base", "rescue"].includes(lines[index].id),
    );
  const apply = (
    eligible: number[],
    requested: number,
    label: string,
    eligibleAmounts?: number[],
  ) => {
    const available = eligible.reduce(
      (sum, index, position) =>
        sum + (eligibleAmounts?.[position] ?? cents(lines[index].amount)),
      0,
    );
    const discount = Math.min(available, Math.max(0, Math.round(requested)));
    if (!discount || !available) return;
    const allocations = eligible.map((index, position) => {
      const numerator =
        discount * (eligibleAmounts?.[position] ?? cents(lines[index].amount));
      return {
        index,
        amount: Math.floor(numerator / available),
        remainder: numerator % available,
      };
    });
    let remaining =
      discount -
      allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
    allocations.sort(
      (first, second) =>
        second.remainder - first.remainder || first.index - second.index,
    );
    for (const allocation of allocations) {
      if (remaining > 0) {
        allocation.amount++;
        remaining--;
      }
      lines[allocation.index].amount = dollars(
        cents(lines[allocation.index].amount) - allocation.amount,
      );
    }
    totalSavings += discount;
    note("applied", label, discount);
  };
  const percent = (eligible: number[], rate: number, label: string) => {
    const amount = eligible.reduce(
      (sum, index) => sum + cents(lines[index].amount),
      0,
    );
    apply(eligible, Math.round((amount * rate) / 100), label);
  };
  const free = (ids: string[], label: string) => {
    const eligible = indexes(ids);
    apply(
      eligible,
      eligible.reduce((sum, index) => sum + cents(lines[index].amount), 0),
      label,
    );
  };
  const gift = (
    id: string,
    name: string,
    passengerIndexes = input.ages.map((_, index) => index),
    startDate: string | null = input.departure,
    endDate: string | null = input.returnDate,
  ) => {
    benefits.gifts.push({ id, name, passengerIndexes, startDate, endDate });
    lines.push({
      id: `club-gift-${id}`,
      name,
      description: "הטבת מועדון משוערת; כפופה לתנאי חברת הביטוח",
      amount: 0,
    });
  };
  const firstDaysEnd = (days: number) => {
    const date = new Date(`${input.departure}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + Math.min(duration, days) - 1);
    return date.toISOString().slice(0, 10);
  };
  const freeRescue = () => {
    if (input.removeRescue) {
      note(
        "conditional",
        "Rescue was removed from the quote; the club benefit does not add coverage.",
      );
      return false;
    }
    if (insurerId !== "harel" && insurerId !== "migdal") {
      note(
        "unimplemented",
        "The rescue benefit cannot be valued for this insurer.",
      );
      return false;
    }
    const without = quoteFor(insurerId, { ...input, removeRescue: true });
    if (
      without.price === null ||
      without.basePremium === undefined ||
      original.basePremium === undefined ||
      without.planName !== original.planName
    ) {
      note(
        "unimplemented",
        "The rescue benefit cannot be calculated from the pricing engine.",
      );
      return false;
    }
    const saving = cents(original.basePremium) - cents(without.basePremium);
    if (saving > 0)
      apply(
        indexes(["base"]),
        saving,
        "Selected rescue coverage: free premium.",
      );
    else if (insurerId === "migdal" && without.basePremium === original.basePremium)
      note("applied", "Migdal rescue is already included at no additional cost.");
    else
      note(
        "conditional",
        "Rescue has no separately calculable premium; confirm the club benefit and coverage with the insurer.",
      );
    return saving > 0;
  };
  const freeThirdParty = () => {
    if (input.removeThirdParty) {
      note(
        "conditional",
        "Third-party coverage was removed; the club benefit does not add it.",
      );
      return;
    }
    if (insurerId === "migdal") {
      const without = quoteFor(insurerId, { ...input, removeThirdParty: true });
      if (
        !without.error &&
        without.basePremium !== undefined &&
        original.basePremium !== undefined &&
        without.planName === original.planName
      ) {
        const saving = cents(original.basePremium) - cents(without.basePremium);
        if (saving > 0) {
          apply(
            indexes(["base"]),
            saving,
            "Selected third-party coverage: free premium.",
          );
          return;
        }
      }
    }
    note(
      "conditional",
      "Third-party benefit is conditional on the insurer's actual coverage; no additional coverage was added or valued.",
    );
  };
  const dayBenefits = (
    freeDays: number,
    reducedDays: number,
    label: string,
    removeRescue = false,
    includeBaggage = true,
  ) => {
    if (!base || (reducedDays > 0 && insurerId !== "harel")) {
      note(
        "unimplemented",
        `${label}: exact daily pricing is not implemented for this insurer.`,
      );
      return false;
    }
    const prefixBase = (days: number) => {
      if (days === 0) return 0;
      if (insurerId !== "harel") {
        const total = cents(base.amount);
        return Math.round((total * days) / duration);
      }
      const date = new Date(`${input.departure}T00:00:00Z`);
      date.setUTCDate(date.getUTCDate() + days - 1);
      const quote = quoteFor("harel", {
        ...input,
        removeRescue: removeRescue || input.removeRescue,
        returnDate: date.toISOString().slice(0, 10),
        selectedAddons: [],
      });
      return quote.error || quote.basePremium === undefined
        ? null
        : cents(quote.basePremium);
    };
    const first = Math.min(duration, freeDays);
    const through = Math.min(duration, freeDays + reducedDays);
    const freeBase = prefixBase(first);
    const throughBase = prefixBase(through);
    if (freeBase === null || throughBase === null) {
      note(
        "unimplemented",
        `${label}: the day-level base price could not be calculated.`,
      );
      return false;
    }
    apply(
      indexes(["base"]),
      freeBase,
      `${label}: base days 1-${first} free for all passengers.`,
    );
    if (through > first)
      apply(
        indexes(["base"]),
        Math.round((throughBase - freeBase) * 0.1),
        `${label}: 10% off base days ${first + 1}-${through}.`,
      );
    const baggage = lines.find(
      (line) => line.id === "baggage" && !line.includedInBase,
    );
    if (baggage && includeBaggage) {
      const full = cents(baggage.amount);
      apply(
        indexes(["baggage"]),
        Math.round((full * first) / duration),
        `${label}: selected baggage days 1-${first} free.`,
      );
      if (through > first)
        apply(
          indexes(["baggage"]),
          Math.round((full * (through - first) * 0.1) / duration),
          `${label}: 10% off selected baggage days ${first + 1}-${through}.`,
        );
    }
    return true;
  };

  switch (clubId) {
    case "hever":
      gift("operational-cancellation", "ביטול עקב פעילות מבצעית במתנה", undefined, null, null);
      free(["operationalCancellation"], "Selected operational cancellation premium is free.");
      note("unimplemented", "Cancellation gift coverage dates and expiry require confirmation with the insurer.");
      if (insurerId === "phoenix") {
        free(["baggage"], "Selected baggage premium is free.");
        if (indexes(["cancellation"]).some((index) => lines[index].amount > 0))
          note("unimplemented", "The medical-only gift cannot be separated from the selected broader cancellation premium; that premium remains payable.");
        gift("baggage", "כיסוי כבודה במתנה לכל הנוסעים");
        gift("medical-cancellation", "ביטול וקיצור נסיעה מסיבות רפואיות במתנה", undefined, null, null);
      }
      percent(addonIndexes(), 15, "15% off remaining paid add-ons.");
      break;
    case "hot":
      if (insurerId === "clal")
        percent(paidIndexes(), 25, "25% off the total.");
      else if (insurerId === "menora")
        percent(paidIndexes(), 22, "22% off the total.");
      else if (insurerId === "harel") {
        freeRescue();
        percent(
          paidIndexes(),
          15,
          "15% off the total after the rescue benefit.",
        );
        percent(
          indexes(["extremeSports"]),
          50,
          "50% off the remaining extreme sports premium.",
        );
      } else if (insurerId === "phoenix") {
        free(["baggage"], "Selected baggage premium is free.");
        gift("baggage", "כיסוי כבודה במתנה לכל הנוסעים");
      } else if (insurerId === "migdal") {
        free(["baggage"], "Selected baggage premium is free.");
        gift("baggage", "כיסוי כבודה במתנה לכל הנוסעים");
        freeRescue();
        if (duration > 14)
          percent(
            indexes(["base"]),
            19,
            "19% off the remaining base premium for trips over 14 days.",
          );
      } else
        note("not_applicable", "No HOT benefit is specified for this insurer.");
      break;
    case "doctors":
      if (insurerId === "harel") freeRescue();
      if (insurerId === "harel" || insurerId === "clal")
        percent(
          paidIndexes(),
          20,
          "20% off the total after any rescue benefit.",
        );
      else
        note(
          "not_applicable",
          "No doctors club benefit is specified for this insurer.",
        );
      break;
    case "adif":
      if (insurerId === "migdal")
        percent(
          paidIndexes().filter(
            (index) => lines[index].id !== "trip-cancellation-shortening",
          ),
          20,
          "20% off the total excluding cancellation.",
        );
      else
        note(
          "not_applicable",
          "No Adif benefit is specified for this insurer.",
        );
      break;
    case "teachers": {
      freeThirdParty();
      gift("baggage", "כיסוי כבודה במתנה", undefined, input.departure, firstDaysEnd(8));
      if (duration > 8)
        note("conditional", "Baggage after the free days is included only for passengers who selected it; other passengers have no quoted baggage after day 8.");
      const daysCalculated = dayBenefits(8, 0, "Teachers");
      if (daysCalculated && duration > 8)
        percent(
          indexes(["base", "baggage"]),
          15,
          "15% off remaining base and selected baggage from day 9.",
        );
      let otherAddonsUnimplemented = false;
      if (duration > 8) {
        const supported: Record<ClubInsurerId, string[]> = {
          harel: ["phone", "laptop", "cancellation", "medical", "pregnancy", "extremeSports", "ski", "competitiveSports", "rentalCar", "valuableItem", "personalAccident", "extremeSportsAccident", "cancellation10k", "bicycle2500", "bicycle4500", "bicycle6000"],
          menora: ["phone", "laptop", "cancellation", "medical", "pregnancy", "extremeSports", "ski", "rentalCar"],
          clal: ["rescue", "devices", "cancellation", "medical", "pregnancy", "extremeSports", "ski", "competitiveSports", "competitiveSports2", "rentalCar"],
          phoenix: ["phone", "laptop", "cancellation", "medical", "pregnancy", "extremeSports", "ski", "competitiveSports", "rentalCar", "camera", "experienceTicket", "israelMedical", "rentalCarJeep"],
          passportcard: ["phone", "laptop", "camera", "cancellation", "medical", "pregnancy", "extremeSports", "ski", "rentalCar", "valuableItem", "phone1600", "laptop1500", "laptop2000", "personalAccident", "operationalCancellation"],
          direct: ["rescue", "tripShortening", "cancellation", "extremeSports", "ski", "rentalCar", "competitiveSports", "pregnancy", "phone", "laptop", "medical", "basicUpgrade", "specialPreexistingCondition"],
          migdal: ["phone-gps", "tablet-laptop", "pregnancy", "extreme-sports", "winter-sports", "competitive-sports", "trip-cancellation-shortening", "rental-car-deductible", "preexisting-condition"],
        };
        for (const index of paidIndexes().filter(
          (index) => !["base", "baggage"].includes(lines[index].id),
        )) {
          const id = lines[index].id;
          if (
            !supported[insurerId].includes(id) ||
            lines.filter((line) => line.id === id && !line.includedInBase)
              .length !== 1
          ) {
            otherAddonsUnimplemented = true;
            note(
              "unimplemented",
              `Teachers day-nine discount for ${id} is not calculated: capped or ambiguous premium allocation needs clarification.`,
            );
            continue;
          }
          let coverageDays = duration;
          let eligibleDays = duration - 8;
          if (
            ["extremeSports", "extreme-sports"].includes(id) &&
            insurerId !== "passportcard"
          ) {
            const start = Date.parse(
              `${input.extremeSportsStart || input.departure}T00:00:00Z`,
            );
            const end = Date.parse(
              `${input.extremeSportsEnd || input.returnDate}T00:00:00Z`,
            );
            const departure = Date.parse(`${input.departure}T00:00:00Z`);
            const returnDate = Date.parse(`${input.returnDate}T00:00:00Z`);
            if (
              !Number.isFinite(start) ||
              !Number.isFinite(end) ||
              start < departure ||
              end > returnDate ||
              end < start
            ) {
              otherAddonsUnimplemented = true;
              note(
                "unimplemented",
                `Teachers day-nine discount for ${id} is not calculated: its coverage dates are invalid.`,
              );
              continue;
            }
            const dayNine = departure + 8 * 86_400_000;
            coverageDays = (end - start) / 86_400_000 + 1;
            eligibleDays = Math.max(
              0,
              (end - Math.max(start, dayNine)) / 86_400_000 + 1,
            );
          }
          const amount = cents(lines[index].amount);
          const fixedPremium =
            (["competitiveSports", "experienceTicket"].includes(id) &&
              insurerId === "phoenix") ||
            (insurerId === "direct" && id === "pregnancy");
          const cappedPremium =
            (insurerId === "harel" && ["competitiveSports", "rentalCar"].includes(id)) ||
            (insurerId === "phoenix" && id === "cancellation") ||
            (insurerId === "passportcard" && ["phone", "cancellation"].includes(id)) ||
            (insurerId === "migdal" && ["competitive-sports", "trip-cancellation-shortening"].includes(id));
          if (
            !Number.isInteger(coverageDays) ||
            coverageDays <= 0 ||
            !Number.isInteger(eligibleDays) ||
            eligibleDays > coverageDays ||
            (!fixedPremium && !cappedPremium && amount % coverageDays !== 0)
          ) {
            otherAddonsUnimplemented = true;
            note(
              "unimplemented",
              `Teachers day-nine discount for ${id} is not calculated: its daily premium cannot be established exactly.`,
            );
            continue;
          }
          apply(
            [index],
            Math.round((amount * eligibleDays * 0.15) / coverageDays),
            `15% off ${id} for covered days from day 9.`,
          );
        }
      }
      const holder = input.ages.findIndex((age) => age >= 18);
      if (holder < 0) {
        note(
          "unimplemented",
          "The additional-traveler 15% benefit cannot be calculated without an adult card holder.",
        );
      } else {
        let additionalAdults = 0;
        const eligiblePassengers = input.ages.map((age, index) => {
          if (index === holder) return false;
          if (age < 18) return true;
          additionalAdults++;
          return additionalAdults <= 2;
        });
        if (eligiblePassengers.some(Boolean)) {
          const passengerQuotes = input.ages.map((age, index) => {
            const selections = Object.fromEntries(
              (["baggage", "phone", "laptop"] as const).map((addon) => {
                const selected = input.passengerSelections?.[addon];
                const covered = selected
                  ? selected.includes(index)
                  : addon === "baggage" && input.baggagePassengerCount
                    ? index < input.baggagePassengerCount
                    : true;
                return [addon, covered ? [0] : []];
              }),
            );
            const passengerInput = {
              ...input,
              ages: [age],
              planSelectionAges: input.planSelectionAges ?? input.ages,
              passengerSelections: selections,
              baggagePassengerCount: 0,
            };
            const originalPassenger = quoteFor(insurerId, passengerInput);
            const remainingPassenger = calculateClubBenefits(
              insurerId,
              originalPassenger,
              passengerInput,
              "teachers",
            );
            return { originalPassenger, remainingPassenger };
          });
          const paid = lines.flatMap((line, index) =>
            !line.includedInBase && !line.id.startsWith("club-gift-") ? [index] : [],
          );
          const passengerLine = (quote: ClubQuote, id: string) =>
            quote.priceLines
              ?.filter((line) => line.id === id && !line.includedInBase)
              .reduce((sum, line) => sum + cents(line.amount), 0) ?? 0;
          const reconstructable =
            daysCalculated &&
            !otherAddonsUnimplemented &&
            passengerQuotes.every(
              ({ originalPassenger }) =>
                !originalPassenger.error &&
                originalPassenger.price !== null &&
                originalPassenger.planName === original.planName,
            ) &&
            paid.every((index) => {
              const id = lines[index].id;
              return (
                passengerQuotes.reduce(
                  (sum, passenger) =>
                    sum + passengerLine(passenger.originalPassenger, id),
                  0,
                ) === cents(original.priceLines?.[index].amount ?? 0) &&
                passengerQuotes.reduce(
                  (sum, passenger) =>
                    sum + passengerLine(passenger.remainingPassenger, id),
                  0,
                ) === cents(lines[index].amount)
              );
            });
          if (reconstructable) {
            const eligibleAmounts = paid.map((index) =>
              passengerQuotes.reduce(
                (sum, passenger, passengerIndex) =>
                  sum +
                  (eligiblePassengers[passengerIndex]
                    ? passengerLine(passenger.remainingPassenger, lines[index].id)
                    : 0),
                0,
              ),
            );
            const eligibleTotal = eligibleAmounts.reduce(
              (sum, amount) => sum + amount,
              0,
            );
            apply(
              paid,
              Math.round(eligibleTotal * 0.15),
              "15% off eligible additional travelers' remaining insurance premiums.",
              eligibleAmounts,
            );
          } else
            note(
              "unimplemented",
              "The additional-traveler 15% benefit is not calculated because passenger-level remaining premiums cannot be reconstructed exactly.",
            );
        }
      }
      if (flags.clubCardConfirmed)
        percent(
          paidIndexes(),
          5,
          "Extra 5% off the remaining quote with a confirmed club card.",
        );
      else
        note(
          "conditional",
          "An extra 5% off the remaining quote requires a confirmed club card.",
        );
      break;
    }
    case "mami": {
      const singleQuotes = input.ages.map((age) =>
        quoteFor(insurerId, {
          ...input,
          ages: [age],
          planSelectionAges: input.planSelectionAges ?? input.ages,
          selectedAddons: [],
          passengerSelections: undefined,
          baggagePassengerCount: 0,
        }),
      );
      if (
        singleQuotes.some(
          (quote) =>
            quote.error ||
            quote.basePremium === undefined ||
            quote.planName !== original.planName,
        ) ||
        singleQuotes.reduce(
          (sum, quote) => sum + cents(quote.basePremium ?? 0),
          0,
        ) !== cents(original.basePremium ?? 0)
      ) {
        note(
          "unimplemented",
          "Adult base premiums cannot be recomputed exactly for this quote.",
        );
      } else {
        const adultBase = singleQuotes.reduce(
          (sum, quote, index) =>
            sum + (input.ages[index] >= 18 ? cents(quote.basePremium ?? 0) : 0),
          0,
        );
        apply(
          indexes(["base"]),
          Math.round(adultBase * 0.15),
          "15% off the base premium for passengers aged 18 or older.",
        );
      }
      break;
    }
    case "uniq":
      if (insurerId !== "migdal")
        note(
          "not_applicable",
          "No uniq benefit is specified for this insurer.",
        );
      else if (
        !input.selectedAddons.includes("baggage") ||
        !lines.some((line) => line.id === "baggage" && line.amount > 0)
      )
        note(
          "conditional",
          "Purchase of baggage is required for the uniq bonus; no bonus coverage was added.",
        );
      else {
        const baggageIndexes =
          input.passengerSelections?.baggage ??
          (input.baggagePassengerCount
            ? input.ages
                .map((_, index) => index)
                .slice(0, input.baggagePassengerCount)
            : input.ages.map((_, index) => index));
        const eligibleBaggageIndexes = input.ages.flatMap((_, index) =>
          baggageIndexes.includes(index) ? [index] : [],
        );
        for (const [id, name] of [
          ["phone", "כיסוי טלפון במתנה"],
          ["laptop", "כיסוי מחשב נייד במתנה"],
          ["extreme-sports", "כיסוי ספורט אתגרי במתנה"],
        ] as const)
          gift(id, name, eligibleBaggageIndexes);
        for (const [selection, lineId] of [
          ["phone", "phone-gps"],
          ["laptop", "tablet-laptop"],
        ] as const) {
          if (!input.selectedAddons.includes(selection)) continue;
          const selected =
            input.passengerSelections?.[selection] ??
            input.ages.map((_, index) => index);
          const eligible = selected.filter((index) =>
            baggageIndexes.includes(index),
          );
          const partial = quoteFor("migdal", {
            ...input,
            passengerSelections: {
              ...input.passengerSelections,
              [selection]: eligible,
            },
          });
          const eligibleLines = partial.priceLines?.filter(
            (line) => line.id === lineId,
          );
          if (partial.error || !eligibleLines?.length)
            note(
              "unimplemented",
              `The eligible ${selection} premium could not be calculated.`,
            );
          else
            apply(
              indexes([lineId]),
              eligibleLines.reduce((sum, line) => sum + cents(line.amount), 0),
              `Selected ${selection} premium for baggage purchasers is free, subject to verification.`,
            );
        }
        if (input.selectedAddons.includes("extremeSports")) {
          const passengerQuotes = input.ages.map((age) => quoteFor("migdal", {
            ...input,
            ages: [age],
            selectedAddons: ["extremeSports"],
            passengerSelections: undefined,
            baggagePassengerCount: 0,
          }));
          const premiums = passengerQuotes.map((quote) =>
            quote.priceLines?.filter((line) => line.id === "extreme-sports")
              .reduce((sum, line) => sum + cents(line.amount), 0) ?? 0,
          );
          const sportsIndexes = indexes(["extreme-sports"]);
          if (passengerQuotes.some((quote) => quote.error || quote.price === null) ||
              premiums.reduce((sum, amount) => sum + amount, 0) !==
                sportsIndexes.reduce((sum, index) => sum + cents(lines[index].amount), 0))
            note("unimplemented", "The eligible extreme sports premium could not be calculated exactly.");
          else
            apply(sportsIndexes, premiums.reduce((sum, amount, index) =>
              sum + (eligibleBaggageIndexes.includes(index) ? amount : 0), 0),
              "Selected extreme sports premium is free for baggage purchasers, subject to verification.");
        }
      }
      break;
    case "hitechzone": {
      if (insurerId !== "harel") {
        note(
          "not_applicable",
          "No Hitechzone benefit is specified for this insurer.",
        );
        break;
      }
      const rescueDiscounted = freeRescue();
      if (flags.calConfirmed) {
        dayBenefits(5, 0, "Hitechzone", rescueDiscounted, false);
      } else
        note(
          "conditional",
          "Five free base days require confirmation of the cal card.",
        );
      freeThirdParty();
      percent(
        indexes(["extremeSports"]),
        50,
        "50% off selected extreme sports.",
      );
      break;
    }
    case "diners_cal":
      if (insurerId === "harel") {
        gift("baggage", "כיסוי כבודה במתנה", undefined, input.departure, firstDaysEnd(5));
        if (duration > 5)
          note("conditional", "Baggage after the free days is included only for passengers who selected it; other passengers have no quoted baggage after day 5.");
        dayBenefits(5, 5, "Diners/cal");
      } else
        note(
          "not_applicable",
          "No Diners/cal benefit is specified for this insurer.",
        );
      break;
    case "elal":
      if (insurerId !== "phoenix")
        note(
          "not_applicable",
          "No El Al benefit is specified for this insurer.",
        );
      else if (flags.elalEligible === true)
        apply(
          paidIndexes(),
          1000,
          "$10 El Al discount, capped at the quote price.",
        );
      else if (flags.elalEligible === false)
        note("not_applicable", "El Al eligibility was not met.");
      else
        note(
          "conditional",
          "The $10 El Al discount requires eligibility confirmation.",
        );
      break;
    default:
      note("unimplemented", "Unknown club; no discount was calculated.");
  }

  benefits.savings = dollars(totalSavings);
  result.priceLines = lines;
  result.price = dollars(cents(original.price) - totalSavings);
  result.basePremium = dollars(
    lines
      .filter((line) => line.id === "base" && !line.includedInBase)
      .reduce((sum, line) => sum + cents(line.amount), 0),
  );
  result.coveragePremium = dollars(
    lines
      .filter((line) => line.id === "rescue" && !line.includedInBase)
      .reduce((sum, line) => sum + cents(line.amount), 0),
  );
  result.addOnsPremium = dollars(
    lines
      .filter(
        (line) => !line.includedInBase && !["base", "rescue"].includes(line.id),
      )
      .reduce((sum, line) => sum + cents(line.amount), 0),
  );
  return result;
}

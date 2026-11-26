const assert = require("node:assert/strict");
const Module = require("node:module");
const path = require("node:path");
const test = require("node:test");
const typescript = require("typescript");

const root = path.resolve(__dirname, "..");
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return resolve.call(
    this,
    request.startsWith("@/")
      ? path.join(root, "src", request.slice(2))
      : request,
    ...args,
  );
};
require.extensions[".ts"] = (module, filename) => {
  const source = require("node:fs").readFileSync(filename, "utf8");
  module._compile(
    typescript.transpileModule(source, {
      compilerOptions: {
        target: typescript.ScriptTarget.ES2017,
        module: typescript.ModuleKind.CommonJS,
        esModuleInterop: true,
        resolveJsonModule: true,
      },
    }).outputText,
    filename,
  );
};

const { calculateClubBenefits } = require("../src/lib/club-benefits.ts");
const { calculateInsurerQuote } = require("../src/lib/insurer-pricing.ts");
const { calculateMigdalQuote } = require("../src/lib/migdal-pricing.ts");
const {
  calculateDirectInsuranceQuote,
} = require("../src/lib/direct-insurance-pricing.ts");

const input = (overrides = {}) => ({
  destination: "יוון",
  departure: "2026-01-01",
  returnDate: "2026-01-10",
  ages: [17, 18, 55],
  selectedAddons: ["baggage", "extremeSports"],
  baggagePassengerCount: 2,
  passengerSelections: { baggage: [0, 2] },
  ...overrides,
});
const quote = (insurer, value) =>
  insurer === "migdal"
    ? calculateMigdalQuote(value)
    : insurer === "direct"
      ? calculateDirectInsuranceQuote(value)
      : calculateInsurerQuote(insurer, value);
const line = (result, id) =>
  result.priceLines.find((item) => item.id === id).amount;
const consistent = (result) => {
  const sum = result.priceLines.reduce(
    (total, item) =>
      total + (item.includedInBase ? 0 : Math.round(item.amount * 100)),
    0,
  );
  assert.equal(sum, Math.round(result.price * 100));
  assert.equal(
    sum,
    Math.round(
      (result.basePremium + result.addOnsPremium + result.coveragePremium) *
        100,
    ),
  );
  assert.ok(result.priceLines.every((item) => item.amount >= 0));
};

test("no club leaves the exact original object untouched", () => {
  const data = input();
  const original = quote("harel", data);
  assert.strictEqual(
    calculateClubBenefits("harel", original, data, null),
    original,
  );
});

test("teachers and Diners gifts cover all passengers only during free days", () => {
  const data = input({ ages: [30, 40, 10], selectedAddons: [], baggagePassengerCount: 0 });
  for (const [club, endDate] of [["teachers", "2026-01-08"], ["diners_cal", "2026-01-05"]]) {
    const result = calculateClubBenefits("harel", quote("harel", data), data, club);
    const gift = result.benefits.gifts.find((item) => item.id === "baggage");
    assert.deepEqual(gift.passengerIndexes, [0, 1, 2]);
    assert.equal(gift.startDate, "2026-01-01");
    assert.equal(gift.endDate, endDate);
    consistent(result);
  }
});

test("uniq gifts are assigned only to baggage purchasers", () => {
  const data = input({ ages: [30, 40], selectedAddons: ["baggage"], baggagePassengerCount: 1, passengerSelections: { baggage: [1] } });
  const result = calculateClubBenefits("migdal", quote("migdal", data), data, "uniq");
  assert.deepEqual(result.benefits.gifts.map((item) => item.id), ["phone", "laptop", "extreme-sports"]);
  for (const gift of result.benefits.gifts) assert.deepEqual(gift.passengerIndexes, [1]);
  consistent(result);
});

test("HOT gifts baggage to every passenger without adding a premium", () => {
  const data = input({ selectedAddons: [], baggagePassengerCount: 0, passengerSelections: {} });
  for (const insurer of ["phoenix", "migdal"]) {
    const original = quote(insurer, data);
    const result = calculateClubBenefits(insurer, original, data, "hot");
    assert.deepEqual(result.benefits.gifts.find((item) => item.id === "baggage"), {
      id: "baggage",
      name: "כיסוי כבודה במתנה לכל הנוסעים",
      passengerIndexes: [0, 1, 2],
      startDate: data.departure,
      endDate: data.returnDate,
    });
    assert.equal(result.priceLines.find((item) => item.id === "club-gift-baggage").amount, 0);
    consistent(result);
  }
});

test("Diners/cal applies all passengers and selected baggage by day", () => {
  const data = input();
  const original = quote("harel", data);
  const before = structuredClone(original);
  const result = calculateClubBenefits("harel", original, data, "diners_cal");
  assert.equal(result.price, 52.26);
  assert.equal(line(result, "base"), 33.75);
  assert.equal(line(result, "baggage"), 3.51);
  assert.deepEqual(original, before);
  consistent(result);
});

test("Hitechzone does not double-discount rescue in the free base days", () => {
  const data = input();
  const result = calculateClubBenefits(
    "harel",
    quote("harel", data),
    data,
    "hitechzone",
    { calConfirmed: true },
  );
  assert.equal(result.price, 49.8);
  assert.equal(line(result, "base"), 34.5);
  assert.equal(line(result, "baggage"), 7.8);
  assert.equal(line(result, "extremeSports"), 7.5);
  consistent(result);
});

test("teachers get first eight days and Migdal third party without overlap", () => {
  const data = input({
    ages: [30, 10],
    returnDate: "2026-01-15",
    selectedAddons: ["baggage"],
    baggagePassengerCount: 1,
    passengerSelections: { baggage: [0] },
  });
  const result = calculateClubBenefits(
    "migdal",
    quote("migdal", data),
    data,
    "teachers",
  );
  assert.equal(result.price, 25.7);
  assert.equal(result.benefits.savings, 49.6);
  assert.ok(
    result.benefits.messages.some(
      (item) => item.status === "applied" && item.message.includes("additional travelers"),
    ),
  );
  consistent(result);
});

test("teachers first eight days use full-trip base rates across insurers", () => {
  const data = input({
    ages: [30],
    selectedAddons: [],
    returnDate: "2026-02-05",
    baggagePassengerCount: 0,
  });
  for (const insurer of [
    "harel",
    "menora",
    "clal",
    "phoenix",
    "passportcard",
    "direct",
    "migdal",
  ]) {
    const original = quote(insurer, data);
    assert.equal(original.error, null, insurer);
    const result = calculateClubBenefits(insurer, original, data, "teachers");
    assert.ok(result.price < original.price, insurer);
    consistent(result);
  }
});

test("MAMI discounts only adults including age 18", () => {
  const data = input({ selectedAddons: [] });
  const result = calculateClubBenefits(
    "harel",
    quote("harel", data),
    data,
    "mami",
  );
  assert.equal(result.benefits.savings, 7.5);
  assert.equal(result.price, 67.5);
  consistent(result);
});

test("uniq discounts only selected bonuses for baggage purchasers", () => {
  const data = input({
    ages: [30, 17],
    returnDate: "2026-01-07",
    selectedAddons: ["baggage", "phone", "laptop", "extremeSports"],
    baggagePassengerCount: 1,
    passengerSelections: { baggage: [0], phone: [0, 1], laptop: [1] },
  });
  const original = quote("migdal", data);
  const result = calculateClubBenefits("migdal", original, data, "uniq");
  assert.equal(result.benefits.savings, 17.5);
  assert.equal(line(result, "phone-gps"), 13.3);
  assert.equal(line(result, "tablet-laptop"), line(original, "tablet-laptop"));
  assert.equal(
    line(result, "extreme-sports"),
    line(original, "extreme-sports") / 2,
  );
  assert.ok(
    result.benefits.gifts.every((item) => item.passengerIndexes.join(",") === "0"),
  );
  consistent(result);
});

test("El Al requires eligibility and never makes the price negative", () => {
  const data = input({
    ages: [20],
    returnDate: "2026-01-01",
    selectedAddons: [],
  });
  const original = quote("phoenix", data);
  assert.equal(
    calculateClubBenefits("phoenix", original, data, "elal").price,
    original.price,
  );
  const result = calculateClubBenefits("phoenix", original, data, "elal", {
    elalEligible: true,
  });
  assert.equal(result.price, 0);
  assert.equal(result.benefits.savings, original.price);
  consistent(result);
});

test("rejects stale quotes and leaves their prices untouched", () => {
  const data = input();
  const original = quote("harel", data);
  const result = calculateClubBenefits(
    "harel",
    original,
    { ...data, ages: [17] },
    "hot",
  );
  assert.equal(result.price, original.price);
  assert.equal(result.benefits.messages[0].status, "unimplemented");
});

test("HOT Harel discounts extreme sports sequentially after the total", () => {
  const data = input();
  const result = calculateClubBenefits(
    "harel",
    quote("harel", data),
    data,
    "hot",
  );
  assert.equal(result.price, 71.65);
  assert.equal(line(result, "extremeSports"), 6.37);
  consistent(result);
});

test("Hever Phoenix preserves broader cancellation and discounts paid add-ons", () => {
  const data = input({
    ages: [20],
    selectedAddons: ["baggage", "cancellation", "phone"],
    passengerSelections: undefined,
    baggagePassengerCount: 1,
  });
  const result = calculateClubBenefits(
    "phoenix",
    quote("phoenix", data),
    data,
    "hever",
  );
  assert.equal(result.price, 36.45);
  assert.equal(line(result, "baggage"), 0);
  assert.equal(line(result, "cancellation"), 5.95);
  assert.equal(line(result, "phone"), 8.5);
  assert.ok(
    result.benefits.messages.some(
      (item) =>
        item.status === "unimplemented" && item.message.includes("medical-only"),
    ),
  );
  consistent(result);
});

test("HOT Migdal base discount starts after 14 days", () => {
  for (const days of [14, 15]) {
    const data = input({
      ages: [30],
      returnDate: `2026-01-${days}`,
      selectedAddons: ["baggage"],
      baggagePassengerCount: 1,
      passengerSelections: undefined,
    });
    const original = quote("migdal", data);
    const result = calculateClubBenefits("migdal", original, data, "hot");
    assert.equal(line(result, "baggage"), 0);
    const baseDiscount = result.benefits.messages.find((item) =>
      item.message.startsWith("19%"),
    );
    assert.equal(!!baseDiscount, days === 15);
    consistent(result);
  }
});

test("Adif excludes Migdal cancellation while discounting other charges", () => {
  const data = input({
    ages: [30],
    selectedAddons: ["cancellation", "baggage"],
    baggagePassengerCount: 1,
    passengerSelections: undefined,
  });
  const original = quote("migdal", data);
  const result = calculateClubBenefits("migdal", original, data, "adif");
  assert.equal(
    line(result, "trip-cancellation-shortening"),
    line(original, "trip-cancellation-shortening"),
  );
  const eligible = Math.round(
    (original.price - line(original, "trip-cancellation-shortening")) * 100,
  );
  assert.equal(
    Math.round(result.benefits.savings * 100),
    Math.round(eligible * 0.2),
  );
  consistent(result);
});

test("doctor club and HOT total discounts use actual paid lines", () => {
  const data = input({
    ages: [30],
    selectedAddons: ["baggage"],
    baggagePassengerCount: 1,
    passengerSelections: undefined,
  });
  for (const [insurer, club, rate] of [
    ["clal", "doctors", 20],
    ["clal", "hot", 25],
    ["menora", "hot", 22],
  ]) {
    const original = quote(insurer, data);
    const result = calculateClubBenefits(insurer, original, data, club);
    assert.equal(
      Math.round(result.benefits.savings * 100),
      Math.round((Math.round(original.price * 100) * rate) / 100),
    );
    consistent(result);
  }
});

test("teachers card discount is sequential after daily add-on discounts", () => {
  const data = input();
  const original = quote("harel", data);
  const without = calculateClubBenefits("harel", original, data, "teachers");
  const withCard = calculateClubBenefits("harel", original, data, "teachers", {
    clubCardConfirmed: true,
  });
  assert.equal(
    Math.round((without.price - withCard.price) * 100),
    Math.round(Math.round(without.price * 100) * 0.05),
  );
  assert.equal(line(without, "extremeSports"), 14.55);
  assert.ok(withCard.benefits.messages.some((item) => item.message.includes("extremeSports for covered days")));
  consistent(withCard);
});

test("teachers prorate the actual $100 fixed premium over the trip", () => {
  const data = input({ ages: [30, 30, 30, 30], selectedAddons: ["competitiveSports"], baggagePassengerCount: 0, passengerSelections: undefined });
  const original = quote("phoenix", data);
  const result = calculateClubBenefits("phoenix", original, data, "teachers");
  assert.equal(line(original, "competitiveSports"), 100);
  assert.equal(result.benefits.messages.find((item) => item.message.includes("competitiveSports for covered days")).savings, 3);
  consistent(result);
});

test("teachers discount only the overlapping extreme sports days", () => {
  for (const [start, end, expected] of [
    ["2026-01-01", "2026-01-08", 0],
    ["2026-01-07", "2026-01-10", 0.15],
    ["2026-01-09", "2026-01-10", 0.15],
  ]) {
    const data = input({ ages: [30], selectedAddons: ["extremeSports"], extremeSportsStart: start, extremeSportsEnd: end, baggagePassengerCount: 0 });
    const original = quote("harel", data);
    const result = calculateClubBenefits("harel", original, data, "teachers");
    assert.equal(Math.round((line(original, "extremeSports") - line(result, "extremeSports")) * 100), Math.round(expected * 100));
    consistent(result);
  }
});

test("teachers apply day-nine and family discounts to selected passengers sequentially", () => {
  const data = input({ ages: [30, 18, 40, 50], selectedAddons: ["phone"], passengerSelections: { phone: [0, 2, 3] }, baggagePassengerCount: 0 });
  const original = quote("harel", data);
  const result = calculateClubBenefits("harel", original, data, "teachers");
  assert.equal(line(original, "phone"), 48);
  assert.equal(result.benefits.messages.find((item) => item.message.includes("phone for covered days")).savings, 1.44);
  assert.equal(line(result, "phone"), 44.23);
  assert.ok(result.benefits.messages.some((item) => item.message.startsWith("15% off eligible additional")));
  consistent(result);
});

test("teachers prorate Direct's fixed fee and daily pregnancy premium together", () => {
  const data = input({ ages: [30], selectedAddons: ["pregnancy"], baggagePassengerCount: 0 });
  const original = quote("direct", data);
  const result = calculateClubBenefits("direct", original, data, "teachers");
  assert.equal(line(original, "pregnancy"), 40);
  assert.equal(line(result, "pregnancy"), 38.8);
  consistent(result);
});

test("teachers prorate capped add-ons evenly over the trip", () => {
  for (const [insurer, selection, id] of [
    ["harel", "competitiveSports", "competitiveSports"],
    ["phoenix", "cancellation", "cancellation"],
    ["passportcard", "phone", "phone"],
    ["migdal", "cancellation", "trip-cancellation-shortening"],
  ]) {
    const data = input({ ages: [30], returnDate: "2026-02-01", selectedAddons: [selection], passengerSelections: undefined, baggagePassengerCount: 0 });
    const original = quote(insurer, data);
    const result = calculateClubBenefits(insurer, original, data, "teachers");
    const discount = Math.round(line(original, id) * 100 * 24 / 32 * 0.15);
    assert.equal(Math.round(line(result, id) * 100), Math.round(line(original, id) * 100) - discount, insurer);
    assert.ok(result.benefits.messages.some((item) => item.status === "applied" && item.message.includes(id)), insurer);
    consistent(result);
  }
});

test("teachers apply day-nine and family discounts below the cap", () => {
  const data = input({ ages: [30, 18], selectedAddons: ["cancellation"], baggagePassengerCount: 0 });
  const original = quote("phoenix", data);
  const result = calculateClubBenefits("phoenix", original, data, "teachers");
  assert.equal(line(original, "cancellation"), 14);
  assert.equal(line(result, "cancellation"), 12.56);
  assert.ok(result.benefits.messages.some((item) => item.status === "applied" && item.message.includes("cancellation")));
  assert.ok(result.benefits.messages.some((item) => item.status === "applied" && item.message.includes("additional travelers")));
  consistent(result);
});

test("teachers discount separately charged rescue from day nine", () => {
  const data = input({ ages: [30], selectedAddons: [], baggagePassengerCount: 0 });
  const original = quote("clal", data);
  const result = calculateClubBenefits("clal", original, data, "teachers");
  assert.equal(line(original, "rescue"), 2);
  assert.equal(line(result, "rescue"), 1.94);
  consistent(result);
});

test("teachers one-day additional benefit includes selected premiums for eligible family only", () => {
  const data = input({
    ages: [10, 30, 18, 40, 50, 5],
    returnDate: "2026-01-01",
    selectedAddons: ["baggage", "phone"],
    passengerSelections: { baggage: [0, 2, 4], phone: [0, 2, 4, 5] },
  });
  const original = quote("harel", data);
  const result = calculateClubBenefits("harel", original, data, "teachers");
  assert.equal(line(result, "base"), 0);
  assert.equal(line(result, "baggage"), 0);
  assert.equal(line(result, "phone"), 5.68);
  assert.equal(result.price, 5.68);
  assert.equal(
    result.benefits.messages.find((item) => item.message.startsWith("15% off eligible additional")).savings,
    0.72,
  );
  assert.ok(result.benefits.messages.some((item) => item.message.includes("must be family")));
  consistent(result);
});

test("teachers day-nine, additional family and card discounts are sequential", () => {
  const data = input({
    ages: [10, 30, 18, 40, 50, 5],
    selectedAddons: [],
    passengerSelections: undefined,
    baggagePassengerCount: 0,
  });
  const original = quote("harel", data);
  const withoutCard = calculateClubBenefits("harel", original, data, "teachers");
  const withCard = calculateClubBenefits("harel", original, data, "teachers", {
    clubCardConfirmed: true,
  });
  assert.equal(withoutCard.price, 22.95);
  assert.equal(withCard.price, 21.8);
  assert.equal(
    withoutCard.benefits.messages.find((item) => item.message.startsWith("15% off eligible additional")).savings,
    2.55,
  );
  assert.equal(
    Math.round(original.price * 100) - Math.round(withoutCard.benefits.savings * 100),
    Math.round(withoutCard.price * 100),
  );
  consistent(withoutCard);
  consistent(withCard);
});

test("teachers nine-day benefit uses each eligible passenger's remaining age-based premium", () => {
  const data = input({
    ages: [10, 65, 65, 65, 65],
    returnDate: "2026-01-09",
    selectedAddons: [],
    passengerSelections: undefined,
    baggagePassengerCount: 0,
  });
  const result = calculateClubBenefits("harel", quote("harel", data), data, "teachers");
  assert.equal(result.price, 13.75);
  assert.equal(
    result.benefits.messages.find((item) => item.message.startsWith("15% off eligible additional")).savings,
    1.29,
  );
  consistent(result);
});

test("teachers additional benefit includes paid coverage without discounting excluded passengers", () => {
  const data = input({
    ages: [30, 18, 40, 50, 5],
    returnDate: "2026-01-01",
    selectedAddons: ["phone"],
    passengerSelections: { phone: [3, 4] },
    baggagePassengerCount: 0,
  });
  const result = calculateClubBenefits("clal", quote("clal", data), data, "teachers");
  assert.equal(line(result, "rescue"), 0.91);
  assert.equal(line(result, "devices"), 2.44);
  assert.equal(result.price, 3.35);
  consistent(result);
});

test("teachers do not guess an adult card holder or ambiguous rounded passenger costs", () => {
  for (const data of [
    input({ ages: [10, 17], selectedAddons: [], baggagePassengerCount: 0 }),
    input({ ages: [30, 17], returnDate: "2026-01-09", selectedAddons: [], baggagePassengerCount: 0 }),
  ]) {
    const result = calculateClubBenefits("harel", quote("harel", data), data, "teachers");
    assert.ok(result.benefits.messages.some((item) => item.message.includes("must be family")));
    assert.ok(result.benefits.messages.some((item) => item.status === "unimplemented" && item.message.includes("additional-traveler")));
    consistent(result);
  }
});

test("teacher family condition is present even for invalid or stale quotes", () => {
  const data = input({ ages: [30, 10] });
  const original = quote("harel", data);
  const result = calculateClubBenefits("harel", original, { ...data, ages: [10] }, "teachers");
  assert.equal(result.price, original.price);
  const familyNote = "Teachers additional-traveler benefit: the card holder and all eligible additional travelers must be family. The first adult is the card holder; up to two other adults and all children under 18 are eligible.";
  assert.ok(result.benefits.messages.some((item) => item.message === familyNote));
  assert.ok(result.benefits.messages.some((item) => item.status === "unimplemented"));
  const invalid = { ...data, departure: "invalid" };
  const invalidResult = calculateClubBenefits("harel", quote("harel", invalid), invalid, "teachers");
  assert.equal(invalidResult.price, null);
  assert.ok(invalidResult.benefits.messages.some((item) => item.message === familyNote));
});

test("teachers use the group plan when pricing additional travelers", () => {
  const data = input({
    ages: [30, 65],
    returnDate: "2026-01-01",
    selectedAddons: ["phone"],
    passengerSelections: { phone: [0, 1] },
    baggagePassengerCount: 0,
  });
  const original = quote("migdal", data);
  assert.notEqual(quote("migdal", { ...data, ages: [30] }).planName, original.planName);
  const result = calculateClubBenefits("migdal", original, data, "teachers");
  assert.ok(result.benefits.messages.some((item) => item.status === "applied" && item.message.includes("additional travelers")));
  assert.equal(line(result, "phone-gps"), 3.51);
  consistent(result);
});

test("MAMI discounts adult premiums using the group's Migdal plan", () => {
  const data = input({ ages: [30, 65, 10], returnDate: "2026-01-03", selectedAddons: [], baggagePassengerCount: 0 });
  const original = quote("migdal", data);
  const result = calculateClubBenefits("migdal", original, data, "mami");
  const adultBase = [30, 65].reduce((sum, age) => sum + quote("migdal", { ...data, ages: [age], planSelectionAges: data.ages }).basePremium, 0);
  assert.equal(result.benefits.savings, Math.round(adultBase * 15) / 100);
  assert.ok(result.benefits.messages.some((item) => item.status === "applied" && item.message.includes("aged 18")));
  consistent(result);
});

test("Migdal HOT rescue already free in LOWCOST and priced in Platinum", () => {
  for (const [endDate, saving] of [["2026-01-10", 0], ["2026-01-15", 3]]) {
    const data = input({ ages: [30], returnDate: endDate, selectedAddons: [], baggagePassengerCount: 0 });
    const result = calculateClubBenefits("migdal", quote("migdal", data), data, "hot");
    const rescue = result.benefits.messages.find((item) => item.message.includes("rescue"));
    assert.equal(rescue.status, "applied");
    assert.equal(rescue.savings ?? 0, saving);
    consistent(result);
  }
});

test("Migdal teachers third-party benefit subtracts the documented daily component", () => {
  const data = input({ ages: [30, 65], returnDate: "2026-01-10", selectedAddons: [], baggagePassengerCount: 0 });
  const result = calculateClubBenefits("migdal", quote("migdal", data), data, "teachers");
  const thirdParty = result.benefits.messages.find((item) => item.message === "Selected third-party coverage: free premium.");
  assert.equal(thirdParty.savings, 4);
  consistent(result);
});

test("removed rescue and third party are never presented as newly added coverage", () => {
  const data = input({ removeRescue: true, removeThirdParty: true });
  const result = calculateClubBenefits(
    "harel",
    quote("harel", data),
    data,
    "hitechzone",
    { calConfirmed: true },
  );
  assert.ok(
    result.benefits.messages.some((item) =>
      item.message.includes("Rescue was removed"),
    ),
  );
  assert.ok(
    result.benefits.messages.some((item) =>
      item.message.includes("Third-party coverage was removed"),
    ),
  );
  consistent(result);
});

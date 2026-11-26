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

test("teachers and Diners gifts cover eligible passengers during free days", () => {
  const data = input({ ages: [30, 40, 10], selectedAddons: [], baggagePassengerCount: 0 });
  for (const [club, endDate] of [["teachers", "2026-01-08"], ["diners_cal", "2026-01-05"]]) {
    const result = calculateClubBenefits("harel", quote("harel", data), data, club);
    const gift = result.benefits.gifts.find((item) => item.id === "baggage");
    assert.deepEqual(gift.passengerIndexes, club === "teachers" ? [0, 1, 2] : [0, 2]);
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
  assert.match(result.benefits.gifts.find((item) => item.id === "phone").name, /אובדן או גניבת טלפון נייד/);
  assert.match(result.benefits.gifts.find((item) => item.id === "laptop").name, /אובדן או גניבת מחשב נייד/);
  consistent(result);
});

test("uniq gifts require baggage and apply only to Migdal", () => {
  const withoutBaggage = input({ ages: [30], selectedAddons: ["phone"], passengerSelections: { phone: [0] }, baggagePassengerCount: 0 });
  const noBaggage = calculateClubBenefits("migdal", quote("migdal", withoutBaggage), withoutBaggage, "uniq");
  assert.deepEqual(noBaggage.benefits.gifts, []);
  assert.equal(noBaggage.price, quote("migdal", withoutBaggage).price);
  const withBaggage = input({ ages: [30], selectedAddons: ["baggage"], passengerSelections: { baggage: [0] }, baggagePassengerCount: 1 });
  const otherInsurer = calculateClubBenefits("harel", quote("harel", withBaggage), withBaggage, "uniq");
  assert.deepEqual(otherInsurer.benefits.gifts, []);
  assert.equal(otherInsurer.price, quote("harel", withBaggage).price);
  consistent(noBaggage);
  consistent(otherInsurer);
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

test("HOT restores removed rescue as a free gift without a second deduction", () => {
  const data = input({ ages: [30, 40], selectedAddons: [], baggagePassengerCount: 0, removeRescue: true });
  for (const insurer of ["harel", "migdal"]) {
    const original = quote(insurer, data);
    const result = calculateClubBenefits(insurer, original, data, "hot");
    const gift = result.benefits.gifts.find((item) => item.id === "rescue");
    assert.deepEqual(gift.passengerIndexes, [0, 1]);
    assert.equal(gift.startDate, data.departure);
    assert.equal(gift.endDate, data.returnDate);
    assert.equal(result.price, insurer === "harel" ? Math.round(original.price * 85) / 100 : original.price);
    consistent(result);
  }
});

test("Diners/cal applies to one adult and child and selected baggage by day", () => {
  const data = input();
  const original = quote("harel", data);
  const before = structuredClone(original);
  const result = calculateClubBenefits("harel", original, data, "diners_cal");
  assert.equal(result.price, 68.15);
  assert.equal(line(result, "base"), 47.5);
  assert.equal(line(result, "baggage"), 5.65);
  assert.deepEqual(original, before);
  consistent(result);
});

test("Diners/cal gives one adult benefits without a child", () => {
  for (const [endDate, base, baggage, price] of [
    ["2026-01-05", 0, 0, 0],
    ["2026-01-07", 4.5, 0.7, 5.2],
    ["2026-01-12", 16.25, 2.53, 18.78],
  ]) {
    const data = input({ ages: [30], returnDate: endDate, selectedAddons: ["baggage"], passengerSelections: { baggage: [0] }, baggagePassengerCount: 1 });
    const result = calculateClubBenefits("harel", quote("harel", data), data, "diners_cal");
    assert.equal(line(result, "base"), base);
    assert.equal(line(result, "baggage"), baggage);
    assert.equal(result.price, price);
    assert.deepEqual(result.benefits.gifts.find((item) => item.id === "baggage").passengerIndexes, [0]);
    consistent(result);
  }
});

test("Diners/cal limits free days and days 6-10 to one adult and one child", () => {
  const data = input({ ages: [30, 40, 8, 10], selectedAddons: ["baggage"], passengerSelections: { baggage: [0, 1, 2, 3] }, baggagePassengerCount: 4 });
  const result = calculateClubBenefits("harel", quote("harel", data), data, "diners_cal");
  assert.equal(line(result, "base"), 72.5);
  assert.equal(line(result, "baggage"), 11.31);
  assert.equal(result.price, 83.81);
  assert.deepEqual(result.benefits.gifts.find((item) => item.id === "baggage").passengerIndexes, [0, 2]);
  consistent(result);
  const other = calculateClubBenefits("clal", quote("clal", data), data, "diners_cal");
  assert.equal(other.price, quote("clal", data).price);
  assert.deepEqual(other.benefits.gifts, []);
});

test("Diners/cal does not discount without an adult", () => {
  const data = input({ ages: [8], selectedAddons: [], baggagePassengerCount: 0 });
  const original = quote("harel", data);
  const result = calculateClubBenefits("harel", original, data, "diners_cal");
  assert.equal(result.price, original.price);
  assert.deepEqual(result.benefits.gifts, []);
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

test("Harel third-party coverage is included free and does not change the price", () => {
  const data = input({ ages: [30], selectedAddons: [], baggagePassengerCount: 0 });
  const original = quote("harel", data);
  const removed = quote("harel", { ...data, removeThirdParty: true });
  const coverage = original.priceLines.find((item) => item.id === "thirdParty");
  assert.equal(coverage.amount, 0);
  assert.equal(coverage.includedInBase, true);
  assert.equal(original.price, removed.price);
  const result = calculateClubBenefits("harel", original, data, "hitechzone", { calConfirmed: true });
  assert.ok(result.benefits.messages.some((item) => item.message === "Harel third-party coverage is included at no additional cost." && item.status === "applied"));
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

test("MAMI discounts only adult base premiums, not add-ons, across insurers", () => {
  const data = input({ ages: [17, 18, 30], selectedAddons: ["phone"], passengerSelections: { phone: [0, 1, 2] }, baggagePassengerCount: 0 });
  for (const insurer of ["migdal", "harel", "menora", "passportcard", "clal", "phoenix", "direct"]) {
    const original = quote(insurer, data);
    const result = calculateClubBenefits(insurer, original, data, "mami");
    const adultBaseCents = [18, 30].reduce((sum, age) => {
      const passenger = quote(insurer, { ...data, ages: [age], planSelectionAges: data.ages, selectedAddons: [], passengerSelections: undefined });
      return sum + Math.round(passenger.basePremium * 100);
    }, 0);
    assert.equal(Math.round(result.benefits.savings * 100), Math.round(adultBaseCents * 0.15), insurer);
    assert.equal(result.addOnsPremium, original.addOnsPremium, insurer);
    assert.equal(result.coveragePremium, original.coveragePremium, insurer);
    consistent(result);
  }
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

test("El Al applies $10 only to Phoenix after confirmation", () => {
  const data = input({ ages: [30], selectedAddons: ["phone"], passengerSelections: { phone: [0] }, baggagePassengerCount: 0 });
  for (const insurer of ["phoenix", "harel", "migdal", "clal"]) {
    const original = quote(insurer, data);
    for (const confirmed of [true, false]) {
      const result = calculateClubBenefits(insurer, original, data, "elal", { elalEligible: confirmed });
      assert.equal(Math.round((original.price - result.price) * 100), insurer === "phoenix" && confirmed ? 1000 : 0);
      if (insurer === "phoenix" && confirmed)
        assert.ok(result.benefits.messages.some((item) => item.message === "The El Al discount requires a flight ticket purchased from El Al."));
      consistent(result);
    }
  }
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

test("Hever discounts paid phone coverage without changing base across insurers", () => {
  const data = input({ ages: [30], returnDate: "2026-01-07", selectedAddons: ["phone"], passengerSelections: { phone: [0] }, baggagePassengerCount: 0 });
  for (const insurer of ["migdal", "harel", "menora", "passportcard", "clal", "phoenix", "direct"]) {
    const original = quote(insurer, data);
    const result = calculateClubBenefits(insurer, original, data, "hever");
    assert.equal(result.basePremium, original.basePremium, insurer);
    assert.equal(result.benefits.savings, Math.round(original.addOnsPremium * 15) / 100, insurer);
    assert.ok(result.benefits.gifts.some((item) => item.id === "operational-cancellation"), insurer);
    consistent(result);
  }
});

test("Hever Phoenix gives baggage and medical cancellation to all passengers", () => {
  const data = input({ ages: [30, 40], selectedAddons: [], baggagePassengerCount: 0 });
  const original = quote("phoenix", data);
  const result = calculateClubBenefits("phoenix", original, data, "hever");
  assert.equal(result.price, original.price);
  for (const id of ["baggage", "medical-cancellation", "operational-cancellation"]) {
    assert.deepEqual(result.benefits.gifts.find((item) => item.id === id).passengerIndexes, [0, 1]);
  }
  consistent(result);
});

test("Hever Phoenix gives selected cancellation and baggage free and discounts other add-ons", () => {
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
  assert.equal(result.price, 30.5);
  assert.equal(line(result, "baggage"), 0);
  assert.equal(line(result, "cancellation"), 0);
  assert.equal(line(result, "phone"), 8.5);
  assert.ok(result.benefits.messages.some((item) => item.status === "applied" && item.message === "Selected Phoenix cancellation and baggage premiums are free."));
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

test("doctors Harel rescue is free whether included or removed", () => {
  for (const removeRescue of [false, true]) {
    const data = input({ ages: [30, 40], selectedAddons: ["phone"], passengerSelections: { phone: [0] }, baggagePassengerCount: 0, removeRescue });
    const original = quote("harel", data);
    const result = calculateClubBenefits("harel", original, data, "doctors");
    const afterRescue = removeRescue ? original.price : original.price - 4;
    assert.equal(result.price, Math.round(afterRescue * 80) / 100);
    if (removeRescue) {
      assert.deepEqual(result.benefits.gifts.find((item) => item.id === "rescue").passengerIndexes, [0, 1]);
    } else {
      assert.equal(result.benefits.messages.find((item) => item.message === "Selected rescue coverage: free premium.").savings, 4);
    }
    assert.ok(!result.benefits.messages.some((item) => item.message.includes("estimated $0.20")));
    consistent(result);
  }
});

test("doctors club Harel provides rescue and discounts the remaining price", () => {
  for (const removed of [false, true]) {
    const data = input({ ages: [30], selectedAddons: ["phone"], passengerSelections: { phone: [0] }, baggagePassengerCount: 0, removeRescue: removed });
    const original = quote("harel", data);
    const result = calculateClubBenefits("harel", original, data, "doctors");
    const eligible = Math.round(original.price * 100) - (removed ? 0 : 200);
    assert.equal(Math.round(result.price * 100), eligible - Math.round(eligible * 0.2));
    if (removed) assert.deepEqual(result.benefits.gifts.find((gift) => gift.id === "rescue").passengerIndexes, [0]);
    else assert.ok(result.benefits.messages.some((item) => item.message === "Selected rescue coverage: free premium." && item.savings === 2));
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
  assert.equal(line(result, "phone"), 46.56);
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
  assert.equal(withoutCard.price, 23.59);
  assert.equal(withCard.price, 22.41);
  assert.equal(
    withoutCard.benefits.messages.find((item) => item.message.startsWith("15% off eligible additional")).savings,
    1.91,
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
  assert.equal(result.price, 14.24);
  assert.equal(
    result.benefits.messages.find((item) => item.message.startsWith("15% off eligible additional")).savings,
    0.8,
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
  assert.equal(line(result, "rescue"), 0.94);
  assert.equal(line(result, "devices"), 2.44);
  assert.equal(result.price, 3.38);
  consistent(result);
});

test("teachers additional benefit covers only one additional adult and all children", () => {
  const data = input({ ages: [30, 40, 50, 5, 10], returnDate: "2026-01-01", selectedAddons: ["phone"], passengerSelections: { phone: [0, 1, 2, 3, 4] }, baggagePassengerCount: 0 });
  const original = quote("harel", data);
  const result = calculateClubBenefits("harel", original, data, "teachers");
  assert.equal(line(original, "phone"), 8);
  assert.equal(line(result, "phone"), 7.28);
  assert.equal(result.benefits.messages.find((item) => item.message.startsWith("15% off eligible additional")).savings, 0.72);
  consistent(result);
});

test("teachers restore removed third-party coverage as a free gift", () => {
  const data = input({ ages: [30], selectedAddons: [], baggagePassengerCount: 0, removeThirdParty: true });
  const original = quote("migdal", data);
  const result = calculateClubBenefits("migdal", original, data, "teachers");
  const gift = result.benefits.gifts.find((item) => item.id === "third-party");
  assert.deepEqual(gift.passengerIndexes, [0]);
  assert.equal(gift.startDate, data.departure);
  assert.equal(gift.endDate, data.returnDate);
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
  const familyNote = "Teachers additional-traveler benefit: the card holder and all eligible additional travelers must be family. The first adult is the card holder; up to one other adult and all children under 18 are eligible.";
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

test("Hitechzone restores removed rescue and third party as free gifts", () => {
  const data = input({ removeRescue: true, removeThirdParty: true });
  const result = calculateClubBenefits(
    "harel",
    quote("harel", data),
    data,
    "hitechzone",
    { calConfirmed: true },
  );
  for (const id of ["rescue", "third-party"]) {
    const gift = result.benefits.gifts.find((item) => item.id === id);
    assert.deepEqual(gift.passengerIndexes, [0, 1, 2]);
    assert.equal(gift.startDate, data.departure);
    assert.equal(gift.endDate, data.returnDate);
  }
  consistent(result);
});

test("Hitechzone first five base days require a confirmed Cal card", () => {
  const data = input({ ages: [30], selectedAddons: ["extremeSports"], baggagePassengerCount: 0 });
  const original = quote("harel", data);
  const confirmed = calculateClubBenefits("harel", original, data, "hitechzone", { calConfirmed: true });
  const declined = calculateClubBenefits("harel", original, data, "hitechzone", { calConfirmed: false });
  assert.equal(confirmed.price, 14);
  assert.equal(declined.price, 25.5);
  assert.equal(line(confirmed, "extremeSports"), 2.5);
  assert.equal(line(declined, "extremeSports"), 2.5);
  assert.ok(declined.benefits.messages.some((item) => item.message.includes("require confirmation")));
  const other = calculateClubBenefits("migdal", quote("migdal", data), data, "hitechzone", { calConfirmed: true });
  assert.equal(other.price, quote("migdal", data).price);
  consistent(confirmed);
  consistent(declined);
  consistent(other);
});

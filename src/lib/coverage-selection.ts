export const limitedCoverages: Record<string, { name: string; insurers: string[] }> = {
  personalAccident: { name: "תאונות אישיות", insurers: ["harel", "passportcard"] },
  rentalCar: { name: "רכב שכור", insurers: ["harel", "passportcard", "phoenix"] },
  valuableItem: { name: "פריט יקר ערך", insurers: ["harel", "passportcard"] },
  camera: { name: "מצלמה", insurers: ["clal", "phoenix", "passportcard"] },
};

export const coverageInsurerNames: Record<string, string> = {
  harel: "הראל",
  passportcard: "פספורטכארד",
  phoenix: "הפניקס",
  clal: "כלל",
};

export const passengerAddonIds = ["baggage", "phone", "laptop"] as const;
export type PassengerAddonId = (typeof passengerAddonIds)[number];
export type PassengerSelections = Partial<Record<PassengerAddonId, number[]>>;

export function addonsForInsurer(addons: string[], insurer: string) {
  return addons.filter((addon) => !limitedCoverages[addon] || limitedCoverages[addon].insurers.includes(insurer));
}

export function missingCoverages(addons: string[], insurer: string) {
  return addons.filter((addon) => limitedCoverages[addon] && !limitedCoverages[addon].insurers.includes(insurer));
}

export function coveredAges(ages: number[], addon: string, selections?: PassengerSelections, baggagePassengerCount?: number) {
  const indexes = selections?.[addon as PassengerAddonId];
  if (indexes) return ages.filter((_, index) => indexes.includes(index));
  if (addon === "baggage" && baggagePassengerCount) return ages.slice(0, baggagePassengerCount);
  return ages;
}

export function parsePassengerSelections(params: URLSearchParams): PassengerSelections {
  return Object.fromEntries(passengerAddonIds.flatMap((addon) => {
    const value = params.get(`${addon}PassengerIndexes`);
    if (value === null) return [];
    const indexes = value.split(",").filter(Boolean).map(Number).filter((index) => Number.isInteger(index) && index >= 0);
    return [[addon, [...new Set(indexes)]]];
  }));
}
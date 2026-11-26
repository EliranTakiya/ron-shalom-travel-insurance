import type {
  ClubBenefitFlags,
  ClubBenefits,
  ClubId,
} from "@/lib/club-benefits";

export const clubs: { id: ClubId; name: string }[] = [
  { id: "hever", name: "חבר" },
  { id: "hot", name: "הוט" },
  { id: "doctors", name: "יחד מועדון צרכנות לרופאים בע״מ" },
  { id: "adif", name: "עדיף" },
  { id: "teachers", name: "מועדון המורים" },
  { id: "mami", name: "מאמי" },
  { id: "uniq", name: "uniq" },
  { id: "hitechzone", name: "הייטקזון" },
  { id: "diners_cal", name: "דיינרס / כאל" },
  { id: "elal", name: "אל על" },
];

export function readClub(params: Pick<URLSearchParams, "get">): {
  club: ClubId | null;
  flags: ClubBenefitFlags;
} {
  const club = clubs.find((item) => item.id === params.get("club"))?.id ?? null;
  const answer = (key: string) =>
    params.get(key) === "true"
      ? true
      : params.get(key) === "false"
        ? false
        : undefined;
  return {
    club,
    flags: {
      clubCardConfirmed: answer("clubCardConfirmed"),
      calConfirmed: answer("calConfirmed"),
      elalEligible: answer("elalEligible"),
    },
  };
}

function translate(message: string): string {
  const exact: Record<string, string> = {
    "The quote does not match the current pricing engine or has inconsistent line items; no club discounts were calculated.":
      "ההצעה אינה תואמת למחשבון או שפירוט המחיר אינו עקבי; לא חושבו הנחות מועדון.",
    "Rescue was removed from the quote; the club benefit does not add coverage.":
      "איתור וחילוץ הוסר מההצעה; ההטבה אינה מוסיפה כיסוי.",
    "The rescue benefit cannot be valued for this insurer.":
      "לא ניתן לתמחר את הטבת החילוץ בחברה זו.",
    "The rescue benefit cannot be calculated from the pricing engine.":
      "לא ניתן לחשב את הטבת החילוץ מהתעריפון.",
    "Selected rescue coverage: free premium.":
      "פרמיית איתור וחילוץ שנבחרה ללא תשלום.",
    "Migdal rescue is already included at no additional cost.":
      "איתור וחילוץ במגדל כבר כלול ללא תוספת תשלום.",
    "Rescue has no separately calculable premium; confirm the club benefit and coverage with the insurer.":
      "לא ניתן לחשב בנפרד את פרמיית החילוץ; יש לאמת את ההטבה והכיסוי מול החברה.",
    "Third-party coverage was removed; the club benefit does not add it.":
      "כיסוי צד ג׳ הוסר; ההטבה אינה מוסיפה אותו.",
    "Selected third-party coverage: free premium.":
      "פרמיית כיסוי צד ג׳ שנבחר ללא תשלום.",
    "Harel third-party coverage is included at no additional cost.":
      "כיסוי צד ג׳ בהראל כלול ללא תוספת תשלום.",
    "Third-party benefit is conditional on the insurer's actual coverage; no additional coverage was added or valued.":
      "הטבת צד ג׳ תלויה בכיסוי בפועל של החברה; לא נוסף או תומחר כיסוי נוסף.",
    "Operational cancellation may be available free subject to eligibility and terms; it is not added or guaranteed by this calculation.":
      "ביטול עקב פעילות מבצעית עשוי להינתן ללא תשלום בכפוף לזכאות ולתנאים; החישוב אינו מוסיף או מבטיח כיסוי זה.",
    "Selected Phoenix cancellation and baggage premiums are free.":
      "פרמיות ביטול וכבודה שנבחרו בפניקס ללא תשלום.",
    "15% off remaining paid add-ons.": "הנחה של 15% מיתרת ההרחבות בתשלום.",
    "25% off the total.": "הנחה של 25% מהסכום הכולל.",
    "22% off the total.": "הנחה של 22% מהסכום הכולל.",
    "15% off the total after the rescue benefit.":
      "הנחה של 15% מהסכום לאחר הטבת החילוץ.",
    "50% off the remaining extreme sports premium.":
      "הנחה של 50% מיתרת פרמיית ספורט אתגרי.",
    "Selected baggage premium is free.": "פרמיית הכבודה שנבחרה ללא תשלום.",
    "Cancellation gift coverage dates and expiry require confirmation with the insurer.":
      "תקופת כיסוי הביטול במתנה מחייבת אימות מול חברת הביטוח.",
    "The medical-only gift cannot be separated from the selected broader cancellation premium; that premium remains payable.":
      "הטבת הביטול הרפואי אינה ניתנת להפרדה מהרחבת הביטול הרחבה שנבחרה, ולכן מחירה נשאר לתשלום ויש לבררו מול החברה.",
    "Baggage after the free days is included only for passengers who selected it; other passengers have no quoted baggage after day 8.":
      "לאחר שמונת ימי המתנה, כבודה כלולה רק לנוסעים שעבורם נבחרה ההרחבה.",
    "Baggage after the free days is included only for passengers who selected it; other passengers have no quoted baggage after day 5.":
      "לאחר חמשת ימי המתנה, כבודה כלולה רק לנוסעים שעבורם נבחרה ההרחבה.",
    "The eligible extreme sports premium could not be calculated exactly.":
      "לא ניתן לחשב במדויק את פרמיית הספורט האתגרי הזכאית להטבה.",
    "19% off the remaining base premium for trips over 14 days.":
      "הנחה של 19% מיתרת פרמיית הבסיס לנסיעות מעל 14 ימים.",
    "20% off the total after any rescue benefit.":
      "הנחה של 20% מהסכום לאחר הטבת חילוץ, ככל שחלה.",
    "20% off the total excluding cancellation.":
      "הנחה של 20% מהסכום ללא ביטול נסיעה.",
    "Free baggage days apply only to baggage already selected in the quote; coverage was not added for other passengers.":
      "ימי כבודה ללא תשלום חלים רק על הכבודה שנבחרה; לא נוסף כיסוי לנוסעים אחרים.",
    "Teachers additional-traveler benefit: the card holder and all eligible additional travelers must be family. The first adult is the card holder; up to one other adult and all children under 18 are eligible.":
      "ההטבה לנוסעים נוספים מיועדת לבני משפחה בלבד. הבגיר הראשון נחשב בעל הכרטיס; זכאי בגיר נוסף אחד, ועד שני בגירים בסך הכול, וילדיהם מתחת לגיל 18 ללא הגבלת מספר.",
    "15% off remaining base and selected baggage from day 9.":
      "הנחה של 15% מיתרת הבסיס והכבודה שנבחרה מהיום התשיעי.",
    "The day-nine discount for other add-ons is not calculated: daily allocation of capped or flat premiums needs clarification.":
      "הנחת היום התשיעי להרחבות אחרות לא חושבה; אופן חלוקת הפרמיות דורש בירור.",
    "The additional-traveler 15% benefit is not calculated because its scope and overlap with the day-nine discount need clarification.":
      "הטבת 15% לנוסעים נוספים לא חושבה; היקפה והחפיפה עם הנחת היום התשיעי דורשים בירור.",
    "The additional-traveler 15% benefit cannot be calculated without an adult card holder.":
      "לא ניתן לחשב את הטבת הנוסעים הנוספים ללא בעל כרטיס בגיר.",
    "The additional-traveler 15% benefit is not calculated because passenger-level remaining premiums cannot be reconstructed exactly.":
      "לא ניתן לחשב במדויק את יתרת הפרמיה לכל נוסע, ולכן הנחת הנוסעים הנוספים לא חושבה.",
    "15% off eligible additional travelers' remaining insurance premiums.":
      "הנחה של 15% על יתרת דמי הביטוח של הנוסעים הנוספים הזכאים.",
    "Extra 5% off the remaining quote with a confirmed club card.":
      "הנחה נוספת של 5% מיתרת ההצעה לפי אישור כרטיס המועדון.",
    "An extra 5% off the remaining quote requires a confirmed club card.":
      "הנחה נוספת של 5% מיתרת ההצעה דורשת אישור כרטיס מועדון.",
    "Adult base premiums cannot be recomputed exactly for this quote.":
      "לא ניתן לחשב במדויק את פרמיות הבסיס למבוגרים בהצעה זו.",
    "15% off the base premium for passengers aged 18 or older.":
      "הנחה של 15% מפרמיית הבסיס לנוסעים מגיל 18.",
    "Purchase of baggage is required for the uniq bonus; no bonus coverage was added.":
      "הטבת uniq דורשת רכישת כבודה; לא נוסף כיסוי במסגרת ההטבה.",
    "Baggage may entitle the purchaser to extreme sports, phone and laptop coverage; eligibility and inclusion must be verified. No coverage was added.":
      "כבודה עשויה להקנות זכאות לספורט אתגרי, טלפון ומחשב; יש לוודא זכאות והכללה. לא נוסף כיסוי.",
    "Extreme sports cannot be split by passenger through the supported selection API; the bonus was not calculated.":
      "לא ניתן לפצל ספורט אתגרי לפי נוסע; ההטבה לא חושבה.",
    "Selected extreme sports premium is free for baggage purchasers, subject to verification.":
      "פרמיית ספורט אתגרי שנבחרה לרוכשי כבודה ללא תשלום, בכפוף לאימות.",
    "Five free base days require confirmation of the cal card.":
      "חמישה ימי בסיס ללא תשלום מחייבים אישור כרטיס כאל.",
    "50% off selected extreme sports.": "הנחה של 50% על ספורט אתגרי שנבחר.",
    "Baggage benefits apply only to baggage already selected in the quote; coverage was not added for other passengers.":
      "הטבות הכבודה חלות רק על הכבודה שנבחרה; לא נוסף כיסוי לנוסעים אחרים.",
    "$10 El Al discount, capped at the quote price.":
      "הנחת אל על בסך 10 דולר, עד למחיר ההצעה.",
    "The El Al discount requires a flight ticket purchased from El Al.":
      "קבלת ההטבה מותנית ברכישת כרטיס טיסה מאל על.",
    "El Al eligibility was not met.": "תנאי הזכאות להטבת אל על לא התקיים.",
    "The $10 El Al discount requires eligibility confirmation.":
      "הנחת אל על בסך 10 דולר מחייבת אישור זכאות.",
    "Unknown club; no discount was calculated.":
      "מועדון לא מוכר; לא חושבה הנחה.",
    "Diners/cal requires at least one adult.":
      "הטבת דיינרס/כאל מחייבת לפחות בגיר אחד.",
  };
  if (exact[message]) return exact[message];
  const dinersAdult = message.match(/^Diners\/cal applies to the first adult only: passenger (\d+)\.$/);
  if (dinersAdult) return `ההטבה חושבה לבגיר הראשון בלבד: נוסע ${dinersAdult[1]}.`;
  const dinersPassengers = message.match(/^Diners\/cal applies to the first adult and first child only: passengers (\d+) and (\d+)\.$/);
  if (dinersPassengers) return `ההטבה חושבה לבגיר ולילד הראשונים בלבד: נוסעים ${dinersPassengers[1]} ו־${dinersPassengers[2]}.`;
  const dinersFreeBase = message.match(/^Diners\/cal: base days 1-(\d+) free for eligible passengers\.$/);
  if (dinersFreeBase) return `ימי הבסיס 1-${dinersFreeBase[1]} ללא תשלום לנוסעים הזכאים.`;
  if (/^15% off .+ for covered days from day 9\.$/.test(message))
    return "הנחה של 15% על ההרחבה עבור ימי הכיסוי החל מהיום התשיעי.";
  if (/^Teachers day-nine discount for .+ is not calculated:/.test(message))
    return "לא ניתן לחשב במדויק את הנחת היום התשיעי לאחת ההרחבות; יש לברר את המחיר מול החברה.";
  if (
    message.startsWith("No ") &&
    message.endsWith(" benefit is specified for this insurer.")
  )
    return "לא הוגדרה הטבת מועדון לחברה זו.";
  const device = message.match(
    /^Selected (phone|laptop) premium for baggage purchasers is free, subject to verification\.$/,
  );
  if (device)
    return `פרמיית ${device[1] === "phone" ? "טלפון" : "מחשב"} שנבחרה לרוכשי כבודה ללא תשלום, בכפוף לאימות.`;
  const missingDevice = message.match(
    /^The eligible (phone|laptop) premium could not be calculated\.$/,
  );
  if (missingDevice)
    return `לא ניתן לחשב את פרמיית ה${missingDevice[1] === "phone" ? "טלפון" : "מחשב"} הזכאית.`;
  const days = message.match(/^(Teachers|Hitechzone|Diners\/cal): (.+)$/);
  if (days) {
    const text = days[2];
    const freeDays = text.match(
      /^base days 1-(\d+) free for all passengers\.$/,
    );
    const baseDiscount = text.match(/^10% off base days (\d+)-(\d+)\.$/);
    const baggageDays = text.match(/^selected baggage days 1-(\d+) free\.$/);
    const baggageDiscount = text.match(
      /^10% off selected baggage days (\d+)-(\d+)\.$/,
    );
    if (freeDays) return `ימי בסיס 1-${freeDays[1]} ללא תשלום לכל הנוסעים.`;
    if (baseDiscount)
      return `הנחה של 10% מימי בסיס ${baseDiscount[1]}-${baseDiscount[2]}.`;
    if (baggageDays) return `ימי כבודה שנבחרה 1-${baggageDays[1]} ללא תשלום.`;
    if (baggageDiscount)
      return `הנחה של 10% מימי כבודה שנבחרה ${baggageDiscount[1]}-${baggageDiscount[2]}.`;
    if (text.includes("baggage daily"))
      return "לא ניתן לחשב במדויק את מחיר הכבודה היומי.";
    return "לא ניתן לחשב במדויק את התמחור היומי לחברה זו.";
  }
  return "יש לבדוק את פרטי ההטבה מול חברת הביטוח; הפירוט המקורי מופיע להלן.";
}

export default function ClubBenefitsDetails({
  benefits,
  passengerCount,
}: {
  benefits?: ClubBenefits;
  passengerCount: number;
}) {
  if (!benefits) return null;
  const incomplete = benefits.messages.some(
    (item) => item.status === "unimplemented",
  );
  const statuses = {
    applied: "חושב",
    conditional: "מותנה באימות",
    unimplemented: "לא חושב",
    not_applicable: "לא חל",
  };
  return (
    <section
      className="mt-4 border-t border-gray-200 pt-4 text-sm"
      aria-label="פירוט הטבות מועדון"
    >
      <h3 className="font-bold text-gray-900">
        הטבות {clubs.find((item) => item.id === benefits.clubId)?.name}: חיסכון
        מחושב ${benefits.savings.toFixed(2)}
      </h3>
      {incomplete && (
        <p
          role="alert"
          className="mt-2 bg-amber-100 p-3 font-bold text-amber-950"
        >
          המחיר משוער והחישוב אינו מלא: חלק מהטבות המועדון לא חושבו. יש לברר מול
          חברת הביטוח.
        </p>
      )}
      {benefits.messages.some(
        (item) =>
          item.status === "conditional" ||
          item.message.includes("subject to verification"),
      ) && (
        <p className="mt-2 bg-amber-50 p-2 font-bold text-amber-950">
          הטבות מותנות דורשות אימות מול חברת הביטוח; המחיר והכיסוי עשויים להשתנות.
        </p>
      )}
      {benefits.gifts.length > 0 && (
        <div className="mt-3 border-r-4 border-green-600 bg-green-50 p-3 text-green-950">
          <h4 className="font-bold">כיסויים במתנה בהצעה המשוערת</h4>
          <ul className="mt-2 space-y-2">
            {benefits.gifts.map((gift) => (
              <li key={gift.id}>
                <strong>{gift.name}</strong>
                {": "}{gift.passengerIndexes.length === passengerCount
                  ? "כל הנוסעים"
                  : gift.passengerIndexes.map((index) => `נוסע ${index + 1}`).join(", ")}
                {gift.startDate && gift.endDate
                  ? `, ${gift.startDate} עד ${gift.endDate}`
                  : ", תקופת הכיסוי דורשת אימות"}.
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs">הכיסויים כפופים לאישור חברת הביטוח ולתנאי הפוליסה.</p>
        </div>
      )}
      {benefits.clubId === "teachers" && passengerCount > 1 && (
        <p className="mt-2 font-bold text-amber-900">
          הטבת נוסעים נוספים מיועדת לבני משפחה בלבד: עד שני בגירים בסך הכול, כולל בעל הכרטיס, וילדיהם מתחת לגיל 18 ללא הגבלת מספר.
        </p>
      )}
      {benefits.messages.length === 0 && (
        <p className="mt-2 text-gray-600">
          לא חושב חיסכון נוסף עבור הבחירות בהצעה זו.
        </p>
      )}
      <ul className="mt-2 space-y-2">
        {benefits.messages.map((item, index) => (
          <li
            key={`${item.message}-${index}`}
            className={
              item.status === "applied" ? "text-green-800" : "text-amber-900"
            }
          >
            <strong>{statuses[item.status]}:</strong> {translate(item.message)}{" "}
            {item.savings !== undefined &&
              `(חיסכון $${item.savings.toFixed(2)})`}
            <details className="text-xs text-gray-600">
              <summary>הפירוט המקורי באנגלית</summary>
              <span dir="ltr">{item.message}</span>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}

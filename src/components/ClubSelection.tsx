"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { clubs } from "@/components/ClubBenefits";
import type { ClubId } from "@/lib/club-benefits";

export default function ClubSelection({
  tripParams,
  onBack,
}: {
  tripParams: string;
  onBack: () => void;
}) {
  const router = useRouter();
  const [club, setClub] = useState<ClubId | "">("");
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [questionOpen, setQuestionOpen] = useState(false);
  const question =
    club === "teachers"
      ? "האם תרכשו את הביטוח באמצעות כרטיס מועדון ארגון המורים?"
      : club === "hitechzone"
        ? "האם יש ברשותכם כרטיס כאל של הייטקזון?"
        : club === "elal"
          ? "קבלת ההטבה מותנית ברכישת כרטיס טיסה מאל על. האם להשתמש בהטבה?"
          : "";
  const answerKey =
    club === "teachers"
      ? "clubCardConfirmed"
      : club === "hitechzone"
        ? "calConfirmed"
        : "elalEligible";
  const submit = (value: boolean | null = answer) => {
    if (!tripParams || !club || (question && value === null)) return;
    const params = new URLSearchParams(tripParams);
    params.set("club", club);
    if (question && value !== null) params.set(answerKey, String(value));
    router.push(`/results/?${params.toString()}`);
  };
  return (
    <div id="club-member" className="scroll-mt-24">
      <h3 className="text-xl font-bold text-gray-900">בחירת מועדון</h3>
      {!tripParams && (
        <p role="alert" className="mt-3 text-sm font-bold text-amber-900">
          יש לחזור להרחבות ולהשלים את ההשוואה לפני בחירת מועדון.
        </p>
      )}
      <label
        htmlFor="club-select"
        className="mt-5 block font-medium text-gray-700"
      >
        בחרו מועדון
      </label>
      <select
        id="club-select"
        value={club}
        onChange={(event) => {
          setClub(event.target.value as ClubId | "");
          setAnswer(null);
        }}
        className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-4"
      >
        <option value="">בחרו מועדון...</option>
        {clubs.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={!club || !tripParams}
        onClick={() => (question ? setQuestionOpen(true) : submit())}
        className="mt-6 w-full rounded-xl bg-green-600 py-4 text-lg font-bold text-white disabled:bg-gray-300"
      >
        הצג הצעות ביטוח
      </button>
      <button
        type="button"
        onClick={onBack}
        className="mt-3 w-full rounded-xl border border-gray-300 py-3 font-bold"
      >
        חזרה להרחבות
      </button>
      {questionOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="club-question"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h3 id="club-question" className="text-lg font-bold">
              {question}
            </h3>
            {club === "elal" && (
              <p className="mt-2 text-sm text-gray-600">
                האישור הוא הצהרה בלבד. תנאי הטיסה והזכאות חייבים אימות מול חברת
                הביטוח.
              </p>
            )}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setAnswer(true);
                  setQuestionOpen(false);
                  submit(true);
                }}
                className="flex-1 rounded-lg bg-green-600 p-3 font-bold text-white"
              >
                כן
              </button>
              <button
                type="button"
                onClick={() => {
                  setAnswer(false);
                  setQuestionOpen(false);
                  submit(false);
                }}
                className="flex-1 rounded-lg border border-gray-300 p-3 font-bold"
              >
                לא
              </button>
            </div>
            <button
              type="button"
              onClick={() => setQuestionOpen(false)}
              className="mt-3 w-full p-2 text-sm underline"
            >
              חזרה לבחירת מועדון
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

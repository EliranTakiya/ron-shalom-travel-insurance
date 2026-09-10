
"use client";

type PassengerFormProps = {
    adults: number;
    setAdults: (value: number) => void;

    children: number;
    setChildren: (value: number) => void;

    babies: number;
    setBabies: (value: number) => void;

    adultAges: (number | null)[];
    setAdultAges: (value: (number | null)[]) => void;

    childAges: (number | null)[];
    setChildAges: (value: (number | null)[]) => void;

    babyAges: (number | null)[];
    setBabyAges: (value: (number | null)[]) => void;

    onContinue: () => void;
};

export default function PassengerForm({
    adults,
    setAdults,
    children,
    setChildren,
    babies,
    setBabies,
    adultAges,
    setAdultAges,
    childAges,
    setChildAges,
    babyAges,
    setBabyAges,
    onContinue,
}: PassengerFormProps) {

    const totalPassengers = adults + children + babies;

    // האם לכל הנוסעים נבחר גיל?
    const allAgesSelected =
        adults > 0 &&
        adultAges.length === adults &&
        childAges.length === children &&
        babyAges.length === babies &&
        adultAges.every((age) => age !== null) &&
        childAges.every((age) => age !== null) &&
        babyAges.every((age) => age !== null);

    // =========================
    // מבוגרים
    // =========================

    const changeAdults = (newCount: number) => {

        setAdults(newCount);

        if (newCount > adultAges.length) {

            setAdultAges([
                ...adultAges,
                ...Array(newCount - adultAges.length).fill(null),
            ]);

        } else {

            setAdultAges(
                adultAges.slice(0, newCount)
            );

        }
    };

    // =========================
    // ילדים
    // =========================

    const changeChildren = (newCount: number) => {

        setChildren(newCount);

        if (newCount > childAges.length) {

            setChildAges([
                ...childAges,
                ...Array(newCount - childAges.length).fill(null),
            ]);

        } else {

            setChildAges(
                childAges.slice(0, newCount)
            );

        }
    };

    // =========================
    // תינוקות
    // =========================

    const changeBabies = (newCount: number) => {

        setBabies(newCount);

        if (newCount > babyAges.length) {

            setBabyAges([
                ...babyAges,
                ...Array(newCount - babyAges.length).fill(null),
            ]);

        } else {

            setBabyAges(
                babyAges.slice(0, newCount)
            );

        }
    };

    return (
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-xl">

            <h2 className="text-2xl font-bold text-gray-900">
                מי טס?
            </h2>

            <p className="mt-2 text-gray-500">
                בחר את מספר הנוסעים ואת הגיל של כל נוסע
            </p>

            <div className="mt-6 space-y-5">

                {/* =========================
            מבוגרים
        ========================= */}

                <div className="rounded-xl bg-gray-50 p-4">

                    <div className="flex items-center justify-between">

                        <div>

                            <div className="font-bold text-gray-900">
                                מבוגרים
                            </div>

                            <div className="text-sm text-gray-500">
                                גיל 18 ומעלה
                            </div>

                        </div>

                        <div className="flex items-center gap-4">

                            <button
                                type="button"
                                onClick={() =>
                                    changeAdults(
                                        Math.max(1, adults - 1)
                                    )
                                }
                                className="h-10 w-10 rounded-full bg-blue-100 text-xl font-bold text-blue-700"
                            >
                                −
                            </button>

                            <span className="w-6 text-center text-lg font-bold">
                                {adults}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    changeAdults(
                                        Math.min(10, adults + 1)
                                    )
                                }
                                className="h-10 w-10 rounded-full bg-blue-600 text-xl font-bold text-white"
                            >
                                +
                            </button>

                        </div>

                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">

                        {adultAges.map((age, index) => (

                            <div key={index}>

                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    מבוגר {index + 1} — גיל
                                </label>

                                <select
                                    value={age ?? ""}
                                    onChange={(e) => {

                                        const newAges = [...adultAges];

                                        newAges[index] =
                                            e.target.value === ""
                                                ? null
                                                : Number(e.target.value);

                                        setAdultAges(newAges);

                                    }}
                                    className="w-full rounded-lg border border-gray-300 bg-white p-3"
                                >

                                    <option value="">
                                        בחר גיל
                                    </option>

                                    {Array.from(
                                        { length: 83 },
                                        (_, i) => i + 18
                                    ).map((ageOption) => (

                                        <option
                                            key={ageOption}
                                            value={ageOption}
                                        >
                                            {ageOption}
                                        </option>

                                    ))}

                                </select>

                            </div>

                        ))}

                    </div>

                </div>

                {/* =========================
            ילדים
        ========================= */}

                <div className="rounded-xl bg-gray-50 p-4">

                    <div className="flex items-center justify-between">

                        <div>

                            <div className="font-bold text-gray-900">
                                ילדים
                            </div>

                            <div className="text-sm text-gray-500">
                                גיל 2–17
                            </div>

                        </div>

                        <div className="flex items-center gap-4">

                            <button
                                type="button"
                                onClick={() =>
                                    changeChildren(
                                        Math.max(0, children - 1)
                                    )
                                }
                                className="h-10 w-10 rounded-full bg-blue-100 text-xl font-bold text-blue-700"
                            >
                                −
                            </button>

                            <span className="w-6 text-center text-lg font-bold">
                                {children}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    changeChildren(
                                        Math.min(10, children + 1)
                                    )
                                }
                                className="h-10 w-10 rounded-full bg-blue-600 text-xl font-bold text-white"
                            >
                                +
                            </button>

                        </div>

                    </div>

                    {children > 0 && (

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">

                            {childAges.map((age, index) => (

                                <div key={index}>

                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        ילד {index + 1} — גיל
                                    </label>

                                    <select
                                        value={age ?? ""}
                                        onChange={(e) => {

                                            const newAges = [...childAges];

                                            newAges[index] =
                                                e.target.value === ""
                                                    ? null
                                                    : Number(e.target.value);

                                            setChildAges(newAges);

                                        }}
                                        className="w-full rounded-lg border border-gray-300 bg-white p-3"
                                    >

                                        <option value="">
                                            בחר גיל
                                        </option>

                                        {Array.from(
                                            { length: 16 },
                                            (_, i) => i + 2
                                        ).map((ageOption) => (

                                            <option
                                                key={ageOption}
                                                value={ageOption}
                                            >
                                                {ageOption}
                                            </option>

                                        ))}

                                    </select>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

                {/* =========================
            תינוקות
        ========================= */}

                <div className="rounded-xl bg-gray-50 p-4">

                    <div className="flex items-center justify-between">

                        <div>

                            <div className="font-bold text-gray-900">
                                תינוקות
                            </div>

                            <div className="text-sm text-gray-500">
                                עד גיל שנתיים
                            </div>

                        </div>

                        <div className="flex items-center gap-4">

                            <button
                                type="button"
                                onClick={() =>
                                    changeBabies(
                                        Math.max(0, babies - 1)
                                    )
                                }
                                className="h-10 w-10 rounded-full bg-blue-100 text-xl font-bold text-blue-700"
                            >
                                −
                            </button>

                            <span className="w-6 text-center text-lg font-bold">
                                {babies}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    changeBabies(
                                        Math.min(10, babies + 1)
                                    )
                                }
                                className="h-10 w-10 rounded-full bg-blue-600 text-xl font-bold text-white"
                            >
                                +
                            </button>

                        </div>

                    </div>

                    {babies > 0 && (

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">

                            {babyAges.map((age, index) => (

                                <div key={index}>

                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        תינוק {index + 1} — גיל
                                    </label>

                                    <select
                                        value={age ?? ""}
                                        onChange={(e) => {

                                            const newAges = [...babyAges];

                                            newAges[index] =
                                                e.target.value === ""
                                                    ? null
                                                    : Number(e.target.value);

                                            setBabyAges(newAges);

                                        }}
                                        className="w-full rounded-lg border border-gray-300 bg-white p-3"
                                    >

                                        <option value="">
                                            בחר גיל
                                        </option>

                                        <option value={0}>
                                            פחות משנה
                                        </option>

                                        <option value={1}>
                                            שנה
                                        </option>

                                    </select>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            </div>

            {/* =========================
          סיכום
      ========================= */}

            <div className="mt-6 rounded-xl bg-blue-50 p-4 text-center">

                <span className="font-bold text-blue-800">
                    סה״כ נוסעים: {totalPassengers}
                </span>

            </div>

            {/* =========================
          הודעה
      ========================= */}

            {!allAgesSelected && totalPassengers > 0 && (

                <div className="mt-4 text-center text-sm text-gray-500">
                    יש לבחור גיל לכל הנוסעים כדי להמשיך
                </div>

            )}

            {/* =========================
          המשך להרחבות
      ========================= */}

            {allAgesSelected && (
                <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.12)] backdrop-blur">
                    <button
                        type="button"
                        onClick={onContinue}
                        className="mx-auto block w-full max-w-5xl rounded-xl bg-green-500 py-4 text-lg font-bold text-white transition hover:bg-green-600"
                    >
                        המשך להרחבות →
                    </button>
                </div>
            )}

        </div>
    );
}


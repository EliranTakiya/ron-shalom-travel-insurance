// "/c/Program Files (x86)/cloudflared/cloudflared.exe" tunnel --protocol http2 --url http://localhost:3000
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SearchForm from "@/components/SearchForm";
import PassengerForm from "@/components/PassengerForm";
import AddonsForm from "@/components/AddonsForm";
// import AccessibilityButton from "@/components/AccessibilityButton";
export default function Home() {
  const router = useRouter();

  const [destination, setDestination] = useState("");
  const [departure, setDeparture] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [babies, setBabies] = useState(0);

  const [adultAges, setAdultAges] = useState<(number | null)[]>([null]);
  const [childAges, setChildAges] = useState<(number | null)[]>([]);
  const [babyAges, setBabyAges] = useState<(number | null)[]>([]);

  const [addons, setAddons] = useState<string[]>([]);
  const [club, setClub] = useState("");

  const [activeTab, setActiveTab] = useState(0);
  const [destinationOpened, setDestinationOpened] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [calendarMonth, setCalendarMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [calendarOpen, setCalendarOpen] = useState(false);
  const STORAGE_KEY = "ron-shalom-trip-data";

  const [contactStatus, setContactStatus] = useState("");
  const [contactSending, setContactSending] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);

      if (!saved) return;

      const data = JSON.parse(saved);

      if (typeof data.destination === "string") {
        setDestination(data.destination);
      }

      if (typeof data.departure === "string") {
        setDeparture(data.departure);
      }

      if (typeof data.returnDate === "string") {
        setReturnDate(data.returnDate);
      }

      if (typeof data.adults === "number") {
        setAdults(data.adults);
      }

      if (typeof data.children === "number") {
        setChildren(data.children);
      }

      if (typeof data.babies === "number") {
        setBabies(data.babies);
      }

      if (Array.isArray(data.adultAges)) {
        setAdultAges(data.adultAges);
      }

      if (Array.isArray(data.childAges)) {
        setChildAges(data.childAges);
      }

      if (Array.isArray(data.babyAges)) {
        setBabyAges(data.babyAges);
      }

      if (Array.isArray(data.addons)) {
        setAddons(data.addons);
      }

      if (typeof data.club === "string") {
        setClub(data.club);
      }
    } catch (error) {
      console.error("Failed to restore trip data:", error);
    }
  }, []);

  useEffect(() => {
    try {
      const data = {
        destination,
        departure,
        returnDate,
        adults,
        children,
        babies,
        adultAges,
        childAges,
        babyAges,
        addons,
        club,
      };

      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error("Failed to save trip data:", error);
    }
  }, [
    destination,
    departure,
    returnDate,
    adults,
    children,
    babies,
    adultAges,
    childAges,
    babyAges,
    addons,
    club,
  ]);

  const resetTrip = () => {
    const confirmed = window.confirm(
      "האם אתם בטוחים שברצונכם לאפס את כל הבחירות ולהתחיל מחדש?"
    );

    if (!confirmed) return;

    sessionStorage.removeItem(STORAGE_KEY);

    setDestination("");
    setDeparture("");
    setReturnDate("");

    setAdults(1);
    setChildren(0);
    setBabies(0);

    setAdultAges([null]);
    setChildAges([]);
    setBabyAges([]);

    setAddons([]);
    setClub("");

    setActiveTab(1);
    setDestinationOpened(true);

    setCalendarOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const tabs = [
    { id: 1, title: "לאן נוסעים?", icon: "" },
    { id: 2, title: "מתי נוסעים?", icon: "" },
    { id: 3, title: "נוסעים וגילאים", icon: "" },
    { id: 4, title: "הרחבות", icon: "" },
    { id: 5, title: "כרטיסי מועדון", icon: "" },
  ];

  const destinationDone = destination !== "";

  const datesDone =
    departure !== "" &&
    returnDate !== "" &&
    returnDate >= departure;

  const passengersDone =
    adults > 0 &&
    adultAges.length === adults &&
    adultAges.every((age) => age !== null) &&
    childAges.length === children &&
    childAges.every((age) => age !== null) &&
    babyAges.length === babies &&
    babyAges.every((age) => age !== null);

  const addonsDone = addons.length > 0;
  const clubDone = club !== "";

  const isDone = (id: number) => {
    if (id === 1) return destinationDone;
    if (id === 2) return datesDone;
    if (id === 3) return passengersDone;
    if (id === 4) return addonsDone;
    if (id === 5) return clubDone;

    return false;
  };

  const handleTabClick = (id: number) => {
    setActiveTab(id);

    if (id === 1) {
      setDestinationOpened(true);

      setTimeout(() => {
        document.getElementById("destination-form")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }

    if (id === 2) {
      setCalendarOpen(false);
    }

    if (id === 3) {
      setTimeout(() => {
        document.getElementById("passenger-form")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  const scrollToHome = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    setMenuOpen(false);
  };

  const scrollToRecommendations = () => {
    document.getElementById("recommendations")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setMenuOpen(false);
  };

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setMenuOpen(false);
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (date: string) => {
    if (!date) return "";

    const [year, month, day] = date.split("-");

    return `${day}/${month}/${year}`;
  };

  const monthNames = [
    "ינואר",
    "פברואר",
    "מרץ",
    "אפריל",
    "מאי",
    "יוני",
    "יולי",
    "אוגוסט",
    "ספטמבר",
    "אוקטובר",
    "נובמבר",
    "דצמבר",
  ];

  const weekDays = [
    "א׳",
    "ב׳",
    "ג׳",
    "ד׳",
    "ה׳",
    "ו׳",
    "ש׳",
  ];

  const getCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const firstWeekDay = firstDay.getDay();

    const daysInMonth = new Date(
      year,
      month + 1,
      0
    ).getDate();

    const days: (Date | null)[] = [];

    for (let i = 0; i < firstWeekDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const previousMonth = () => {
    const newMonth = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth() - 1,
      1
    );

    const currentMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    if (newMonth >= currentMonth) {
      setCalendarMonth(newMonth);
    }
  };

  const nextMonth = () => {
    setCalendarMonth(
      new Date(
        calendarMonth.getFullYear(),
        calendarMonth.getMonth() + 1,
        1
      )
    );
  };

  const handleCalendarDateClick = (date: Date) => {
    const selectedDate = formatDate(date);

    if (!departure) {
      setDeparture(selectedDate);
      setReturnDate("");
      return;
    }

    if (departure && !returnDate) {
      if (selectedDate < departure) {
        setDeparture(selectedDate);
        setReturnDate("");
      } else {
        setReturnDate(selectedDate);
        setCalendarOpen(false);
      }

      return;
    }

    setDeparture(selectedDate);
    setReturnDate("");
  };

  const isPastDate = (date: Date) => {
    return date < today;
  };

  const isTodayDate = (date: Date) => {
    return formatDate(date) === formatDate(today);
  };

  const isDepartureDate = (date: Date) => {
    return departure === formatDate(date);
  };

  const isReturnDate = (date: Date) => {
    return returnDate === formatDate(date);
  };

  const isBetweenDates = (date: Date) => {
    if (!departure || !returnDate) return false;

    const current = formatDate(date);

    return current > departure && current < returnDate;
  };

  const getDateButtonClass = (date: Date) => {
    const past = isPastDate(date);
    const departureSelected = isDepartureDate(date);
    const returnSelected = isReturnDate(date);
    const between = isBetweenDates(date);
    const todayDate = isTodayDate(date);

    if (past) {
      return "text-gray-300 cursor-not-allowed";
    }

    if (departureSelected || returnSelected) {
      return "bg-blue-600 text-white font-bold ring-2 ring-blue-300";
    }

    if (between) {
      return "bg-blue-100 text-blue-800";
    }

    if (todayDate) {
      return "bg-cyan-100 text-blue-700 font-bold ring-2 ring-cyan-400 hover:bg-cyan-200";
    }

    return "text-gray-700 hover:bg-blue-50";
  };

  const monthDays = getCalendarDays();

  return (
    <main
      className="min-h-screen bg-slate-50"
      dir="rtl"
    >
      {/* =========================
          HEADER
      ========================= */}

      {/* <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="relative mx-auto flex max-w-6xl items-center px-4 py-0 sm:px-6 sm:py-0">

          <button
            type="button"
            onClick={scrollToHome}
            className="flex items-center gap-1"
            aria-label="חזרה לדף הבית"
          >
            <img
              src="/airplane.jpg"
              alt="סוכנות רון שלום"
              className="h-20 w-20 rounded-full object-cover"
            />

            <div className="text-2xl font-extrabold text-blue-700">
              סוכנות רון שלום
            </div>
          </button>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">

            <button
              type="button"
              onClick={scrollToHome}
              className="font-medium text-gray-700 transition hover:text-blue-700"
            >
              דף הבית
            </button>

            <button
              type="button"
              className="font-medium text-gray-700 transition hover:text-blue-700"
            >
              אודות
            </button>

            <button
              type="button"
              onClick={scrollToRecommendations}
              className="font-medium text-gray-700 transition hover:text-blue-700"
            >
              לקוחות ממליצים
            </button>

            <button
              type="button"
              onClick={scrollToContact}
              className="font-medium text-gray-700 transition hover:text-blue-700"
            >
              צור קשר
            </button>

          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="mr-auto rounded-lg p-2 text-3xl text-gray-700 hover:bg-gray-100 md:hidden"
            aria-label="פתיחת תפריט"
          >
            {menuOpen ? "✕" : "☰"}
          </button>

        </div>

        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out md:hidden ${menuOpen
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0"
            }`}
        >
          <nav className="border-t bg-white">

            <button
              type="button"
              onClick={scrollToHome}
              className="w-full border-b px-6 py-4 text-right font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
            >
              דף הבית
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="w-full border-b px-6 py-4 text-right font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
            >
              אודות
            </button>

            <button
              type="button"
              onClick={scrollToRecommendations}
              className="w-full border-b px-6 py-4 text-right font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
            >
              לקוחות ממליצים
            </button>

            <button
              type="button"
              onClick={scrollToContact}
              className="w-full px-6 py-4 text-right font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
            >
              צור קשר
            </button>

          </nav>
        </div>
      </header> */}

      {/* =========================
          HERO
      ========================= */}

      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 py-16 text-white">

        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 text-center">

          <div className="mb-5 inline-flex items-center rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-blue-100 backdrop-blur">
            ✈️ השוואה חכמה לביטוחי נסיעות
          </div>

          <h1 className="font-sans text-5xl font-black leading-tight tracking-tight sm:text-6xl">
            השוואת מחירי ביטוח
            <span className="block text-cyan-300">
              נסיעות לחו״ל
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-blue-100 sm:text-xl">
            השוו בין החברות המובילות בישראל וקבלו את הביטוח המתאים ביותר לנסיעה שלכם
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">

            <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur">
              ✓ השוואת מחירים
            </span>

            <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur">
              ✓ מגוון הרחבות
            </span>

            <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur">
              ✓ חברות הביטוח המובילות
            </span>

          </div>

        </div>
      </section>

      {/* =========================
          פרטי הנסיעה
      ========================= */}

      <section className="mx-auto max-w-5xl px-6 py-10">

        <div className="mb-5 text-center">

          <h2 className="text-2xl font-bold text-gray-900">
            פרטי הנסיעה
          </h2>

          {/* <button
  type="button"
  onClick={resetTrip}
  className="mt-4 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-600 shadow-sm transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
>
  ↺ איפוס בחירות והתחלה מחדש
</button> */}

          <p className="mt-2 text-gray-500">
            מלאו את הפרטים ונמצא עבורכם את הביטוח המתאים
          </p>

        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-xl">

          {/* לשוניות */}

          <div
            id="trip-tabs"
            className="grid grid-cols-2 gap-2 bg-slate-100 p-2 md:grid-cols-5"
          >

            {tabs.map((tab) => {

              const active = activeTab === tab.id;
              const done = isDone(tab.id);

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id)}
                  className={`relative flex min-h-[90px] flex-col items-center justify-center rounded-xl border p-3 transition-all duration-200 active:scale-[0.98] ${active
                    ? "border-blue-600 bg-blue-600 text-white shadow-lg"
                    : "border-gray-200 bg-white text-gray-600 shadow-sm hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md"
                    }`}
                >

                  <div className="flex items-center gap-2">

                    <span className="text-xl">
                      {tab.icon}
                    </span>

                    {done && (
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${active
                          ? "bg-white text-green-600"
                          : "bg-green-500 text-white"
                          }`}
                      >
                        ✓
                      </span>
                    )}

                  </div>

                  <span className="mt-2 text-sm font-bold">
                    {tab.title}
                  </span>

                  {active && (
                    <span className="pointer-events-none absolute bottom-0 left-4 right-4 h-1 rounded-full bg-cyan-300" />
                  )}

                </button>
              );
            })}

          </div>

          <div className="flex justify-start px-5 pt-4 md:px-6">
            <button
              type="button"
              onClick={resetTrip}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-500 shadow-sm transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            >
              ↺ איפוס בחירות
            </button>
          </div>

          <div className="p-5 md:p-6">

            {/* יעד */}

            {activeTab === 1 && destinationOpened && (
              <div id="destination-form" className="scroll-mt-24">

                <SearchForm
                  destination={destination}
                  setDestination={setDestination}
                  onContinue={() => {
                    setActiveTab(2);

                    setTimeout(() => {
                      document.getElementById("trip-tabs")?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }, 50);
                  }}
                />

              </div>
            )}

            {/* תאריכים */}

            {activeTab === 2 && (
              <div>

                <h3 className="text-xl font-bold text-gray-900">
                  מתי אתם נוסעים?
                </h3>

                <p className="mt-2 text-gray-500">
                  בחרו תאריך יציאה ותאריך חזרה באותו תאריכון
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">

                  {/* תאריך יציאה */}

                  <button
                    type="button"
                    onClick={() => {
                      setCalendarOpen(true);

                      setTimeout(() => {
                        document.getElementById("trip-calendar")?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }, 100);
                    }}
                    className={`rounded-xl border-2 p-4 text-right transition ${departure
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-blue-400"
                      }`}
                  >

                    <div className="text-sm font-medium text-gray-500">
                      תאריך יציאה
                    </div>

                    <div className="mt-1 font-bold text-gray-900">
                      {departure
                        ? formatDateDisplay(departure)
                        : "בחרו תאריך"}
                    </div>

                  </button>

                  {/* תאריך חזרה */}

                  <button
                    type="button"
                    onClick={() => {
                      setCalendarOpen(true);

                      setTimeout(() => {
                        document.getElementById("trip-calendar")?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }, 100);
                    }}
                    className={`rounded-xl border-2 p-4 text-right transition ${returnDate
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-blue-400"
                      }`}
                  >

                    <div className="text-sm font-medium text-gray-500">
                      תאריך חזרה
                    </div>

                    <div className="mt-1 font-bold text-gray-900">
                      {returnDate
                        ? formatDateDisplay(returnDate)
                        : departure
                          ? "בחרו תאריך חזרה"
                          : "בחרו תאריך"}
                    </div>

                  </button>

                </div>

                {/* תאריכון */}

                {calendarOpen && (
                  <div
                    id="trip-calendar"
                    className="mx-auto mt-6 max-w-md scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl"
                  >

                    <div className="mb-4 flex items-center justify-between">

                      <button
                        type="button"
                        onClick={nextMonth}
                        className="rounded-lg px-3 py-2 text-xl text-gray-600 hover:bg-gray-100"
                      >
                        ←
                      </button>

                      <div className="text-lg font-bold text-gray-900">
                        {monthNames[calendarMonth.getMonth()]}{" "}
                        {calendarMonth.getFullYear()}
                      </div>

                      <button
                        type="button"
                        onClick={previousMonth}
                        className="rounded-lg px-3 py-2 text-xl text-gray-600 hover:bg-gray-100"
                      >
                        →
                      </button>

                    </div>

                    <div className="mb-4 rounded-xl bg-blue-50 p-3 text-center text-sm text-blue-800">

                      {!departure && (
                        <span>
                          בחרו קודם את תאריך היציאה
                        </span>
                      )}

                      {departure && !returnDate && (
                        <span>
                          עכשיו בחרו את תאריך החזרה
                        </span>
                      )}

                      {departure && returnDate && (
                        <span>
                          הנסיעה נבחרה בהצלחה ✓
                        </span>
                      )}

                    </div>

                    <div className="mb-2 grid grid-cols-7">

                      {weekDays.map((day) => (
                        <div
                          key={day}
                          className="py-2 text-center text-sm font-bold text-gray-400"
                        >
                          {day}
                        </div>
                      ))}

                    </div>

                    <div className="grid grid-cols-7 gap-1">

                      {monthDays.map((date, index) => {

                        if (!date) {
                          return (
                            <div
                              key={`empty-${index}`}
                              className="h-10"
                            />
                          );
                        }

                        const disabled = isPastDate(date);

                        return (
                          <button
                            key={formatDate(date)}
                            type="button"
                            disabled={disabled}
                            onClick={() =>
                              handleCalendarDateClick(date)
                            }
                            className={`flex h-10 w-full items-center justify-center rounded-lg text-sm transition ${getDateButtonClass(
                              date
                            )}`}
                          >
                            {date.getDate()}
                          </button>
                        );
                      })}

                    </div>

                    <button
                      type="button"
                      onClick={() => setCalendarOpen(false)}
                      className="mt-4 w-full rounded-xl border border-gray-200 py-3 font-medium text-gray-600 hover:bg-gray-50"
                    >
                      סגור
                    </button>

                  </div>
                )}

                {departure && returnDate && (
                  <div className="mt-5 rounded-xl bg-green-50 p-4 text-center">

                    <div className="font-bold text-green-700">
                      ✓ תאריכי הנסיעה נבחרו
                    </div>

                    <div className="mt-1 text-sm text-green-600">
                      {formatDateDisplay(departure)}
                      {" "}
                      עד
                      {" "}
                      {formatDateDisplay(returnDate)}
                    </div>

                  </div>
                )}

                {datesDone && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab(3);

                      setTimeout(() => {
                        document.getElementById("passenger-form")?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }, 100);
                    }}
                    className="mt-6 w-full rounded-xl bg-green-500 py-4 text-lg font-bold text-white transition hover:bg-green-600"
                  >
                    המשך לנוסעים →
                  </button>
                )}

              </div>
            )}

            {/* נוסעים */}

            {activeTab === 3 && (
              <div
                id="passenger-form"
                className="scroll-mt-24"
              >
                <PassengerForm
                  adults={adults}
                  setAdults={setAdults}
                  children={children}
                  setChildren={setChildren}
                  babies={babies}
                  setBabies={setBabies}
                  adultAges={adultAges}
                  setAdultAges={setAdultAges}
                  childAges={childAges}
                  setChildAges={setChildAges}
                  babyAges={babyAges}
                  setBabyAges={setBabyAges}
                  onContinue={() => {
                    setActiveTab(4);

                    setTimeout(() => {
                      document.getElementById("addons-form")?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }, 100);
                  }}
                />
              </div>
            )}

            {/* הרחבות */}

            {activeTab === 4 && (
              <div
                id="addons-form"
                className="scroll-mt-24"
              >
                <AddonsForm
                  addons={addons}
                  setAddons={setAddons}
                  destination={destination}
                  departure={departure}
                  returnDate={returnDate}
                  adults={adults}
                  children={children}
                  babies={babies}
                  adultAges={adultAges}
                  childAges={childAges}
                  babyAges={babyAges}
                  onClubMember={() => {
                    setActiveTab(5);

                    setTimeout(() => {
                      document.getElementById("club-member")?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }, 100);
                  }}
                />
              </div>
            )}

            {/* כרטיסי מועדון */}

            {activeTab === 5 && (
              <div id="club-member" className="scroll-mt-24">

                <h3 className="text-xl font-bold text-gray-900">
                  כרטיסי מועדון
                </h3>

                <p className="mt-2 text-gray-500">
                  יש לכם כרטיס מועדון? ייתכן שמגיעה לכם הנחה
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">

                  <button
                    type="button"
                    onClick={() => setClub("none")}
                    className={`rounded-xl border-2 p-4 text-right font-bold transition ${club === "none"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-blue-400"
                      }`}
                  >

                    <div className="flex items-center justify-between">

                      <span>
                        אין לי כרטיס מועדון
                      </span>

                      {club === "none" && (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-sm text-white">
                          ✓
                        </span>
                      )}

                    </div>

                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (club === "has-club") {
                        setClub("");
                      } else {
                        setClub("has-club");
                      }
                    }}
                    className={`rounded-xl border-2 p-4 text-right font-bold transition ${club !== "" && club !== "none"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-blue-400"
                      }`}
                  >

                    <div className="flex items-center justify-between">

                      <span>
                        יש לי כרטיס מועדון
                      </span>

                      {club !== "" && club !== "none" && (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-sm text-white">
                          ✓
                        </span>
                      )}

                    </div>

                  </button>

                </div>

                {(
                  club === "has-club" ||
                  [
                    "ישראכרט",
                    "פיס פלוס",
                    "חבר",
                    "ביחד בשבילך",
                    "ארגון המורים",
                    "משרד הביטחון",
                    "ההסתדרות",
                  ].includes(club)
                ) && (
                    <div className="mt-5">

                      <label className="mb-2 block font-medium text-gray-700">
                        בחרו את כרטיס המועדון
                      </label>

                      <select
                        value={
                          [
                            "ישראכרט",
                            "פיס פלוס",
                            "חבר",
                            "ביחד בשבילך",
                            "ארגון המורים",
                            "משרד הביטחון",
                            "ההסתדרות",
                          ].includes(club)
                            ? club
                            : ""
                        }
                        onChange={(e) => setClub(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white p-4 font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >

                        <option value="">
                          בחרו כרטיס מועדון...
                        </option>

                        <option value="ישראכרט">
                          ישראכרט
                        </option>

                        <option value="פיס פלוס">
                          פיס פלוס
                        </option>

                        <option value="חבר">
                          חבר
                        </option>

                        <option value="ביחד בשבילך">
                          ביחד בשבילך
                        </option>

                        <option value="ארגון המורים">
                          ארגון המורים
                        </option>

                        <option value="משרד הביטחון">
                          משרד הביטחון
                        </option>

                        <option value="ההסתדרות">
                          ההסתדרות
                        </option>

                      </select>

                    </div>
                  )}

                {club !== "" && (
                  <button
                    type="button"
                    onClick={() => {

                      const params = new URLSearchParams({
                        destination,
                        departure,
                        returnDate,

                        adults: adults.toString(),
                        children: children.toString(),
                        babies: babies.toString(),

                        adultAges: adultAges
                          .map((age) => age?.toString() ?? "")
                          .join(","),

                        childAges: childAges
                          .map((age) => age?.toString() ?? "")
                          .join(","),

                        babyAges: babyAges
                          .map((age) => age?.toString() ?? "")
                          .join(","),

                        addons: addons.join(","),
                      });

                      router.push(
                        `/results/?${params.toString()}`
                      );
                    }}
                    className="mt-6 w-full rounded-xl bg-green-600 py-4 text-lg font-bold text-white hover:bg-green-700"
                  >
                    הצג הצעות ביטוח
                  </button>
                )}

              </div>
            )}

          </div>
        </div>
      </section>

      {/* ================= אודות ================= */}
      <section
        id="about"
        className="mx-auto mt-16 w-full max-w-6xl scroll-mt-24 px-4 pb-8"
      >
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
          <div className="grid md:grid-cols-2">

            {/* תמונה */}
            <div className="relative min-h-[320px] overflow-hidden md:min-h-[500px]">
              <img
                src="/airplane.jpg"
                alt="סוכנות רון שלום - ביטוח נסיעות לחו״ל"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              <div className="absolute bottom-0 right-0 left-0 p-8 text-white md:p-10">
                <div className="mb-3 inline-block rounded-full bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur">
                  ✈️ נוסעים בראש שקט
                </div>

                <h3 className="text-3xl font-extrabold leading-tight md:text-4xl">
                  הביטוח שלכם,
                  <br />
                  השקט הנפשי שלנו
                </h3>
              </div>
            </div>

            {/* תוכן */}
            <div className="flex flex-col justify-center p-7 md:p-10 lg:p-12">

              <div className="mb-3 text-sm font-bold text-blue-600">
                אודות סוכנות רון שלום
              </div>

              <h2 className="text-3xl font-extrabold leading-tight text-gray-900 md:text-4xl">
                הדרך החכמה לבחור
                <br />
                ביטוח נסיעות לחו״ל
              </h2>

              <p className="mt-5 text-base leading-8 text-gray-600 md:text-lg">
                אנחנו מאמינים שביטוח נסיעות לחו״ל צריך להיות פשוט, ברור
                ומתאים באמת לצרכים שלכם.
              </p>

              <p className="mt-3 text-base leading-8 text-gray-600">
                באמצעות המערכת שלנו תוכלו להשוות בין אפשרויות ביטוח שונות,
                לבחון את הכיסויים הרלוונטיים עבורכם ולקבל החלטה מושכלת
                לפני הנסיעה.
              </p>

              {/* יתרונות */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2">

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 transition hover:-translate-y-1 hover:shadow-md">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                    🔎
                  </div>

                  <h3 className="font-bold text-gray-900">
                    השוואה פשוטה
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    לראות את האפשרויות במקום אחד ולבחור את הביטוח שמתאים לכם.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 transition hover:-translate-y-1 hover:shadow-md">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-2xl">
                    🛡️
                  </div>

                  <h3 className="font-bold text-gray-900">
                    כיסויים מותאמים
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    לבחור את ההרחבות והכיסויים הרלוונטיים בהתאם לאופי הנסיעה.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 transition hover:-translate-y-1 hover:shadow-md">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-2xl">
                    👨‍💼
                  </div>

                  <h3 className="font-bold text-gray-900">
                    שירות אישי
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    סוכנות ביטוח שמלווה אתכם ומעמידה את השירות במרכז.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 transition hover:-translate-y-1 hover:shadow-md">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-2xl">
                    ✈️
                  </div>

                  <h3 className="font-bold text-gray-900">
                    נוסעים בראש שקט
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    מתחילים את החופשה בידיעה שבחרתם ביטוח שמתאים לנסיעה שלכם.
                  </p>
                </div>

              </div>

              {/* כפתור */}
              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => {
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  className="rounded-xl bg-blue-600 px-7 py-3.5 text-base font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl"
                >
                  להשוואת ביטוח נסיעות ✈️
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>
      {/* =========================
          לקוחות ממליצים
      ========================= */}

      <section
        id="recommendations"
        className="mx-auto mt-12 w-full max-w-6xl scroll-mt-24 px-4 pb-12"
      >

        <div className="mb-8 text-center">

          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            לקוחות ממליצים
          </h2>

          <p className="mt-3 text-gray-500">
            אלפי לקוחות כבר בחרו בנו לביטוח הנסיעות שלהם
          </p>

        </div>

        <div className="grid gap-6 md:grid-cols-3">

          <div className="rounded-2xl bg-white p-6 text-right shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl">

            <div className="flex items-center justify-between">

              <div className="text-lg tracking-wide">
                ⭐⭐⭐⭐⭐
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                א
              </div>

            </div>

            <p className="mt-5 leading-7 text-gray-600">
              "השירות היה פשוט מעולה. הצלחתי להשוות בין האפשרויות
              בקלות ולמצוא ביטוח שמתאים בדיוק לנסיעה שלי."
            </p>

            <div className="mt-5 border-t border-gray-100 pt-4">

              <div className="font-bold text-gray-900">
                אבי כהן
              </div>

              <div className="mt-1 text-sm text-gray-500">
                לקוח מרוצה
              </div>

            </div>

          </div>

          <div className="rounded-2xl bg-white p-6 text-right shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl">

            <div className="flex items-center justify-between">

              <div className="text-lg tracking-wide">
                ⭐⭐⭐⭐⭐
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">
                מ
              </div>

            </div>

            <p className="mt-5 leading-7 text-gray-600">
              "חסכתי הרבה זמן וכסף. הכל היה ברור, מהיר ונוח,
              והכי חשוב – לא הייתי צריך להתעסק עם הרבה אתרים שונים."
            </p>

            <div className="mt-5 border-t border-gray-100 pt-4">

              <div className="font-bold text-gray-900">
                מיכל לוי
              </div>

              <div className="mt-1 text-sm text-gray-500">
                לקוחה מרוצה
              </div>

            </div>

          </div>

          <div className="rounded-2xl bg-white p-6 text-right shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl">

            <div className="flex items-center justify-between">

              <div className="text-lg tracking-wide">
                ⭐⭐⭐⭐⭐
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-700">
                ד
              </div>

            </div>

            <p className="mt-5 leading-7 text-gray-600">
              "אתר נוח מאוד והכל מסודר בצורה ברורה. תוך כמה דקות
              כבר ידעתי איזה ביטוח מתאים לי. ממליץ בחום!"
            </p>

            <div className="mt-5 border-t border-gray-100 pt-4">

              <div className="font-bold text-gray-900">
                דניאל ישראלי
              </div>

              <div className="mt-1 text-sm text-gray-500">
                לקוח מרוצה
              </div>

            </div>

          </div>

        </div>

        <div className="mx-auto mt-8 max-w-md rounded-2xl bg-blue-50 px-6 py-5 text-center">

          <div className="text-2xl font-bold text-blue-900">
            ⭐ 4.9 מתוך 5
          </div>

          <p className="mt-1 text-sm text-blue-700">
            שביעות רצון גבוהה של לקוחותינו
          </p>

        </div>

      </section>

      {/* ================= שאלות נפוצות ================= */}
      <section
        id="faq"
        className="mx-auto mt-16 w-full max-w-5xl scroll-mt-24 px-4 pb-8"
      >
        <div className="text-center">
          <div className="mb-3 text-sm font-bold text-blue-600">
            שאלות ותשובות
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl">
            שאלות נפוצות
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600">
            ריכזנו עבורכם תשובות לשאלות הנפוצות ביותר בנושא ביטוח נסיעות לחו״ל.
          </p>
        </div>

        <div className="mt-10 space-y-4">

          <details className="group rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-bold text-gray-900 md:p-6">
              <span>מה כולל ביטוח נסיעות לחו״ל?</span>

              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xl text-blue-600 transition-transform duration-200 group-open:rotate-45">
                +
              </span>
            </summary>

            <div className="border-t border-gray-100 px-5 pb-6 pt-4 text-sm leading-7 text-gray-600 md:px-6">
              ביטוח נסיעות לחו״ל יכול לכלול כיסויים שונים בהתאם לתוכנית ולחברת
              הביטוח, כגון הוצאות רפואיות, כבודה, ביטול או קיצור נסיעה והרחבות
              נוספות. מומלץ לבדוק את תנאי הפוליסה והכיסויים לפני הרכישה.
            </div>
          </details>

          <details className="group rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-bold text-gray-900 md:p-6">
              <span>האם כל נוסע צריך ביטוח?</span>

              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xl text-blue-600 transition-transform duration-200 group-open:rotate-45">
                +
              </span>
            </summary>

            <div className="border-t border-gray-100 px-5 pb-6 pt-4 text-sm leading-7 text-gray-600 md:px-6">
              מומלץ להתאים את הביטוח לכל אחד מהנוסעים בהתאם לגילו, מצבו ולצרכים
              שלו. בעת מילוי הטופס באתר ניתן להזין את מספר הנוסעים ואת גיליהם.
            </div>
          </details>

          <details className="group rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-bold text-gray-900 md:p-6">
              <span>האם אפשר להוסיף הרחבות לביטוח?</span>

              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xl text-blue-600 transition-transform duration-200 group-open:rotate-45">
                +
              </span>
            </summary>

            <div className="border-t border-gray-100 px-5 pb-6 pt-4 text-sm leading-7 text-gray-600 md:px-6">
              כן. בהתאם לתוכנית הביטוח ולחברה ניתן לבחור הרחבות שונות, כגון כבודה,
              הריון, ספורט אתגרי, סקי, מצב רפואי קיים וביטול או קיצור נסיעה.
            </div>
          </details>

          <details className="group rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-bold text-gray-900 md:p-6">
              <span>מה עושים במקרה חירום רפואי בחו״ל?</span>

              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xl text-blue-600 transition-transform duration-200 group-open:rotate-45">
                +
              </span>
            </summary>

            <div className="border-t border-gray-100 px-5 pb-6 pt-4 text-sm leading-7 text-gray-600 md:px-6">
              במקרה חירום יש לפנות לקבלת טיפול רפואי בהתאם למצב ולפעול לפי
              ההנחיות של חברת הביטוח. חשוב לשמור מסמכים, סיכומים רפואיים וקבלות
              הקשורים לטיפול.
            </div>
          </details>

          <details className="group rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-bold text-gray-900 md:p-6">
              <span>האם אפשר לבטח מצב רפואי קיים?</span>

              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xl text-blue-600 transition-transform duration-200 group-open:rotate-45">
                +
              </span>
            </summary>

            <div className="border-t border-gray-100 px-5 pb-6 pt-4 text-sm leading-7 text-gray-600 md:px-6">
              בחלק מתוכניות הביטוח קיימת אפשרות להרחבה עבור מצב רפואי קיים,
              בכפוף לתנאי חברת הביטוח, להצהרה הרפואית ולתנאי הפוליסה.
            </div>
          </details>

          <details className="group rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-bold text-gray-900 md:p-6">
              <span>מתי כדאי לרכוש ביטוח נסיעות?</span>

              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xl text-blue-600 transition-transform duration-200 group-open:rotate-45">
                +
              </span>
            </summary>

            <div className="border-t border-gray-100 px-5 pb-6 pt-4 text-sm leading-7 text-gray-600 md:px-6">
              מומלץ להסדיר את ביטוח הנסיעות לפני היציאה מהארץ ולוודא שתאריכי
              הביטוח תואמים את תקופת הנסיעה המתוכננת.
            </div>
          </details>

          <details className="group rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-bold text-gray-900 md:p-6">
              <span>האם אפשר לבטח ילדים ותינוקות?</span>

              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xl text-blue-600 transition-transform duration-200 group-open:rotate-45">
                +
              </span>
            </summary>

            <div className="border-t border-gray-100 px-5 pb-6 pt-4 text-sm leading-7 text-gray-600 md:px-6">
              כן. ניתן להזין באתר את מספר המבוגרים, הילדים והתינוקות ולבחון את
              אפשרויות הביטוח בהתאם לגיל ולתנאי התוכנית.
            </div>
          </details>

          <details className="group rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-bold text-gray-900 md:p-6">
              <span>איך בוחרים את הביטוח המתאים לי?</span>

              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xl text-blue-600 transition-transform duration-200 group-open:rotate-45">
                +
              </span>
            </summary>

            <div className="border-t border-gray-100 px-5 pb-6 pt-4 text-sm leading-7 text-gray-600 md:px-6">
              מתחילים בהזנת פרטי הנסיעה, הנוסעים וההרחבות הרצויות. לאחר מכן ניתן
              להשוות בין האפשרויות המוצגות ולבחור את התוכנית המתאימה לכם בהתאם
              לכיסויים, למחיר ולתנאי הפוליסה.
            </div>
          </details>

        </div>
      </section>
      {/* =========================
          צור קשר
      ========================= */}

      <section
        id="contact"
        className="mx-auto mt-4 w-full max-w-6xl scroll-mt-24 px-4 pb-16"
      >
        <div className="overflow-hidden rounded-3xl bg-cyan-100 shadow-xl">

          {/* כותרת */}
          <div className="px-6 pt-8 text-center md:px-10 md:pt-10">
            <div className="mb-3 text-sm font-bold text-cyan-700">
              אנחנו כאן בשבילכם
            </div>

            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              צור קשר
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-gray-600">
              לסגירת ביטוח דרך נציג או לכל שאלה בנושא ביטוח נסיעות,
              השאירו פרטים ונחזור אליכם.
            </p>
          </div>

          <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch">

            {/* פרטי קשר */}
            <div className="flex h-full flex-col">

              <h3 className="text-2xl font-bold text-gray-900">
                צריכים עזרה?
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                רוצים להתייעץ לפני הנסיעה או לקבל עזרה בבחירת הביטוח?
                אנחנו כאן כדי לעזור.
              </p>

              <div className="mt-7 space-y-4">

                {/* טלפון */}
                <a
                  href="tel:0544601269"
                  className="flex cursor-pointer items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-2xl">
                    📞
                  </div>

                  <div>
                    <div className="text-sm text-gray-500">
                      התקשרו אלינו
                    </div>

                    <div className="font-bold text-gray-900">
                      054-4601269
                    </div>
                  </div>
                </a>

                {/* אימייל */}
                <a
                  href="mailto:ronshalom.jr@gmail.com"
                  className="flex cursor-pointer items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                    ✉️
                  </div>

                  <div>
                    <div className="text-sm text-gray-500">
                      אימייל
                    </div>

                    <div className="font-bold text-gray-900">
                      ronshalom.jr@gmail.com
                    </div>
                  </div>
                </a>

              </div>

              <div className="mt-7 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/80 p-4 text-center shadow-sm">
                  <div className="text-2xl">🛡️</div>
                  <div className="mt-2 text-sm font-bold text-gray-800">
                    שירות אישי
                  </div>
                </div>

                <div className="rounded-2xl bg-white/80 p-4 text-center shadow-sm">
                  <div className="text-2xl">⚡</div>
                  <div className="mt-2 text-sm font-bold text-gray-800">
                    מענה מהיר
                  </div>
                </div>

                <div className="rounded-2xl bg-white/80 p-4 text-center shadow-sm">
                  <div className="text-2xl">✈️</div>
                  <div className="mt-2 text-sm font-bold text-gray-800">
                    נוסעים בראש שקט
                  </div>
                </div>
              </div>
              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/972544601269"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-green-600 hover:shadow-xl lg:mt-auto lg:mb-8"
              >
                💬 דברו איתנו ב־WhatsApp
              </a>

            </div>

            {/* טופס */}
            <div className="rounded-3xl bg-white p-6 shadow-md md:p-8">

              <h3 className="text-xl font-bold text-gray-900">
                השאירו פרטים
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                מלאו את הפרטים ונציג יחזור אליכם.
              </p>


              <form
                className="mt-6"
                onSubmit={async (e) => {
                  e.preventDefault();

                  const form = e.currentTarget;
                  const formData = new FormData(form);

                  const name = String(formData.get("name") || "").trim();
                  const phone = String(formData.get("phone") || "").trim();
                  const message = String(formData.get("message") || "").trim();
                  const privacy = formData.get("privacy");

                  if (!name || !phone || !message) {
                    setContactStatus("נא למלא את כל השדות.");
                    return;
                  }

                  if (!privacy) {
                    setContactStatus("יש לאשר את מדיניות הפרטיות.");
                    return;
                  }

                  setContactSending(true);
                  setContactStatus("");

                  try {
                    const response = await fetch("/api/contact", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        name,
                        phone,
                        message,
                      }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                      throw new Error(data.error || "אירעה שגיאה בשליחה");
                    }

                    setContactStatus("ההודעה נשלחה בהצלחה! נחזור אליכם בהקדם.");
                    form.reset();

                    window.alert("✅ ההודעה נשלחה בהצלחה!\nנחזור אליכם בהקדם.");
                  } catch (error) {
                    console.error(error);
                    setContactStatus(
                      "אירעה שגיאה בשליחת ההודעה. נסו שוב בעוד רגע."
                    );
                  } finally {
                    setContactSending(false);
                  }
                }}
              >
                <div className="grid gap-5 md:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-right font-medium text-gray-700">
                      שם מלא
                    </label>

                    <input
                      type="text"
                      name="name"
                      placeholder="הקלידו שם מלא"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-right outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-right font-medium text-gray-700">
                      טלפון
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      placeholder="050-0000000"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-right outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>

                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-right font-medium text-gray-700">
                    הודעה
                  </label>

                  <textarea
                    rows={5}
                    name="message"
                    placeholder="כתבו לנו הודעה..."
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-right outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
                  />
                </div>

                <div className="mt-5 w-full text-right">

                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700">

                    <input
                      type="checkbox"
                      name="privacy"
                      className="h-4 w-4 cursor-pointer accent-cyan-500"
                    />

                    <span>
                      אני מסכים/ה ל{" "}

                      <a
                        href="/privacy"
                        className="font-medium text-cyan-700 hover:underline"
                      >
                        מדיניות הפרטיות
                      </a>

                      {" "}של האתר
                    </span>

                  </label>

                </div>

                <button
                  type="submit"
                  disabled={contactSending}
                  className="mt-6 w-full cursor-pointer rounded-xl bg-cyan-600 py-4 text-lg font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {contactSending ? "שולח..." : "שליחה"}
                </button>

                {contactStatus && (
                  <div className="mt-4 rounded-xl bg-cyan-50 px-4 py-3 text-center text-sm font-medium text-cyan-800">
                    {contactStatus}
                  </div>
                )}

              </form>



            </div>

          </div>
        </div>
      </section>

      {/* =========================
          למה לבחור בסוכנות רון שלום
      ========================= */}

      <section className="mx-auto w-full max-w-6xl px-4 pb-20">

        <div className="rounded-3xl bg-white px-6 py-12 shadow-xl md:px-10">

          <div className="mb-10 text-center">

            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              למה לבחור דווקא בסוכנות רון שלום?
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-gray-500">
              אנחנו כאן כדי להפוך את תהליך בחירת ביטוח הנסיעות
              לפשוט, מהיר ונוח יותר
            </p>

          </div>

          <div className="grid gap-6 md:grid-cols-3">

            <div className="group rounded-2xl border border-gray-100 bg-slate-50 p-7 text-center transition duration-300 hover:-translate-y-2 hover:shadow-xl">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-4xl shadow-sm transition duration-300 group-hover:scale-110">
                🏢
              </div>

              <h3 className="mt-6 text-xl font-bold text-gray-900">
                השוואה מהירה
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                השוואה מהירה בין חברות הביטוח המובילות בישראל,
                כדי שתוכלו לראות את האפשרויות שלכם ולבחור
                את הביטוח שמתאים לכם ביותר.
              </p>

            </div>

            <div className="group rounded-2xl border border-gray-100 bg-slate-50 p-7 text-center transition duration-300 hover:-translate-y-2 hover:shadow-xl">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl shadow-sm transition duration-300 group-hover:scale-110">
                ⚡
              </div>

              <h3 className="mt-6 text-xl font-bold text-gray-900">
                סוגרים ביטוח בקליק
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                בלי טפסים מסובכים ובלי לבזבז זמן.
                בוחרים את הביטוח המתאים לכם ומתקדמים
                במהירות ובקלות עד לסגירת הביטוח.
              </p>

            </div>

            <div className="group rounded-2xl border border-gray-100 bg-slate-50 p-7 text-center transition duration-300 hover:-translate-y-2 hover:shadow-xl">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 text-4xl shadow-sm transition duration-300 group-hover:scale-110">
                📞
              </div>

              <h3 className="mt-6 text-xl font-bold text-gray-900">
                זמינות לכל אורך הדרך
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                אנחנו כאן בשבילכם גם לפני הנסיעה וגם במהלכה.
                ניתן לפנות אלינו לקבלת עזרה, מידע וליווי
                בכל שלב בדרך.
              </p>

            </div>

          </div>

        </div>

      </section>
      {/* <AccessibilityButton /> */}
    </main>
  );
}


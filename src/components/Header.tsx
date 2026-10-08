
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTripButton, setShowTripButton] = useState(false);

  useEffect(() => {
    const updateTripButtonVisibility = () => {
      setShowTripButton(window.scrollY > 160);
    };

    updateTripButtonVisibility();
    window.addEventListener("scroll", updateTripButtonVisibility, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", updateTripButtonVisibility);
    };
  }, []);

  const goHome = () => {
    setMenuOpen(false);

    if (pathname === "/") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    router.push("/");
  };

  const goToSection = (id: string) => {
    setMenuOpen(false);

    if (pathname === "/") {
      const element = document.getElementById(id);

      if (!element) return;

      const header = document.querySelector("header");
      const headerHeight =
        header?.getBoundingClientRect().height || 0;

      const elementTop =
        element.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: elementTop - headerHeight - 10,
        behavior: "smooth",
      });

      return;
    }

    router.push(`/#${id}`);
  };

  const goToDestinationTab = () => {
    setMenuOpen(false);

    if (pathname === "/") {
      const destinationTab = document.querySelector<HTMLButtonElement>(
        "#trip-tabs button"
      );
      const tabs = document.getElementById("trip-tabs");

      if (!destinationTab || !tabs) return;

      destinationTab.click();

      window.setTimeout(() => {
        const headerHeight =
          document.querySelector("header")?.getBoundingClientRect().height || 0;
        const ctaOffset = showTripButton ? 52 : 0;
        const tabsTop = tabs.getBoundingClientRect().top + window.scrollY;

        window.scrollTo({
          top: tabsTop - headerHeight - ctaOffset - 12,
          behavior: "smooth",
        });
      }, 140);
      return;
    }

    router.push("/#trip-tabs");
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="relative mx-auto flex max-w-6xl items-center px-4 py-0 sm:px-6 sm:py-0">
        <button
          type="button"
          onClick={goHome}
          className="flex items-center gap-1 min-[1366px]:translate-x-[5.5rem]"
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

        {/* Desktop menu */}
        <nav className="mr-auto hidden shrink-0 items-center gap-5 whitespace-nowrap text-[1.125rem] min-[1366px]:absolute min-[1366px]:left-[calc(50%+19.25rem-25vw)] min-[1366px]:mr-0 min-[1366px]:w-[52rem] min-[1366px]:justify-between min-[1366px]:gap-3 min-[1366px]:-translate-x-1/2 min-[1366px]:flex">
          <button
            type="button"
            onClick={goHome}
            className="cursor-pointer font-medium text-gray-700 transition hover:text-blue-700"
          >
            דף הבית
          </button>
          <span aria-hidden="true" className="hidden h-4 w-px shrink-0 bg-slate-300 min-[1366px]:block" />

          <button
            type="button"
            onClick={() => goToSection("about")}
            className="cursor-pointer font-medium text-gray-700 transition hover:text-blue-700"
          >
            אודות
          </button>
          <span aria-hidden="true" className="hidden h-4 w-px shrink-0 bg-slate-300 min-[1366px]:block" />

          <button
            type="button"
            onClick={() => goToSection("recommendations")}
            className="cursor-pointer font-medium text-gray-700 transition hover:text-blue-700"
          >
            לקוחות ממליצים
          </button>
          <span aria-hidden="true" className="hidden h-4 w-px shrink-0 bg-slate-300 min-[1366px]:block" />

          <button
            type="button"
            onClick={() => goToSection("faq")}
            className="cursor-pointer font-medium text-gray-700 transition hover:text-blue-700"
          >
            שאלות נפוצות
          </button>
          <span aria-hidden="true" className="hidden h-4 w-px shrink-0 bg-slate-300 min-[1366px]:block" />

          <button
            type="button"
            onClick={() => goToSection("contact")}
            className="cursor-pointer whitespace-nowrap font-medium text-gray-700 transition hover:text-blue-700"
          >
            שירות תביעות 24/7
          </button>
          <span aria-hidden="true" className="hidden h-4 w-px shrink-0 bg-slate-300 min-[1366px]:block" />

          <span className="whitespace-nowrap font-medium text-gray-500">
            תכנית שיווק שותפים
          </span>
          <span aria-hidden="true" className="hidden h-4 w-px shrink-0 bg-slate-300 min-[1366px]:block" />

          <button
            type="button"
            onClick={() => goToSection("contact")}
            className="cursor-pointer font-medium text-gray-700 transition hover:text-blue-700"
          >
            צור קשר
          </button>

        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="mr-auto rounded-lg p-2 text-3xl text-gray-700 hover:bg-gray-100 min-[1366px]:hidden"
          aria-label="פתיחת תפריט"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      <a
        href="https://wa.me/972544601269"
        target="_blank"
        rel="noopener noreferrer"
        dir="ltr"
        aria-label="פתיחת WhatsApp עם 054-4601269"
        className="absolute left-3 top-1/2 z-[60] hidden w-max -translate-y-1/2 items-center gap-3 rounded-full bg-emerald-50 px-5 py-2 text-[18px] font-medium text-emerald-800 transition-colors hover:bg-emerald-100 min-[1366px]:flex"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7 shrink-0"
          aria-hidden="true"
        >
          <path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z" />
          <path d="M9 8.5c.4 2.4 2.1 4.1 4.5 4.5l1.2-1.2 2 1c-.2 1.2-.9 1.9-2 2-3.9-.3-7.1-3.5-7.4-7.4.1-1.1.8-1.8 2-2l1 2L9 8.5Z" />
        </svg>
        <span className="whitespace-nowrap">054-4601269</span>
      </a>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out min-[1366px]:hidden ${
          menuOpen
            ? "max-h-[28rem] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <nav className="border-t bg-white">
          <button
            type="button"
            onClick={goHome}
            className="w-full cursor-pointer border-b px-6 py-4 text-right font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
          >
            דף הבית
          </button>

          <button
            type="button"
            onClick={() => goToSection("about")}
            className="w-full cursor-pointer border-b px-6 py-4 text-right font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
          >
            אודות
          </button>

          <button
            type="button"
            onClick={() => goToSection("recommendations")}
            className="w-full cursor-pointer border-b px-6 py-4 text-right font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
          >
            לקוחות ממליצים
          </button>

          {/* שאלות נפוצות - נוסף למובייל */}
          <button
            type="button"
            onClick={() => goToSection("faq")}
            className="w-full cursor-pointer border-b px-6 py-4 text-right font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
          >
            שאלות נפוצות
          </button>

          <button
            type="button"
            onClick={() => goToSection("contact")}
            className="w-full cursor-pointer border-b px-6 py-4 text-right font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
          >
            שירות תביעות 24/7
          </button>

          <div className="border-b px-6 py-4 text-right font-medium text-gray-500">
            תכנית שיווק שותפים
          </div>

          <button
            type="button"
            onClick={() => goToSection("contact")}
            className="w-full cursor-pointer px-6 py-4 text-right font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
          >
            צור קשר
          </button>
        </nav>
      </div>
      </header>

      <div
        aria-hidden={!showTripButton || menuOpen}
        className={`pointer-events-none fixed inset-x-0 top-[5.1rem] z-40 flex justify-center px-4 transition-all duration-300 ease-out ${
          showTripButton && !menuOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-3 opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={goToDestinationTab}
          tabIndex={showTripButton && !menuOpen ? 0 : -1}
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-sm font-medium text-slate-700 shadow-md backdrop-blur transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <span aria-hidden="true">✈</span>
          תכנן נסיעה לחו״ל
        </button>
      </div>
    </>
  );
}


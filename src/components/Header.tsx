
"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="relative mx-auto flex max-w-6xl items-center px-4 py-0 sm:px-6 sm:py-0">
        <button
          type="button"
          onClick={goHome}
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

        {/* Desktop menu */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
          <button
            type="button"
            onClick={goHome}
            className="cursor-pointer font-medium text-gray-700 transition hover:text-blue-700"
          >
            דף הבית
          </button>

          <button
            type="button"
            onClick={() => goToSection("about")}
            className="cursor-pointer font-medium text-gray-700 transition hover:text-blue-700"
          >
            אודות
          </button>

          <button
            type="button"
            onClick={() => goToSection("recommendations")}
            className="cursor-pointer font-medium text-gray-700 transition hover:text-blue-700"
          >
            לקוחות ממליצים
          </button>

          <button
            type="button"
            onClick={() => goToSection("faq")}
            className="cursor-pointer font-medium text-gray-700 transition hover:text-blue-700"
          >
            שאלות נפוצות
          </button>

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
          className="mr-auto rounded-lg p-2 text-3xl text-gray-700 hover:bg-gray-100 md:hidden"
          aria-label="פתיחת תפריט"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out md:hidden ${
          menuOpen
            ? "max-h-96 opacity-100"
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
            className="w-full cursor-pointer px-6 py-4 text-right font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
          >
            צור קשר
          </button>
        </nav>
      </div>
    </header>
  );
}


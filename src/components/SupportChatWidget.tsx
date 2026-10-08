"use client";

import { useState } from "react";

export default function SupportChatWidget() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="פתיחת סוכן חכם לשירותך"
        className="fixed bottom-5 right-0 z-[80] flex min-h-12 max-w-[calc(100vw-6rem)] items-center gap-1.5 rounded-l-2xl border border-r-0 border-emerald-800/30 bg-emerald-700 px-3 text-xs font-semibold text-white shadow-[0_12px_30px_rgba(5,150,105,0.28)] transition-colors duration-200 hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-200"
      >
        <span aria-hidden="true" className="text-lg leading-none">
          🎧
        </span>
        <span>סוכן חכם לשירותך</span>
      </button>
    );
  }

  return (
    <section
      aria-label="שירות לקוחות"
      className="fixed bottom-[9.5rem] right-5 z-[80] flex h-[min(24rem,60dvh)] w-[min(20rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]"
      dir="rtl"
    >
      <header className="flex h-16 shrink-0 items-center justify-between bg-emerald-800 px-4 text-white">
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-lg"
            aria-hidden="true"
          >
            🎧
          </span>
          <h2 className="text-base font-bold">שירות לקוחות</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="מזעור השיחה"
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <span aria-hidden="true">−</span>
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="סגירת השיחה"
            className="flex h-9 w-9 items-center justify-center rounded-full text-2xl transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </header>

      <div
        className="flex min-h-0 flex-1 items-center justify-center bg-slate-50"
        aria-live="polite"
      >
        <span
          className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-100 bg-white text-2xl text-emerald-700 shadow-sm"
          aria-hidden="true"
        >
          💬
        </span>
      </div>

      <div className="flex h-[4.25rem] shrink-0 items-center gap-2 border-t border-slate-100 bg-white px-3">
        <input
          type="text"
          disabled
          aria-label="הודעה לבוט"
          className="h-10 min-w-0 flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none disabled:cursor-not-allowed"
        />
        <button
          type="button"
          disabled
          aria-label="שליחת הודעה"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-lg text-slate-400 disabled:cursor-not-allowed"
        >
          <span aria-hidden="true">➤</span>
        </button>
      </div>
    </section>
  );
}

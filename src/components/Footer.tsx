
export default function Footer() {
  return (
    <footer
      dir="rtl"
      className="border-t border-gray-200 bg-gray-50"
    >
      <div className="mx-auto max-w-6xl px-4 py-6 text-center">
        <p className="text-sm font-medium text-gray-600">
          © {new Date().getFullYear()} סוכנות רון שלום. כל הזכויות שמורות.
        </p>
      </div>
    </footer>
  );
}

'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center px-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Kritik xatolik</h1>
            <p className="text-lg text-gray-600 mb-8">
              Kechirasiz, ilova ishlamayapti.
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-[#1761FF] text-white rounded-xl font-semibold hover:bg-[#1451dd] transition-colors"
            >
              Qayta urinib ko'ring
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}


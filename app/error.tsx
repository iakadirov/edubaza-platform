'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Xatolik yuz berdi</h1>
        <p className="text-lg text-gray-600 mb-8">
          Kechirasiz, biror narsa noto'g'ri ketdi.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#1761FF] text-white rounded-xl font-semibold hover:bg-[#1451dd] transition-colors"
          >
            Qayta urinib ko'ring
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}


import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sahifa topilmadi</h2>
        <p className="text-lg text-gray-600 mb-8">
          Kechirasiz, siz qidirayotgan sahifa mavjud emas.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[#1761FF] text-white rounded-xl font-semibold hover:bg-[#1451dd] transition-colors"
        >
          Bosh sahifaga qaytish
        </Link>
      </div>
    </div>
  );
}


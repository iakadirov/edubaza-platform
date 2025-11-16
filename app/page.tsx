'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleGetStarted = () => {
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EduBaza.uz
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Imkoniyatlar
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Tariflar
              </a>
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                >
                  Shaxsiy kabinet
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Kirish
                  </Link>
                  <Link
                    href="/login"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                  >
                    Bepul boshlash
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Oʻquv materiallarini yarating
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              sun'iy intellekt yordamida
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            EduBaza.uz Oʻzbekiston oʻqituvchilariga sifatli topshiriqlar, testlar va
            didaktik materiallarni bir necha daqiqada yaratishda yordam beradi
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              {isLoggedIn ? 'Kabinetga o\'tish' : 'Bepul boshlash'}
            </button>
            <a
              href="#features"
              className="bg-white hover:bg-gray-50 text-gray-800 px-8 py-4 rounded-lg text-lg font-semibold transition-all border-2 border-gray-200"
            >
              Batafsil ma'lumot
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div>
              <div className="text-4xl font-bold text-blue-600">11+</div>
              <div className="text-gray-600 mt-2">Fanlar</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600">1000+</div>
              <div className="text-gray-600 mt-2">Oʻqituvchilar</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600">5000+</div>
              <div className="text-gray-600 mt-2">Materiallar</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Platforma imkoniyatlari
            </h2>
            <p className="text-xl text-gray-600">
              Sifatli oʻquv materiallarini yaratish uchun zarur boʻlgan hamma narsa
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                AI yaratish
              </h3>
              <p className="text-gray-600">
                Sun'iy intellekt yordamida avtomatik topshiriqlar yaratish
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl border-2 border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Tayyor shablonlar
              </h3>
              <p className="text-gray-600">
                Professional PDF shablonlar kutubxonasi
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl border-2 border-gray-100 hover:border-green-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Tez yaratish
              </h3>
              <p className="text-gray-600">
                Topshiriqlarni qoʻlda soatlab yaratish oʻrniga 2-3 daqiqada yarating
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-xl border-2 border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Barcha fanlar
              </h3>
              <p className="text-gray-600">
                Oʻzbekiston maktab dasturining barcha fanlari qoʻllab-quvvatlanadi
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Qanday ishlaydi
            </h2>
            <p className="text-xl text-gray-600">
              Tayyor topshiriqlar toʻplamigacha uch oddiy qadam
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Parametrlarni tanlang
              </h3>
              <p className="text-gray-600">
                Fan, sinf, mavzu va topshiriq turini koʻrsating
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                AI topshiriqlar yaratadi
              </h3>
              <p className="text-gray-600">
                Sun'iy intellekt noyob topshiriqlarni yaratadi
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                PDF oling
              </h3>
              <p className="text-gray-600">
                Tayyor topshiriqlar toʻplamini PDF formatda yuklab oling
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tarif rejalari
            </h2>
            <p className="text-xl text-gray-600">
              Oʻzingizga mos tarifni tanlang
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* FREE Plan */}
            <div className="border-2 border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">BEPUL</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">
                0 <span className="text-lg text-gray-600">soʻm/oy</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">Oyiga 10 ta topshiriq</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">3 ta asosiy shablon</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">AI yaratish imkoniyati</span>
                </li>
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
              >
                Bepul boshlash
              </button>
            </div>

            {/* PRO Plan */}
            <div className="border-2 border-blue-600 rounded-2xl p-8 hover:shadow-xl transition-all relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Ommabop
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">PRO</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">
                99,000 <span className="text-lg text-gray-600">soʻm/oy</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">Oyiga 100 ta topshiriq</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">Barcha shablonlar</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">Tezkor yaratish</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">Word formatida eksport</span>
                </li>
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                PRO tanlash
              </button>
            </div>

            {/* SCHOOL Plan */}
            <div className="border-2 border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">MAKTAB</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">
                Soʻrov orqali
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">Cheksiz topshiriqlar</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">Butun maktab uchun</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">Maxsus shablonlar</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">24/7 qoʻllab-quvvatlash</span>
                </li>
              </ul>
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold transition-colors">
                Biz bilan bogʻlanish
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Materiallar yaratishni boshlashga tayyormisiz?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            EduBaza.uz dan foydalanayotgan minglab oʻqituvchilarga qoʻshiling
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            {isLoggedIn ? 'Kabinetga o\'tish' : 'Bepul boshlash'}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-lg font-bold mb-4">EduBaza.uz</h3>
              <p className="text-gray-400">
                AI yordamida oʻquv materiallari yaratish platformasi
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Mahsulot</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition-colors">Imkoniyatlar</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Tariflar</a></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Kirish</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Qoʻllab-quvvatlash</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Hujjatlar</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Koʻp soʻraladigan savollar</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Aloqa</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Aloqa</h4>
              <ul className="space-y-2">
                <li>Email: support@edubaza.uz</li>
                <li>Telegram: @edubaza_support</li>
                <li>Toshkent, Oʻzbekiston</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 EduBaza.uz. Barcha huquqlar himoyalangan.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

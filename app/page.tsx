'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';

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
    <div className="min-h-screen bg-white font-['Onest']">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-[124px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
                🏆 O'zbekistonda №1 platforma
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Barcha pedagogik ehtiyojlaringiz{' '}
                <span className="text-[#1761FF]">bir joyda</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                EduBaza — bu faqat raqamli ishchi varaqlar emas. Bu to'liq ekotizim: darsliklar, resurslar,
                testlar, taqdimotlar, kurslar va AI-asistent. Hamma narsa bitta platformada.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-4 bg-[#1761FF] hover:bg-[#1451dd] text-white rounded-xl text-lg font-semibold transition-colors shadow-lg"
                >
                  {isLoggedIn ? 'Kabinetga o\'tish' : 'Bepul boshlash →'}
                </button>
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-xl text-lg font-semibold transition-colors border-2 border-gray-200"
                >
                  Imkoniyatlar
                </button>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Kredit karta talab qilinmaydi</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>2 daqiqada sozlang</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-xl p-6 shadow-lg mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#1761FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Bugun yaratildi</div>
                      <div className="text-xl font-bold text-gray-900">247 ta material</div>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-[#1761FF] to-[#1451dd] rounded-full"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow">
                    <div className="text-3xl mb-2">📚</div>
                    <div className="text-sm text-gray-500">Darsliklar</div>
                    <div className="text-2xl font-bold text-gray-900">850+</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow">
                    <div className="text-3xl mb-2">🎯</div>
                    <div className="text-sm text-gray-500">Testlar</div>
                    <div className="text-2xl font-bold text-gray-900">1,200+</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow">
                    <div className="text-3xl mb-2">🎨</div>
                    <div className="text-sm text-gray-500">Taqdimotlar</div>
                    <div className="text-2xl font-bold text-gray-900">540+</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow">
                    <div className="text-3xl mb-2">🎓</div>
                    <div className="text-sm text-gray-500">Kurslar</div>
                    <div className="text-2xl font-bold text-gray-900">120+</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-gray-900 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-[#1761FF] mb-2">15,000+</div>
                <div className="text-gray-400">Faol o'qituvchilar</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#1761FF] mb-2">50,000+</div>
                <div className="text-gray-400">Yaratilgan materiallar</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#1761FF] mb-2">11</div>
                <div className="text-gray-400">Ta'lim fanlari</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#1761FF] mb-2">99.8%</div>
                <div className="text-gray-400">Foydalanuvchilar rozi</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Pedagogik arsenal bir platformada
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Darslarni tayyorlash, materiallar yaratish, o'quvchilarni baholash — barcha jarayonlarni
              bir joydan boshqaring
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl border-2 border-gray-100 hover:border-[#1761FF] hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#1761FF] transition-colors">
                <svg className="w-7 h-7 text-[#1761FF] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Raqamli darsliklar
              </h3>
              <p className="text-gray-600 leading-relaxed">
                O'zbekiston ta'lim dasturiga mos barcha sinflar uchun to'liq darsliklar kutubxonasi.
                Onlayn va oflayn foydalanish imkoniyati.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl border-2 border-gray-100 hover:border-[#1761FF] hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#1761FF] transition-colors">
                <svg className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                AI ishchi varaqlar
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Sun'iy intellekt yordamida soniyalar ichida professional ishchi varaqlar yarating.
                Har bir material noyob va sifatli.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl border-2 border-gray-100 hover:border-[#1761FF] hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#1761FF] transition-colors">
                <svg className="w-7 h-7 text-green-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Test va nazorat
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Testlar, nazorat ishlari, viktorinalar yarating. Avtomatik tekshirish va natijalarni
                tahlil qilish imkoniyati.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 rounded-2xl border-2 border-gray-100 hover:border-[#1761FF] hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#1761FF] transition-colors">
                <svg className="w-7 h-7 text-orange-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Taqdimotlar
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Darslar uchun tayyor taqdimotlar kutubxonasi. O'z taqdimotlaringizni yarating va
                boshqalar bilan almashing.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 rounded-2xl border-2 border-gray-100 hover:border-[#1761FF] hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#1761FF] transition-colors">
                <svg className="w-7 h-7 text-pink-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Video kurslar
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Professional metodistlardan video darslar va kurslar. O'z malakangizni oshiring va
                yangi metodikalar bilan tanishing.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 rounded-2xl border-2 border-gray-100 hover:border-[#1761FF] hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#1761FF] transition-colors">
                <svg className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Hamjamiyat
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Minglab o'qituvchilar bilan tajriba almashing. O'z materiallaringizni joylashtiring va
                boshqalarnikidan foydalaning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Power Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-6">
                🤖 AI yordamchisi
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Sun'iy intellekt — sizning shaxsiy assistentingiz
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Bizning AI tizimimiz O'zbekiston ta'lim dasturi va metodikasiga maxsus o'rgatilgan.
                U nafaqat material yaratadi, balki pedagogik talablarga mos kelishini ta'minlaydi.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Milliy dasturga moslashtirilgan</h4>
                    <p className="text-gray-600">O'zbekiston maktab dasturi va talablariga to'liq mos</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Noyob kontentni kafolatlaydi</h4>
                    <p className="text-gray-600">Har bir yaratilgan material unikal va plagiatsiz</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Vaqtni 95% tejaydi</h4>
                    <p className="text-gray-600">Soatlab ish o'rniga, bir necha soniyada tayyor material</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold">AI ishlamoqda...</span>
                  </div>
                  <p className="text-sm opacity-90">7-sinf matematika uchun 15 ta masala yaratilmoqda</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">Mavzu tahlili bajarildi</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">Masalalar generatsiya qilindi</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg animate-pulse">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-700">PDF hujjat tayyorlanmoqda...</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-2">Tahminiy tugash vaqti</div>
                  <div className="text-2xl font-bold text-gray-900">8 soniya</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              O'qituvchilar fikrlari
            </h2>
            <p className="text-xl text-gray-600">
              Minglab o'qituvchilar EduBaza bilan ishlarini osonlashtirdilar
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "EduBaza menga haftalik ish rejamni tayyorlashda juda ko'p vaqt tejab beradi. AI yordamida yaratilgan
                materiallar sifatli va o'quvchilar uchun qiziqarli."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center text-xl font-bold text-blue-700">
                  M
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Mehriban Karimova</div>
                  <div className="text-sm text-gray-500">Matematika o'qituvchisi, Toshkent</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Barcha kerakli materiallar bir joyda. Darsliklar, testlar, taqdimotlar — hammasi tayyor.
                Men endi faqat o'qitishga e'tibor qarataman."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center text-xl font-bold text-purple-700">
                  J
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Javohir Ismoilov</div>
                  <div className="text-sm text-gray-500">Fizika o'qituvchisi, Samarqand</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Eng yaxshi pedagogik platforma! Hamjamiyat orqali boshqa o'qituvchilar bilan tajriba almashamiz.
                Professional rivojlanish uchun ajoyib imkoniyat."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center text-xl font-bold text-green-700">
                  G
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Gulnora Rahimova</div>
                  <div className="text-sm text-gray-500">Ona tili o'qituvchisi, Buxoro</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-[#1761FF] to-[#1451dd] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            O'qitish samaradorligini oshiring
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            15,000+ o'qituvchi allaqachon EduBaza bilan vaqt tejab, sifatli ta'lim bermoqda.
            Siz ham qo'shiling!
          </p>
          <button
            onClick={handleGetStarted}
            className="px-10 py-5 bg-white hover:bg-gray-100 text-[#1761FF] rounded-xl text-xl font-bold transition-colors shadow-2xl"
          >
            {isLoggedIn ? 'Kabinetga o\'tish →' : 'Bepul boshlash →'}
          </button>
          <p className="mt-6 text-blue-100 text-sm">
            Kredit karta kerak emas • 2 daqiqada sozlang • Istalgan vaqt bekor qilish mumkin
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <h3 className="text-white text-2xl font-bold mb-4">EduBaza</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                O'zbekistonning №1 ta'lim platformasi. Barcha pedagogik ehtiyojlaringiz uchun
                yagona yechim — darsliklar, materiallar, testlar va AI yordamchi.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold text-lg mb-4">Platforma</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="hover:text-white transition-colors">Imkoniyatlar</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Narxlar</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Hamjamiyat</a></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Kirish</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-lg mb-4">Yordam</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition-colors">Qo'llanma</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Qo'llab-quvvatlash</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Bog'lanish</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2024 EduBaza.uz. Barcha huquqlar himoyalangan.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-500 hover:text-white transition-colors">Maxfiylik siyosati</a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">Foydalanish shartlari</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Sparkles,
  Users,
  Target,
  FileText,
  Video,
  CheckCircle2,
  ArrowRight,
  Star,
  Heart,
  Award,
} from 'lucide-react';

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
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section - Soft Pastel Style */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-[#F5F3FF]">
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <h1 className="text-6xl lg:text-7xl font-black leading-tight text-gray-900">
                O'qituvchilar uchun
                <span className="block text-[#8B5CF6]">
                  zamonaviy platforma
                </span>
              </h1>

              <p className="text-2xl text-gray-700 leading-relaxed">
                Darslarni oson tayyorlang. Materiallar yarating. O'quvchilarni rivojlantiring.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="text-xl px-10 py-7 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-2xl shadow-lg font-semibold"
                >
                  {isLoggedIn ? 'Boshlash' : 'Bepul boshlash'}
                  <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-200 to-purple-300 border-4 border-white flex items-center justify-center text-purple-700 font-bold shadow-sm"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    18,000+ o'qituvchi ishlatadi
                  </p>
                </div>
              </div>
            </div>

            {/* Right Visual - Soft Colored Cards */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-8 bg-[#FFF7ED] border-0 rounded-3xl shadow-lg">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">2,500+</h3>
                  <p className="text-gray-600">Darsliklar</p>
                </Card>

                <Card className="p-8 bg-[#FEF2F2] border-0 rounded-3xl shadow-lg mt-12">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">4,300+</h3>
                  <p className="text-gray-600">Testlar</p>
                </Card>

                <Card className="p-8 bg-[#EFF6FF] border-0 rounded-3xl shadow-lg -mt-6">
                  <div className="text-6xl mb-4">🎨</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">890+</h3>
                  <p className="text-gray-600">Taqdimotlar</p>
                </Card>

                <Card className="p-8 bg-[#F0FDF4] border-0 rounded-3xl shadow-lg">
                  <div className="text-6xl mb-4">✨</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">AI</h3>
                  <p className="text-gray-600">Generator</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              Barcha imkoniyatlar bir joyda
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Darsliklar, AI generator, testlar va yana ko'plab foydali vositalar
            </p>
          </div>

          {/* Feature 1 - Soft Peach */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <div className="order-2 lg:order-1">
              <Card className="p-12 bg-[#FFF7ED] border-0 rounded-3xl shadow-lg">
                <div className="text-8xl mb-8">📚</div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 bg-white p-5 rounded-2xl shadow-sm">
                    <CheckCircle2 className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-1">1-11 sinf darsliklari</h4>
                      <p className="text-gray-600">Barcha fanlar bo'yicha to'liq darsliklar</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 bg-white p-5 rounded-2xl shadow-sm">
                    <CheckCircle2 className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-1">PDF yuklab olish</h4>
                      <p className="text-gray-600">Istalgan darslikni saqlab qo'ying</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <h3 className="text-4xl lg:text-5xl font-black text-gray-900">
                Raqamli darsliklar kutubxonasi
              </h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                O'zbekiston davlat standarti bo'yicha barcha sinflar va fanlar uchun to'liq darsliklar to'plami
              </p>
              <div className="flex items-center gap-6 pt-4">
                <div>
                  <div className="text-4xl font-black text-orange-600">2,500+</div>
                  <div className="text-sm text-gray-600 mt-1">Darsliklar</div>
                </div>
                <div>
                  <div className="text-4xl font-black text-orange-600">16</div>
                  <div className="text-sm text-gray-600 mt-1">Fan</div>
                </div>
                <div>
                  <div className="text-4xl font-black text-orange-600">11</div>
                  <div className="text-sm text-gray-600 mt-1">Sinf</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 - Soft Pink */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <div className="space-y-6">
              <h3 className="text-4xl lg:text-5xl font-black text-gray-900">
                AI yordamida soniyalarda material
              </h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                Sun'iy intellekt sizning shaxsiy yordamchingiz. Professional materiallar yaratish uchun faqat bir necha soniya kerak bo'ladi
              </p>
              <div className="flex flex-wrap gap-3 pt-4">
                {['Ishchi varaqlar', 'Testlar', 'Mashqlar', 'Topshiriqlar'].map((item) => (
                  <div key={item} className="px-6 py-3 bg-[#FEF2F2] text-rose-700 rounded-full font-semibold shadow-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Card className="p-12 bg-[#FEF2F2] border-0 rounded-3xl shadow-lg">
                <div className="text-8xl mb-8">✨</div>
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-bold text-gray-900">AI ishlamoqda...</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded-full"></div>
                      <div className="h-3 bg-gray-200 rounded-full w-4/5"></div>
                      <div className="h-3 bg-gray-200 rounded-full w-3/5"></div>
                    </div>
                  </div>
                  <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
                    <div className="text-4xl font-black text-rose-600 mb-1">8 soniya</div>
                    <div className="text-sm text-gray-600">Tayyor!</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Feature 3 - Soft Blue */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <Card className="p-12 bg-[#EFF6FF] border-0 rounded-3xl shadow-lg">
                <div className="text-8xl mb-8">👥</div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: '18K+', label: 'O\'qituvchi' },
                    { value: '65K+', label: 'Material' },
                    { value: '4.9', label: 'Reyting' },
                    { value: '99%', label: 'Mamnun' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-2xl text-center shadow-sm">
                      <div className="text-3xl font-black text-blue-600 mb-2">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <h3 className="text-4xl lg:text-5xl font-black text-gray-900">
                Katta hamjamiyat
              </h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                18,000+ o'qituvchi bilan birgalikda. Tajriba almashing, materiallar ulashing va professional rivojlaning
              </p>
              <div className="flex items-center gap-3 pt-4">
                <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                <span className="text-lg font-semibold text-gray-700">
                  99% foydalanuvchilar mamnun
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Soft Cards */}
      <section className="py-24 bg-[#FAFAF9]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              O'qituvchilar fikri
            </h2>
            <p className="text-xl text-gray-600">Minglab o'qituvchilar har kuni EduBaza ishlatadi</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Dilnoza Karimova',
                role: 'Matematika o\'qituvchisi',
                text: 'EduBaza bilan vaqtim 70% tejaldi. Endi darsga tayyorgarlik ko\'rish juda oson va qiziqarli.',
                bgColor: 'bg-[#FFF7ED]',
                textColor: 'text-orange-600',
                emoji: '🎓',
              },
              {
                name: 'Sardor Rahmonov',
                role: 'Fizika o\'qituvchisi',
                text: 'AI generator ajoyib! Professional materiallar yaratish uchun faqat bir necha soniya kerak.',
                bgColor: 'bg-[#FEF2F2]',
                textColor: 'text-rose-600',
                emoji: '⭐',
              },
              {
                name: 'Nodira Yusupova',
                role: 'Ona tili o\'qituvchisi',
                text: 'Hamjamiyat orqali ko\'plab yangi metodikalar bilan tanishdim. Juda foydali platforma.',
                bgColor: 'bg-[#EFF6FF]',
                textColor: 'text-blue-600',
                emoji: '💡',
              },
            ].map((testimonial, i) => (
              <Card
                key={i}
                className={`p-8 ${testimonial.bgColor} border-0 rounded-3xl shadow-lg hover:shadow-xl transition-shadow`}
              >
                <div className="text-5xl mb-4">{testimonial.emoji}</div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <div className={`w-12 h-12 ${testimonial.bgColor} border-2 border-white rounded-full flex items-center justify-center ${testimonial.textColor} font-black text-xl shadow-sm`}>
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Soft Purple */}
      <section className="py-32 bg-[#F5F3FF]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl text-center space-y-10">
          <div className="text-7xl mb-6">🚀</div>
          <h2 className="text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
            Bugun bepul boshlang
          </h2>
          <p className="text-2xl text-gray-700 max-w-3xl mx-auto">
            18,000+ o'qituvchi allaqachon EduBaza bilan vaqt tejab, sifatli ta'lim bermoqda
          </p>
          <div className="pt-6">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="text-2xl px-12 py-8 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-2xl shadow-xl font-black"
            >
              {isLoggedIn ? 'Boshlash' : 'Bepul sinab ko\'ring'}
              <ArrowRight className="ml-3 w-7 h-7" />
            </Button>
          </div>
          <p className="text-lg text-gray-600 pt-4">
            Kredit karta shart emas • 2 daqiqada sozlash • Istalgan vaqt bekor qilish
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <h3 className="text-white text-4xl font-black mb-4">
                EduBaza
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                O'zbekistonning №1 ta'lim platformasi. O'qituvchilar uchun yaratilgan.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold text-lg mb-4">Platforma</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition-colors">Imkoniyatlar</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Narxlar</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Hamjamiyat</a></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Kirish</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-lg mb-4">Yordam</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition-colors">Qo'llanma</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Qo'llab-quvvatlash</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Bog'lanish</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500">
              © 2024 EduBaza.uz. Barcha huquqlar himoyalangan.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-500 hover:text-white transition-colors">Maxfiylik</a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">Shartlar</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

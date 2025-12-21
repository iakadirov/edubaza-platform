'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-[124px] pb-24 overflow-hidden bg-background">
        <div className="container-wrapper py-0">
          <div className="container-content">
            <div className="container-inner">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                {/* Left Content */}
                <div className="space-y-8">
                  <h1 className="text-4xl font-bold tracking-tight lg:text-5xl scroll-m-20 text-balance">
                    O'qituvchilar uchun{' '}
                    <span className="text-primary">
                      zamonaviy platforma
                    </span>
                  </h1>

                  <p className="text-lg leading-7 text-muted-foreground">
                    Darslarni oson tayyorlang. Materiallar yarating. O'quvchilarni rivojlantiring.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                      size="lg"
                      onClick={handleGetStarted}
                      className="text-lg px-8 py-6 rounded-xl"
                    >
                      {isLoggedIn ? 'Boshlash' : 'Bepul boshlash'}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-6 pt-6">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-12 h-12 rounded-full bg-primary/20 border-4 border-background flex items-center justify-center text-primary font-bold bento-shadow-2"
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
                      <p className="text-sm font-semibold text-foreground">
                        18,000+ o'qituvchi ishlatadi
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Visual - Bento Cards */}
                <div className="relative">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-8 bg-card border-0 rounded-3xl bento-shadow-5 hover:bento-shadow-5 transition-shadow">
                      <CardContent className="p-0">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">2,500+</h3>
                        <p className="text-muted-foreground">Darsliklar</p>
                      </CardContent>
                    </Card>

                    <Card className="p-8 bg-card border-0 rounded-3xl bento-shadow-5 hover:bento-shadow-5 transition-shadow mt-12">
                      <CardContent className="p-0">
                        <div className="text-6xl mb-4">🎯</div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">4,300+</h3>
                        <p className="text-muted-foreground">Testlar</p>
                      </CardContent>
                    </Card>

                    <Card className="p-8 bg-card border-0 rounded-3xl bento-shadow-5 hover:bento-shadow-5 transition-shadow -mt-6">
                      <CardContent className="p-0">
                        <div className="text-6xl mb-4">🎨</div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">890+</h3>
                        <p className="text-muted-foreground">Taqdimotlar</p>
                      </CardContent>
                    </Card>

                    <Card className="p-8 bg-card border-0 rounded-3xl bento-shadow-5 hover:bento-shadow-5 transition-shadow">
                      <CardContent className="p-0">
                        <div className="text-6xl mb-4">✨</div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">AI</h3>
                        <p className="text-muted-foreground">Generator</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container-wrapper py-0">
          <div className="container-content">
            <div className="container-inner">
              <div className="text-center mb-20">
                <h2 className="text-3xl font-semibold tracking-tight scroll-m-20 border-b pb-2 mb-6">
                  Barcha imkoniyatlar bir joyda
                </h2>
                <p className="text-lg leading-7 text-muted-foreground max-w-3xl mx-auto">
                  Darsliklar, AI generator, testlar va yana ko'plab foydali vositalar
                </p>
              </div>

              {/* Feature 1 - Digital Library */}
              <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
                <div className="order-2 lg:order-1">
                  <Card className="p-12 bg-card border-0 rounded-3xl bento-shadow-5">
                    <CardContent className="p-0">
                      <div className="text-8xl mb-8">📚</div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4 bg-muted p-5 rounded-xl bento-shadow-2">
                          <CheckCircle2 className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-foreground text-lg mb-1">1-11 sinf darsliklari</h4>
                            <p className="text-muted-foreground">Barcha fanlar bo'yicha to'liq darsliklar</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 bg-muted p-5 rounded-xl bento-shadow-2">
                          <CheckCircle2 className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-foreground text-lg mb-1">PDF yuklab olish</h4>
                            <p className="text-muted-foreground">Istalgan darslikni saqlab qo'ying</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="order-1 lg:order-2 space-y-6">
                  <h3 className="text-2xl font-semibold tracking-tight scroll-m-20">
                    Raqamli darsliklar kutubxonasi
                  </h3>
                  <p className="text-lg leading-7 text-muted-foreground">
                    O'zbekiston davlat standarti bo'yicha barcha sinflar va fanlar uchun to'liq darsliklar to'plami
                  </p>
                  <div className="flex items-center gap-6 pt-4">
                    <div>
                      <div className="text-4xl font-bold text-primary">2,500+</div>
                      <div className="text-sm text-muted-foreground mt-1">Darsliklar</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-primary">16</div>
                      <div className="text-sm text-muted-foreground mt-1">Fan</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-primary">11</div>
                      <div className="text-sm text-muted-foreground mt-1">Sinf</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 2 - AI Generator */}
              <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold tracking-tight scroll-m-20">
                    AI yordamida soniyalarda material
                  </h3>
                  <p className="text-lg leading-7 text-muted-foreground">
                    Sun'iy intellekt sizning shaxsiy yordamchingiz. Professional materiallar yaratish uchun faqat bir necha soniya kerak bo'ladi
                  </p>
                  <div className="flex flex-wrap gap-3 pt-4">
                    {['Ishchi varaqlar', 'Testlar', 'Mashqlar', 'Topshiriqlar'].map((item) => (
                      <div key={item} className="px-6 py-3 bg-secondary text-secondary-foreground rounded-full font-semibold bento-shadow-2">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Card className="p-12 bg-card border-0 rounded-3xl bento-shadow-5">
                    <CardContent className="p-0">
                      <div className="text-8xl mb-8">✨</div>
                      <div className="space-y-4">
                        <div className="bg-muted p-6 rounded-xl bento-shadow-2">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                            <span className="font-semibold text-foreground">AI ishlamoqda...</span>
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 bg-muted-foreground/20 rounded-full"></div>
                            <div className="h-3 bg-muted-foreground/20 rounded-full w-4/5"></div>
                            <div className="h-3 bg-muted-foreground/20 rounded-full w-3/5"></div>
                          </div>
                        </div>
                        <div className="text-center p-6 bg-muted rounded-xl bento-shadow-2">
                          <div className="text-4xl font-bold text-primary mb-1">8 soniya</div>
                          <div className="text-sm text-muted-foreground">Tayyor!</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Feature 3 - Community */}
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="order-2 lg:order-1">
                  <Card className="p-12 bg-card border-0 rounded-3xl bento-shadow-5">
                    <CardContent className="p-0">
                      <div className="text-8xl mb-8">👥</div>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { value: '18K+', label: 'O\'qituvchi' },
                          { value: '65K+', label: 'Material' },
                          { value: '4.9', label: 'Reyting' },
                          { value: '99%', label: 'Mamnun' },
                        ].map((stat) => (
                          <div key={stat.label} className="bg-muted p-6 rounded-xl text-center bento-shadow-2">
                            <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                            <div className="text-sm text-muted-foreground">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="order-1 lg:order-2 space-y-6">
                  <h3 className="text-2xl font-semibold tracking-tight scroll-m-20">
                    Katta hamjamiyat
                  </h3>
                  <p className="text-lg leading-7 text-muted-foreground">
                    18,000+ o'qituvchi bilan birgalikda. Tajriba almashing, materiallar ulashing va professional rivojlaning
                  </p>
                  <div className="flex items-center gap-3 pt-4">
                    <Heart className="w-6 h-6 text-destructive fill-destructive" />
                    <span className="text-lg font-semibold text-foreground">
                      99% foydalanuvchilar mamnun
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-muted/50">
        <div className="container-wrapper py-0">
          <div className="container-content bg-muted/50">
            <div className="container-inner">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-semibold tracking-tight scroll-m-20 border-b pb-2 mb-6">
                  O'qituvchilar fikri
                </h2>
                <p className="text-lg leading-7 text-muted-foreground">Minglab o'qituvchilar har kuni EduBaza ishlatadi</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    name: 'Dilnoza Karimova',
                    role: 'Matematika o\'qituvchisi',
                    text: 'EduBaza bilan vaqtim 70% tejaldi. Endi darsga tayyorgarlik ko\'rish juda oson va qiziqarli.',
                    emoji: '🎓',
                  },
                  {
                    name: 'Sardor Rahmonov',
                    role: 'Fizika o\'qituvchisi',
                    text: 'AI generator ajoyib! Professional materiallar yaratish uchun faqat bir necha soniya kerak.',
                    emoji: '⭐',
                  },
                  {
                    name: 'Nodira Yusupova',
                    role: 'Ona tili o\'qituvchisi',
                    text: 'Hamjamiyat orqali ko\'plab yangi metodikalar bilan tanishdim. Juda foydali platforma.',
                    emoji: '💡',
                  },
                ].map((testimonial, i) => (
                  <Card
                    key={i}
                    className="p-8 bg-card border-0 rounded-3xl bento-shadow-5 hover:bento-shadow-5 transition-shadow"
                  >
                    <CardContent className="p-0">
                      <div className="text-5xl mb-4">{testimonial.emoji}</div>
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-lg text-foreground mb-6 leading-relaxed">
                        "{testimonial.text}"
                      </p>
                      <div className="flex items-center gap-3 pt-4 border-t border-border">
                        <div className="w-12 h-12 bg-primary/20 border-2 border-background rounded-full flex items-center justify-center text-primary font-bold text-xl bento-shadow-2">
                          {testimonial.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-background">
        <div className="container-wrapper py-0">
          <div className="container-content">
            <div className="container-inner text-center space-y-10">
              <div className="text-7xl mb-6">🚀</div>
              <h2 className="text-3xl font-semibold tracking-tight scroll-m-20 border-b pb-2 leading-tight">
                Bugun bepul boshlang
              </h2>
              <p className="text-lg leading-7 text-muted-foreground max-w-3xl mx-auto">
                18,000+ o'qituvchi allaqachon EduBaza bilan vaqt tejab, sifatli ta'lim bermoqda
              </p>
              <div className="pt-6">
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="text-xl px-12 py-8 rounded-xl"
                >
                  {isLoggedIn ? 'Boshlash' : 'Bepul sinab ko\'ring'}
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </div>
              <p className="text-base text-muted-foreground pt-4">
                Kredit karta shart emas • 2 daqiqada sozlash • Istalgan vaqt bekor qilish
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted text-muted-foreground py-16">
        <div className="container-wrapper py-0">
          <div className="container-content bg-muted">
            <div className="container-inner">
              <div className="grid md:grid-cols-4 gap-12 mb-12">
                <div className="md:col-span-2">
                  <h3 className="text-foreground text-4xl font-bold mb-4">
                    EduBaza
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                    O'zbekistonning №1 ta'lim platformasi. O'qituvchilar uchun yaratilgan.
                  </p>
                </div>
                <div>
                  <h4 className="text-foreground font-semibold text-lg mb-4">Platforma</h4>
                  <ul className="space-y-3">
                    <li><a href="#" className="hover:text-foreground transition-colors">Imkoniyatlar</a></li>
                    <li><a href="#" className="hover:text-foreground transition-colors">Narxlar</a></li>
                    <li><a href="#" className="hover:text-foreground transition-colors">Hamjamiyat</a></li>
                    <li><Link href="/login" className="hover:text-foreground transition-colors">Kirish</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-foreground font-semibold text-lg mb-4">Yordam</h4>
                  <ul className="space-y-3">
                    <li><a href="#" className="hover:text-foreground transition-colors">Qo'llanma</a></li>
                    <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
                    <li><a href="#" className="hover:text-foreground transition-colors">Qo'llab-quvvatlash</a></li>
                    <li><a href="#" className="hover:text-foreground transition-colors">Bog'lanish</a></li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-muted-foreground">
                  © 2024 EduBaza.uz. Barcha huquqlar himoyalangan.
                </p>
                <div className="flex gap-6">
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Maxfiylik</a>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Shartlar</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

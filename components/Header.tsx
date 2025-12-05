'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import AuthModal from '@/components/auth/AuthModal';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password'>('login');

  // Мега-меню данные
  const megaMenus: Record<string, { title: string; items: { name: string; href: string; description: string }[] }[]> = {
    vositalar: [
      {
        title: 'Dars rejalashtirish',
        items: [
          { name: 'Dars rejasi generatori', href: '/tools/lesson-planner', description: 'AI bilan dars rejasi yaratish' },
          { name: 'Kalendar-tematik reja', href: '/tools/calendar-plan', description: 'Yillik reja tuzish' },
          { name: 'Dars ishlanmalari', href: '/tools/lesson-templates', description: 'Tayyor shablonlar' },
        ],
      },
      {
        title: 'Baholash va nazorat',
        items: [
          { name: 'Test generatori', href: '/tools/test-generator', description: 'Testlar yaratish AI yordamida' },
          { name: 'Topshiriq yaratuvchi', href: '/tools/assignment-creator', description: 'Uy vazifalar va mashqlar' },
          { name: 'Baholar jurnali', href: '/tools/gradebook', description: 'Raqamli jurnal' },
        ],
      },
      {
        title: 'Vizual vositalar',
        items: [
          { name: 'Infografika yaratish', href: '/tools/infographic', description: 'Vizual materiallar dizayni' },
          { name: 'Slayd generator', href: '/tools/slide-generator', description: 'Taqdimotlar yaratish' },
          { name: 'Didaktik materiallar', href: '/tools/didactic', description: 'Kartochka va plakatlar' },
        ],
      },
    ],
    yechimlar: [
      {
        title: 'Boshlang\'ich ta\'lim',
        items: [
          { name: 'O\'qishni o\'rgatish', href: '/solutions/primary/literacy', description: 'Savodxonlik metodlari' },
          { name: 'Matematik tayyorgarlik', href: '/solutions/primary/math', description: 'Hisoblashni o\'rgatish' },
          { name: 'Ijodiy rivojlantirish', href: '/solutions/primary/creative', description: 'San\'at va ijod' },
        ],
      },
      {
        title: 'O\'rta ta\'lim',
        items: [
          { name: 'Fan darslari', href: '/solutions/secondary/science', description: 'Fizika, kimyo, biologiya' },
          { name: 'Til va adabiyot', href: '/solutions/secondary/language', description: 'Ona tili va chet tillari' },
          { name: 'Raqamli savodxonlik', href: '/solutions/secondary/digital', description: 'IT va dasturlash' },
        ],
      },
      {
        title: 'Maxsus ehtiyojlar',
        items: [
          { name: 'Inklyuziv ta\'lim', href: '/solutions/special/inclusive', description: 'Har bir bola uchun' },
          { name: 'Iqtidorlilarni rivojlantirish', href: '/solutions/special/gifted', description: 'Olimpiadaga tayyorgarlik' },
          { name: 'Qo\'shimcha yordam', href: '/solutions/special/support', description: 'Qiyinchilikdagi o\'quvchilar' },
        ],
      },
    ],
    textbooks: [
      {
        title: 'Boshlang\'ich sinf',
        items: [
          { name: '1-sinf', href: '/textbooks/grade-1', description: 'Birinchi sinf darsliklari' },
          { name: '2-sinf', href: '/textbooks/grade-2', description: 'Ikkinchi sinf darsliklari' },
          { name: '3-sinf', href: '/textbooks/grade-3', description: 'Uchinchi sinf darsliklari' },
          { name: '4-sinf', href: '/textbooks/grade-4', description: 'To\'rtinchi sinf darsliklari' },
        ],
      },
      {
        title: 'O\'rta sinf',
        items: [
          { name: '5-sinf', href: '/textbooks/grade-5', description: 'Beshinchi sinf darsliklari' },
          { name: '6-sinf', href: '/textbooks/grade-6', description: 'Oltinchi sinf darsliklari' },
          { name: '7-sinf', href: '/textbooks/grade-7', description: 'Yettinchi sinf darsliklari' },
          { name: '8-sinf', href: '/textbooks/grade-8', description: 'Sakkizinchi sinf darsliklari' },
          { name: '9-sinf', href: '/textbooks/grade-9', description: 'To\'qqizinchi sinf darsliklari' },
        ],
      },
      {
        title: 'Yuqori sinf',
        items: [
          { name: '10-sinf', href: '/textbooks/grade-10', description: 'O\'ninchi sinf darsliklari' },
          { name: '11-sinf', href: '/textbooks/grade-11', description: 'O\'n birinchi sinf darsliklari' },
        ],
      },
    ],
    resources: [
      {
        title: 'Video darslar',
        items: [
          { name: 'Matematika', href: '/resources/video/math', description: 'Video qo\'llanmalar' },
          { name: 'Fizika', href: '/resources/video/physics', description: 'Amaliy videolar' },
          { name: 'Kimyo', href: '/resources/video/chemistry', description: 'Tajribalar videoda' },
        ],
      },
      {
        title: 'Audio materiallar',
        items: [
          { name: 'Ingliz tili', href: '/resources/audio/english', description: 'Tinglash uchun' },
          { name: 'Adabiyot', href: '/resources/audio/literature', description: 'Audio kitoblar' },
        ],
      },
      {
        title: 'Interaktiv',
        items: [
          { name: 'Testlar', href: '/resources/tests', description: 'Online testlar' },
          { name: 'O\'yinlar', href: '/resources/games', description: 'Ta\'lim o\'yinlari' },
        ],
      },
    ],
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white font-['Onest']">
      {/* Main Header */}
      <div className="flex justify-between items-center px-20 lg:px-40 xl:px-80 h-[68px] bg-white border-b border-gray-100">
        {/* Left Side - Logo and Search */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/images/mainlogo.png"
              alt="edubaza"
              width={120}
              height={40}
              priority
              className="object-contain"
            />
          </Link>

          {/* Search Bar */}
          <div
            className={`flex items-center gap-3 px-4 py-2.5 w-[443px] h-[43px] bg-gray-50 rounded-xl transition-all duration-200 ${
              isSearchFocused
                ? 'ring-2 ring-[#1761FF] ring-opacity-20 bg-white shadow-sm'
                : 'hover:bg-white hover:shadow-sm'
            }`}
          >
            {/* Search Icon */}
            <svg
              className={`w-5 h-5 transition-colors ${isSearchFocused ? 'text-[#1761FF]' : 'text-gray-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Qidiruv..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full text-base font-normal text-gray-900 placeholder-gray-400 outline-none bg-transparent"
            />
            {/* Clear Button */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Right Side - Navigation and Login */}
        <div className="flex items-center gap-8">
          {/* Teachers Link with Icon */}
          <Link
            href="/teachers"
            className="group flex items-center gap-2 text-base font-medium text-gray-700 hover:text-[#1761FF] transition-all duration-200 whitespace-nowrap"
          >
            <svg className="w-5 h-5 text-gray-400 group-hover:text-[#1761FF] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Ustozlar uchun</span>
          </Link>

          {/* Students Link with Icon */}
          <Link
            href="/students"
            className="group flex items-center gap-2 text-base font-medium text-gray-700 hover:text-[#1761FF] transition-all duration-200 whitespace-nowrap"
          >
            <svg className="w-5 h-5 text-gray-400 group-hover:text-[#1761FF] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>O&apos;quvchilar uchun</span>
          </Link>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200"></div>

          {/* Register Button - Text Only */}
          <button
            onClick={() => {
              setAuthMode('register');
              setIsAuthModalOpen(true);
            }}
            className="text-base font-medium text-gray-700 hover:text-[#1761FF] transition-colors duration-200 whitespace-nowrap"
          >
            Roʻyxatdan oʻtish
          </button>

          {/* Login Button with Icon */}
          <button
            onClick={() => {
              setAuthMode('login');
              setIsAuthModalOpen(true);
            }}
            className="group flex items-center justify-center gap-2 px-5 py-2.5 min-w-[100px] h-[43px] bg-gradient-to-r from-[#1761FF] to-[#1451dd] hover:from-[#1451dd] hover:to-[#0d3fb8] rounded-xl text-base font-semibold text-white transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span>Kirish</span>
          </button>
        </div>
      </div>

      {/* Secondary Navigation */}
      <div className="relative bg-white">
        <div className="flex justify-between items-center px-20 lg:px-40 xl:px-80 h-[56px]">
          {/* Categories */}
          <nav className="flex items-center gap-8">
            {/* Vositalar with Dropdown Indicator */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveMenu('vositalar')}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <Link
                href="/tools"
                className={`flex items-center gap-1.5 py-4 px-1 text-[15px] font-medium transition-all duration-200 ${
                  activeMenu === 'vositalar'
                    ? 'text-[#1761FF]'
                    : 'text-gray-700 hover:text-[#1761FF]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Vositalar</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    activeMenu === 'vositalar' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              {/* Active Indicator */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1761FF] to-[#1451dd] transition-opacity duration-200 ${
                  activeMenu === 'vositalar' ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>

            {/* Yechimlar with Dropdown Indicator */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveMenu('yechimlar')}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <Link
                href="/solutions"
                className={`flex items-center gap-1.5 py-4 px-1 text-[15px] font-medium transition-all duration-200 ${
                  activeMenu === 'yechimlar'
                    ? 'text-[#1761FF]'
                    : 'text-gray-700 hover:text-[#1761FF]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Yechimlar</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    activeMenu === 'yechimlar' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              {/* Active Indicator */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1761FF] to-[#1451dd] transition-opacity duration-200 ${
                  activeMenu === 'yechimlar' ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>

            {/* Resurslar with Dropdown Indicator */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveMenu('resources')}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <Link
                href="/resources"
                className={`flex items-center gap-1.5 py-4 px-1 text-[15px] font-medium transition-all duration-200 ${
                  activeMenu === 'resources'
                    ? 'text-[#1761FF]'
                    : 'text-gray-700 hover:text-[#1761FF]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Resurslar</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    activeMenu === 'resources' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              {/* Active Indicator */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1761FF] to-[#1451dd] transition-opacity duration-200 ${
                  activeMenu === 'resources' ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>
          </nav>

          {/* Right Side - Help/Support */}
          <Link
            href="/help"
            className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-[#1761FF] hover:bg-blue-50 rounded-lg transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Yordam</span>
          </Link>
        </div>

        {/* Mega Menu Dropdown */}
        {activeMenu && megaMenus[activeMenu] && (
          <div
            className="absolute left-0 right-0 bg-white border-t border-gray-100 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
            onMouseEnter={() => setActiveMenu(activeMenu)}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <div className="px-20 lg:px-40 xl:px-80 py-10">
              <div className="grid grid-cols-3 gap-10">
                {megaMenus[activeMenu].map((section, idx) => (
                  <div key={idx} className="space-y-4">
                    {/* Section Header */}
                    <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                      <div className="w-1 h-4 bg-gradient-to-b from-[#1761FF] to-[#1451dd] rounded-full"></div>
                      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                        {section.title}
                      </h3>
                    </div>

                    {/* Section Items */}
                    <ul className="space-y-1">
                      {section.items.map((item, itemIdx) => (
                        <li key={itemIdx}>
                          <Link
                            href={item.href}
                            className="group block p-3 rounded-lg hover:bg-blue-50 transition-all duration-150"
                          >
                            <div className="flex items-start gap-3">
                              {/* Icon Circle */}
                              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 group-hover:from-[#1761FF] group-hover:to-[#1451dd] flex items-center justify-center transition-all duration-200">
                                <svg className="w-4 h-4 text-[#1761FF] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-gray-900 group-hover:text-[#1761FF] transition-colors mb-0.5">
                                  {item.name}
                                </div>
                                <div className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors line-clamp-2">
                                  {item.description}
                                </div>
                              </div>

                              {/* Arrow */}
                              <svg
                                className="flex-shrink-0 w-4 h-4 text-gray-300 group-hover:text-[#1761FF] transition-colors duration-200"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Footer Banner */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#1761FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Yangi materiallar har kuni!</div>
                      <div className="text-xs text-gray-600">Eng so'nggi ta'lim resurslariga ega bo'ling</div>
                    </div>
                  </div>
                  <Link
                    href="/new"
                    className="px-4 py-2 bg-white text-sm font-medium text-[#1761FF] rounded-lg hover:shadow-md transition-shadow"
                  >
                    Ko'rish →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </header>
  );
}

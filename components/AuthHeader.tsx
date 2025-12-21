'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthHeader() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isScrolledDown, setIsScrolledDown] = useState(false);

  // Отслеживание скролла для скрытия Secondary Navigation
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Показываем только когда на самом верху страницы (scrollY === 0)
      // Скрываем во всех остальных случаях
      if (currentScrollY === 0) {
        setIsScrolledDown(false);
      } else {
        setIsScrolledDown(true);
      }
    };

    // Проверяем начальную позицию
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Мега-меню данные
  const megaMenus: any = {
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white" style={{ fontFamily: 'Onest' }}>
      {/* Main Header */}
      <div className="relative z-10 w-full bg-white border-b border-gray-100">
        <div className="container-wrapper">
          <div className="flex justify-between items-center h-[68px]">
            {/* Left Side - Logo and Search */}
            <div className="flex items-center gap-6">
              {/* Logo */}
              <Link href="/dashboard" className="flex items-center group">
            <Image
              src="/images/logo.svg"
              alt="edubaza"
              width={160}
              height={32}
              priority
              className="object-contain"
              style={{ width: 'auto', maxWidth: 'fit-content', height: '32px' }}
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

          {/* Right Side - Navigation and Profile */}
          <div className="flex items-center gap-8">
          {/* Generate Button */}
          <Link
            href="/generate-chat"
            className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1761FF] to-[#1451dd] hover:from-[#1451dd] hover:to-[#0d3fb8] text-white rounded-xl text-base font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Yaratish</span>
          </Link>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200"></div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 hover:bg-gray-50 rounded-xl px-3 py-2 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#1761FF] to-[#1451dd] rounded-full flex items-center justify-center text-white font-semibold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <svg className={`w-4 h-4 text-gray-600 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="text-gray-700 font-medium">Bosh sahifa</span>
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-gray-700 font-medium">Profil</span>
                </Link>
                <div className="border-t border-gray-100 my-2"></div>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left"
                >
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-red-600 font-medium">Chiqish</span>
                </button>
              </div>
            )}
          </div>
          </div>
          </div>
        </div>
      </div>

      {/* Secondary Navigation */}
      <div 
        className={`relative z-0 bg-white overflow-hidden transition-all duration-300 ease-in-out ${
          isScrolledDown 
            ? 'max-h-0 opacity-0 pointer-events-none' 
            : 'max-h-[56px] opacity-100 pointer-events-auto'
        }`}
      >
        <div className="w-full">
          <div className="container-wrapper">
            <div className="flex justify-between items-center h-[56px]">
              {/* Categories */}
              <nav className="flex items-center gap-8">
                {/* Darsliklar with Dropdown Indicator */}
                <div
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveMenu('textbooks')}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <Link
                href="/textbooks"
                className={`flex items-center gap-1.5 py-4 px-1 text-[15px] font-medium transition-all duration-200 ${
                  activeMenu === 'textbooks'
                    ? 'text-[#1761FF]'
                    : 'text-gray-700 hover:text-[#1761FF]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Darsliklar</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    activeMenu === 'textbooks' ? 'rotate-180' : ''
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
                  activeMenu === 'textbooks' ? 'opacity-100' : 'opacity-0'
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

                    {/* Other menu items */}
                <Link
                  href="/materials"
                  className="group flex items-center gap-1.5 py-2 px-1 text-[15px] font-medium text-gray-700 hover:text-[#1761FF] transition-all duration-200 whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Tarqatma materiallar</span>
                </Link>

                <Link
                  href="/presentations"
                  className="group flex items-center gap-1.5 py-2 px-1 text-[15px] font-medium text-gray-700 hover:text-[#1761FF] transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                  <span>Taqdimotlar</span>
                </Link>

                <Link
                  href="/courses"
                  className="group flex items-center gap-1.5 py-2 px-1 text-[15px] font-medium text-gray-700 hover:text-[#1761FF] transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Kurslar</span>
                </Link>
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
          </div>
        </div>

        {/* Mega Menu Dropdown */}
        {activeMenu && megaMenus[activeMenu] && (
          <div
            className="absolute left-0 right-0 bg-white border-t border-gray-100 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
            onMouseEnter={() => setActiveMenu(activeMenu)}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <div className="w-full">
              <div className="container-wrapper">
                <div className="py-10">
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
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

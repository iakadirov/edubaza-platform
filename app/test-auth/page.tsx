'use client';

import { useState } from 'react';
import AuthModal from '@/components/auth/AuthModal';

export default function TestAuthPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialMode, setInitialMode] = useState<'login' | 'register' | 'forgot-password'>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            EduBaza.uz - Test Auth Modal
          </h1>
          <p className="text-lg text-gray-600">
            Yangi optimallashtir ilgan avtorizatsiya tizimi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Login Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">🔐</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Kirish</h3>
              <p className="text-sm text-gray-600 mb-4">
                Parol yoki Telegram orqali tezkor kirish
              </p>
            </div>
            <button
              onClick={() => {
                setInitialMode('login');
                setIsModalOpen(true);
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Kirish oynasini ochish
            </button>
            <ul className="mt-4 text-xs text-gray-600 space-y-1">
              <li>✅ +998 niqobi bilan telefon</li>
              <li>✅ "Eslab qolish" funksiyasi</li>
              <li>✅ Telegram Login Widget</li>
            </ul>
          </div>

          {/* Register Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">📝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Roʻyxatdan oʻtish</h3>
              <p className="text-sm text-gray-600 mb-4">
                3 bosqichli registratsiya: Telefon → OTP → Profil
              </p>
            </div>
            <button
              onClick={() => {
                setInitialMode('register');
                setIsModalOpen(true);
              }}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Roʻyxatdan oʻtish
            </button>
            <ul className="mt-4 text-xs text-gray-600 space-y-1">
              <li>✅ Kompakt dizayn</li>
              <li>✅ Rollar bir qatorda</li>
              <li>✅ Oʻzbek tilida fanlar</li>
            </ul>
          </div>

          {/* Forgot Password Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">🔑</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Parolni unutdim</h3>
              <p className="text-sm text-gray-600 mb-4">
                OTP kod orqali parolni tiklash
              </p>
            </div>
            <button
              onClick={() => {
                setInitialMode('forgot-password');
                setIsModalOpen(true);
              }}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Parolni tiklash
            </button>
            <ul className="mt-4 text-xs text-gray-600 space-y-1">
              <li>✅ SMS OTP kod</li>
              <li>✅ 5 daqiqa amal qiladi</li>
              <li>✅ Rate limiting bilan</li>
            </ul>
          </div>
        </div>

        {/* Optimizations Info */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Qilingan optimallashtirish lar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Backend Optimizations:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Password check:</strong> 1 SQL запрос вместо 2 (-50%)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Session creation:</strong> 1 SQL запрос вместо 3 (-66%)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Redis rate limit:</strong> Atomic pipeline operation (-50%)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Phone formatting:</strong> Централизованная утилита</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Frontend Improvements:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span><strong>Modal design:</strong> Вместо full-page форм</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span><strong>Phone mask:</strong> +998 нередактируемый префикс</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span><strong>Compact layout:</strong> Роли в один ряд</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span><strong>Telegram auth:</strong> Официальный Login Widget</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span><strong>Uzbek language:</strong> Полный перевод интерфейса</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialMode={initialMode}
      />
    </div>
  );
}

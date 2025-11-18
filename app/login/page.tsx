'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOTP] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('otp');
        setCountdown(300); // 5 дақиқа
        startCountdown();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('SMS yuborishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        router.push('/dashboard');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Tekshirishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            EduBaza.uz
          </h1>
          <p className="text-gray-600">
            {step === 'phone'
              ? 'Telefon raqamingiz orqali kiring'
              : 'SMS dan kelgan kodni kiriting'}
          </p>
        </div>

        {/* Форма ввода телефона */}
        {step === 'phone' && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon raqam
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-800 font-semibold">+998</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    // Удаляем все нецифровые символы
                    const digitsOnly = e.target.value.replace(/\D/g, '');
                    setPhone(digitsOnly);
                  }}
                  placeholder="90 123 45 67"
                  className="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  required
                  maxLength={9}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || phone.length < 9}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Yuborilmoqda...' : 'Kod olish'}
            </button>
          </form>
        )}

        {/* Форма ввода OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tasdiqlash kodi
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOTP(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                required
                maxLength={6}
                autoFocus
              />
            </div>

            {countdown > 0 && (
              <div className="text-center text-sm text-gray-600">
                Kod amal qiladi: <span className="font-semibold">{formatTime(countdown)}</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {loading ? 'Tekshirilmoqda...' : 'Kirish'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOTP('');
                  setError('');
                  setCountdown(0);
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Raqamni oʻzgartirish
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Raqamni yuborish orqali siz xizmat shartlariga</p>
          <p>rozilik bildirasiz</p>
        </div>
      </div>
    </div>
  );
}

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

  // Отправка OTP
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
        setCountdown(300); // 5 минут
        startCountdown();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Ошибка отправки SMS');
    } finally {
      setLoading(false);
    }
  };

  // Верификация OTP
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
        // Сохраняем токен в localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        // Перенаправляем на главную
        router.push('/dashboard');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Ошибка верификации');
    } finally {
      setLoading(false);
    }
  };

  // Таймер обратного отсчёта
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
              ? 'Войдите с помощью номера телефона'
              : 'Введите код из SMS'}
          </p>
        </div>

        {/* Форма ввода телефона */}
        {step === 'phone' && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Номер телефона
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">+998</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="90 123 45 67"
                  className="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              disabled={loading || phone.length !== 9}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Отправка...' : 'Получить код'}
            </button>
          </form>
        )}

        {/* Форма ввода OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Код подтверждения
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOTP(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                maxLength={6}
                autoFocus
              />
            </div>

            {countdown > 0 && (
              <div className="text-center text-sm text-gray-600">
                Код действителен: <span className="font-semibold">{formatTime(countdown)}</span>
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
                {loading ? 'Проверка...' : 'Войти'}
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
                Изменить номер
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Отправив номер, вы соглашаетесь с</p>
          <p>условиями использования сервиса</p>
        </div>
      </div>
    </div>
  );
}

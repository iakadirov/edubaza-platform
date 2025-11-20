'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type LoginMethod = 'password' | 'otp';

export default function LoginPage() {
  const router = useRouter();

  // Login method
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');

  // Common
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password login
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP login
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOTP] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Format phone number: автоматически +998, только цифры, макс 9 цифр
  const formatPhoneNumber = (value: string) => {
    // Убираем все кроме цифр
    const numbers = value.replace(/\D/g, '');

    // Удаляем 998 если пользователь его ввел
    let localNumber = numbers;
    if (localNumber.startsWith('998')) {
      localNumber = localNumber.substring(3);
    }

    // Берем максимум 9 цифр
    localNumber = localNumber.substring(0, 9);

    // Форматируем: 94 639 21 25
    const match = localNumber.match(/^(\d{0,2})(\d{0,3})(\d{0,2})(\d{0,2})$/);
    if (match) {
      const parts = [match[1], match[2], match[3], match[4]].filter(Boolean);
      return `+998 ${parts.join(' ')}`.trim();
    }

    return `+998 ${localNumber}`.trim();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  // Password login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanPhone = phone.replace(/\s/g, '');

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          password,
          rememberMe,
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/dashboard');
      } else {
        setError(data.error || `Notoʻgʻri telefon yoki parol`);
      }
    } catch (err) {
      setError('Kirish xatosi');
    } finally {
      setLoading(false);
    }
  };

  // OTP login: Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanPhone = phone.replace(/\s/g, '');

      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await response.json();

      if (data.success || response.ok) {
        setStep('otp');
        setCountdown(300); // 5 минут
        startCountdown();
      } else {
        setError(data.error || data.message || 'SMS yuborishda xatolik');
      }
    } catch (err) {
      setError('SMS yuborishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  // OTP login: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanPhone = phone.replace(/\s/g, '');

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, otp }),
      });

      const data = await response.json();

      if (data.success || (response.ok && data.data)) {
        const token = data.data?.token || data.token;
        const user = data.data?.user || data.user;

        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          router.push('/dashboard');
        } else {
          setError('Token olishda xatolik');
        }
      } else {
        setError(data.error || data.message || 'Notoʻgʻri kod');
      }
    } catch (err) {
      setError('Kodni tekshirishda xatolik');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            EduBaza.uz ga kirish
          </h1>
          <p className="text-gray-600">
            {loginMethod === 'password' && 'Parol yordamida kirish'}
            {loginMethod === 'otp' && step === 'phone' && 'SMS kod yordamida kirish'}
            {loginMethod === 'otp' && step === 'otp' && 'SMS dan kodni kiriting'}
          </p>
        </div>

        {/* Toggle Login Method */}
        {loginMethod === 'password' && (
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setLoginMethod('password')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                loginMethod === 'password'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Parol
            </button>
            <button
              onClick={() => {
                setLoginMethod('otp');
                setStep('phone');
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                loginMethod === 'otp'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              SMS kod
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Password Login Form */}
        {loginMethod === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon raqami
              </label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+998 __ ___ __ __"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parol
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Parolni kiriting"
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Tizimda qolish
                </span>
              </label>

              <a
                href="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Parolni unutdingizmi?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length < 17}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Kirilmoqda...' : 'Kirish'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('otp');
                  setError('');
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                SMS kod orqali kirish
              </button>
            </div>

            <div className="text-center text-sm text-gray-600">
              Akkauntingiz yoʻqmi?{' '}
              <a href="/register" className="text-blue-600 hover:underline font-medium">
                Roʻyxatdan oʻtish
              </a>
            </div>
          </form>
        )}

        {/* OTP Login Form - Phone */}
        {loginMethod === 'otp' && step === 'phone' && (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon raqami
              </label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+998 __ ___ __ __"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading || phone.length < 17}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Yuborilmoqda...' : 'Kod olish'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('password');
                  setError('');
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Parol bilan kirish
              </button>
            </div>

            <div className="text-center text-sm text-gray-600">
              Akkauntingiz yoʻqmi?{' '}
              <a href="/register" className="text-blue-600 hover:underline font-medium">
                Roʻyxatdan oʻtish
              </a>
            </div>
          </form>
        )}

        {/* OTP Login Form - OTP */}
        {loginMethod === 'otp' && step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMS dan kod
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="______"
                maxLength={6}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <p className="mt-2 text-sm text-gray-600">
                {phone} raqamiga yuborildi
              </p>
            </div>

            {countdown > 0 && (
              <div className="text-center text-sm text-gray-600">
                Qayta yuborish: {formatTime(countdown)}
              </div>
            )}

            {countdown === 0 && (
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOTP('');
                }}
                className="w-full text-blue-600 hover:underline text-sm font-medium"
              >
                Kodni qayta yuborish
              </button>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Tekshirilmoqda...' : 'Kirish'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setError('');
              }}
              className="w-full text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              ← Raqamni oʻzgartirish
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

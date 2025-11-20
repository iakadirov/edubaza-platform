'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RoleSelector, { UserRole } from '@/components/auth/RoleSelector';
import PasswordInput from '@/components/auth/PasswordInput';
import SpecialtySelector, { TeacherSpecialty } from '@/components/auth/SpecialtySelector';

type Step = 'phone' | 'otp' | 'profile';

export default function RegisterPage() {
  const router = useRouter();

  // Steps
  const [step, setStep] = useState<Step>('phone');

  // Step 1: Phone
  const [phone, setPhone] = useState('');

  // Step 2: OTP
  const [otp, setOTP] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Step 3: Profile
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [specialty, setSpecialty] = useState<TeacherSpecialty | ''>('');
  const [school, setSchool] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  // Step 1: Send OTP
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

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanPhone = phone.replace(/\s/g, '');

      // Просто проверяем OTP, не создаем пользователя
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, otp, skipUserCreation: true }),
      });

      const data = await response.json();

      if (data.success || response.ok) {
        // Если пользователь уже существует - редирект на логин
        if (data.userExists) {
          setError(`Bu raqam allaqachon roʻyxatdan oʻtgan. Kirish sahifasiga oʻting.`);
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        setStep('profile');
      } else {
        setError(data.error || data.message || 'Notoʻgʻri kod');
      }
    } catch (err) {
      setError('Kodni tekshirishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Валидация
    if (!firstName || !lastName) {
      setError('Ism va familiyani kiriting');
      return;
    }

    if (role === 'TEACHER' && !specialty) {
      setError('Fanni tanlang');
      return;
    }

    if (password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat boʻlishi kerak');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Parollar mos kelmayapti');
      return;
    }

    setLoading(true);

    try {
      const cleanPhone = phone.replace(/\s/g, '');

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          otp,
          firstName,
          lastName,
          role,
          specialty: role === 'TEACHER' ? specialty : undefined,
          school: role === 'TEACHER' ? school : undefined,
          password,
          rememberMe: true,
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Сохранить токен и данные пользователя
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Редирект на dashboard
        router.push('/dashboard');
      } else {
        setError(data.error || 'Roʻyxatdan oʻtishda xatolik');
      }
    } catch (err) {
      setError('Server xatosi');
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
            Roʻyxatdan oʻtish
          </h1>
          <p className="text-gray-600">
            {step === 'phone' && 'Telefon raqamini kiriting'}
            {step === 'otp' && 'SMS dan kelgan kodni kiriting'}
            {step === 'profile' && 'Profilni toʻldiring'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center ${step === 'phone' ? 'text-blue-600' : 'text-green-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'phone' ? 'bg-blue-600' : 'bg-green-600'
            } text-white font-semibold`}>
              {step === 'phone' ? '1' : '✓'}
            </div>
            <span className="ml-2 text-sm font-medium hidden sm:inline">Telefon</span>
          </div>

          <div className={`w-12 h-0.5 mx-2 ${
            step !== 'phone' ? 'bg-green-600' : 'bg-gray-300'
          }`} />

          <div className={`flex items-center ${
            step === 'phone' ? 'text-gray-400' :
            step === 'otp' ? 'text-blue-600' : 'text-green-600'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'phone' ? 'bg-gray-300' :
              step === 'otp' ? 'bg-blue-600' : 'bg-green-600'
            } text-white font-semibold`}>
              {step === 'phone' ? '2' : step === 'otp' ? '2' : '✓'}
            </div>
            <span className="ml-2 text-sm font-medium hidden sm:inline">Kod</span>
          </div>

          <div className={`w-12 h-0.5 mx-2 ${
            step === 'profile' ? 'bg-green-600' : 'bg-gray-300'
          }`} />

          <div className={`flex items-center ${
            step === 'profile' ? 'text-blue-600' : 'text-gray-400'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'profile' ? 'bg-blue-600' : 'bg-gray-300'
            } text-white font-semibold`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium hidden sm:inline">Profil</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Phone */}
        {step === 'phone' && (
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

            <div className="text-center text-sm text-gray-600">
              Akkauntingiz bormi?{' '}
              <a href="/login" className="text-blue-600 hover:underline font-medium">
                Kirish
              </a>
            </div>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMS dan kelgan kod
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="______"
                maxLength={6}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              {loading ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              ← Raqamni oʻzgartirish
            </button>
          </form>
        )}

        {/* Step 3: Profile */}
        {step === 'profile' && (
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ism <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Familiya <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <RoleSelector value={role} onChange={setRole} />

            {role === 'TEACHER' && (
              <>
                <SpecialtySelector
                  value={specialty}
                  onChange={setSpecialty}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maktab
                  </label>
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="Masalan: 45-maktab"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            <PasswordInput
              value={password}
              onChange={setPassword}
              label="Parol oʻylab toping"
              showStrength
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parolni takrorlang <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {passwordConfirm && password !== passwordConfirm && (
                <p className="mt-1 text-sm text-red-600">
                  Parollar mos kelmayapti
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Roʻyxatdan oʻtkazilmoqda...' : 'Akkaunt yaratish'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

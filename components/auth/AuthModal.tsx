'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PhoneInput from './PhoneInput';
import PasswordInput from './PasswordInput';
import RoleSelector, { UserRole } from './RoleSelector';
import SpecialtySelector, { TeacherSpecialty } from './SpecialtySelector';
import TelegramLoginButton from './TelegramLoginButton';

type AuthMode = 'login' | 'register' | 'forgot-password';
type RegisterStep = 'phone' | 'otp' | 'profile';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const router = useRouter();

  // Mode and Steps
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [registerStep, setRegisterStep] = useState<RegisterStep>('phone');

  // Form Data
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register Data
  const [otp, setOTP] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [specialty, setSpecialty] = useState<TeacherSpecialty | ''>('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Очистка при закрытии
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Обновление режима при изменении initialMode
  useEffect(() => {
    setMode(initialMode);
    setRegisterStep('phone'); // Сброс на первый шаг
  }, [initialMode]);

  const resetForm = () => {
    setPhone('');
    setPassword('');
    setOTP('');
    setFirstName('');
    setLastName('');
    setRole('STUDENT');
    setSpecialty('');
    setPasswordConfirm('');
    setError('');
    setRegisterStep('phone');
  };

  const startCountdown = () => {
    setCountdown(300);
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

  // LOGIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: `+998${phone.replace(/\s/g, '')}`,
          password,
          rememberMe,
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onClose();
        router.push('/dashboard');
      } else {
        setError(data.error || 'Notoʻgʻri telefon yoki parol');
      }
    } catch (err) {
      setError('Kirish xatosi');
    } finally {
      setLoading(false);
    }
  };

  // REGISTER - Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: `+998${phone.replace(/\s/g, '')}`,
          type: mode === 'register' ? 'register' : 'reset',
        }),
      });

      const data = await response.json();

      if (data.success || response.ok) {
        setRegisterStep('otp');
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

  // REGISTER - Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Notoʻgʻri kod');
      return;
    }

    if (mode === 'register') {
      setRegisterStep('profile');
    } else {
      // Forgot password flow
      setMode('login');
      setRegisterStep('phone');
    }
  };

  // REGISTER - Complete Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: `+998${phone.replace(/\s/g, '')}`,
          otp,
          firstName,
          lastName,
          role,
          specialty: role === 'TEACHER' ? specialty : undefined,
          password,
          rememberMe: true,
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-8 transform transition-all">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'login' && 'Kirish'}
              {mode === 'register' && 'Roʻyxatdan oʻtish'}
              {mode === 'forgot-password' && 'Parolni tiklash'}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {mode === 'login' && 'Parol yordamida kirish'}
              {mode === 'register' && registerStep === 'phone' && 'Telefon raqamingizni kiriting'}
              {mode === 'register' && registerStep === 'otp' && 'SMS dan kelgan kodni kiriting'}
              {mode === 'register' && registerStep === 'profile' && 'Profilni toʻldiring'}
              {mode === 'forgot-password' && 'Telefon raqamingizni kiriting'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <PhoneInput value={phone} onChange={setPhone} />

              <PasswordInput
                value={password}
                onChange={setPassword}
                label="Parol"
                required
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Tizimda qolish</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot-password');
                    setRegisterStep('phone');
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Parolni unutdingizmi?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length < 9 || !password}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Kirilmoqda...' : 'Kirish'}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">yoki</span>
                </div>
              </div>

              {/* Telegram Login Widget */}
              <TelegramLoginButton
                onAuth={() => {
                  onClose();
                }}
              />

              <div className="text-center text-sm text-gray-600">
                Akkauntingiz yoʻqmi?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setRegisterStep('phone');
                  }}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Roʻyxatdan oʻtish
                </button>
              </div>
            </form>
          )}

          {/* REGISTER / FORGOT PASSWORD - Phone Step */}
          {(mode === 'register' || mode === 'forgot-password') && registerStep === 'phone' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <PhoneInput value={phone} onChange={setPhone} />

              <button
                type="submit"
                disabled={loading || phone.length < 9}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Yuborilmoqda...' : 'Kod olish'}
              </button>

              <div className="text-center text-sm text-gray-600">
                {mode === 'register' ? (
                  <>
                    Akkauntingiz bormi?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Kirish
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-blue-600 hover:underline"
                  >
                    ← Kirish sahifasiga qaytish
                  </button>
                )}
              </div>
            </form>
          )}

          {/* REGISTER / FORGOT PASSWORD - OTP Step */}
          {(mode === 'register' || mode === 'forgot-password') && registerStep === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMS dan kelgan kod
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="_ _ _ _ _ _"
                  maxLength={6}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-2 text-sm text-gray-600 text-center">
                  +998 {phone} raqamiga yuborildi
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
                  onClick={() => setRegisterStep('phone')}
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
                onClick={() => setRegisterStep('phone')}
                className="w-full text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                ← Raqamni oʻzgartirish
              </button>
            </form>
          )}

          {/* REGISTER - Profile Step */}
          {mode === 'register' && registerStep === 'profile' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ism <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <RoleSelector value={role} onChange={setRole} compact />

              {role === 'TEACHER' && (
                <SpecialtySelector
                  value={specialty}
                  onChange={setSpecialty}
                  required
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
    </div>
  );
}

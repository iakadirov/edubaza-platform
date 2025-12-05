'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PhoneInput from '@/components/auth/PhoneInput';
import PasswordInput from '@/components/auth/PasswordInput';

type Step = 'phone' | 'otp' | 'reset';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOTP] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanPhone = `+998${phone.replace(/\s/g, '')}`;

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('otp');
        setCountdown(300);
        startCountdown();
      } else {
        setError(data.error || 'SMS yuborishda xatolik');
      }
    } catch (err) {
      setError('Server xatosi');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('6 raqamli kodni kiriting');
      return;
    }

    setStep('reset');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat boʻlishi kerak');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Parollar mos kelmayapti');
      return;
    }

    setLoading(true);

    try {
      const cleanPhone = `+998${phone.replace(/\s/g, '')}`;

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          otp,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Parol muvaffaqiyatli oʻzgartirildi! Endi tizimga kirishingiz mumkin.');
        router.push('/login');
      } else {
        setError(data.error || 'Parolni tiklashda xatolik');
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Parolni tiklash
          </h1>
          <p className="text-gray-600">
            {step === 'phone' && 'Telefon raqamingizni kiriting'}
            {step === 'otp' && 'SMS dan kelgan kodni kiriting'}
            {step === 'reset' && 'Yangi parol oʻylab toping'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Phone */}
        {step === 'phone' && (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <PhoneInput
              value={phone}
              onChange={setPhone}
              label="Telefon raqami"
              required
            />

            <button
              type="submit"
              disabled={loading || phone.length < 9}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Yuborilmoqda...' : 'Kod olish'}
            </button>

            <div className="text-center text-sm text-gray-600">
              <a href="/login" className="text-blue-600 hover:underline">
                ← Kirish sahifasiga qaytish
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
                autoFocus
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-600">
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
                onClick={() => setStep('phone')}
                className="w-full text-blue-600 hover:underline text-sm font-medium"
              >
                Kodni qayta yuborish
              </button>
            )}

            <button
              type="submit"
              disabled={otp.length !== 6}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Davom etish
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

        {/* Step 3: Reset Password */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <PasswordInput
              value={newPassword}
              onChange={setNewPassword}
              label="Yangi parol"
              placeholder="Kamida 6 ta belgi"
              showStrength
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parolni takrorlang <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Parolni takrorlang"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {confirmPassword && newPassword !== confirmPassword && (
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
              {loading ? 'Saqlanmoqda...' : 'Parolni tiklash'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

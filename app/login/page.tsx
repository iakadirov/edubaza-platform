'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PhoneInput from '@/components/auth/PhoneInput';
import PasswordInput from '@/components/auth/PasswordInput';

export default function LoginPage() {
  const router = useRouter();

  // Form fields
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login with password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // PhoneInput уже хранит чистый номер без пробелов
      const cleanPhone = `+998${phone.replace(/\s/g, '')}`;

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
      
      console.log('[Login Page] Response:', { ok: response.ok, status: response.status, hasToken: !!data.token, error: data.error });

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/dashboard');
      } else {
        console.error('[Login Page] Login failed:', data);
        setError(data.error || `Notoʻgʻri telefon yoki parol`);
      }
    } catch (err) {
      console.error('[Login Page] Login error:', err);
      setError('Kirish xatosi');
    } finally {
      setLoading(false);
    }
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
            Parol yordamida kirish
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <PhoneInput
            value={phone}
            onChange={setPhone}
            label="Telefon raqami"
            required
          />

          <PasswordInput
            value={password}
            onChange={setPassword}
            label="Parol"
            placeholder="Parolni kiriting"
            showStrength={false}
            required
          />

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

            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Parolni unutdingizmi?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading || phone.length < 9 || !password}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Kirilmoqda...' : 'Kirish'}
          </button>

          <div className="text-center text-sm text-gray-600">
            Akkauntingiz yoʻqmi?{' '}
            <Link href="/register" className="text-blue-600 hover:underline font-medium">
              Roʻyxatdan oʻtish
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

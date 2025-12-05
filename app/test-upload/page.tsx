'use client';

import { useState } from 'react';

/**
 * Test Upload Page
 * Тестовая страница для проверки загрузки файлов в Yandex Cloud
 * Доступна по адресу: http://localhost:3000/test-upload
 */
export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [token, setToken] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Пожалуйста, выберите файл');
      return;
    }

    if (!token) {
      setError('Пожалуйста, введите токен авторизации');
      return;
    }

    setUploading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'test'); // Папка для тестовых файлов

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        setFile(null);
        // Очистить input
        const input = document.getElementById('file-input') as HTMLInputElement;
        if (input) input.value = '';
      } else {
        setError(data.message || 'Ошибка при загрузке');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Тест загрузки файлов
          </h1>
          <p className="text-gray-600 mb-8">
            Загрузите файл для проверки интеграции с Yandex Cloud Storage
          </p>

          {/* Storage Type Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Текущий режим: <span className="font-bold">Yandex Cloud Storage</span>
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Файлы будут загружены в bucket: edubaza-storage
                </p>
              </div>
            </div>
          </div>

          {/* Token Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              JWT Token (Bearer Token)
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Вставьте ваш JWT токен здесь"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Получите токен после авторизации на главной странице (откройте DevTools → Application → Local Storage → token)
            </p>
          </div>

          {/* File Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Выберите файл
            </label>
            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              accept="image/*,.pdf,.doc,.docx,.mp4,.webm,.mp3,.wav"
            />
            {file && (
              <div className="mt-2 text-sm text-gray-600">
                <p>📎 Выбран файл: <span className="font-medium">{file.name}</span></p>
                <p>📏 Размер: <span className="font-medium">{(file.size / 1024).toFixed(2)} KB</span></p>
                <p>📋 Тип: <span className="font-medium">{file.type}</span></p>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={uploading || !file || !token}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
              uploading || !file || !token
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
            }`}
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Загрузка...
              </span>
            ) : (
              '🚀 Загрузить файл'
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-900">Ошибка</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Result */}
          {result && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2 mb-3">
                <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">✅ Файл успешно загружен!</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="text-xs font-medium text-gray-600 mb-1">Публичный URL:</p>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 break-all underline"
                  >
                    {result.url}
                  </a>
                </div>

                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="text-xs font-medium text-gray-600 mb-1">Ключ файла:</p>
                  <code className="text-xs text-gray-800 break-all">{result.key}</code>
                </div>

                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="text-xs font-medium text-gray-600 mb-1">Имя файла:</p>
                  <p className="text-xs text-gray-800">{result.fileName}</p>
                </div>

                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="text-xs font-medium text-gray-600 mb-1">Размер:</p>
                  <p className="text-xs text-gray-800">{(result.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>

              {/* Preview if image */}
              {result.type.startsWith('image/') && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-600 mb-2">Предварительный просмотр:</p>
                  <img
                    src={result.url}
                    alt="Uploaded"
                    className="max-w-full h-auto rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">📝 Инструкция:</h3>
            <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
              <li>Авторизуйтесь на главной странице (<a href="/" className="text-blue-600 hover:underline">перейти</a>)</li>
              <li>Откройте DevTools (F12) → Application → Local Storage → выберите localhost:3000</li>
              <li>Скопируйте значение ключа <code className="bg-gray-200 px-1 rounded">token</code></li>
              <li>Вставьте токен в поле выше</li>
              <li>Выберите файл и нажмите "Загрузить файл"</li>
              <li>Проверьте Yandex Cloud Console → Object Storage → edubaza-storage → папка test/</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'LOADING';
  data?: any;
  error?: string;
}

export default function TestPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const tests = [
    { name: 'PostgreSQL (direct)', endpoint: '/api/test/db' },
    { name: 'PostgreSQL (Prisma)', endpoint: '/api/test/prisma' },
    { name: 'Redis', endpoint: '/api/test/redis' },
    { name: 'Gemini API', endpoint: '/api/test/gemini' },
    { name: 'Eskiz.uz API', endpoint: '/api/test/eskiz' },
  ];

  const runTest = async (test: typeof tests[0]) => {
    try {
      const response = await fetch(test.endpoint);
      const data = await response.json();
      return {
        name: test.name,
        status: data.success ? 'PASS' : 'FAIL',
        data: data,
      } as TestResult;
    } catch (error) {
      return {
        name: test.name,
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error',
      } as TestResult;
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setResults(tests.map(t => ({ name: t.name, status: 'LOADING' as const })));

    const testResults = await Promise.all(tests.map(runTest));
    setResults(testResults);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    if (status === 'PASS') return '✅';
    if (status === 'FAIL') return '❌';
    return '⏳';
  };

  const getStatusColor = (status: string) => {
    if (status === 'PASS') return 'text-green-600';
    if (status === 'FAIL') return 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🧪 EduBaza.uz - Infrastructure Tests
          </h1>
          <p className="text-gray-600">
            Test all infrastructure components: Database, Cache, APIs
          </p>
        </div>

        {/* Run Tests Button */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <button
            onClick={runAllTests}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 text-lg"
          >
            {loading ? '⏳ Running Tests...' : '🚀 Run All Tests'}
          </button>
        </div>

        {/* Test Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {result.name}
                  </h3>
                  <span className={`text-3xl ${getStatusColor(result.status)}`}>
                    {getStatusIcon(result.status)}
                  </span>
                </div>

                {result.data && (
                  <div className="space-y-2">
                    <p className={`font-medium ${getStatusColor(result.status)}`}>
                      {result.data.message}
                    </p>
                    {result.data.data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                          Show details
                        </summary>
                        <pre className="mt-2 p-4 bg-gray-50 rounded text-xs overflow-auto max-h-64">
                          {JSON.stringify(result.data.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                )}

                {result.error && (
                  <p className="text-red-600 text-sm">
                    Error: {result.error}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {results.length > 0 && !loading && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              📊 Summary
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-gray-800">
                  {results.length}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="p-4 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">
                  {results.filter(r => r.status === 'PASS').length}
                </div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="p-4 bg-red-50 rounded">
                <div className="text-2xl font-bold text-red-600">
                  {results.filter(r => r.status === 'FAIL').length}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>EduBaza.uz Platform v2.0 - Development Environment</p>
          <p className="mt-2">
            <a href="/" className="text-indigo-600 hover:text-indigo-800">
              ← Back to Home
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

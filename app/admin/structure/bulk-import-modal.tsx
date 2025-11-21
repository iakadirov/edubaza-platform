'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';

interface BulkImportModalProps {
  subjectId: string;
  subjectName: string;
  gradeNumber: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkImportModal({ subjectId, subjectName, gradeNumber, onClose, onSuccess }: BulkImportModalProps) {
  const [text, setText] = useState('');
  const [format, setFormat] = useState<'simple' | 'structured'>('simple');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<Array<{title: string, quarter?: number, weekNumber?: number, sortOrder?: number}>>([]);

  // Parse text into topics
  const parseText = () => {
    if (!text.trim()) {
      alert('Matn kiritilmagan');
      return;
    }

    const lines = text.split('\n').filter(line => line.trim());
    const parsed = [];

    if (format === 'simple') {
      // Format: "1. Topic name - week 1 - quarter 1"
      // or: "Topic name"
      for (const line of lines) {
        let sortOrder: number | undefined;
        let title = line.trim();
        let quarter: number | undefined;
        let weekNumber: number | undefined;

        // Extract sortOrder from начала (1., 2., etc)
        const orderMatch = title.match(/^(\d+)\.\s*/);
        if (orderMatch) {
          sortOrder = parseInt(orderMatch[1]);
          title = title.substring(orderMatch[0].length);
        }

        // Extract quarter (1-chorak, 2-chorak, etc)
        const quarterMatch = title.match(/(\d+)-chorak/i);
        if (quarterMatch) {
          quarter = parseInt(quarterMatch[1]);
          title = title.replace(quarterMatch[0], '').trim();
        }

        // Extract week (1-hafta, 2-hafta, etc)
        const weekMatch = title.match(/(\d+)-hafta/i);
        if (weekMatch) {
          weekNumber = parseInt(weekMatch[1]);
          title = title.replace(weekMatch[0], '').trim();
        }

        // Clean up separators (-, •, etc)
        title = title.replace(/^[-•\s]+/, '').replace(/[-•\s]+$/, '').trim();

        if (title) {
          parsed.push({ title, quarter, weekNumber, sortOrder });
        }
      }
    } else {
      // Structured format: "Title\tQuarter\tWeek\tOrder"
      for (const line of lines) {
        const parts = line.split('\t');
        if (parts.length >= 1) {
          const title = parts[0].trim();
          const quarter = parts[1] ? parseInt(parts[1]) : undefined;
          const weekNumber = parts[2] ? parseInt(parts[2]) : undefined;
          const sortOrder = parts[3] ? parseInt(parts[3]) : undefined;

          if (title) {
            parsed.push({ title, quarter, weekNumber, sortOrder });
          }
        }
      }
    }

    setPreview(parsed);
  };

  // Submit import
  const handleImport = async () => {
    if (preview.length === 0) {
      alert('Namuna yo\'q. Avval "Preview" tugmasini bosing');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/topics/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subjectId,
          gradeNumber,
          topics: preview,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        onSuccess();
        onClose();
      } else {
        alert(data.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Import xatosi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon icon="solar:upload-twice-square-bold-duotone" className="text-3xl text-green-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-800">Ommaviy import</h2>
                <p className="text-sm text-gray-600">{subjectName} • {gradeNumber}-sinf</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icon icon="solar:close-circle-bold" className="text-2xl text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
            <div className="flex gap-3">
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  value="simple"
                  checked={format === 'simple'}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="sr-only"
                />
                <div className={`p-3 border-2 rounded-lg transition-colors ${
                  format === 'simple' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <div className="font-semibold text-gray-800 mb-1">Oddiy format</div>
                  <div className="text-xs text-gray-600">
                    Har bir qatorda mavzu nomi<br/>
                    Misol: <code className="bg-gray-100 px-1">1. Sonli nur va shkala - 1-chorak - 1-hafta</code>
                  </div>
                </div>
              </label>

              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  value="structured"
                  checked={format === 'structured'}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="sr-only"
                />
                <div className={`p-3 border-2 rounded-lg transition-colors ${
                  format === 'structured' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <div className="font-semibold text-gray-800 mb-1">Strukturali format (Excel)</div>
                  <div className="text-xs text-gray-600">
                    Tab bilan ajratilgan ustunlar<br/>
                    Misol: <code className="bg-gray-100 px-1">Mavzu nomi&nbsp;&nbsp;&nbsp;1&nbsp;&nbsp;&nbsp;1&nbsp;&nbsp;&nbsp;1</code>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mavzular ro'yxati
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={format === 'simple'
                ? "1. Sonli nur va shkala - 1-chorak - 1-hafta\n2. O'nli kasrlar - 1-chorak - 1-hafta\n3. O'nli kasrlarni qo'shish - 1-chorak - 2-hafta"
                : "Mavzu nomi\t1\t1\t1\nIkkinchi mavzu\t1\t2\t2"
              }
              className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              <Icon icon="solar:info-circle-bold" className="inline text-blue-500 mr-1" />
              {format === 'simple' ? (
                'Har bir qatorga bitta mavzu. Chorak va hafta ixtiyoriy.'
              ) : (
                'Ustunlar: Mavzu nomi, Chorak, Hafta, Tartib raqami (Tab bilan ajratilgan)'
              )}
            </p>
          </div>

          {/* Preview Button */}
          <button
            onClick={parseText}
            disabled={!text.trim()}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Icon icon="solar:eye-bold-duotone" className="text-xl" />
            Namunani ko'rish ({text.split('\n').filter(l => l.trim()).length} qator)
          </button>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="border-2 border-green-200 rounded-lg overflow-hidden">
              <div className="bg-green-50 px-4 py-2 border-b border-green-200">
                <div className="font-semibold text-green-800">
                  Namuna: {preview.length} ta mavzu topildi
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold text-gray-700">№</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-700">Mavzu</th>
                      <th className="text-center px-3 py-2 font-semibold text-gray-700">Chorak</th>
                      <th className="text-center px-3 py-2 font-semibold text-gray-700">Hafta</th>
                      <th className="text-center px-3 py-2 font-semibold text-gray-700">Tartib</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((topic, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-600">{index + 1}</td>
                        <td className="px-3 py-2 font-medium text-gray-800">{topic.title}</td>
                        <td className="px-3 py-2 text-center text-gray-600">{topic.quarter || '-'}</td>
                        <td className="px-3 py-2 text-center text-gray-600">{topic.weekNumber || '-'}</td>
                        <td className="px-3 py-2 text-center text-gray-600">{topic.sortOrder || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleImport}
            disabled={preview.length === 0 || loading}
            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Icon icon="solar:loading-bold" className="text-xl animate-spin" />
                Yuklanyapti...
              </>
            ) : (
              <>
                <Icon icon="solar:check-circle-bold" className="text-xl" />
                Import qilish ({preview.length} ta)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

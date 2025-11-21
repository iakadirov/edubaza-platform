'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

interface Subject {
  id: string;
  code: string;
  nameUz: string;
  icon: string;
  color: string;
}

interface Topic {
  id: string;
  titleUz: string;
  subjectId: string;
  gradeNumber: number;
  quarter?: number;
  weekNumber?: number;
  sortOrder?: number;
  subject: {
    nameUz: string;
    icon: string;
  };
}

interface TopicsContextProps {
  subjects: Subject[];
  topics: Topic[];
  onAddTopic: () => void;
  onEditTopic: (topic: Topic) => void;
  onImport: () => void;
}

export default function TopicsContext({ subjects, topics, onAddTopic, onEditTopic, onImport }: TopicsContextProps) {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | ''>('');
  const [selectedQuarter, setSelectedQuarter] = useState<number | ''>('');
  const [selectedWeek, setSelectedWeek] = useState('');

  // Filter topics based on context
  const contextTopics = topics.filter(topic => {
    if (!selectedSubject || !selectedGrade) return false;
    if (topic.subjectId !== selectedSubject) return false;
    if (topic.gradeNumber !== selectedGrade) return false;
    if (selectedQuarter && topic.quarter !== selectedQuarter) return false;
    if (selectedWeek && topic.weekNumber !== parseInt(selectedWeek)) return false;
    return true;
  });

  // Group topics by quarter
  const topicsByQuarter = contextTopics.reduce((acc, topic) => {
    const quarter = topic.quarter || 0;
    if (!acc[quarter]) acc[quarter] = [];
    acc[quarter].push(topic);
    return acc;
  }, {} as Record<number, Topic[]>);

  // Sort quarters
  const quarters = Object.keys(topicsByQuarter).map(Number).sort((a, b) => a - b);

  const hasContext = !!selectedSubject && !!selectedGrade;

  return (
    <div className="space-y-4">
      {/* Context Selection - Always Visible */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon icon="solar:settings-bold-duotone" className="text-2xl text-blue-600" />
          <h3 className="font-bold text-gray-800">Ish kontekstini tanlang</h3>
          <span className="text-xs text-gray-500">(majburiy)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Subject - Required */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Fan * <span className="text-red-500">⬤</span>
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className={`w-full px-3 py-2.5 border-2 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 ${
                selectedSubject ? 'border-blue-500 bg-white' : 'border-gray-300 bg-gray-50'
              }`}
            >
              <option value="">Fanni tanlang...</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.icon} {subject.nameUz}
                </option>
              ))}
            </select>
          </div>

          {/* Grade - Required */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Sinf * <span className="text-red-500">⬤</span>
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value ? parseInt(e.target.value) : '')}
              className={`w-full px-3 py-2.5 border-2 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 ${
                selectedGrade ? 'border-blue-500 bg-white' : 'border-gray-300 bg-gray-50'
              }`}
            >
              <option value="">Sinfni tanlang...</option>
              {[1,2,3,4,5,6,7,8,9,10,11].map(grade => (
                <option key={grade} value={grade}>{grade}-sinf</option>
              ))}
            </select>
          </div>

          {/* Quarter - Optional */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Chorak (ixtiyoriy)
            </label>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value ? parseInt(e.target.value) : '')}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={!hasContext}
            >
              <option value="">Barcha choraklar</option>
              {[1,2,3,4].map(quarter => (
                <option key={quarter} value={quarter}>{quarter}-chorak</option>
              ))}
            </select>
          </div>

          {/* Week - Optional */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Hafta (ixtiyoriy)
            </label>
            <input
              type="number"
              min="1"
              max="9"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              placeholder="1-9"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={!hasContext}
            />
          </div>
        </div>

        {hasContext && (
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Icon icon="solar:check-circle-bold" className="text-green-500 text-lg" />
              <span className="text-green-700 font-medium">
                Kontekst: {subjects.find(s => s.id === selectedSubject)?.nameUz} • {selectedGrade}-sinf
                {selectedQuarter && ` • ${selectedQuarter}-chorak`}
                {selectedWeek && ` • ${selectedWeek}-hafta`}
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedSubject('');
                setSelectedGrade('');
                setSelectedQuarter('');
                setSelectedWeek('');
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Icon icon="solar:restart-bold-duotone" className="text-base" />
              Tozalash
            </button>
          </div>
        )}
      </div>

      {/* Show content only if context is selected */}
      {!hasContext ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Icon icon="solar:danger-triangle-bold-duotone" className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">Ish kontekstini tanlang</h3>
          <p className="text-gray-600">
            Mavzular bilan ishlash uchun yuqorida <span className="font-semibold">Fan</span> va <span className="font-semibold">Sinf</span>ni tanlang
          </p>
        </div>
      ) : (
        <>
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={onAddTopic}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors"
              >
                <Icon icon="solar:add-circle-bold-duotone" className="text-xl" />
                <span>Yangi mavzu</span>
              </button>

              <button
                onClick={onImport}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors"
              >
                <Icon icon="solar:upload-twice-square-bold-duotone" className="text-xl" />
                <span>Ommaviy import</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">
                Jami: <span className="font-semibold text-gray-900">{contextTopics.length}</span> ta mavzu
              </div>
            </div>
          </div>

          {/* Topics grouped by quarter */}
          {contextTopics.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Icon icon="solar:folder-open-bold-duotone" className="text-5xl text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Mavzular topilmadi</h3>
              <p className="text-gray-500 text-sm">Yangi mavzu qo'shish uchun yuqoridagi tugmani bosing</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quarters.map(quarter => {
                const quarterTopics = topicsByQuarter[quarter];
                const quarterName = quarter === 0 ? 'Chorak ko\'rsatilmagan' : `${quarter}-chorak`;

                return (
                  <div key={quarter} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon icon="solar:calendar-bold-duotone" className="text-2xl text-indigo-600" />
                          <div>
                            <h3 className="font-bold text-gray-800">{quarterName}</h3>
                            <p className="text-xs text-gray-600">{quarterTopics.length} ta mavzu</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="space-y-2">
                        {quarterTopics.map((topic, index) => (
                          <div
                            key={topic.id}
                            className="group flex items-center gap-3 p-3 border border-gray-200 hover:border-blue-400 hover:shadow-sm rounded-lg transition-all cursor-pointer"
                            onClick={() => onEditTopic(topic)}
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                              {topic.sortOrder || index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800">{topic.titleUz}</p>
                              {topic.weekNumber && (
                                <p className="text-xs text-gray-500 mt-0.5">{topic.weekNumber}-hafta</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditTopic(topic);
                                }}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Ko'rish va tahrirlash"
                              >
                                <Icon icon="solar:pen-bold-duotone" className="text-lg" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

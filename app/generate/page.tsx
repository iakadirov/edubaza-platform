'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import GradeSelector from '@/components/worksheet/GradeSelector';
import ContentSelector from '@/components/worksheet/ContentSelector';
import GoalSelector from '@/components/worksheet/GoalSelector';
import GenerationParams from '@/components/worksheet/GenerationParams';
import AdvancedSettings from '@/components/worksheet/AdvancedSettings';
import ParametersPreview from '@/components/worksheet/ParametersPreview';
import GenerationProgress from '@/components/worksheet/GenerationProgress';

interface Grade {
  number: number;
  nameUz: string;
  isActive: boolean;
}

interface Subject {
  id: string;
  code: string;
  nameUz: string;
  descriptionUz?: string;
  icon: string;
  color: string;
}

interface Topic {
  id: string;
  titleUz: string;
  gradeNumber: number;
  quarter: number | null;
  keywords: string[];
}

type ContentType = 'SUBJECT' | 'SKILL';
type GoalType = 'TOPIC' | 'CONTROL';

export default function GenerateNewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  // Данные из API
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  // Шаг 1: Класс
  const [selectedGrade, setSelectedGrade] = useState<number>(5);
  const [isMobile, setIsMobile] = useState(false);

  // Шаг 2: Тип контента (Предмет или Навык)
  const [contentType, setContentType] = useState<ContentType>('SUBJECT');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  // Шаг 3: Цель
  const [goalType, setGoalType] = useState<GoalType>('TOPIC');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedQuarter, setSelectedQuarter] = useState<number>(1);
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>([]);

  // Шаг 4: Параметры
  const [taskCount, setTaskCount] = useState(10);
  const [aiPercentage, setAiPercentage] = useState<number>(0);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(['EASY', 'MEDIUM']);
  const [selectedTaskTypes, setSelectedTaskTypes] = useState<string[]>([]);

  // Шаг 5: Advanced (опционально)
  const [language, setLanguage] = useState('uz-latn');
  const [tone, setTone] = useState<string>('FRIENDLY');
  const [context, setContext] = useState<string>('MIX');
  const [customInstructions, setCustomInstructions] = useState('');

  // Проверка мобильного устройства
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Проверка авторизации
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // Загрузка классов
  useEffect(() => {
    loadGrades();
  }, []);

  // Загрузка предметов при смене класса
  useEffect(() => {
    if (selectedGrade && contentType === 'SUBJECT') {
      loadSubjects(selectedGrade);
    }
  }, [selectedGrade, contentType]);

  // Загрузка тем при смене предмета
  useEffect(() => {
    if (selectedSubject && goalType === 'TOPIC') {
      loadTopics(selectedSubject.code, selectedGrade);
    }
  }, [selectedSubject, selectedGrade, goalType]);

  const loadGrades = async () => {
    try {
      const response = await fetch('/api/grades');
      const data = await response.json();
      if (data.success) {
        setGrades(data.data);
      }
    } catch (error) {
      console.error('Failed to load grades:', error);
    }
  };

  const loadSubjects = async (grade: number) => {
    try {
      const response = await fetch(`/api/subjects?grade=${grade}`);
      const data = await response.json();
      if (data.success) {
        setSubjects(data.data);
      }
    } catch (error) {
      console.error('Failed to load subjects:', error);
    }
  };

  const loadTopics = async (subjectCode: string, grade: number) => {
    try {
      const response = await fetch(`/api/topics?subjectCode=${subjectCode}&grade=${grade}`);
      const data = await response.json();
      if (data.success) {
        setTopics(data.data);
      }
    } catch (error) {
      console.error('Failed to load topics:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Валидация
    if (contentType === 'SUBJECT' && !selectedSubject) {
      setError('Iltimos, fanni tanlang');
      return;
    }

    if (contentType === 'SKILL' && !selectedSkill) {
      setError('Iltimos, koʻnikmani tanlang');
      return;
    }

    if (goalType === 'TOPIC' && !selectedTopic && contentType === 'SUBJECT') {
      setError('Iltimos, mavzuni tanlang');
      return;
    }

    if (selectedTaskTypes.length === 0) {
      setError('Kamida bitta topshiriq turini tanlang');
      return;
    }

    setShowProgress(true);
    setProgress(0);

    try {
      // Подготовка данных для API
      const requestBody: any = {
        grade: selectedGrade,
        taskCount,
        aiPercentage,
        difficulty: selectedDifficulties,
        taskTypes: selectedTaskTypes,
        language,
        tone,
        context,
        customInstructions,
      };

      if (contentType === 'SUBJECT') {
        requestBody.subject = selectedSubject?.code;
        if (goalType === 'TOPIC') {
          requestBody.topicId = selectedTopic?.id;
          requestBody.topic = selectedTopic?.titleUz;
        } else {
          requestBody.quarter = selectedQuarter;
          requestBody.weeks = selectedWeeks;
        }
        if (selectedFormat) {
          requestBody.format = selectedFormat;
        }
      } else {
        requestBody.skill = selectedSkill;
        requestBody.quarter = selectedQuarter;
        requestBody.weeks = selectedWeeks;
      }

      const token = localStorage.getItem('token');

      // Симуляция прогресса
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 90));
      }, 300);

      const response = await fetch('/api/worksheets/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      clearInterval(progressInterval);

      const data = await response.json();

      if (data.success) {
        setProgress(100);
        setTimeout(() => {
          router.push(`/worksheet/${data.data.worksheetId}`);
        }, 1500);
      } else {
        setShowProgress(false);
        setError(data.message || 'Topshiriq yaratishda xatolik yuz berdi');
      }
    } catch (error) {
      setShowProgress(false);
      setError('Serverga ulanishda xatolik yuz berdi');
      console.error('Generation error:', error);
    }
  };

  if (showProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <GenerationProgress
          progress={progress}
          onComplete={() => {
            // Completion handled in handleSubmit
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
              <Icon icon="solar:magic-stick-3-bold-duotone" className="text-blue-600" />
              Topshiriq yaratish
            </h1>
            <p className="text-gray-600 mt-2">AI yordamida sifatli topshiriqlar yarating</p>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Icon icon="solar:arrow-left-line-duotone" className="text-xl" />
            <span className="hidden md:inline">Ortga</span>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Шаг 1: Класс */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Sinf tanlang</h2>
            </div>

            <GradeSelector
              grades={grades}
              selectedGrade={selectedGrade}
              onChange={setSelectedGrade}
              isMobile={isMobile}
            />
          </div>

          {/* Шаг 2: Тип контента */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-lg">2</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Nima ustida ishlaysiz?</h2>
            </div>

            <ContentSelector
              contentType={contentType}
              onContentTypeChange={(type) => {
                setContentType(type);
                if (type === 'SUBJECT') {
                  setSelectedSkill(null);
                } else {
                  setSelectedSubject(null);
                  setSelectedFormat(null);
                  setSelectedTopic(null);
                }
              }}
              subjects={subjects}
              selectedSubject={selectedSubject}
              onSubjectChange={(subject) => {
                setSelectedSubject(subject);
                if (subject) {
                  loadTopics(subject.code, selectedGrade);
                }
              }}
              selectedSkill={selectedSkill}
              onSkillChange={setSelectedSkill}
              selectedFormat={selectedFormat}
              onFormatChange={setSelectedFormat}
            />
          </div>

          {/* Шаг 3: Цель */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-lg">3</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Maqsad</h2>
            </div>

            <GoalSelector
              contentType={contentType}
              goalType={goalType}
              onGoalTypeChange={setGoalType}
              topics={topics}
              selectedTopic={selectedTopic}
              onTopicChange={setSelectedTopic}
              selectedQuarter={selectedQuarter}
              onQuarterChange={setSelectedQuarter}
              selectedWeeks={selectedWeeks}
              onWeeksChange={setSelectedWeeks}
            />
          </div>

          {/* Шаг 4: Параметры генерации */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-bold text-lg">4</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Parametrlar</h2>
            </div>

            <GenerationParams
              taskCount={taskCount}
              onTaskCountChange={setTaskCount}
              aiPercentage={aiPercentage}
              onAiPercentageChange={setAiPercentage}
              selectedDifficulties={selectedDifficulties}
              onDifficultiesChange={setSelectedDifficulties}
              selectedTaskTypes={selectedTaskTypes}
              onTaskTypesChange={setSelectedTaskTypes}
            />
          </div>

          {/* Шаг 5: Advanced настройки */}
          <AdvancedSettings
            language={language}
            onLanguageChange={setLanguage}
            tone={tone}
            onToneChange={setTone}
            context={context}
            onContextChange={setContext}
            customInstructions={customInstructions}
            onCustomInstructionsChange={setCustomInstructions}
          />

          {/* Предпросмотр параметров */}
          <ParametersPreview
            grade={selectedGrade}
            contentType={contentType}
            subject={selectedSubject}
            skill={selectedSkill}
            format={selectedFormat}
            goalType={goalType}
            topic={selectedTopic}
            quarter={selectedQuarter}
            weeks={selectedWeeks}
            taskCount={taskCount}
            aiPercentage={aiPercentage}
            difficulties={selectedDifficulties}
            taskTypes={selectedTaskTypes}
          />

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-center gap-3">
              <Icon icon="solar:danger-triangle-bold" className="text-2xl flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Icon icon="solar:refresh-circle-bold-duotone" className="text-2xl animate-spin" />
                <span>Yaratilmoqda...</span>
              </>
            ) : (
              <>
                <Icon icon="solar:magic-stick-3-bold-duotone" className="text-2xl" />
                <span>Topshiriq yaratish</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';

interface Grade {
  number: number;
  nameUz: string;
  isActive: boolean;
}

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
  gradeNumber: number;
  quarter: number | null;
  weekNumber?: number | null;
  keywords: string[];
}

type MaterialType = 'MATERIAL' | 'KONIKMA' | 'BOSHQOTIRMA';
type GoalType = 'MAVZU_MUSTAHKAMLASH' | 'CHSB' | 'BSB' | 'KONIKMA';
type FormatType = 'DTS' | 'PISA' | 'OLIMPIADA' | 'KREATIV' | 'MIKIS';
type DifficultyType = 'OSON' | 'ORTA' | 'QIYIN' | 'MIKIS';

export default function GenerateChatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  // Data from API
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  // Main parameters - активная карточка
  const [materialType, setMaterialType] = useState<MaterialType>('MATERIAL');

  // Основные параметры для генерации
  const [selectedGrade, setSelectedGrade] = useState<number | null>(1);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<FormatType | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyType | null>(null);
  const [taskCount, setTaskCount] = useState<number | null>(10);
  const [selectedTaskTypes, setSelectedTaskTypes] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(['ORTA']);
  const [aiPercentage, setAiPercentage] = useState<number>(100); // 0-100, where 100 = 100% AI, 0 = 100% DB
  const [customInstructions, setCustomInstructions] = useState<string>('');

  // Для контрольных работ
  const [selectedQuarter, setSelectedQuarter] = useState<number>(1);
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>([]);

  // Для навыков
  const [selectedSkill, setSelectedSkill] = useState<string>('');

  // Variable editing state
  const [activeVariable, setActiveVariable] = useState<string | null>(null);
  const [topicSearchQuery, setTopicSearchQuery] = useState('');

  // Menu states
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);

  // Debug logs
  const [showDebugLogs, setShowDebugLogs] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [requestPayload, setRequestPayload] = useState<any>(null);

  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const sourceMenuRef = useRef<HTMLDivElement>(null);
  const formatMenuRef = useRef<HTMLDivElement>(null);

  // Check auth
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // Load data
  useEffect(() => {
    loadGrades();
  }, []);

  useEffect(() => {
    if (selectedGrade) {
      loadSubjects(selectedGrade);
    }
  }, [selectedGrade]);

  useEffect(() => {
    if (selectedSubject) {
      loadTopics(selectedSubject.code, selectedGrade);
    }
  }, [selectedSubject, selectedGrade]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
      if (sourceMenuRef.current && !sourceMenuRef.current.contains(event.target as Node)) {
        setShowSourceMenu(false);
      }
      if (formatMenuRef.current && !formatMenuRef.current.contains(event.target as Node)) {
        setShowFormatMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Generate dynamic text based on material type and goal
  const generateDynamicText = () => {
    const grade = `${selectedGrade}-sinf`;
    const subject = selectedSubject?.nameUz || 'Matematika';
    const topic = selectedTopic?.titleUz || 'Natural sonlar';
    const count = `${taskCount} ta`;

    if (materialType === 'NAZORAT') {
      if (goalType === 'MAVZU') {
        return `Menga ${grade} uchun ${subject} fanidan mavzuni mustahkamlash uchun ${topic} mavzusida DTS asosida, o'rtacha murakkablikda tuzilgan ${count} vazifadan iborat tarqatma material tayyorlab bering! Savollar yoqimli, sodda va tushunarli usulda tuzilgan bo'lsin.`;
      } else {
        return `Menga ${grade} uchun ${subject} fanidan ${topic} mavzusi bo'yicha nazorat ishi (SHSB/BSB) uchun DTS asosida, o'rtacha murakkablikda tuzilgan ${count} vazifadan iborat material tayyorlab bering! Savollar professional, aniq va talabalar bilimini to'liq tekshiradigan bo'lsin.`;
      }
    } else if (materialType === 'KONIKMA') {
      return `Menga ${grade} uchun ${subject} fanidan ${topic} mavzusida o'quvchilarning ko'nikmalarini rivojlantirish uchun ${count} vazifadan iborat amaliy topshiriqlar tayyorlab bering! Vazifalar turli xil formatda bo'lsin va o'quvchilar mantiqan o'ylash qobiliyatini rivojlantirsin.`;
    } else {
      return `Menga ${grade} uchun ${subject} fanidan ${topic} mavzusida o'quvchilar qiziqishini oshirish uchun ${count} ta o'yinchoq, boshqotirma va qiziqarli topshiriqlar tayyorlab bering! Vazifalar qiziqarli, kreativ va talabalar uchun qiziqarli bo'lsin.`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedGrade) {
      setError('Iltimos, sinfni tanlang');
      return;
    }

    if (!selectedSubject) {
      setError('Iltimos, fanni tanlang');
      return;
    }

    if (!selectedGoal) {
      setError('Iltimos, maqsadni tanlang');
      return;
    }

    if (!selectedTopic && selectedGoal !== 'CHSB' && selectedGoal !== 'BSB') {
      setError('Iltimos, mavzuni kiriting');
      return;
    }

    if (!selectedFormat) {
      setError('Iltimos, formatni tanlang');
      return;
    }

    if (!selectedDifficulty) {
      setError('Iltimos, qiyinlik darajasini tanlang');
      return;
    }

    if (!taskCount) {
      setError('Iltimos, topshiriqlar sonini belgilang');
      return;
    }

    setShowProgress(true);
    setProgress(0);

    try {
      const requestBody = {
        grade: selectedGrade,
        subject: selectedSubject.code,
        topic: selectedTopic?.titleUz || `${selectedGoal} - ${selectedQuarter}-chorak`,
        topicId: selectedTopic?.id || null,
        taskCount,
        aiPercentage,
        difficulty: selectedDifficulties.length > 0 ? selectedDifficulties : [selectedDifficulty],
        taskTypes: selectedTaskTypes.length > 0 ? selectedTaskTypes : ['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'LONG_ANSWER'],
        format: selectedFormat,
        language: 'uz-latn',
        tone: 'FRIENDLY',
        context: 'MIX',
        goal: selectedGoal,
        quarter: selectedQuarter,
        weeks: selectedWeeks,
        customInstructions: customInstructions || undefined,
      };

      // Generate debug prompt
      const debugPrompt = `SINF: ${selectedGrade}-sinf
FAN: ${selectedSubject.nameUz} (${selectedSubject.code})
MAQSAD: ${selectedGoal}
${selectedTopic ? `MAVZU: ${selectedTopic.titleUz}` : `CHORAK: ${selectedQuarter}`}
${selectedWeeks.length > 0 ? `HAFTALAR: ${selectedWeeks.join(', ')}` : ''}
FORMAT: ${selectedFormat}
QIYINLIK: ${selectedDifficulty} (${selectedDifficulties.join(', ')})
TOPSHIRIQLAR SONI: ${taskCount}
TOPSHIRIQ TURLARI: ${requestBody.taskTypes.join(', ')}

=== YARATILGAN PROMTP ===
Menga ${selectedGrade}-sinf uchun ${selectedSubject.nameUz} fanidan ${selectedGoal === 'MAVZU_MUSTAHKAMLASH' ? 'mavzuni mustahkamlash' : selectedGoal === 'CHSB' ? 'CHSB' : selectedGoal === 'BSB' ? 'BSB' : "ko'nikmani rivojlantirish"} uchun ${selectedTopic?.titleUz || `${selectedQuarter}-chorak`} ${selectedGoal === 'MAVZU_MUSTAHKAMLASH' ? 'mavzusida' : 'ga oid,'} ${selectedFormat} formatda ${selectedDifficulty === 'OSON' ? 'oson' : selectedDifficulty === 'ORTA' ? "o'rtacha" : selectedDifficulty === 'QIYIN' ? 'qiyin' : 'aralash'} murakkablikda tuzilgan ${taskCount} ta vazifadan iborat printerdan chiqarishga tayyor material tuzib bering!`;

      setGeneratedPrompt(debugPrompt);
      setRequestPayload(requestBody);
      setShowDebugLogs(true);

      const token = localStorage.getItem('token');

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
        // Немедленный редирект на созданный worksheet
        router.push(`/worksheet/${data.data.worksheetId}`);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <Icon icon="solar:magic-stick-3-bold-duotone" className="text-6xl text-blue-600 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Topshiriqlar yaratilmoqda...</h2>
          <p className="text-gray-600 mb-6">AI yordamida sifatli topshiriqlar tayyorlanmoqda</p>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500">{progress}%</p>
        </div>
      </div>
    );
  }

  const materialTypeCards = [
    {
      type: 'MATERIAL' as MaterialType,
      title: 'Materiallar yaratish',
      description: "O'quvchilar uchun yuqori sifatda, professional tuzilgan topshiriqlar, nazorat ishlari va mashqlar yaratish",
      icon: 'solar:document-add-bold-duotone',
      color: '#406CFF',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      enabled: true,
    },
    {
      type: 'KONIKMA' as MaterialType,
      title: "Ko'nikmalarni rivojlantirish",
      description: "Tez kunda",
      icon: 'solar:notes-bold-duotone',
      color: '#9CA3AF',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      enabled: false,
    },
    {
      type: 'BOSHQOTIRMA' as MaterialType,
      title: "Boshqotirma va o'yinlar",
      description: "Tez kunda",
      icon: 'solar:lightbulb-bolt-bold-duotone',
      color: '#9CA3AF',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      enabled: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-[1278px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-800">Edubaza AI</h1>
            <span className="px-2 py-0.5 bg-white text-gray-600 text-xs font-medium rounded-full border border-gray-200">
              Beta
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDebugLogs(!showDebugLogs)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                showDebugLogs
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
              }`}
            >
              <Icon icon="solar:code-bold-duotone" className="text-lg" />
              <span className="text-sm font-medium">Debug Logs</span>
            </button>
            <Link
              href="/generate"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Eski versiya
            </Link>
          </div>
        </div>

        {/* Main Container */}
        <div className="bg-white rounded-3xl shadow-sm p-12 space-y-8">
          {/* Title */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Icon icon="solar:magic-stick-3-bold-duotone" className="text-2xl text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-black text-center">
              Edubaza AI xizmati haqida
            </h2>
          </div>

          {/* Material Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {materialTypeCards.map((card) => (
              <button
                key={card.type}
                type="button"
                onClick={() => card.enabled && setMaterialType(card.type)}
                disabled={!card.enabled}
                className={`flex flex-col items-start p-6 rounded-3xl border transition-all ${
                  !card.enabled
                    ? 'opacity-60 cursor-not-allowed border-gray-100'
                    : materialType === card.type
                    ? 'border-gray-300 shadow-md'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Icon icon={card.icon} className="text-2xl" style={{ color: card.color }} />
                  <h3 className="font-medium text-base" style={{ color: card.color }}>
                    {card.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed text-left">
                  {card.description}
                </p>
              </button>
            ))}
          </div>

          {/* Warning Banner */}
          <div className="bg-[#F8FAFF] border border-[#EFF3FD] rounded-3xl p-6">
            <h4 className="font-medium text-base text-[#F46A52] mb-2">Eslatma!</h4>
            <p className="text-base text-gray-600">
              AI tomonidan yaratilgan topshiriqlar avtomatik tekshiriladi va takomillashtiriladi
            </p>
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white border border-gray-200 rounded-3xl shadow-md">
              {/* Text Area */}
              <div className="p-6 pb-[68px]">
                {/* Dynamic Text with Interactive Variables */}
                <p className="text-lg font-medium text-black leading-relaxed">
                  Menga{' '}
                  {/* Grade Variable */}
                  <button
                    type="button"
                    onClick={() => setActiveVariable('grade')}
                    title="Sinfni tanlang"
                    className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium text-lg ${
                      selectedGrade
                        ? 'text-[#1761FF]'
                        : 'bg-white border border-dashed border-[#DFDFDF] text-[#8099FF]'
                    }`}
                  >
                    {selectedGrade ? `${selectedGrade}-sinf` : 'sinf tanlang'}
                  </button>
                  {' '}uchun{' '}
                  {/* Subject Variable */}
                  <button
                    type="button"
                    onClick={() => setActiveVariable('subject')}
                    title="Fanni tanlang"
                    className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium text-lg ${
                      selectedSubject
                        ? 'text-[#1761FF]'
                        : 'bg-white border border-dashed border-[#DFDFDF] text-[#8099FF]'
                    }`}
                  >
                    {selectedSubject?.nameUz || 'fan tanlang'}
                  </button>
                  {' '}fanidan{' '}
                  {/* Goal Variable */}
                  <button
                    type="button"
                    onClick={() => setActiveVariable('goal')}
                    title="Maqsadni tanlang"
                    className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium text-lg ${
                      selectedGoal
                        ? 'text-[#1761FF]'
                        : 'bg-white border border-dashed border-[#DFDFDF] text-[#8099FF]'
                    }`}
                  >
                    {selectedGoal === 'MAVZU_MUSTAHKAMLASH' && 'mavzuni mustahkamlash'}
                    {selectedGoal === 'CHSB' && 'CHSB'}
                    {selectedGoal === 'BSB' && 'BSB'}
                    {selectedGoal === 'KONIKMA' && "ko'nikmani rivojlantirish"}
                    {!selectedGoal && 'maqsad tanlang'}
                  </button>
                  {' '}uchun{' '}
                  {/* Topic/Quarter Variable - depends on goal */}
                  {(selectedGoal === 'MAVZU_MUSTAHKAMLASH' || selectedGoal === 'KONIKMA' || !selectedGoal) && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveVariable('topic')}
                        title="Mavzuni kiriting"
                        className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium text-lg ${
                          selectedTopic
                            ? 'text-[#1761FF]'
                            : 'bg-white border border-dashed border-[#DFDFDF] text-[#8099FF]'
                        }`}
                      >
                        {selectedTopic?.titleUz || 'mavzuni kiriting'}
                      </button>
                      {' '}mavzusida{' '}
                    </>
                  )}
                  {selectedGoal === 'CHSB' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveVariable('quarter')}
                        title="Chorakni tanlang"
                        className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium text-lg text-[#1761FF]"
                      >
                        {selectedQuarter}-chorak
                      </button>
                      {' '}ga oid,{' '}
                    </>
                  )}
                  {selectedGoal === 'BSB' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveVariable('weeks')}
                        title="Haftalarni tanlang"
                        className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium text-lg text-[#1761FF]"
                      >
                        {selectedQuarter}-chorak {selectedWeeks.length > 0 ? `(${selectedWeeks.length} hafta)` : ''}
                      </button>
                      {' '}ga oid,{' '}
                    </>
                  )}
                  {/* Format Variable */}
                  <button
                    type="button"
                    onClick={() => setActiveVariable('format')}
                    title="Formatni tanlang"
                    className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium text-lg ${
                      selectedFormat
                        ? 'text-[#1761FF]'
                        : 'bg-white border border-dashed border-[#DFDFDF] text-[#8099FF]'
                    }`}
                  >
                    {selectedFormat || 'formatni tanlang'}
                  </button>
                  {' '}formatda{' '}
                  {/* Difficulty Variable */}
                  <button
                    type="button"
                    onClick={() => setActiveVariable('difficulty')}
                    title="Qiyinlik darajasini tanlang"
                    className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium text-lg ${
                      selectedDifficulty
                        ? 'text-[#1761FF]'
                        : 'bg-white border border-dashed border-[#DFDFDF] text-[#8099FF]'
                    }`}
                  >
                    {selectedDifficulty === 'OSON' && 'oson'}
                    {selectedDifficulty === 'ORTA' && "o'rtacha"}
                    {selectedDifficulty === 'QIYIN' && 'qiyin'}
                    {selectedDifficulty === 'MIKIS' && 'aralash'}
                    {!selectedDifficulty && 'darajani tanlang'}
                  </button>
                  {' '}murakkablikda tuzilgan{' '}
                  {/* Task Count Variable */}
                  <button
                    type="button"
                    onClick={() => setActiveVariable('taskCount')}
                    title="Topshiriqlar sonini belgilang"
                    className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium text-lg ${
                      taskCount
                        ? 'text-[#1761FF]'
                        : 'bg-white border border-dashed border-[#DFDFDF] text-[#8099FF]'
                    }`}
                  >
                    {taskCount ? `${taskCount} ta` : 'sonini tanlang'}
                  </button>
                  {' '}vazifadan iborat printerdan chiqarishga tayyor material tuzib bering. Savollar{' '}
                  {/* Source Ratio Variable */}
                  <button
                    type="button"
                    onClick={() => setActiveVariable('source')}
                    title="Manbani tanlang"
                    className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium text-lg text-[#1761FF]"
                  >
                    {aiPercentage === 100
                      ? '100% AI'
                      : aiPercentage === 0
                      ? '100% darslik'
                      : `${100 - aiPercentage}% darslik - ${aiPercentage}% AI`}
                  </button>
                  {' '}asosida tuzilsin!{' '}
                  <input
                    type="text"
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="Maxsus ko'rsatmalar kiriting..."
                    className="inline-block border-none outline-none bg-transparent text-gray-400 placeholder-gray-300 italic font-normal text-lg min-w-[200px] focus:text-gray-600"
                    style={{ width: customInstructions ? `${Math.max(customInstructions.length * 10, 200)}px` : '200px' }}
                  />
                </p>
              </div>

              {/* Bottom Bar */}
              <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100">
                {/* Left: Settings Button */}
                <div className="flex items-center gap-3">
                  {/* Settings */}
                  <div className="relative" ref={settingsMenuRef}>
                    <button
                      type="button"
                      onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                      className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-100 rounded-full hover:border-gray-200 transition-colors"
                    >
                      <Icon icon="solar:tuning-square-2-linear" className="text-xl text-gray-600" />
                      <span className="font-medium text-base text-gray-600">Qo'shimcha sozlamalar</span>
                    </button>

                    {showSettingsMenu && (
                      <div className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 min-w-[280px] z-50">
                        <div className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveVariable('taskTypes');
                              setShowSettingsMenu(false);
                            }}
                            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Icon icon="solar:list-check-bold-duotone" className="text-xl text-blue-600" />
                              <span className="text-sm font-medium text-gray-700">Topshiriq turlari</span>
                            </div>
                            <Icon icon="solar:alt-arrow-right-linear" className="text-gray-400" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Magical Generate Button with Gas Gradient Animation */}
                <div className="relative">
                  <button
                    type="submit"
                    disabled={loading || !selectedSubject}
                    className="relative px-8 py-4 rounded-full border-none transition-all disabled:cursor-not-allowed overflow-hidden shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-60 disabled:scale-100"
                    style={{
                      background: 'transparent',
                      zIndex: 1,
                    }}
                  >
                    {/* The "Gas" Animation Layer */}
                    {(!loading && selectedSubject) ? (
                      <div className="absolute inset-0 -z-10 overflow-hidden rounded-full">
                        <div className="absolute inset-0 gradient-gas-layer-1"></div>
                        <div className="absolute inset-0 gradient-gas-layer-2"></div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full"></div>
                    )}

                    {/* Button Content */}
                    <div className="relative flex items-center gap-3 z-10">
                      <Icon icon="solar:stars-bold-duotone" className="text-2xl text-white drop-shadow-sm" />
                      <span className="font-semibold text-lg text-white tracking-wide drop-shadow-sm">TAYYORLASH</span>
                    </div>

                    {/* Hover white border effect */}
                    <div className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
                         style={{ boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.5)' }}>
                    </div>
                  </button>

                  <style jsx>{`
                    /* Gas Animation Layers */
                    .gradient-gas-layer-1::before,
                    .gradient-gas-layer-1::after {
                      content: '';
                      position: absolute;
                      width: 200%;
                      height: 200%;
                      top: -70%;
                      left: -70%;
                      background: radial-gradient(
                        circle at 50% 50%,
                        rgba(65, 144, 234, 0.9),
                        rgba(65, 144, 234, 0.6),
                        rgba(232, 34, 165, 0.4),
                        transparent 70%
                      );
                      filter: blur(20px);
                      opacity: 0.8;
                      animation: moveGas1 8s infinite alternate ease-in-out;
                    }

                    .gradient-gas-layer-2::before,
                    .gradient-gas-layer-2::after {
                      content: '';
                      position: absolute;
                      width: 200%;
                      height: 200%;
                      top: -70%;
                      left: -70%;
                      background: radial-gradient(
                        circle at 50% 50%,
                        rgba(20, 255, 178, 0.8),
                        rgba(160, 0, 223, 0.6),
                        rgba(128, 52, 183, 0.5),
                        transparent 70%
                      );
                      filter: blur(20px);
                      opacity: 0.7;
                      animation: moveGas2 10s infinite alternate-reverse ease-in-out;
                    }

                    @keyframes moveGas1 {
                      0% {
                        transform: translate(-10%, -10%) rotate(0deg) scale(1);
                      }
                      50% {
                        transform: translate(10%, 5%) rotate(20deg) scale(1.2);
                      }
                      100% {
                        transform: translate(-5%, 10%) rotate(-10deg) scale(1.1);
                      }
                    }

                    @keyframes moveGas2 {
                      0% {
                        transform: translate(5%, -15%) rotate(10deg) scale(1.1);
                      }
                      50% {
                        transform: translate(-10%, 10%) rotate(-15deg) scale(0.95);
                      }
                      100% {
                        transform: translate(15%, -5%) rotate(25deg) scale(1.15);
                      }
                    }

                    button:hover {
                      transform: scale(1.02);
                      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                    }

                    button:disabled {
                      transform: scale(1);
                      cursor: not-allowed;
                    }
                  `}</style>
                </div>
              </div>
            </div>
          </form>

          {/* Debug Logs Panel */}
          {showDebugLogs && (
            <div className="bg-gray-900 border border-gray-700 rounded-3xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-800">
                <div className="flex items-center gap-3">
                  <Icon icon="solar:code-bold-duotone" className="text-2xl text-green-400" />
                  <h3 className="font-semibold text-lg text-white">Debug Logs</h3>
                  <span className="text-xs text-gray-400">Промпт и параметры запроса</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDebugLogs(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Icon icon="solar:close-circle-bold" className="text-2xl" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                {/* Generated Prompt */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon icon="solar:chat-round-line-bold-duotone" className="text-xl text-blue-400" />
                    <h4 className="font-semibold text-white">Сгенерированный промпт</h4>
                    <button
                      onClick={() => navigator.clipboard.writeText(generatedPrompt)}
                      className="ml-auto text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Icon icon="solar:copy-bold-duotone" />
                      Копировать
                    </button>
                  </div>
                  <pre className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-sm text-green-300 font-mono whitespace-pre-wrap overflow-x-auto">
{generatedPrompt}
                  </pre>
                </div>

                {/* Request Payload */}
                {requestPayload && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon icon="solar:server-bold-duotone" className="text-xl text-purple-400" />
                      <h4 className="font-semibold text-white">Request Payload (JSON)</h4>
                      <button
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(requestPayload, null, 2))}
                        className="ml-auto text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Icon icon="solar:copy-bold-duotone" />
                        Копировать
                      </button>
                    </div>
                    <pre className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-sm text-purple-300 font-mono overflow-x-auto">
{JSON.stringify(requestPayload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center gap-2 text-sm">
              <Icon icon="solar:danger-triangle-bold" className="text-lg flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Modal for Variable Selection */}
        {activeVariable && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">
                  {activeVariable === 'grade' && 'Sinfni tanlang'}
                  {activeVariable === 'subject' && 'Fanni tanlang'}
                  {activeVariable === 'goal' && 'Maqsadni tanlang'}
                  {activeVariable === 'topic' && 'Mavzuni kiriting'}
                  {activeVariable === 'quarter' && 'Chorakni tanlang'}
                  {activeVariable === 'weeks' && 'Haftalarni tanlang'}
                  {activeVariable === 'format' && 'Formatni tanlang'}
                  {activeVariable === 'difficulty' && 'Qiyinlik darajasini tanlang'}
                  {activeVariable === 'source' && 'Manbani tanlang'}
                  {activeVariable === 'taskCount' && 'Topshiriqlar sonini belgilang'}
                  {activeVariable === 'taskTypes' && 'Topshiriq turlarini tanlang'}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveVariable(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Icon icon="solar:close-circle-bold" className="text-3xl" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                {/* Grade Selection */}
                {activeVariable === 'grade' && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {grades.filter(g => g.isActive).map((grade) => (
                      <button
                        key={grade.number}
                        type="button"
                        onClick={() => {
                          setSelectedGrade(grade.number);
                          setActiveVariable(null);
                        }}
                        className={`py-4 px-6 rounded-xl text-center font-semibold transition-all ${
                          selectedGrade === grade.number
                            ? 'bg-blue-600 text-white shadow-lg scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                      >
                        {grade.number}-sinf
                      </button>
                    ))}
                  </div>
                )}

                {/* Subject Selection */}
                {activeVariable === 'subject' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {subjects.map((subject) => (
                      <button
                        key={subject.id}
                        type="button"
                        onClick={() => {
                          setSelectedSubject(subject);
                          setActiveVariable(null);
                        }}
                        className={`p-4 rounded-xl text-left transition-all border-2 ${
                          selectedSubject?.id === subject.id
                            ? 'bg-purple-50 border-purple-600 shadow-lg'
                            : 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{subject.icon}</span>
                          <span className="font-medium text-gray-800">{subject.nameUz}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Topic Selection */}
                {activeVariable === 'topic' && (
                  <div className="space-y-4">
                    {/* Search Input */}
                    <div className="relative">
                      <input
                        type="text"
                        value={topicSearchQuery}
                        onChange={(e) => setTopicSearchQuery(e.target.value)}
                        placeholder="Mavzu nomini kiriting yoki qidiring..."
                        className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all"
                        autoFocus
                      />
                      <Icon
                        icon="solar:magnifer-linear"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl"
                      />
                    </div>

                    {/* Topics List */}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {/* Existing Topics */}
                      {topics.length > 0 && topics
                        .filter((topic) => {
                          const query = topicSearchQuery.toLowerCase();
                          return (
                            topic.titleUz.toLowerCase().includes(query) ||
                            (topic.quarter && topic.quarter.toString().includes(query)) ||
                            (topic.weekNumber && topic.weekNumber.toString().includes(query))
                          );
                        })
                        .map((topic) => (
                          <button
                            key={topic.id}
                            type="button"
                            onClick={() => {
                              setSelectedTopic(topic);
                              setTopicSearchQuery('');
                              setActiveVariable(null);
                            }}
                            className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                              selectedTopic?.id === topic.id
                                ? 'bg-green-50 border-green-600 shadow-md'
                                : 'bg-white border-gray-200 hover:border-green-300 hover:bg-green-50'
                            }`}
                          >
                            <div className="font-medium text-gray-800">{topic.titleUz}</div>
                            {topic.quarter && topic.weekNumber && (
                              <div className="flex items-center gap-2 mt-2">
                                <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                  <Icon icon="solar:calendar-bold-duotone" className="text-sm" />
                                  {topic.quarter}-chorak
                                </span>
                                <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                  <Icon icon="solar:clock-circle-bold-duotone" className="text-sm" />
                                  {topic.weekNumber}-hafta
                                </span>
                              </div>
                            )}
                          </button>
                        ))}

                      {/* Custom Topic Option - показываем если ввели текст и нет точного совпадения */}
                      {topicSearchQuery && (topics.length === 0 || topics.filter((topic) => {
                        const query = topicSearchQuery.toLowerCase();
                        return topic.titleUz.toLowerCase().includes(query);
                      }).length === 0) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTopic({
                              id: 'custom',
                              titleUz: topicSearchQuery.trim(),
                              gradeNumber: selectedGrade,
                              quarter: null,
                              keywords: [],
                            });
                            setTopicSearchQuery('');
                            setActiveVariable(null);
                          }}
                          className="w-full p-4 rounded-xl text-left transition-all border-2 border-dashed border-amber-300 bg-amber-50 hover:bg-amber-100"
                        >
                          <div className="flex items-center gap-2">
                            <Icon icon="solar:add-circle-bold-duotone" className="text-xl text-amber-600" />
                            <div>
                              <div className="font-medium text-gray-800">"{topicSearchQuery}" mavzusini ishlatish</div>
                              <div className="text-xs text-gray-600 mt-1">Maxsus mavzu (darslikda yoʻq)</div>
                            </div>
                          </div>
                        </button>
                      )}

                      {/* Loading state - показываем только если темы загружаются И ничего не введено */}
                      {topics.length === 0 && !topicSearchQuery && (
                        <div className="text-center py-12">
                          <Icon icon="solar:file-search-bold-duotone" className="text-6xl text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">Mavzular yuklanmoqda...</p>
                          <p className="text-xs text-gray-400 mt-2">Yoki yuqoridagi qatorga mavzu nomini yozing</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Goal Selection */}
                {activeVariable === 'goal' && (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGoal('MAVZU_MUSTAHKAMLASH');
                        setActiveVariable(null);
                      }}
                      className={`p-6 rounded-xl text-center transition-all border-2 ${
                        selectedGoal === 'MAVZU_MUSTAHKAMLASH'
                          ? 'bg-blue-50 border-blue-600 shadow-lg'
                          : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <Icon icon="solar:book-2-bold-duotone" className="text-4xl text-blue-600 mx-auto mb-2" />
                      <div className="font-semibold text-gray-800">Mavzuni mustahkamlash</div>
                      <p className="text-xs text-gray-600 mt-1">Dars mavzusini mustahkamlash uchun</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGoal('CHSB');
                        setActiveVariable(null);
                      }}
                      className={`p-6 rounded-xl text-center transition-all border-2 ${
                        selectedGoal === 'CHSB'
                          ? 'bg-purple-50 border-purple-600 shadow-lg'
                          : 'bg-white border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <Icon icon="solar:clipboard-check-bold-duotone" className="text-4xl text-purple-600 mx-auto mb-2" />
                      <div className="font-semibold text-gray-800">CHSB</div>
                      <p className="text-xs text-gray-600 mt-1">Choraklik sumativ baholash</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGoal('BSB');
                        setActiveVariable(null);
                      }}
                      className={`p-6 rounded-xl text-center transition-all border-2 ${
                        selectedGoal === 'BSB'
                          ? 'bg-green-50 border-green-600 shadow-lg'
                          : 'bg-white border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <Icon icon="solar:document-text-bold-duotone" className="text-4xl text-green-600 mx-auto mb-2" />
                      <div className="font-semibold text-gray-800">BSB</div>
                      <p className="text-xs text-gray-600 mt-1">Bo'lim summativ baholash</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGoal('KONIKMA');
                        setActiveVariable(null);
                      }}
                      className={`p-6 rounded-xl text-center transition-all border-2 ${
                        selectedGoal === 'KONIKMA'
                          ? 'bg-amber-50 border-amber-600 shadow-lg'
                          : 'bg-white border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      <Icon icon="solar:lightbulb-bolt-bold-duotone" className="text-4xl text-amber-600 mx-auto mb-2" />
                      <div className="font-semibold text-gray-800">Ko'nikmani rivojlantirish</div>
                      <p className="text-xs text-gray-600 mt-1">Maxsus ko'nikma rivojlantirish</p>
                    </button>
                  </div>
                )}

                {/* Quarter Selection */}
                {activeVariable === 'quarter' && (
                  <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => {
                          setSelectedQuarter(q);
                          setActiveVariable(null);
                        }}
                        className={`py-8 rounded-xl text-center transition-all border-2 ${
                          selectedQuarter === q
                            ? 'bg-blue-600 text-white shadow-lg scale-105'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-3xl font-bold">{q}</div>
                        <div className="text-sm mt-1">chorak</div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Weeks Selection */}
                {activeVariable === 'weeks' && (
                  <div>
                    <div className="mb-4">
                      <label className="text-sm text-gray-600">Chorakni tanlang:</label>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {[1, 2, 3, 4].map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => setSelectedQuarter(q)}
                            className={`py-3 rounded-lg text-center transition-all ${
                              selectedQuarter === q
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {q}-chorak
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Haftalarni tanlang:</label>
                      <div className="grid grid-cols-9 gap-2 mt-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((week) => (
                          <button
                            key={week}
                            type="button"
                            onClick={() => {
                              if (selectedWeeks.includes(week)) {
                                setSelectedWeeks(selectedWeeks.filter(w => w !== week));
                              } else {
                                setSelectedWeeks([...selectedWeeks, week]);
                              }
                            }}
                            className={`py-3 rounded-lg text-center transition-all ${
                              selectedWeeks.includes(week)
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {week}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Tanlangan: {selectedWeeks.length} hafta</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveVariable(null)}
                      className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors mt-4"
                    >
                      Tasdiqlash
                    </button>
                  </div>
                )}

                {/* Format Selection */}
                {activeVariable === 'format' && (
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: 'DTS' as FormatType, label: 'DTS', description: "Davlat ta'lim standarti", icon: 'solar:document-text-bold-duotone' },
                      { value: 'PISA' as FormatType, label: 'PISA', description: 'Xalqaro standart', icon: 'solar:global-bold-duotone' },
                      { value: 'OLIMPIADA' as FormatType, label: 'Olimpiada', description: 'Olimpiada darajasida', icon: 'solar:medal-ribbons-star-bold-duotone' },
                      { value: 'KREATIV' as FormatType, label: 'Kreativ', description: "Ijodiy va qiziqarli", icon: 'solar:palette-bold-duotone' },
                      { value: 'MIKIS' as FormatType, label: 'Aralash', description: 'Turli formatlardan', icon: 'solar:shuffle-bold-duotone' },
                    ].map((format) => (
                      <button
                        key={format.value}
                        type="button"
                        onClick={() => {
                          setSelectedFormat(format.value);
                          setActiveVariable(null);
                        }}
                        className={`p-4 rounded-xl text-left transition-all border-2 ${
                          selectedFormat === format.value
                            ? 'bg-blue-50 border-blue-600 shadow-lg'
                            : 'bg-white border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <Icon icon={format.icon} className="text-3xl text-blue-600 mb-2" />
                        <div className="font-semibold text-gray-800">{format.label}</div>
                        <p className="text-xs text-gray-600 mt-1">{format.description}</p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Difficulty Selection */}
                {activeVariable === 'difficulty' && (
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: 'OSON' as DifficultyType, label: 'Oson', description: 'Boshlang\'ich daraja', icon: 'solar:smile-circle-bold-duotone', color: 'green' },
                      { value: 'ORTA' as DifficultyType, label: "O'rtacha", description: "O'rta daraja", icon: 'solar:star-bold-duotone', color: 'blue' },
                      { value: 'QIYIN' as DifficultyType, label: 'Qiyin', description: 'Murakkab daraja', icon: 'solar:fire-bold-duotone', color: 'red' },
                      { value: 'MIKIS' as DifficultyType, label: 'Aralash', description: 'Turli darajada', icon: 'solar:layers-minimalistic-bold-duotone', color: 'purple' },
                    ].map((diff) => (
                      <button
                        key={diff.value}
                        type="button"
                        onClick={() => {
                          setSelectedDifficulty(diff.value);
                          setActiveVariable(null);
                        }}
                        className={`p-4 rounded-xl text-left transition-all border-2 ${
                          selectedDifficulty === diff.value
                            ? `bg-${diff.color}-50 border-${diff.color}-600 shadow-lg`
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon icon={diff.icon} className={`text-3xl text-${diff.color}-600 mb-2`} />
                        <div className="font-semibold text-gray-800">{diff.label}</div>
                        <p className="text-xs text-gray-600 mt-1">{diff.description}</p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Task Count Selection */}
                {activeVariable === 'taskCount' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-blue-600 mb-2">{taskCount}</div>
                      <p className="text-gray-600">topshiriq</p>
                    </div>
                    <div className="px-4">
                      <input
                        type="range"
                        min="3"
                        max="30"
                        value={taskCount}
                        onChange={(e) => setTaskCount(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-2">
                        <span>3</span>
                        <span>30</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveVariable(null)}
                      className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Tasdiqlash
                    </button>
                  </div>
                )}

                {/* Source Ratio Selection (AI vs Database) */}
                {activeVariable === 'source' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-blue-600 mb-2">
                        {aiPercentage === 100
                          ? '100% AI'
                          : aiPercentage === 0
                          ? '100% Darslik'
                          : `${100 - aiPercentage}% / ${aiPercentage}%`}
                      </div>
                      <p className="text-gray-600">
                        {aiPercentage === 100
                          ? 'Faqat AI yaratadi'
                          : aiPercentage === 0
                          ? 'Faqat darslikdan'
                          : `${100 - aiPercentage}% Darslik - ${aiPercentage}% AI`}
                      </p>
                    </div>
                    <div className="px-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="10"
                        value={aiPercentage}
                        onChange={(e) => setAiPercentage(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-2">
                        <span>0% (Faqat darslik)</span>
                        <span>100% (Faqat AI)</span>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Icon icon="solar:info-circle-bold-duotone" className="text-2xl text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900">
                          <p className="font-medium mb-1">Manbani sozlang:</p>
                          <ul className="space-y-1 text-blue-800">
                            <li>• <strong>0%</strong> - Faqat mavjud darslikdan topshiriqlar</li>
                            <li>• <strong>100%</strong> - Faqat AI yaratgan yangi topshiriqlar</li>
                            <li>• <strong>50%</strong> - Yarmi darslik, yarmi AI</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveVariable(null)}
                      className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Tasdiqlash
                    </button>
                  </div>
                )}

                {/* Task Types Selection */}
                {activeVariable === 'taskTypes' && (
                  <div className="space-y-4">
                    {/* Mix Option (Select All) */}
                    <button
                      type="button"
                      onClick={() => {
                        const allTypes = ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'FILL_BLANKS', 'MATCHING', 'ESSAY', 'LONG_ANSWER'];
                        if (selectedTaskTypes.length === allTypes.length) {
                          setSelectedTaskTypes([]);
                        } else {
                          setSelectedTaskTypes(allTypes);
                        }
                      }}
                      className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                        selectedTaskTypes.length === 8
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-600 shadow-lg'
                          : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedTaskTypes.length === 8 ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                        }`}>
                          {selectedTaskTypes.length === 8 && (
                            <Icon icon="solar:check-circle-bold" className="text-sm text-white" />
                          )}
                        </div>
                        <Icon icon="solar:layers-minimalistic-bold-duotone" className="text-2xl text-purple-600" />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">Aralash</div>
                          <p className="text-xs text-gray-600">Barcha turlar (tavsiya etiladi)</p>
                        </div>
                      </div>
                    </button>

                    {/* Individual Task Types */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'SINGLE_CHOICE', label: 'Bir javobli', icon: 'solar:check-circle-bold-duotone', color: 'blue' },
                        { value: 'MULTIPLE_CHOICE', label: "Ko'p javobli", icon: 'solar:check-square-bold-duotone', color: 'purple' },
                        { value: 'TRUE_FALSE', label: "To'g'ri/Noto'g'ri", icon: 'solar:close-circle-bold-duotone', color: 'green' },
                        { value: 'SHORT_ANSWER', label: 'Qisqa javob', icon: 'solar:pen-bold-duotone', color: 'yellow' },
                        { value: 'FILL_BLANKS', label: "Bo'sh joylar", icon: 'solar:text-bold-duotone', color: 'indigo' },
                        { value: 'MATCHING', label: 'Moslashtirish', icon: 'solar:link-bold-duotone', color: 'pink' },
                        { value: 'ESSAY', label: 'Insho', icon: 'solar:document-text-bold-duotone', color: 'cyan' },
                        { value: 'LONG_ANSWER', label: 'Batafsil javob', icon: 'solar:document-add-bold-duotone', color: 'orange' },
                      ].map((taskType) => (
                        <button
                          key={taskType.value}
                          type="button"
                          onClick={() => {
                            if (selectedTaskTypes.includes(taskType.value)) {
                              setSelectedTaskTypes(selectedTaskTypes.filter(t => t !== taskType.value));
                            } else {
                              setSelectedTaskTypes([...selectedTaskTypes, taskType.value]);
                            }
                          }}
                          className={`p-3 rounded-xl text-left transition-all border-2 ${
                            selectedTaskTypes.includes(taskType.value)
                              ? `bg-${taskType.color}-50 border-${taskType.color}-500 shadow-md`
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                              selectedTaskTypes.includes(taskType.value) ? `bg-${taskType.color}-600 border-${taskType.color}-600` : 'border-gray-300'
                            }`}>
                              {selectedTaskTypes.includes(taskType.value) && (
                                <Icon icon="solar:check-circle-bold" className="text-xs text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <Icon icon={taskType.icon} className={`text-xl text-${taskType.color}-600 mb-1`} />
                              <div className="font-medium text-sm text-gray-800 truncate">{taskType.label}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveVariable(null)}
                      className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Tasdiqlash ({selectedTaskTypes.length === 0 ? 'Standart' : selectedTaskTypes.length === 8 ? 'Aralash' : `${selectedTaskTypes.length} ta tur`})
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

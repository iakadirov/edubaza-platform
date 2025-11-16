'use client';

import { useState, useEffect } from 'react';
import TopicAutocomplete from './TopicAutocomplete';

// Common form props interface
interface FormProps {
  topicId: string;
  topics: any[];
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  taskSubType?: string; // For TASK subtypes
}

// ========================================
// PRESENTATION FORM
// ========================================
export function PresentationFormComponent({
  topicId,
  topics,
  initialData,
  onSave,
  onCancel
}: FormProps) {
  const [form, setForm] = useState({
    titleUz: initialData?.titleUz || '',
    topicId: initialData?.topicId || topicId,
    difficulty: initialData?.difficulty || 'MEDIUM',
    durationMinutes: initialData?.durationMinutes || 30,
    slides: initialData?.content?.slides || '',
    presentationUrl: initialData?.content?.presentationUrl || '',
    description: initialData?.content?.description || '',
    tags: initialData?.tags?.join(', ') || '',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        titleUz: initialData.titleUz || '',
        topicId: initialData.topicId || topicId,
        difficulty: initialData.difficulty || 'MEDIUM',
        durationMinutes: initialData.durationMinutes || 30,
        slides: initialData.content?.slides || '',
        presentationUrl: initialData.content?.presentationUrl || '',
        description: initialData.content?.description || '',
        tags: initialData.tags?.join(', ') || '',
      });
    }
  }, [initialData, topicId]);

  const handleSubmit = () => {
    if (!form.titleUz || !form.topicId) {
      alert('Iltimos, barcha majburiy maydonlarni toʻldiring!');
      return;
    }

    const tagsArray = form.tags
      ? form.tags.split(',').map(t => t.trim()).filter(t => t)
      : [];

    const content = {
      slides: form.slides,
      presentationUrl: form.presentationUrl,
      description: form.description,
    };

    onSave({
      id: initialData?.id,
      typeCode: 'PRESENTATION',
      topicId: form.topicId,
      titleUz: form.titleUz,
      content,
      difficulty: form.difficulty,
      durationMinutes: form.durationMinutes,
      tags: tagsArray,
      status: 'PUBLISHED',
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Taqdimot nomi *
        </label>
        <input
          type="text"
          value={form.titleUz}
          onChange={(e) => setForm({ ...form, titleUz: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Masalan: Fotosintez jarayoni"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mavzu *
        </label>
        <TopicAutocomplete
          value={form.topicId}
          onChange={(topicId) => setForm({ ...form, topicId })}
          placeholder="Mavzuni qidiring (masalan: tov, mat, bio)..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Qiyinlik darajasi
          </label>
          <select
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="EASY">Oson</option>
            <option value="MEDIUM">Oʻrtacha</option>
            <option value="HARD">Qiyin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Davomiyligi (daqiqa)
          </label>
          <input
            type="number"
            value={form.durationMinutes}
            onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            min="1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tavsif
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Taqdimot haqida qisqacha..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Slaydlar matni
        </label>
        <textarea
          value={form.slides}
          onChange={(e) => setForm({ ...form, slides: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={8}
          placeholder="Taqdimot slaydlarining mazmuni..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Taqdimot fayli URL (ixtiyoriy)
        </label>
        <input
          type="text"
          value={form.presentationUrl}
          onChange={(e) => setForm({ ...form, presentationUrl: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/presentation.pptx"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Teglar (vergul bilan ajratilgan)
        </label>
        <input
          type="text"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="taqdimot, biologiya, fotosintez"
        />
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold"
        >
          Bekor qilish
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Saqlash
        </button>
      </div>
    </div>
  );
}

// ========================================
// LESSON PLAN FORM
// ========================================
export function LessonPlanFormComponent({
  topicId,
  topics,
  initialData,
  onSave,
  onCancel
}: FormProps) {
  const [form, setForm] = useState({
    titleUz: initialData?.titleUz || '',
    topicId: initialData?.topicId || topicId,
    durationMinutes: initialData?.durationMinutes || 45,
    objectives: initialData?.content?.objectives || '',
    materials: initialData?.content?.materials || '',
    introduction: initialData?.content?.introduction || '',
    mainPart: initialData?.content?.mainPart || '',
    conclusion: initialData?.content?.conclusion || '',
    homework: initialData?.content?.homework || '',
    tags: initialData?.tags?.join(', ') || '',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        titleUz: initialData.titleUz || '',
        topicId: initialData.topicId || topicId,
        durationMinutes: initialData.durationMinutes || 45,
        objectives: initialData.content?.objectives || '',
        materials: initialData.content?.materials || '',
        introduction: initialData.content?.introduction || '',
        mainPart: initialData.content?.mainPart || '',
        conclusion: initialData.content?.conclusion || '',
        homework: initialData.content?.homework || '',
        tags: initialData.tags?.join(', ') || '',
      });
    }
  }, [initialData, topicId]);

  const handleSubmit = () => {
    if (!form.titleUz || !form.topicId || !form.objectives) {
      alert('Iltimos, barcha majburiy maydonlarni toʻldiring!');
      return;
    }

    const tagsArray = form.tags
      ? form.tags.split(',').map(t => t.trim()).filter(t => t)
      : [];

    const content = {
      objectives: form.objectives,
      materials: form.materials,
      introduction: form.introduction,
      mainPart: form.mainPart,
      conclusion: form.conclusion,
      homework: form.homework,
    };

    onSave({
      id: initialData?.id,
      typeCode: 'LESSON_PLAN',
      topicId: form.topicId,
      titleUz: form.titleUz,
      content,
      durationMinutes: form.durationMinutes,
      tags: tagsArray,
      status: 'PUBLISHED',
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dars nomi *
        </label>
        <input
          type="text"
          value={form.titleUz}
          onChange={(e) => setForm({ ...form, titleUz: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Masalan: Fotosintez jarayoni darsi"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mavzu *
        </label>
        <TopicAutocomplete
          value={form.topicId}
          onChange={(topicId) => setForm({ ...form, topicId })}
          placeholder="Mavzuni qidiring (masalan: tov, mat, bio)..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dars davomiyligi (daqiqa)
        </label>
        <input
          type="number"
          value={form.durationMinutes}
          onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 0 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          min="1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dars maqsadlari *
        </label>
        <textarea
          value={form.objectives}
          onChange={(e) => setForm({ ...form, objectives: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Darsning asosiy maqsadlari..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kerakli materiallar
        </label>
        <textarea
          value={form.materials}
          onChange={(e) => setForm({ ...form, materials: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="Dars uchun kerakli materiallar roʻyxati..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kirish qismi
        </label>
        <textarea
          value={form.introduction}
          onChange={(e) => setForm({ ...form, introduction: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Darsning kirish qismi..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Asosiy qism
        </label>
        <textarea
          value={form.mainPart}
          onChange={(e) => setForm({ ...form, mainPart: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={6}
          placeholder="Darsning asosiy qismi..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Xulosa qismi
        </label>
        <textarea
          value={form.conclusion}
          onChange={(e) => setForm({ ...form, conclusion: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Darsning xulosa qismi..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Uyga vazifa
        </label>
        <textarea
          value={form.homework}
          onChange={(e) => setForm({ ...form, homework: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="Uyga vazifa..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Teglar (vergul bilan ajratilgan)
        </label>
        <input
          type="text"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="dars rejasi, biologiya, fotosintez"
        />
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold"
        >
          Bekor qilish
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Saqlash
        </button>
      </div>
    </div>
  );
}

// ========================================
// TASK SUBTYPE: SINGLE CHOICE
// ========================================
export function SingleChoiceFormComponent({
  topicId,
  topics,
  initialData,
  onSave,
  onCancel,
  taskSubType
}: FormProps) {
  const [form, setForm] = useState({
    titleUz: initialData?.titleUz || '',
    topicId: initialData?.topicId || topicId,
    difficulty: initialData?.difficulty || 'MEDIUM',
    durationMinutes: initialData?.durationMinutes || 3,
    questionText: initialData?.content?.questionText || '',
    option1: initialData?.content?.options?.[0] || '',
    option2: initialData?.content?.options?.[1] || '',
    option3: initialData?.content?.options?.[2] || '',
    option4: initialData?.content?.options?.[3] || '',
    correctAnswer: initialData?.content?.correctAnswer || 0,
    explanation: initialData?.content?.explanation || '',
    tags: initialData?.tags?.join(', ') || '',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        titleUz: initialData.titleUz || '',
        topicId: initialData.topicId || topicId,
        difficulty: initialData.difficulty || 'MEDIUM',
        durationMinutes: initialData.durationMinutes || 3,
        questionText: initialData.content?.questionText || '',
        option1: initialData.content?.options?.[0] || '',
        option2: initialData.content?.options?.[1] || '',
        option3: initialData.content?.options?.[2] || '',
        option4: initialData.content?.options?.[3] || '',
        correctAnswer: initialData.content?.correctAnswer || 0,
        explanation: initialData.content?.explanation || '',
        tags: initialData.tags?.join(', ') || '',
      });
    }
  }, [initialData, topicId]);

  const handleSubmit = () => {
    if (!form.titleUz || !form.topicId || !form.questionText ||
        !form.option1 || !form.option2 || !form.option3 || !form.option4) {
      alert('Iltimos, barcha majburiy maydonlarni toʻldiring!');
      return;
    }

    const tagsArray = form.tags
      ? form.tags.split(',').map(t => t.trim()).filter(t => t)
      : [];

    const content = {
      task_type: 'SINGLE_CHOICE',
      questionText: form.questionText,
      options: [form.option1, form.option2, form.option3, form.option4],
      correctAnswer: form.correctAnswer,
      explanation: form.explanation,
    };

    onSave({
      id: initialData?.id,
      typeCode: 'TASK',
      topicId: form.topicId,
      titleUz: form.titleUz,
      content,
      difficulty: form.difficulty,
      durationMinutes: form.durationMinutes,
      tags: tagsArray,
      status: 'PUBLISHED',
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Topshiriq nomi *
        </label>
        <input
          type="text"
          value={form.titleUz}
          onChange={(e) => setForm({ ...form, titleUz: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Masalan: Fotosintez jarayoni"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mavzu *
        </label>
        <TopicAutocomplete
          value={form.topicId}
          onChange={(topicId) => setForm({ ...form, topicId })}
          placeholder="Mavzuni qidiring (masalan: tov, mat, bio)..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Qiyinlik darajasi
          </label>
          <select
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="EASY">Oson</option>
            <option value="MEDIUM">Oʻrtacha</option>
            <option value="HARD">Qiyin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vaqt (daqiqa)
          </label>
          <input
            type="number"
            value={form.durationMinutes}
            onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            min="1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Savol matni *
        </label>
        <textarea
          value={form.questionText}
          onChange={(e) => setForm({ ...form, questionText: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Savolni kiriting..."
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Javob variantlari * (Faqat BITTA toʻgʻri javob)
        </label>

        <div className="flex items-center gap-2">
          <input
            type="radio"
            name="correct"
            checked={form.correctAnswer === 0}
            onChange={() => setForm({ ...form, correctAnswer: 0 })}
            className="w-4 h-4"
          />
          <input
            type="text"
            value={form.option1}
            onChange={(e) => setForm({ ...form, option1: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="A) Variant 1"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="radio"
            name="correct"
            checked={form.correctAnswer === 1}
            onChange={() => setForm({ ...form, correctAnswer: 1 })}
            className="w-4 h-4"
          />
          <input
            type="text"
            value={form.option2}
            onChange={(e) => setForm({ ...form, option2: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="B) Variant 2"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="radio"
            name="correct"
            checked={form.correctAnswer === 2}
            onChange={() => setForm({ ...form, correctAnswer: 2 })}
            className="w-4 h-4"
          />
          <input
            type="text"
            value={form.option3}
            onChange={(e) => setForm({ ...form, option3: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="C) Variant 3"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="radio"
            name="correct"
            checked={form.correctAnswer === 3}
            onChange={() => setForm({ ...form, correctAnswer: 3 })}
            className="w-4 h-4"
          />
          <input
            type="text"
            value={form.option4}
            onChange={(e) => setForm({ ...form, option4: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="D) Variant 4"
          />
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Toʻgʻri javobni belgilash uchun variant yonidagi radiobuttonni bosing
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tushuntirish (ixtiyoriy)
        </label>
        <textarea
          value={form.explanation}
          onChange={(e) => setForm({ ...form, explanation: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="Toʻgʻri javob uchun tushuntirish..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Teglar (vergul bilan ajratilgan)
        </label>
        <input
          type="text"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="topshiriq, biologiya, fotosintez"
        />
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold"
        >
          Bekor qilish
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Saqlash
        </button>
      </div>
    </div>
  );
}

// ========================================
// TASK SUBTYPE: MULTIPLE CHOICE
// ========================================
export function MultipleChoiceFormComponent({
  topicId,
  topics,
  initialData,
  onSave,
  onCancel,
  taskSubType
}: FormProps) {
  const [form, setForm] = useState({
    titleUz: initialData?.titleUz || '',
    topicId: initialData?.topicId || topicId,
    difficulty: initialData?.difficulty || 'MEDIUM',
    durationMinutes: initialData?.durationMinutes || 5,
    questionText: initialData?.content?.questionText || '',
    option1: initialData?.content?.options?.[0] || '',
    option2: initialData?.content?.options?.[1] || '',
    option3: initialData?.content?.options?.[2] || '',
    option4: initialData?.content?.options?.[3] || '',
    correctAnswers: initialData?.content?.correctAnswers || [],
    explanation: initialData?.content?.explanation || '',
    tags: initialData?.tags?.join(', ') || '',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        titleUz: initialData.titleUz || '',
        topicId: initialData.topicId || topicId,
        difficulty: initialData.difficulty || 'MEDIUM',
        durationMinutes: initialData.durationMinutes || 5,
        questionText: initialData.content?.questionText || '',
        option1: initialData.content?.options?.[0] || '',
        option2: initialData.content?.options?.[1] || '',
        option3: initialData.content?.options?.[2] || '',
        option4: initialData.content?.options?.[3] || '',
        correctAnswers: initialData.content?.correctAnswers || [],
        explanation: initialData.content?.explanation || '',
        tags: initialData.tags?.join(', ') || '',
      });
    }
  }, [initialData, topicId]);

  const toggleCorrectAnswer = (index: number) => {
    const newCorrectAnswers = form.correctAnswers.includes(index)
      ? form.correctAnswers.filter((i: number) => i !== index)
      : [...form.correctAnswers, index];
    setForm({ ...form, correctAnswers: newCorrectAnswers });
  };

  const handleSubmit = () => {
    if (!form.titleUz || !form.topicId || !form.questionText ||
        !form.option1 || !form.option2 || !form.option3 || !form.option4 ||
        form.correctAnswers.length === 0) {
      alert('Iltimos, barcha majburiy maydonlarni toʻldiring va kamida bitta toʻgʻri javobni belgilang!');
      return;
    }

    const tagsArray = form.tags
      ? form.tags.split(',').map(t => t.trim()).filter(t => t)
      : [];

    const content = {
      task_type: 'MULTIPLE_CHOICE',
      questionText: form.questionText,
      options: [form.option1, form.option2, form.option3, form.option4],
      correctAnswers: form.correctAnswers,
      explanation: form.explanation,
    };

    onSave({
      id: initialData?.id,
      typeCode: 'TASK',
      topicId: form.topicId,
      titleUz: form.titleUz,
      content,
      difficulty: form.difficulty,
      durationMinutes: form.durationMinutes,
      tags: tagsArray,
      status: 'PUBLISHED',
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Topshiriq nomi *
        </label>
        <input
          type="text"
          value={form.titleUz}
          onChange={(e) => setForm({ ...form, titleUz: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Masalan: Biologiya asoslari"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mavzu *
        </label>
        <TopicAutocomplete
          value={form.topicId}
          onChange={(topicId) => setForm({ ...form, topicId })}
          placeholder="Mavzuni qidiring (masalan: tov, mat, bio)..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Qiyinlik darajasi
          </label>
          <select
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="EASY">Oson</option>
            <option value="MEDIUM">Oʻrtacha</option>
            <option value="HARD">Qiyin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vaqt (daqiqa)
          </label>
          <input
            type="number"
            value={form.durationMinutes}
            onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            min="1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Savol matni *
        </label>
        <textarea
          value={form.questionText}
          onChange={(e) => setForm({ ...form, questionText: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Savolni kiriting..."
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Javob variantlari * (BIR NECHTA toʻgʻri javob mumkin)
        </label>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.correctAnswers.includes(0)}
            onChange={() => toggleCorrectAnswer(0)}
            className="w-4 h-4"
          />
          <input
            type="text"
            value={form.option1}
            onChange={(e) => setForm({ ...form, option1: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="A) Variant 1"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.correctAnswers.includes(1)}
            onChange={() => toggleCorrectAnswer(1)}
            className="w-4 h-4"
          />
          <input
            type="text"
            value={form.option2}
            onChange={(e) => setForm({ ...form, option2: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="B) Variant 2"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.correctAnswers.includes(2)}
            onChange={() => toggleCorrectAnswer(2)}
            className="w-4 h-4"
          />
          <input
            type="text"
            value={form.option3}
            onChange={(e) => setForm({ ...form, option3: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="C) Variant 3"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.correctAnswers.includes(3)}
            onChange={() => toggleCorrectAnswer(3)}
            className="w-4 h-4"
          />
          <input
            type="text"
            value={form.option4}
            onChange={(e) => setForm({ ...form, option4: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="D) Variant 4"
          />
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Toʻgʻri javoblarni belgilash uchun checkboxlarni bosing (bir nechtasini tanlash mumkin)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tushuntirish (ixtiyoriy)
        </label>
        <textarea
          value={form.explanation}
          onChange={(e) => setForm({ ...form, explanation: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="Toʻgʻri javoblar uchun tushuntirish..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Teglar (vergul bilan ajratilgan)
        </label>
        <input
          type="text"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="topshiriq, biologiya"
        />
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold"
        >
          Bekor qilish
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Saqlash
        </button>
      </div>
    </div>
  );
}

// ========================================
// TASK SUBTYPE: TRUE/FALSE
// ========================================
export function TrueFalseFormComponent({
  topicId,
  topics,
  initialData,
  onSave,
  onCancel,
  taskSubType
}: FormProps) {
  const [form, setForm] = useState({
    titleUz: initialData?.titleUz || '',
    topicId: initialData?.topicId || topicId,
    difficulty: initialData?.difficulty || 'EASY',
    durationMinutes: initialData?.durationMinutes || 2,
    statement: initialData?.content?.statement || '',
    correctAnswer: initialData?.content?.correctAnswer !== undefined ? initialData.content.correctAnswer : true,
    explanation: initialData?.content?.explanation || '',
    tags: initialData?.tags?.join(', ') || '',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        titleUz: initialData.titleUz || '',
        topicId: initialData.topicId || topicId,
        difficulty: initialData.difficulty || 'EASY',
        durationMinutes: initialData.durationMinutes || 2,
        statement: initialData.content?.statement || '',
        correctAnswer: initialData.content?.correctAnswer !== undefined ? initialData.content.correctAnswer : true,
        explanation: initialData.content?.explanation || '',
        tags: initialData.tags?.join(', ') || '',
      });
    }
  }, [initialData, topicId]);

  const handleSubmit = () => {
    if (!form.titleUz || !form.topicId || !form.statement) {
      alert('Iltimos, barcha majburiy maydonlarni toʻldiring!');
      return;
    }

    const tagsArray = form.tags
      ? form.tags.split(',').map(t => t.trim()).filter(t => t)
      : [];

    const content = {
      task_type: 'TRUE_FALSE',
      statement: form.statement,
      correctAnswer: form.correctAnswer,
      explanation: form.explanation,
    };

    onSave({
      id: initialData?.id,
      typeCode: 'TASK',
      topicId: form.topicId,
      titleUz: form.titleUz,
      content,
      difficulty: form.difficulty,
      durationMinutes: form.durationMinutes,
      tags: tagsArray,
      status: 'PUBLISHED',
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Topshiriq nomi *
        </label>
        <input
          type="text"
          value={form.titleUz}
          onChange={(e) => setForm({ ...form, titleUz: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Masalan: Fotosintez haqida tasddiq"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mavzu *
        </label>
        <TopicAutocomplete
          value={form.topicId}
          onChange={(topicId) => setForm({ ...form, topicId })}
          placeholder="Mavzuni qidiring (masalan: tov, mat, bio)..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Qiyinlik darajasi
          </label>
          <select
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="EASY">Oson</option>
            <option value="MEDIUM">Oʻrtacha</option>
            <option value="HARD">Qiyin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vaqt (daqiqa)
          </label>
          <input
            type="number"
            value={form.durationMinutes}
            onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            min="1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tasddiq (Statement) *
        </label>
        <textarea
          value={form.statement}
          onChange={(e) => setForm({ ...form, statement: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Toʻgʻri yoki notoʻgʻri ekanligi aniqlanishi kerak boʻlgan tasdiqni kiriting..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Toʻgʻri javob *
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="correctAnswer"
              checked={form.correctAnswer === true}
              onChange={() => setForm({ ...form, correctAnswer: true })}
              className="w-4 h-4"
            />
            <span className="text-green-600 font-semibold">Toʻgʻri</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="correctAnswer"
              checked={form.correctAnswer === false}
              onChange={() => setForm({ ...form, correctAnswer: false })}
              className="w-4 h-4"
            />
            <span className="text-red-600 font-semibold">Notoʻgʻri</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tushuntirish (ixtiyoriy)
        </label>
        <textarea
          value={form.explanation}
          onChange={(e) => setForm({ ...form, explanation: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="Nega toʻgʻri yoki notoʻgʻri ekanligini tushuntiring..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Teglar (vergul bilan ajratilgan)
        </label>
        <input
          type="text"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="topshiriq, biologiya, fotosintez"
        />
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold"
        >
          Bekor qilish
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Saqlash
        </button>
      </div>
    </div>
  );
}

// ========================================
// TASK SUBTYPE: SHORT ANSWER
// ========================================
export function ShortAnswerFormComponent({
  topicId,
  topics,
  initialData,
  onSave,
  onCancel,
  taskSubType
}: FormProps) {
  const [form, setForm] = useState({
    titleUz: initialData?.titleUz || '',
    topicId: initialData?.topicId || topicId,
    difficulty: initialData?.difficulty || 'MEDIUM',
    durationMinutes: initialData?.durationMinutes || 5,
    questionText: initialData?.content?.questionText || '',
    correctAnswer: initialData?.content?.correctAnswer || '',
    acceptableAnswers: initialData?.content?.acceptableAnswers?.join(', ') || '',
    caseSensitive: initialData?.content?.caseSensitive || false,
    explanation: initialData?.content?.explanation || '',
    tags: initialData?.tags?.join(', ') || '',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        titleUz: initialData.titleUz || '',
        topicId: initialData.topicId || topicId,
        difficulty: initialData.difficulty || 'MEDIUM',
        durationMinutes: initialData.durationMinutes || 5,
        questionText: initialData.content?.questionText || '',
        correctAnswer: initialData.content?.correctAnswer || '',
        acceptableAnswers: initialData.content?.acceptableAnswers?.join(', ') || '',
        caseSensitive: initialData.content?.caseSensitive || false,
        explanation: initialData.content?.explanation || '',
        tags: initialData.tags?.join(', ') || '',
      });
    }
  }, [initialData, topicId]);

  const handleSubmit = () => {
    if (!form.titleUz || !form.topicId || !form.questionText || !form.correctAnswer) {
      alert('Iltimos, barcha majburiy maydonlarni toʻldiring!');
      return;
    }

    const tagsArray = form.tags
      ? form.tags.split(',').map(t => t.trim()).filter(t => t)
      : [];

    const acceptableAnswersArray = form.acceptableAnswers
      ? form.acceptableAnswers.split(',').map(a => a.trim()).filter(a => a)
      : [];

    const content = {
      task_type: 'SHORT_ANSWER',
      questionText: form.questionText,
      correctAnswer: form.correctAnswer,
      acceptableAnswers: acceptableAnswersArray,
      caseSensitive: form.caseSensitive,
      explanation: form.explanation,
    };

    onSave({
      id: initialData?.id,
      typeCode: 'TASK',
      topicId: form.topicId,
      titleUz: form.titleUz,
      content,
      difficulty: form.difficulty,
      durationMinutes: form.durationMinutes,
      tags: tagsArray,
      status: 'PUBLISHED',
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Topshiriq nomi *
        </label>
        <input
          type="text"
          value={form.titleUz}
          onChange={(e) => setForm({ ...form, titleUz: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Masalan: O'zbekiston poytaxti"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mavzu *
        </label>
        <TopicAutocomplete
          value={form.topicId}
          onChange={(topicId) => setForm({ ...form, topicId })}
          placeholder="Mavzuni qidiring (masalan: tov, mat, bio)..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Qiyinlik darajasi
          </label>
          <select
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="EASY">Oson</option>
            <option value="MEDIUM">Oʻrtacha</option>
            <option value="HARD">Qiyin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vaqt (daqiqa)
          </label>
          <input
            type="number"
            value={form.durationMinutes}
            onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            min="1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Savol matni *
        </label>
        <textarea
          value={form.questionText}
          onChange={(e) => setForm({ ...form, questionText: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Savolni kiriting..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Toʻgʻri javob *
        </label>
        <input
          type="text"
          value={form.correctAnswer}
          onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Masalan: Toshkent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Qabul qilinadigan boshqa javoblar (vergul bilan ajratilgan)
        </label>
        <input
          type="text"
          value={form.acceptableAnswers}
          onChange={(e) => setForm({ ...form, acceptableAnswers: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Masalan: Toshkent shahar, Toshkent sh"
        />
        <p className="text-xs text-gray-500 mt-1">
          Toʻgʻri deb hisoblanadigan alternativ javoblar
        </p>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.caseSensitive}
            onChange={(e) => setForm({ ...form, caseSensitive: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-700">
            Katta-kichik harflarga sezgir (case-sensitive)
          </span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tushuntirish (ixtiyoriy)
        </label>
        <textarea
          value={form.explanation}
          onChange={(e) => setForm({ ...form, explanation: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="Javob uchun tushuntirish..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Teglar (vergul bilan ajratilgan)
        </label>
        <input
          type="text"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="topshiriq, geografiya"
        />
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold"
        >
          Bekor qilish
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Saqlash
        </button>
      </div>
    </div>
  );
}

// ========================================
// TASK SUBTYPE: FILL IN THE BLANKS
// ========================================
export function FillBlanksFormComponent({
  topicId,
  topics,
  initialData,
  onSave,
  onCancel,
  taskSubType
}: FormProps) {
  // Helper function to normalize blanks data
  const normalizeBlanks = (blanks: any) => {
    if (!blanks || blanks.length === 0) {
      return [{ correctAnswer: '', acceptableAnswers: '' }];
    }
    return blanks.map((blank: any) => ({
      correctAnswer: blank.correctAnswer || '',
      acceptableAnswers: Array.isArray(blank.acceptableAnswers)
        ? blank.acceptableAnswers.join(', ')
        : (blank.acceptableAnswers || '')
    }));
  };

  const [form, setForm] = useState({
    titleUz: initialData?.titleUz || '',
    topicId: initialData?.topicId || topicId,
    difficulty: initialData?.difficulty || 'MEDIUM',
    durationMinutes: initialData?.durationMinutes || 7,
    textWithBlanks: initialData?.content?.textWithBlanks || '',
    blanks: normalizeBlanks(initialData?.content?.blanks),
    explanation: initialData?.content?.explanation || '',
    tags: initialData?.tags?.join(', ') || '',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        titleUz: initialData.titleUz || '',
        topicId: initialData.topicId || topicId,
        difficulty: initialData.difficulty || 'MEDIUM',
        durationMinutes: initialData.durationMinutes || 7,
        textWithBlanks: initialData.content?.textWithBlanks || '',
        blanks: normalizeBlanks(initialData.content?.blanks),
        explanation: initialData.content?.explanation || '',
        tags: initialData.tags?.join(', ') || '',
      });
    }
  }, [initialData, topicId]);

  const addBlank = () => {
    setForm({
      ...form,
      blanks: [...form.blanks, { correctAnswer: '', acceptableAnswers: '' }]
    });
  };

  const removeBlank = (index: number) => {
    const newBlanks = form.blanks.filter((_: any, i: number) => i !== index);
    setForm({ ...form, blanks: newBlanks });
  };

  const updateBlank = (index: number, field: string, value: string) => {
    const newBlanks = [...form.blanks];
    newBlanks[index] = { ...newBlanks[index], [field]: value };
    setForm({ ...form, blanks: newBlanks });
  };

  const handleSubmit = () => {
    if (!form.titleUz || !form.topicId || !form.textWithBlanks ||
        form.blanks.some((b: any) => !b.correctAnswer)) {
      alert('Iltimos, barcha majburiy maydonlarni toʻldiring!');
      return;
    }

    const tagsArray = form.tags
      ? form.tags.split(',').map(t => t.trim()).filter(t => t)
      : [];

    const blanksArray = form.blanks.map((blank: any) => ({
      correctAnswer: blank.correctAnswer,
      acceptableAnswers: blank.acceptableAnswers
        ? (typeof blank.acceptableAnswers === 'string'
            ? blank.acceptableAnswers.split(',').map((a: string) => a.trim()).filter((a: string) => a)
            : blank.acceptableAnswers)
        : []
    }));

    const content = {
      task_type: 'FILL_BLANKS',
      textWithBlanks: form.textWithBlanks,
      blanks: blanksArray,
      explanation: form.explanation,
    };

    onSave({
      id: initialData?.id,
      typeCode: 'TASK',
      topicId: form.topicId,
      titleUz: form.titleUz,
      content,
      difficulty: form.difficulty,
      durationMinutes: form.durationMinutes,
      tags: tagsArray,
      status: 'PUBLISHED',
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Topshiriq nomi *
        </label>
        <input
          type="text"
          value={form.titleUz}
          onChange={(e) => setForm({ ...form, titleUz: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Masalan: Fotosintez jarayoni boʻshliqlari"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mavzu *
        </label>
        <TopicAutocomplete
          value={form.topicId}
          onChange={(topicId) => setForm({ ...form, topicId })}
          placeholder="Mavzuni qidiring (masalan: tov, mat, bio)..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Qiyinlik darajasi
          </label>
          <select
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="EASY">Oson</option>
            <option value="MEDIUM">Oʻrtacha</option>
            <option value="HARD">Qiyin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vaqt (daqiqa)
          </label>
          <input
            type="number"
            value={form.durationMinutes}
            onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            min="1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Matn (boʻshliqlari bilan) *
        </label>
        <textarea
          value={form.textWithBlanks}
          onChange={(e) => setForm({ ...form, textWithBlanks: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={5}
          placeholder="Fotosintez jarayonida oʻsimliklar [___] va suvdan foydalanib [___] hosil qiladi."
        />
        <p className="text-xs text-gray-500 mt-1">
          Boʻshliklarni [___] bilan belgilang. Har bir [___] bitta boʻshliq.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Boʻshliklar uchun javoblar *
        </label>
        {form.blanks.map((blank: any, index: number) => (
          <div key={index} className="border border-gray-200 rounded-lg p-3 mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Boʻshliq {index + 1}</span>
              {form.blanks.length > 1 && (
                <button
                  onClick={() => removeBlank(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  ✕ Oʻchirish
                </button>
              )}
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={blank.correctAnswer}
                onChange={(e) => updateBlank(index, 'correctAnswer', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Toʻgʻri javob"
              />
              <input
                type="text"
                value={blank.acceptableAnswers}
                onChange={(e) => updateBlank(index, 'acceptableAnswers', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Qabul qilinadigan boshqa javoblar (vergul bilan)"
              />
            </div>
          </div>
        ))}
        <button
          onClick={addBlank}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          + Boʻshliq qoʻshish
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tushuntirish (ixtiyoriy)
        </label>
        <textarea
          value={form.explanation}
          onChange={(e) => setForm({ ...form, explanation: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="Javoblar uchun tushuntirish..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Teglar (vergul bilan ajratilgan)
        </label>
        <input
          type="text"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="topshiriq, biologiya, fotosintez"
        />
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold"
        >
          Bekor qilish
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Saqlash
        </button>
      </div>
    </div>
  );
}

// ========================================
// TASK SUBTYPE: MATCHING
// ========================================
export function MatchingFormComponent({
  topicId,
  topics,
  initialData,
  onSave,
  onCancel,
  taskSubType
}: FormProps) {
  const [form, setForm] = useState({
    titleUz: initialData?.titleUz || '',
    topicId: initialData?.topicId || topicId,
    difficulty: initialData?.difficulty || 'MEDIUM',
    durationMinutes: initialData?.durationMinutes || 8,
    instruction: initialData?.content?.instruction || '',
    pairs: initialData?.content?.pairs || [{ left: '', right: '' }, { left: '', right: '' }],
    explanation: initialData?.content?.explanation || '',
    tags: initialData?.tags?.join(', ') || '',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        titleUz: initialData.titleUz || '',
        topicId: initialData.topicId || topicId,
        difficulty: initialData.difficulty || 'MEDIUM',
        durationMinutes: initialData.durationMinutes || 8,
        instruction: initialData.content?.instruction || '',
        pairs: initialData.content?.pairs || [{ left: '', right: '' }, { left: '', right: '' }],
        explanation: initialData.content?.explanation || '',
        tags: initialData.tags?.join(', ') || '',
      });
    }
  }, [initialData, topicId]);

  const addPair = () => {
    setForm({
      ...form,
      pairs: [...form.pairs, { left: '', right: '' }]
    });
  };

  const removePair = (index: number) => {
    if (form.pairs.length <= 2) {
      alert('Kamida 2 ta juftlik boʻlishi kerak!');
      return;
    }
    const newPairs = form.pairs.filter((_: any, i: number) => i !== index);
    setForm({ ...form, pairs: newPairs });
  };

  const updatePair = (index: number, field: string, value: string) => {
    const newPairs = [...form.pairs];
    newPairs[index] = { ...newPairs[index], [field]: value };
    setForm({ ...form, pairs: newPairs });
  };

  const handleSubmit = () => {
    if (!form.titleUz || !form.topicId ||
        form.pairs.some((p: any) => !p.left || !p.right)) {
      alert('Iltimos, barcha majburiy maydonlarni toʻldiring!');
      return;
    }

    const tagsArray = form.tags
      ? form.tags.split(',').map(t => t.trim()).filter(t => t)
      : [];

    const content = {
      task_type: 'MATCHING',
      instruction: form.instruction,
      pairs: form.pairs,
      explanation: form.explanation,
    };

    onSave({
      id: initialData?.id,
      typeCode: 'TASK',
      topicId: form.topicId,
      titleUz: form.titleUz,
      content,
      difficulty: form.difficulty,
      durationMinutes: form.durationMinutes,
      tags: tagsArray,
      status: 'PUBLISHED',
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Topshiriq nomi *
        </label>
        <input
          type="text"
          value={form.titleUz}
          onChange={(e) => setForm({ ...form, titleUz: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Masalan: Organizmlar va ularning xususiyatlari"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mavzu *
        </label>
        <TopicAutocomplete
          value={form.topicId}
          onChange={(topicId) => setForm({ ...form, topicId })}
          placeholder="Mavzuni qidiring (masalan: tov, mat, bio)..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Qiyinlik darajasi
          </label>
          <select
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="EASY">Oson</option>
            <option value="MEDIUM">Oʻrtacha</option>
            <option value="HARD">Qiyin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vaqt (daqiqa)
          </label>
          <input
            type="number"
            value={form.durationMinutes}
            onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            min="1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Koʻrsatma
        </label>
        <textarea
          value={form.instruction}
          onChange={(e) => setForm({ ...form, instruction: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="Quyidagi elementlarni moslashtiring..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Moslashtiriladigan juftliklar * (Kamida 2 ta)
        </label>
        {form.pairs.map((pair: any, index: number) => (
          <div key={index} className="border border-gray-200 rounded-lg p-3 mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Juftlik {index + 1}</span>
              {form.pairs.length > 2 && (
                <button
                  onClick={() => removePair(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  ✕ Oʻchirish
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={pair.left}
                onChange={(e) => updatePair(index, 'left', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Chap tomon (masalan: Fotosintez)"
              />
              <input
                type="text"
                value={pair.right}
                onChange={(e) => updatePair(index, 'right', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Oʻng tomon (masalan: Yorugʻlikdan foydalanish)"
              />
            </div>
          </div>
        ))}
        <button
          onClick={addPair}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          + Juftlik qoʻshish
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tushuntirish (ixtiyoriy)
        </label>
        <textarea
          value={form.explanation}
          onChange={(e) => setForm({ ...form, explanation: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="Moslashtirish uchun tushuntirish..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Teglar (vergul bilan ajratilgan)
        </label>
        <input
          type="text"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="topshiriq, biologiya, moslashtirish"
        />
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold"
        >
          Bekor qilish
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Saqlash
        </button>
      </div>
    </div>
  );
}

// ========================================
// TASK SUBTYPE: ESSAY
// ========================================
export function EssayFormComponent({
  topicId,
  topics,
  initialData,
  onSave,
  onCancel,
  taskSubType
}: FormProps) {
  const [form, setForm] = useState({
    titleUz: initialData?.titleUz || '',
    topicId: initialData?.topicId || topicId,
    difficulty: initialData?.difficulty || 'HARD',
    durationMinutes: initialData?.durationMinutes || 30,
    prompt: initialData?.content?.prompt || '',
    rubric: initialData?.content?.rubric || '',
    minWords: initialData?.content?.minWords || 100,
    maxWords: initialData?.content?.maxWords || 500,
    sampleAnswer: initialData?.content?.sampleAnswer || '',
    tags: initialData?.tags?.join(', ') || '',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        titleUz: initialData.titleUz || '',
        topicId: initialData.topicId || topicId,
        difficulty: initialData.difficulty || 'HARD',
        durationMinutes: initialData.durationMinutes || 30,
        prompt: initialData.content?.prompt || '',
        rubric: initialData.content?.rubric || '',
        minWords: initialData.content?.minWords || 100,
        maxWords: initialData.content?.maxWords || 500,
        sampleAnswer: initialData.content?.sampleAnswer || '',
        tags: initialData.tags?.join(', ') || '',
      });
    }
  }, [initialData, topicId]);

  const handleSubmit = () => {
    if (!form.titleUz || !form.topicId || !form.prompt) {
      alert('Iltimos, barcha majburiy maydonlarni toʻldiring!');
      return;
    }

    const tagsArray = form.tags
      ? form.tags.split(',').map(t => t.trim()).filter(t => t)
      : [];

    const content = {
      task_type: 'ESSAY',
      prompt: form.prompt,
      rubric: form.rubric,
      minWords: form.minWords,
      maxWords: form.maxWords,
      sampleAnswer: form.sampleAnswer,
    };

    onSave({
      id: initialData?.id,
      typeCode: 'TASK',
      topicId: form.topicId,
      titleUz: form.titleUz,
      content,
      difficulty: form.difficulty,
      durationMinutes: form.durationMinutes,
      tags: tagsArray,
      status: 'PUBLISHED',
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Topshiriq nomi *
        </label>
        <input
          type="text"
          value={form.titleUz}
          onChange={(e) => setForm({ ...form, titleUz: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Masalan: Ekologik muammolar haqida insho"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mavzu *
        </label>
        <TopicAutocomplete
          value={form.topicId}
          onChange={(topicId) => setForm({ ...form, topicId })}
          placeholder="Mavzuni qidiring (masalan: tov, mat, bio)..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Qiyinlik darajasi
          </label>
          <select
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="EASY">Oson</option>
            <option value="MEDIUM">Oʻrtacha</option>
            <option value="HARD">Qiyin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vaqt (daqiqa)
          </label>
          <input
            type="number"
            value={form.durationMinutes}
            onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            min="1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Insho mavzusi (Prompt) *
        </label>
        <textarea
          value={form.prompt}
          onChange={(e) => setForm({ ...form, prompt: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="Insho yozish uchun mavzu va koʻrsatmalar..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimal soʻzlar soni
          </label>
          <input
            type="number"
            value={form.minWords}
            onChange={(e) => setForm({ ...form, minWords: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maksimal soʻzlar soni
          </label>
          <input
            type="number"
            value={form.maxWords}
            onChange={(e) => setForm({ ...form, maxWords: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Baholash mezonlari (Rubric)
        </label>
        <textarea
          value={form.rubric}
          onChange={(e) => setForm({ ...form, rubric: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="Inshoni baholash uchun mezonlar..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Namunaviy javob
        </label>
        <textarea
          value={form.sampleAnswer}
          onChange={(e) => setForm({ ...form, sampleAnswer: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={6}
          placeholder="Namunaviy yoki ideal javob..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Teglar (vergul bilan ajratilgan)
        </label>
        <input
          type="text"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="insho, ekologiya, yozish"
        />
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold"
        >
          Bekor qilish
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Saqlash
        </button>
      </div>
    </div>
  );
}

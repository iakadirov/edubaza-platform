'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { PROGRESS_MESSAGES, GENERATION_CHECKLIST } from '@/lib/worksheet-generator-config';

interface GenerationProgressProps {
  progress: number; // 0-100
  currentStep?: string;
  onComplete?: () => void;
}

export default function GenerationProgress({
  progress,
  currentStep,
  onComplete,
}: GenerationProgressProps) {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState(PROGRESS_MESSAGES[0]);

  // Обновляем сообщение в зависимости от прогресса
  useEffect(() => {
    const message = [...PROGRESS_MESSAGES]
      .reverse()
      .find((msg) => progress >= msg.step) || PROGRESS_MESSAGES[0];
    setCurrentMessage(message);

    // Автоматически отмечаем выполненные шаги
    const completedCount = Math.floor((progress / 100) * GENERATION_CHECKLIST.length);
    const completed = GENERATION_CHECKLIST.slice(0, completedCount).map((step) => step.id);
    setCompletedSteps(completed);

    // Вызываем onComplete при 100%
    if (progress >= 100 && onComplete) {
      setTimeout(onComplete, 500);
    }
  }, [progress, onComplete]);

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 animate-pulse">
          <Icon icon="solar:magic-stick-3-bold-duotone" className="text-4xl text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          AI topshiriq yaratmoqda...
        </h2>
        <p className="text-gray-600">
          Iltimos, bir necha soniya kuting
        </p>
      </div>

      {/* Прогресс бар */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {currentMessage.message}
          </span>
          <span className="text-2xl">{currentMessage.emoji}</span>
        </div>

        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          {/* Анимированный градиентный фон */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          >
            {/* Светящийся эффект */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
          </div>
        </div>

        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">0%</span>
          <span className="text-sm font-bold text-blue-600">{Math.round(progress)}%</span>
          <span className="text-xs text-gray-500">100%</span>
        </div>
      </div>

      {/* Чеклист шагов */}
      <div className="space-y-3">
        {GENERATION_CHECKLIST.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = index === completedSteps.length && progress < 100;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                isCompleted
                  ? 'bg-green-50 border-2 border-green-200'
                  : isCurrent
                  ? 'bg-blue-50 border-2 border-blue-200 animate-pulse'
                  : 'bg-gray-50 border-2 border-gray-100'
              }`}
            >
              {/* Иконка статуса */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <Icon icon="solar:check-circle-bold" className="text-xl" />
                ) : isCurrent ? (
                  <Icon icon="solar:refresh-circle-bold" className="text-xl animate-spin" />
                ) : (
                  <Icon icon="solar:clock-circle-bold" className="text-xl" />
                )}
              </div>

              {/* Иконка шага */}
              <Icon
                icon={step.icon}
                className={`text-2xl transition-colors duration-300 ${
                  isCompleted
                    ? 'text-green-600'
                    : isCurrent
                    ? 'text-blue-600'
                    : 'text-gray-400'
                }`}
              />

              {/* Текст */}
              <span
                className={`flex-1 font-medium transition-colors duration-300 ${
                  isCompleted
                    ? 'text-green-800'
                    : isCurrent
                    ? 'text-blue-800'
                    : 'text-gray-500'
                }`}
              >
                {step.label}
              </span>

              {/* Индикатор прогресса для текущего шага */}
              {isCurrent && (
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Завершение */}
      {progress >= 100 && (
        <div className="mt-6 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-lg">
            <Icon icon="solar:check-circle-bold-duotone" className="text-2xl" />
            <span className="font-bold">Tayyor! Topshiriqlar yaratildi! 🎉</span>
          </div>
        </div>
      )}

      {/* CSS для анимаций */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

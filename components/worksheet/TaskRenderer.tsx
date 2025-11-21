'use client';

import React from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { MathText } from '@/components/MathText';

interface TaskContent {
  task_type?: string;
  questionText?: string;
  statement?: string;
  questionImage?: string;
  options?: string[];
  correctAnswer?: number | boolean | string;
  answer?: string;
  explanation?: string;
  pairs?: Array<{ left: string; right: string }>;
  blanks?: Array<{ correctAnswer: string; acceptableAnswers: string[] }>;
  textWithBlanks?: string;
}

interface Task {
  id: string;
  content: TaskContent;
  metadata?: {
    isAiGenerated?: boolean;
    generatedAt?: string;
    approved?: boolean;
  };
}

interface TaskRendererProps {
  task: Task;
  index: number;
  interactive?: boolean;
  onDelete?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  onRegenerate?: (taskId: string) => void;
  onApprove?: (taskId: string) => void;
}

// 1. SINGLE_CHOICE
const SingleChoiceTask: React.FC<{ content: TaskContent; interactive?: boolean }> = ({ content, interactive }) => {
  const questionText = content.questionText || content.statement || '';
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);

  return (
    <div>
      <p className="text-base text-blue-600 mt-2 mb-3 font-medium">
        Faqat bitta toʻgʻri javobni tanlang
      </p>
      <MathText text={questionText} className="text-lg font-medium text-gray-900 mb-4 leading-relaxed" />

      {content.questionImage && (
        <div className="mb-5 flex justify-center">
          <img
            src={content.questionImage}
            alt="Question"
            className="max-h-[200px] object-contain rounded-xl"
          />
        </div>
      )}

      <div className="flex flex-col gap-3 mt-4">
        {content.options?.map((option, index) => (
          <div
            key={index}
            className={`flex items-center gap-2.5 ${interactive ? 'cursor-pointer hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors' : ''}`}
            onClick={() => interactive && setSelectedOption(index)}
          >
            <div
              className={`w-5 h-5 border-2 rounded-full flex-shrink-0 transition-colors ${
                interactive && selectedOption === index
                  ? 'bg-blue-600 border-blue-600'
                  : 'border-gray-400 bg-white'
              }`}
            />
            <span className="text-base font-semibold text-gray-700">
              {String.fromCharCode(65 + index)}.
            </span>
            <MathText text={option} className="text-base text-gray-800 inline" />
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. MULTIPLE_CHOICE
const MultipleChoiceTask: React.FC<{ content: TaskContent; interactive?: boolean }> = ({ content, interactive }) => {
  const questionText = content.questionText || content.statement || '';
  const [selectedOptions, setSelectedOptions] = React.useState<Set<number>>(new Set());

  const toggleOption = (index: number) => {
    const newSelected = new Set(selectedOptions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedOptions(newSelected);
  };

  return (
    <div>
      <p className="text-base text-blue-600 mt-2 mb-3 font-medium">
        Bir nechta toʻgʻri javoblarni belgilang
      </p>
      <MathText text={questionText} className="text-lg font-medium text-gray-900 mb-4 leading-relaxed" />

      {content.questionImage && (
        <div className="mb-5 flex justify-center">
          <img
            src={content.questionImage}
            alt="Question"
            className="max-h-[200px] object-contain rounded-xl"
          />
        </div>
      )}

      <div className="flex flex-col gap-3 mt-4">
        {content.options?.map((option, index) => (
          <div
            key={index}
            className={`flex items-center gap-2.5 ${interactive ? 'cursor-pointer hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors' : ''}`}
            onClick={() => interactive && toggleOption(index)}
          >
            <div
              className={`w-5 h-5 border-2 rounded-[3px] flex-shrink-0 transition-colors ${
                interactive && selectedOptions.has(index)
                  ? 'bg-blue-600 border-blue-600'
                  : 'border-gray-400 bg-white'
              }`}
            />
            <span className="text-base font-semibold text-gray-700">
              {String.fromCharCode(65 + index)}.
            </span>
            <MathText text={option} className="text-base text-gray-800 inline" />
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. TRUE_FALSE
const TrueFalseTask: React.FC<{ content: TaskContent; interactive?: boolean }> = ({ content, interactive }) => {
  const questionText = content.questionText || content.statement || '';
  const [selected, setSelected] = React.useState<boolean | null>(null);

  return (
    <div>
      <p className="text-base text-blue-600 mt-2 mb-3 font-medium">
        Toʻgʻri yoki notoʻgʻrini tanlang
      </p>
      <MathText text={questionText} className="text-lg font-medium text-gray-900 mb-4 leading-relaxed" />

      {content.questionImage && (
        <div className="mb-5 flex justify-center">
          <img
            src={content.questionImage}
            alt="Question"
            className="max-h-[200px] object-contain rounded-xl"
          />
        </div>
      )}

      <div className="flex gap-6 mt-4">
        <div
          className={`flex items-center gap-2.5 ${interactive ? 'cursor-pointer hover:bg-green-50 px-3 py-2 rounded-lg transition-colors' : ''}`}
          onClick={() => interactive && setSelected(true)}
        >
          <div
            className={`w-5 h-5 border-2 rounded-[3px] flex-shrink-0 transition-colors ${
              interactive && selected === true
                ? 'bg-green-600 border-green-600'
                : 'border-gray-400 bg-white'
            }`}
          />
          <span className="text-base font-medium text-gray-700">✓ Toʻgʻri</span>
        </div>
        <div
          className={`flex items-center gap-2.5 ${interactive ? 'cursor-pointer hover:bg-red-50 px-3 py-2 rounded-lg transition-colors' : ''}`}
          onClick={() => interactive && setSelected(false)}
        >
          <div
            className={`w-5 h-5 border-2 rounded-[3px] flex-shrink-0 transition-colors ${
              interactive && selected === false
                ? 'bg-red-600 border-red-600'
                : 'border-gray-400 bg-white'
            }`}
          />
          <span className="text-base font-medium text-gray-700">✗ Notoʻgʻri</span>
        </div>
      </div>
    </div>
  );
};

// 4. SHORT_ANSWER
const ShortAnswerTask: React.FC<{ content: TaskContent; interactive?: boolean }> = ({ content, interactive }) => {
  const questionText = content.questionText || content.statement || '';
  const [answer, setAnswer] = React.useState('');

  return (
    <div>
      <p className="text-base text-blue-600 mt-2 mb-3 font-medium">
        Qisqa javob yozing
      </p>
      <MathText text={questionText} className="text-lg font-medium text-gray-900 mb-4 leading-relaxed" />

      {content.questionImage && (
        <div className="mb-5 flex justify-center">
          <img
            src={content.questionImage}
            alt="Question"
            className="max-h-[200px] object-contain rounded-xl"
          />
        </div>
      )}

      {interactive ? (
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full h-8 border-b border-black mt-3 mb-2 bg-transparent focus:outline-none focus:border-blue-500 text-base"
          placeholder="Javobingizni kiriting..."
        />
      ) : (
        <div className="h-8 border-b border-black mt-3 mb-2" />
      )}
    </div>
  );
};

// 5. FILL_BLANKS
const FillBlanksTask: React.FC<{ content: TaskContent; interactive?: boolean }> = ({ content, interactive }) => {
  const questionText = content.textWithBlanks || content.questionText || content.statement || '';
  const blanksCount = content.blanks?.length || 0;
  const [answers, setAnswers] = React.useState<string[]>(
    new Array(blanksCount).fill('')
  );

  const updateAnswer = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  // Parse text and replace [___] with input fields
  const renderTextWithBlanks = () => {
    const parts = questionText.split(/(\[___\])/g);
    let blankIndex = 0;

    return (
      <div className="text-lg font-medium text-gray-900 leading-relaxed inline-flex flex-wrap items-center gap-1">
        {parts.map((part, index) => {
          if (part === '[___]') {
            const currentBlankIndex = blankIndex++;
            return interactive ? (
              <input
                key={index}
                type="text"
                value={answers[currentBlankIndex] || ''}
                onChange={(e) => updateAnswer(currentBlankIndex, e.target.value)}
                className="inline-block w-24 h-8 border-b-2 border-gray-400 bg-transparent focus:outline-none focus:border-blue-500 text-base font-medium px-2 mx-1"
                placeholder="___"
              />
            ) : (
              <span key={index} className="inline-block w-24 h-8 border-b-2 border-gray-400 mx-1" />
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div>
      <p className="text-base text-blue-600 mt-2 mb-3 font-medium">
        Bo'sh joylarni to'ldiring
      </p>
      {renderTextWithBlanks()}
    </div>
  );
};

// 6. MATCHING
const MatchingTask: React.FC<{ content: TaskContent; interactive?: boolean }> = ({ content, interactive }) => {
  const questionText = content.questionText || content.statement || '';
  const [matches, setMatches] = React.useState<Map<number, number>>(new Map());

  // Shuffle right column
  const [shuffledRight] = React.useState(() => {
    if (!content.pairs) return [];
    const rightItems = content.pairs.map((pair, idx) => ({
      text: pair.right,
      letter: String.fromCharCode(65 + idx),
      originalIndex: idx
    }));
    // Fisher-Yates shuffle
    for (let i = rightItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rightItems[i], rightItems[j]] = [rightItems[j], rightItems[i]];
    }
    return rightItems;
  });

  return (
    <div>
      <p className="text-base text-blue-600 mt-2 mb-3 font-medium">
        Mos keluvchi javoblarni bog'lang
      </p>
      <MathText text={questionText} className="text-lg font-medium text-gray-900 mb-4 leading-relaxed" />

      {content.pairs && content.pairs.length > 0 && (
        <div className="flex gap-8 mt-4">
          {/* Left column */}
          <div className="flex-1 flex flex-col gap-3">
            {content.pairs.map((pair, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1 border border-gray-200 rounded-lg py-3 px-4 bg-gray-50">
                  <span className="text-base font-semibold text-gray-700">{index + 1}. </span>
                  <MathText text={pair.left} className="text-base text-gray-800 inline" />
                </div>
                <div className="w-2 h-2 rounded-full bg-gray-500" />
              </div>
            ))}
          </div>

          {/* Space for lines */}
          <div className="w-8" />

          {/* Right column (shuffled) */}
          <div className="flex-1 flex flex-col gap-3">
            {shuffledRight.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-500" />
                <div className="flex-1 border border-gray-200 rounded-lg py-3 px-4 bg-gray-50">
                  <span className="text-base font-semibold text-gray-700">{item.letter}. </span>
                  <MathText text={item.text} className="text-base text-gray-800 inline" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 7. ESSAY
const EssayTask: React.FC<{ content: TaskContent; interactive?: boolean }> = ({ content, interactive }) => {
  const questionText = content.questionText || content.statement || '';
  const [answer, setAnswer] = React.useState('');
  const solution = content.solution;

  return (
    <div>
      <p className="text-base text-blue-600 mt-2 mb-3 font-medium">
        Batafsil javob yozing
      </p>
      <MathText text={questionText} className="text-lg font-medium text-gray-900 mb-4 leading-relaxed" />

      {content.questionImage && (
        <div className="mb-5 flex justify-center">
          <img
            src={content.questionImage}
            alt="Question"
            className="max-h-[200px] object-contain rounded-xl"
          />
        </div>
      )}

      {interactive ? (
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full border-b-2 border-gray-400 mt-4 mb-2 bg-transparent focus:outline-none focus:border-blue-500 text-base resize-none px-2 py-1"
          rows={5}
          placeholder="Batafsil javobingizni yozing..."
        />
      ) : (
        <div className="mt-4">
          <div className="h-10 border-b-2 border-gray-400 mb-3" />
          <div className="h-10 border-b-2 border-gray-400 mb-3" />
          <div className="h-10 border-b-2 border-gray-400 mb-3" />
          <div className="h-10 border-b-2 border-gray-400 mb-3" />
        </div>
      )}

      {solution && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-semibold text-blue-800 mb-2">Yechim:</p>
          <MathText text={solution} className="text-sm text-gray-700 whitespace-pre-wrap" />
        </div>
      )}
    </div>
  );
};

// Main Task Renderer
export const TaskRenderer: React.FC<TaskRendererProps> = ({
  task,
  index,
  interactive = false,
  onDelete,
  onEdit,
  onRegenerate,
  onApprove
}) => {
  const taskType = task.content.task_type?.toUpperCase();
  const [showActions, setShowActions] = React.useState(false);

  let TaskComponent;
  switch (taskType) {
    case 'SINGLE_CHOICE':
      TaskComponent = SingleChoiceTask;
      break;
    case 'MULTIPLE_CHOICE':
      TaskComponent = MultipleChoiceTask;
      break;
    case 'TRUE_FALSE':
      TaskComponent = TrueFalseTask;
      break;
    case 'SHORT_ANSWER':
      TaskComponent = ShortAnswerTask;
      break;
    case 'FILL_BLANKS':
      TaskComponent = FillBlanksTask;
      break;
    case 'MATCHING':
      TaskComponent = MatchingTask;
      break;
    case 'ESSAY':
    case 'LONG_ANSWER':
      TaskComponent = EssayTask;
      break;
    default:
      console.error('Unknown task type:', taskType, 'Task ID:', task.id);
      return null;
  }

  const isAiGenerated = task.metadata?.isAiGenerated;
  const isApproved = task.metadata?.approved;

  return (
    <div
      className="w-full bg-white rounded-xl p-5 my-3 relative group"
      style={{ boxShadow: 'rgba(0, 0, 0, 0.2) 0px 0px 2px' }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full text-blue-700 text-base font-bold flex items-center justify-center flex-shrink-0">
          {index + 1}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {isAiGenerated && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-full">
                  <Icon icon="solar:magic-stick-3-bold-duotone" className="text-purple-600 text-sm" />
                  <span className="text-xs font-semibold text-purple-700">AI tuzgan</span>
                </div>
              )}
              {isAiGenerated && isApproved && (
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded-full">
                  <Icon icon="solar:check-circle-bold" className="text-green-600 text-xs" />
                  <span className="text-xs font-medium text-green-700">Tasdiqlangan</span>
                </div>
              )}
            </div>
          </div>
          <TaskComponent content={task.content} interactive={interactive} />
        </div>
      </div>

      {/* Action buttons for AI-generated tasks */}
      {isAiGenerated && (onDelete || onEdit || onRegenerate || onApprove) && (
        <div className={`absolute bottom-3 right-3 flex items-center gap-1 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          {!isApproved && onApprove && (
            <button
              onClick={() => onApprove(task.id)}
              className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-all hover:scale-110 shadow-sm border border-green-200"
              title="Tasdiqlash"
            >
              <Icon icon="solar:check-circle-bold" className="text-lg" />
            </button>
          )}
          {onRegenerate && (
            <button
              onClick={() => onRegenerate(task.id)}
              className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg transition-all hover:scale-110 shadow-sm border border-purple-200"
              title="Qayta yaratish"
            >
              <Icon icon="solar:restart-bold" className="text-lg" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(task.id)}
              className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all hover:scale-110 shadow-sm border border-blue-200"
              title="Tahrirlash"
            >
              <Icon icon="solar:pen-bold" className="text-lg" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all hover:scale-110 shadow-sm border border-red-200"
              title="O'chirish"
            >
              <Icon icon="solar:trash-bin-trash-bold" className="text-lg" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

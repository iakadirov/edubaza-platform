'use client';

import React from 'react';
import Image from 'next/image';
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
}

interface TaskRendererProps {
  task: Task;
  index: number;
  interactive?: boolean;
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
    </div>
  );
};

// Main Task Renderer
export const TaskRenderer: React.FC<TaskRendererProps> = ({ task, index, interactive = false }) => {
  const taskType = task.content.task_type?.toUpperCase();

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
      TaskComponent = EssayTask;
      break;
    default:
      return null;
  }

  return (
    <div className="w-full bg-white rounded-xl p-5 my-3" style={{ boxShadow: 'rgba(0, 0, 0, 0.2) 0px 0px 2px' }}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full text-blue-700 text-base font-bold flex items-center justify-center flex-shrink-0">
          {index + 1}
        </div>
        <div className="flex-1">
          <TaskComponent content={task.content} interactive={interactive} />
        </div>
      </div>
    </div>
  );
};

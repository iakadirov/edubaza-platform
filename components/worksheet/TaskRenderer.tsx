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
      <p className="text-[15px] text-[#666666] mb-4">
        Faqat bitta to'g'ri javobni tanlang
      </p>
      <MathText text={questionText} className="text-base text-black mb-3" />

      {content.questionImage && (
        <div className="mb-[6px]">
          <img
            src={content.questionImage}
            alt="Question"
            className="h-[150px] object-contain rounded-[5.75px]"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-4 mt-3">
        {content.options?.map((option, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 ${interactive ? 'cursor-pointer hover:opacity-70' : ''}`}
            onClick={() => interactive && setSelectedOption(index)}
          >
            <div
              className={`w-4 h-4 border border-black rounded-full bg-white flex-shrink-0 ${
                interactive && selectedOption === index ? 'bg-blue-500' : ''
              }`}
            />
            <span className="text-sm text-black">
              {String.fromCharCode(65 + index)}.{' '}
            </span>
            <MathText text={option} className="text-sm text-black inline" />
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
      <p className="text-[15px] text-[#666666] mb-4">
        Bir nechta to'g'ri javoblarni belgilang
      </p>
      <MathText text={questionText} className="text-base text-black mb-3" />

      {content.questionImage && (
        <div className="mb-[6px]">
          <img
            src={content.questionImage}
            alt="Question"
            className="h-[150px] object-contain rounded-[5.75px]"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-4 mt-3">
        {content.options?.map((option, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 ${interactive ? 'cursor-pointer hover:opacity-70' : ''}`}
            onClick={() => interactive && toggleOption(index)}
          >
            <div
              className={`w-4 h-4 border border-black rounded-[2px] bg-white flex-shrink-0 ${
                interactive && selectedOptions.has(index) ? 'bg-blue-500' : ''
              }`}
            />
            <span className="text-sm text-black">
              {String.fromCharCode(65 + index)}.{' '}
            </span>
            <MathText text={option} className="text-sm text-black inline" />
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
      <p className="text-[15px] text-[#666666] mb-4">
        To'g'ri yoki noto'g'rini tanlang
      </p>
      <MathText text={questionText} className="text-base text-black mb-3" />

      {content.questionImage && (
        <div className="mb-[6px]">
          <img
            src={content.questionImage}
            alt="Question"
            className="h-[150px] object-contain rounded-[5.75px]"
          />
        </div>
      )}

      <div className="flex gap-6 mt-3">
        <div
          className={`flex items-center gap-2 ${interactive ? 'cursor-pointer hover:opacity-70' : ''}`}
          onClick={() => interactive && setSelected(true)}
        >
          <div
            className={`w-4 h-4 border border-black rounded-[2px] bg-white ${
              interactive && selected === true ? 'bg-green-500' : ''
            }`}
          />
          <span className="text-sm text-black">✓ To'g'ri</span>
        </div>
        <div
          className={`flex items-center gap-2 ${interactive ? 'cursor-pointer hover:opacity-70' : ''}`}
          onClick={() => interactive && setSelected(false)}
        >
          <div
            className={`w-4 h-4 border border-black rounded-[2px] bg-white ${
              interactive && selected === false ? 'bg-red-500' : ''
            }`}
          />
          <span className="text-sm text-black">✗ Noto'g'ri</span>
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
      <p className="text-[15px] text-[#666666] mb-4">
        Qisqa javob yozing
      </p>
      <MathText text={questionText} className="text-base text-black mb-3" />

      {content.questionImage && (
        <div className="mb-[6px]">
          <img
            src={content.questionImage}
            alt="Question"
            className="h-[150px] object-contain rounded-[5.75px]"
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
  const [answers, setAnswers] = React.useState<string[]>(
    new Array(content.blanks?.length || 0).fill('')
  );

  const updateAnswer = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  return (
    <div>
      <p className="text-[15px] text-[#666666] mb-4">
        Bo'sh joylarni to'ldiring
      </p>
      <MathText text={questionText} className="text-base text-black mb-3" />

      {content.blanks && content.blanks.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-3">
          {content.blanks.map((_, index) => (
            <div key={index} className="min-w-[80px] max-w-[160px]">
              {interactive ? (
                <input
                  type="text"
                  value={answers[index]}
                  onChange={(e) => updateAnswer(index, e.target.value)}
                  className="w-full h-8 border-b border-black bg-transparent focus:outline-none focus:border-blue-500 text-base"
                  placeholder={`${index + 1}`}
                />
              ) : (
                <div className="h-8 border-b border-black" />
              )}
            </div>
          ))}
        </div>
      )}
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
      <p className="text-[15px] text-[#666666] mb-4">
        Mos keluvchi javoblarni bog'lang
      </p>
      <MathText text={questionText} className="text-base text-black mb-3" />

      {content.pairs && content.pairs.length > 0 && (
        <div className="flex gap-8 mt-3">
          {/* Left column */}
          <div className="flex-1 flex flex-col gap-2">
            {content.pairs.map((pair, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1 border-[0.5px] border-[#E9E9E9] rounded-[3px] py-2 px-3">
                  <span className="text-sm text-black">{index + 1}. </span>
                  <MathText text={pair.left} className="text-sm text-black inline" />
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#666666]" />
              </div>
            ))}
          </div>

          {/* Space for lines */}
          <div className="w-8" />

          {/* Right column (shuffled) */}
          <div className="flex-1 flex flex-col gap-2">
            {shuffledRight.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#666666]" />
                <div className="flex-1 border-[0.5px] border-[#E9E9E9] rounded-[3px] py-2 px-3">
                  <span className="text-sm text-black">{item.letter}. </span>
                  <MathText text={item.text} className="text-sm text-black inline" />
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
      <p className="text-[15px] text-[#666666] mb-4">
        Batafsil javob yozing
      </p>
      <MathText text={questionText} className="text-base text-black mb-3" />

      {content.questionImage && (
        <div className="mb-[6px]">
          <img
            src={content.questionImage}
            alt="Question"
            className="h-[150px] object-contain rounded-[5.75px]"
          />
        </div>
      )}

      {interactive ? (
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full border-b border-black mt-3 mb-2 bg-transparent focus:outline-none focus:border-blue-500 text-base resize-none"
          rows={4}
          placeholder="Batafsil javobingizni yozing..."
        />
      ) : (
        <div className="mt-3">
          <div className="h-8 border-b border-black mb-2" />
          <div className="h-8 border-b border-black mb-2" />
          <div className="h-8 border-b border-black mb-2" />
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
    <div className="w-full pt-3 px-3 pb-2 border-[0.5px] border-[#E9E9E9] rounded-lg mb-2 bg-transparent">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-6 h-6 bg-[#BEDAFF] rounded-full text-[#00275B] text-xs font-bold flex items-center justify-center flex-shrink-0">
          {index + 1}
        </div>
        <div className="flex-1">
          <TaskComponent content={task.content} interactive={interactive} />
        </div>
      </div>
    </div>
  );
};

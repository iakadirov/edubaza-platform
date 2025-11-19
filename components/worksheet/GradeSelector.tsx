'use client';

import { Icon } from '@iconify/react';

interface Grade {
  number: number;
  nameUz: string;
  isActive: boolean;
}

interface GradeSelectorProps {
  grades: Grade[];
  selectedGrade: number;
  onChange: (grade: number) => void;
  isMobile?: boolean;
}

export default function GradeSelector({
  grades,
  selectedGrade,
  onChange,
  isMobile = false,
}: GradeSelectorProps) {
  if (isMobile) {
    return (
      <select
        value={selectedGrade}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
      >
        <optgroup label="Boshlangʻich (0-4)">
          {grades
            .filter((g) => g.number >= 0 && g.number <= 4)
            .map((g) => (
              <option key={g.number} value={g.number}>
                {g.nameUz}
              </option>
            ))}
        </optgroup>
        <optgroup label="Oʻrta maktab (5-9)">
          {grades
            .filter((g) => g.number >= 5 && g.number <= 9)
            .map((g) => (
              <option key={g.number} value={g.number}>
                {g.nameUz}
              </option>
            ))}
        </optgroup>
        <optgroup label="Katta sinf (10-11)">
          {grades
            .filter((g) => g.number >= 10 && g.number <= 11)
            .map((g) => (
              <option key={g.number} value={g.number}>
                {g.nameUz}
              </option>
            ))}
        </optgroup>
      </select>
    );
  }

  return (
    <div className="space-y-4">
      {/* Группа: Boshlangʻich */}
      <div>
        <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
          <Icon icon="solar:user-rounded-bold-duotone" className="text-lg" />
          Boshlangʻich (0-4)
        </p>
        <div className="grid grid-cols-5 gap-2">
          {grades
            .filter((g) => g.number >= 0 && g.number <= 4)
            .map((g) => (
              <button
                key={g.number}
                type="button"
                onClick={() => onChange(g.number)}
                className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                  selectedGrade === g.number
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {g.number === 0 ? 'MK' : g.number}
              </button>
            ))}
        </div>
      </div>

      {/* Группа: Oʻrta */}
      <div>
        <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
          <Icon icon="solar:users-group-two-rounded-bold-duotone" className="text-lg" />
          Oʻrta maktab (5-9)
        </p>
        <div className="grid grid-cols-5 gap-2">
          {grades
            .filter((g) => g.number >= 5 && g.number <= 9)
            .map((g) => (
              <button
                key={g.number}
                type="button"
                onClick={() => onChange(g.number)}
                className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                  selectedGrade === g.number
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {g.number}
              </button>
            ))}
        </div>
      </div>

      {/* Группа: Katta */}
      <div>
        <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
          <Icon icon="solar:diploma-bold-duotone" className="text-lg" />
          Katta sinf (10-11)
        </p>
        <div className="grid grid-cols-2 gap-2 max-w-xs">
          {grades
            .filter((g) => g.number >= 10 && g.number <= 11)
            .map((g) => (
              <button
                key={g.number}
                type="button"
                onClick={() => onChange(g.number)}
                className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                  selectedGrade === g.number
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {g.number}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

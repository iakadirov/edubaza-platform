'use client';

import React from 'react';

export type TeacherSpecialty =
  | 'PRIMARY_SCHOOL'
  | 'MATHEMATICS'
  | 'RUSSIAN_LANGUAGE'
  | 'UZBEK_LANGUAGE'
  | 'ENGLISH_LANGUAGE'
  | 'PHYSICS'
  | 'CHEMISTRY'
  | 'BIOLOGY'
  | 'GEOGRAPHY'
  | 'HISTORY'
  | 'LITERATURE'
  | 'INFORMATICS'
  | 'PHYSICAL_EDUCATION'
  | 'MUSIC'
  | 'ART'
  | 'OTHER';

interface SpecialtySelectorProps {
  value: TeacherSpecialty | '';
  onChange: (specialty: TeacherSpecialty) => void;
  required?: boolean;
}

const specialties: { value: TeacherSpecialty; label: string }[] = [
  { value: 'PRIMARY_SCHOOL', label: 'Начальные классы (1-4)' },
  { value: 'MATHEMATICS', label: 'Математика' },
  { value: 'RUSSIAN_LANGUAGE', label: 'Русский язык' },
  { value: 'UZBEK_LANGUAGE', label: 'Узбекский язык' },
  { value: 'ENGLISH_LANGUAGE', label: 'Английский язык' },
  { value: 'PHYSICS', label: 'Физика' },
  { value: 'CHEMISTRY', label: 'Химия' },
  { value: 'BIOLOGY', label: 'Биология' },
  { value: 'GEOGRAPHY', label: 'География' },
  { value: 'HISTORY', label: 'История' },
  { value: 'LITERATURE', label: 'Литература' },
  { value: 'INFORMATICS', label: 'Информатика' },
  { value: 'PHYSICAL_EDUCATION', label: 'Физическая культура' },
  { value: 'MUSIC', label: 'Музыка' },
  { value: 'ART', label: 'Изобразительное искусство' },
  { value: 'OTHER', label: 'Другое' },
];

export default function SpecialtySelector({ value, onChange, required = false }: SpecialtySelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Предмет
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TeacherSpecialty)}
        required={required}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Выберите предмет</option>
        {specialties.map((specialty) => (
          <option key={specialty.value} value={specialty.value}>
            {specialty.label}
          </option>
        ))}
      </select>
    </div>
  );
}

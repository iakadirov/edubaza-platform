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
  { value: 'PRIMARY_SCHOOL', label: 'Boshlangʻich sinf (1-4)' },
  { value: 'MATHEMATICS', label: 'Matematika' },
  { value: 'RUSSIAN_LANGUAGE', label: 'Rus tili' },
  { value: 'UZBEK_LANGUAGE', label: 'Oʻzbek tili' },
  { value: 'ENGLISH_LANGUAGE', label: 'Ingliz tili' },
  { value: 'PHYSICS', label: 'Fizika' },
  { value: 'CHEMISTRY', label: 'Kimyo' },
  { value: 'BIOLOGY', label: 'Biologiya' },
  { value: 'GEOGRAPHY', label: 'Geografiya' },
  { value: 'HISTORY', label: 'Tarix' },
  { value: 'LITERATURE', label: 'Adabiyot' },
  { value: 'INFORMATICS', label: 'Informatika' },
  { value: 'PHYSICAL_EDUCATION', label: 'Jismoniy tarbiya' },
  { value: 'MUSIC', label: 'Musiqa' },
  { value: 'ART', label: 'Tasviriy sanʻat' },
  { value: 'OTHER', label: 'Boshqa' },
];

export default function SpecialtySelector({ value, onChange, required = false }: SpecialtySelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Fan
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TeacherSpecialty)}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Fanni tanlang</option>
        {specialties.map((specialty) => (
          <option key={specialty.value} value={specialty.value}>
            {specialty.label}
          </option>
        ))}
      </select>
    </div>
  );
}

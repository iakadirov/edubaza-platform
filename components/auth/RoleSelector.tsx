'use client';

import React from 'react';

export type UserRole = 'TEACHER' | 'STUDENT' | 'PARENT';

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

const roles: { value: UserRole; label: string; icon: string; description: string }[] = [
  {
    value: 'TEACHER',
    label: 'Учитель',
    icon: '👨‍🏫',
    description: 'Создавайте задания и управляйте контентом',
  },
  {
    value: 'STUDENT',
    label: 'Ученик',
    icon: '👨‍🎓',
    description: 'Выполняйте задания и отслеживайте прогресс',
  },
  {
    value: 'PARENT',
    label: 'Родитель',
    icon: '👨‍👩‍👧',
    description: 'Следите за успеваемостью вашего ребенка',
  },
];

export default function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Я:
      </label>
      <div className="grid grid-cols-1 gap-3">
        {roles.map((role) => (
          <button
            key={role.value}
            type="button"
            onClick={() => onChange(role.value)}
            className={`
              relative flex items-center p-4 border-2 rounded-lg transition-all
              ${
                value === role.value
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }
            `}
          >
            <div className="flex items-center flex-1">
              <div className="text-3xl mr-4">{role.icon}</div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">{role.label}</div>
                <div className="text-sm text-gray-600">{role.description}</div>
              </div>
            </div>
            {value === role.value && (
              <div className="ml-4">
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

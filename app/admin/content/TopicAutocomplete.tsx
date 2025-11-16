'use client';

import { useState, useEffect, useRef } from 'react';

interface Topic {
  id: string;
  titleUz: string;
  gradeNumber: number;
  subject: {
    nameUz: string;
  };
}

interface TopicAutocompleteProps {
  value: string;
  onChange: (topicId: string) => void;
  placeholder?: string;
}

export default function TopicAutocomplete({ value, onChange, placeholder = 'Mavzuni qidiring...' }: TopicAutocompleteProps) {
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Barcha mavzularni yuklash
  useEffect(() => {
    loadAllTopics();
  }, []);

  // Tanlangan mavzuni olish
  useEffect(() => {
    if (value && allTopics.length > 0) {
      const topic = allTopics.find(t => t.id === value);
      if (topic) {
        setSelectedTopic(topic);
        setSearchTerm(`${topic.titleUz} - ${topic.subject.nameUz} (${topic.gradeNumber}-sinf)`);
      }
    }
  }, [value, allTopics]);

  // Qidiruv bo'yicha filtrlash
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTopics([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = allTopics.filter(topic => {
      const topicTitle = topic.titleUz.toLowerCase();
      const subjectName = topic.subject.nameUz.toLowerCase();

      // Qidiruv birinchi harflar bo'yicha yoki to'liq nomdan qidirish
      return topicTitle.startsWith(term) ||
             topicTitle.includes(term) ||
             subjectName.includes(term);
    });

    setFilteredTopics(filtered);
    setShowDropdown(filtered.length > 0);
  }, [searchTerm, allTopics]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadAllTopics = async () => {
    try {
      const response = await fetch('/api/topics');
      const data = await response.json();

      if (data.success) {
        setAllTopics(data.data);
      }
    } catch (error) {
      console.error('Error loading topics:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    // Agar input tozalansa, tanlangan mavzuni ham tozalash
    if (!term) {
      setSelectedTopic(null);
      onChange('');
    }
  };

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    setSearchTerm(`${topic.titleUz} - ${topic.subject.nameUz} (${topic.gradeNumber}-sinf)`);
    onChange(topic.id);
    setShowDropdown(false);
  };

  const handleInputFocus = () => {
    if (searchTerm && filteredTopics.length > 0) {
      setShowDropdown(true);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        autoComplete="off"
      />

      {showDropdown && filteredTopics.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredTopics.map(topic => (
            <div
              key={topic.id}
              onClick={() => handleTopicSelect(topic)}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="text-sm font-medium text-gray-900">
                {topic.titleUz}
              </div>
              <div className="text-xs text-gray-500">
                {topic.subject.nameUz} • {topic.gradeNumber}-sinf
              </div>
            </div>
          ))}
        </div>
      )}

      {searchTerm && !showDropdown && filteredTopics.length === 0 && !selectedTopic && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
          <p className="text-sm text-gray-500">Mavzu topilmadi</p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Filter, Check, Circle } from 'lucide-react';

type Status = 'ALL' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';

interface StatusFilterProps {
  value: Status;
  onChange: (value: Status) => void;
}

const statusOptions: { value: Status; label: string; color: string }[] = [
  { value: 'ALL', label: 'All Status', color: 'text-dark-400' },
  { value: 'ACTIVE', label: 'Active', color: 'text-green-500' },
  { value: 'ON_HOLD', label: 'On Hold', color: 'text-yellow-500' },
  { value: 'COMPLETED', label: 'Completed', color: 'text-blue-500' },
];

export default function StatusFilter({ value, onChange }: StatusFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = statusOptions.find((opt) => opt.value === value) || statusOptions[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative min-w-[180px]" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input flex items-center justify-between w-full group"
      >
        <div className="flex items-center gap-2.5">
          {value === 'ALL' ? (
            <Filter className="w-4 h-4 text-dark-400 group-hover:text-primary-400 transition-colors" />
          ) : (
            <div className={`w-2 h-2 rounded-full ${selectedOption.color.replace('text-', 'bg-')}`} />
          )}
          <span className="text-sm font-medium text-white">{selectedOption.label}</span>
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-dark-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-dark-800 border border-dark-600 rounded-xl shadow-xl overflow-hidden animate-fade-in py-1.5 translate-y-0 opacity-100 transition-all">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors
                ${value === option.value ? 'bg-dark-700 text-white' : 'text-dark-300 hover:bg-dark-700 hover:text-white'}
              `}
            >
              <div className="flex items-center gap-3">
                {option.value === 'ALL' ? (
                  <Filter className="w-4 h-4 text-dark-400" />
                ) : (
                  <Circle className={`w-3.5 h-3.5 ${option.color} fill-current`} />
                )}
                <span>{option.label}</span>
              </div>
              {value === option.value && <Check className="w-4 h-4 text-primary-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

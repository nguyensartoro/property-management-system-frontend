import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Calendar as CalendarComponent } from '../ui/calendar';

interface CalendarDropdownProps {
  onClose: () => void;
}

const CalendarDropdown: React.FC<CalendarDropdownProps> = ({ onClose }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-slideDown"
      style={{
        transformOrigin: 'top right',
        animation: 'slideDown 0.2s ease-out'
      }}
    >
      <div className="p-4">
        <div className="mb-2 flex justify-between items-center">
          <h3 className="text-md font-semibold text-secondary-900">Calendar</h3>
        </div>
        <CalendarComponent
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          View full calendar
        </button>
      </div>
    </div>
  );
};

export default CalendarDropdown;
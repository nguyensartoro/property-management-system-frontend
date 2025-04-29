import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  initialDate?: Date;
  onSelectDate?: (date: Date) => void;
  className?: string;
}

const Calendar: React.FC<CalendarProps> = ({
  initialDate = new Date(),
  onSelectDate,
  className
}) => {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get the current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get day names
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Get month name
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Get days in month matrix
  const getDaysInMonth = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];
    const rows = Math.ceil((firstDay + daysInMonth) / 7);

    let day = 1;
    let nextMonthDay = 1;

    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDay) {
          // Previous month days
          const prevMonthDate = daysInPrevMonth - (firstDay - j - 1);
          row.push({
            day: prevMonthDate,
            month: currentMonth - 1,
            year: currentMonth === 0 ? currentYear - 1 : currentYear,
            isCurrentMonth: false,
            date: new Date(
              currentMonth === 0 ? currentYear - 1 : currentYear,
              currentMonth === 0 ? 11 : currentMonth - 1,
              prevMonthDate
            )
          });
        } else if (day > daysInMonth) {
          // Next month days
          row.push({
            day: nextMonthDay,
            month: currentMonth + 1,
            year: currentMonth === 11 ? currentYear + 1 : currentYear,
            isCurrentMonth: false,
            date: new Date(
              currentMonth === 11 ? currentYear + 1 : currentYear,
              currentMonth === 11 ? 0 : currentMonth + 1,
              nextMonthDay
            )
          });
          nextMonthDay++;
        } else {
          // Current month days
          row.push({
            day,
            month: currentMonth,
            year: currentYear,
            isCurrentMonth: true,
            date: new Date(currentYear, currentMonth, day)
          });
          day++;
        }
      }
      days.push(row);
    }

    return days;
  };

  const daysMatrix = getDaysInMonth();

  // Handle date selection
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (onSelectDate) {
      onSelectDate(date);
    }
  };

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Check if a date is selected
  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();
  };

  return (
    <div className={`w-full bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 ${className || ''}`}>
      {/* Calendar header with month/year and navigation buttons */}
      <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200">
        <button
          onClick={prevMonth}
          className="p-1 rounded-full hover:bg-gray-100"
          aria-label="Previous month"
        >
          <ChevronLeft size={16} className="text-gray-600" />
        </button>

        <div className="font-medium text-secondary-900">
          {`${monthNames[currentMonth]} ${currentYear}`}
        </div>

        <button
          onClick={nextMonth}
          className="p-1 rounded-full hover:bg-gray-100"
          aria-label="Next month"
        >
          <ChevronRight size={16} className="text-gray-600" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="p-2">
        {/* Week days header */}
        <div className="grid grid-cols-7 mb-1">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className="py-1 text-xs font-medium text-center text-secondary-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        {daysMatrix.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7">
            {week.map((dayObj, dayIndex) => (
              <button
                key={dayIndex}
                onClick={() => handleDateClick(dayObj.date)}
                className={`h-8 w-8 mx-auto flex items-center justify-center text-sm rounded-full
                  ${!dayObj.isCurrentMonth ? 'text-gray-400' : 'text-secondary-900'}
                  ${isToday(dayObj.date) ? 'bg-primary-100 text-primary-600' : ''}
                  ${isSelected(dayObj.date) ? 'bg-primary-500 text-white' : ''}
                  ${!isToday(dayObj.date) && !isSelected(dayObj.date) ? 'hover:bg-gray-100' : ''}
                `}
              >
                {dayObj.day}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

Calendar.displayName = "Calendar";

export { Calendar };
import React, { useState } from 'react';
import { Calendar } from './ui/calendar';
import { toast } from 'react-hot-toast';

const CalendarDemo: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    toast.success(`Date Selected: You selected ${date.toLocaleDateString()}`);
  };

  return (
    <div className="p-6 max-w-screen-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Calendar Component</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div>
          <h2 className="text-lg font-medium mb-4">Select a date:</h2>
          <Calendar
            initialDate={new Date(2025, 5, 15)} // June 2025 to match the image
            onSelectDate={handleDateSelect}
          />
        </div>
        
        <div className="mt-6 md:mt-0">
          <h2 className="text-lg font-medium mb-4">Selected Date:</h2>
          {selectedDate ? (
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <p className="font-medium">{selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
            </div>
          ) : (
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <p className="text-gray-500 italic">No date selected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarDemo; 
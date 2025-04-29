import React, { useState } from 'react';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'US', name: 'English' },
  { code: 'VN', name: 'Tiếng Việt' },
];

const LanguageSelector: React.FC = () => {
  const [currentLang, setCurrentLang] = useState('US');
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="flex items-center p-2 rounded-lg hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Globe size={20} className="text-secondary-500" />
        <span className="ml-1 text-sm text-secondary-700">{currentLang}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 py-1 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg">
          {languages.map(language => (
            <button
              key={language.code}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50
                ${currentLang === language.code ? 'text-primary-600 bg-primary-50' : 'text-secondary-700'}`}
              onClick={() => handleLanguageChange(language.code)}
            >
              {language.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
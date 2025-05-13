import { useState } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../utils/languageContext';
import { LANGUAGES } from '../../utils/languageConstants';

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode as 'en' | 'vi');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Globe size={20} className="text-secondary-500 dark:text-secondary-400" />
        <span className="ml-1 text-sm text-secondary-700 dark:text-secondary-300">
          {language === 'en' ? 'EN' : 'VI'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 py-1 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
          {Object.entries(LANGUAGES).map(([code, name]) => (
            <button
              key={code}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700
                ${language === code ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'text-secondary-700 dark:text-secondary-300'}`}
              onClick={() => handleLanguageChange(code)}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
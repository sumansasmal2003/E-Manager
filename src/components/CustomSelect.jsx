import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';

const CustomSelect = ({ options, value, onChange, placeholder = 'Select an option', icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Normalize options to be an array of { value, label }
  const normalizedOptions = options.map(option =>
    typeof option === 'string'
      ? { value: option, label: option }
      : option
  );

  const selectedOption = normalizedOptions.find(opt => opt.value === value);

  // Hook to close dropdown on outside click
  const dropdownRef = useClickOutside(() => {
    setIsOpen(false);
  });

  const handleOptionClick = (newValue) => {
    onChange(newValue);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* 1. The Select Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="relative w-full pl-10 pr-10 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 text-left focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 flex items-center justify-between"
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {Icon && <Icon size={18} className="text-gray-400" />}
        </div>

        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
        >
          <ChevronDown size={18} className="text-gray-400" />
        </motion.div>
      </button>

      {/* 2. The Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            <div className="p-2">
              {normalizedOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionClick(option.value)}
                  className="w-full text-left flex items-center justify-between px-3 py-2 rounded-md text-gray-800 hover:bg-gray-100"
                >
                  <span>{option.label}</span>
                  {option.value === value && <Check size={16} className="text-gray-900" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;

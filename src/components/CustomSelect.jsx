import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Filter } from 'lucide-react';
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
      {/* Enhanced Select Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="relative w-full pl-10 pr-10 py-3 bg-white border border-gray-300 rounded-lg text-primary placeholder-gray-500 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 flex items-center justify-between hover:border-gray-400"
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {Icon ? <Icon size={18} className="text-gray-400" /> : <Filter size={18} className="text-gray-400" />}
        </div>

        <span className={`font-medium ${selectedOption ? 'text-primary' : 'text-gray-500'}`}>
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

      {/* Enhanced Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
          >
            <div className="p-2 space-y-1">
              {normalizedOptions.map(option => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionClick(option.value)}
                    className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isSelected
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                    }`}
                  >
                    <span className="font-medium">{option.label}</span>
                    {isSelected && <Check size={16} className={isSelected ? 'text-white' : 'text-primary'} />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;

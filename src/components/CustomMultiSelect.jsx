import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, X } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';

const CustomMultiSelect = ({ options, value, onChange, placeholder = 'Select options', icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  const normalizedOptions = options.map(option =>
    typeof option === 'string'
      ? { value: option, label: option }
      : option
  );

  const dropdownRef = useClickOutside(() => setIsOpen(false));

  const handleOptionClick = (optionValue) => {
    // Check if the option is already selected
    if (value.includes(optionValue)) {
      // Remove it
      onChange(value.filter(item => item !== optionValue));
    } else {
      // Add it
      onChange([...value, optionValue]);
    }
  };

  const getSelectedLabels = () => {
    if (value.length === 0) return placeholder;
    if (value.length > 2) return `${value.length} selected`;
    return normalizedOptions
      .filter(opt => value.includes(opt.value))
      .map(opt => opt.label)
      .join(', ');
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* 1. The Select Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="relative w-full pl-10 pr-10 py-3 bg-white border border-gray-300 rounded-lg text-primary placeholder-gray-500 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 flex items-center justify-between"
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {Icon && <Icon size={18} className="text-gray-400" />}
        </div>

        <span className={value.length === 0 ? 'text-gray-500' : 'text-primary'}>
          {getSelectedLabels()}
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
              {normalizedOptions.map(option => {
                const isSelected = value.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionClick(option.value)}
                    className="w-full text-left flex items-center space-x-3 px-3 py-2 rounded-md text-gray-800 hover:bg-gray-100"
                  >
                    <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center ${
                      isSelected ? 'bg-primary border-primary' : 'border-gray-300'
                    }`}>
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>
                    <span>{option.label}</span>
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

export default CustomMultiSelect;

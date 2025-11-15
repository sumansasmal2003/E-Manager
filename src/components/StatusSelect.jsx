import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Umbrella,
  Clock,
  MinusCircle,
  ChevronDown
} from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';

// Constants
const STATUS = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LEAVE: 'Leave',
  HOLIDAY: 'Holiday',
  NOT_SET: 'Due'
};

// Status configuration with consistent styling
const STATUS_CONFIG = {
  [STATUS.PRESENT]: {
    icon: CheckCircle,
    label: 'Present',
    className: 'text-green-800 bg-green-50 border-green-200 hover:bg-green-100',
    iconColor: 'text-green-600'
  },
  [STATUS.ABSENT]: {
    icon: XCircle,
    label: 'Absent',
    className: 'text-red-800 bg-red-50 border-red-200 hover:bg-red-100',
    iconColor: 'text-red-600'
  },
  [STATUS.LEAVE]: {
    icon: Umbrella,
    label: 'Leave',
    className: 'text-amber-800 bg-amber-50 border-amber-200 hover:bg-amber-100',
    iconColor: 'text-amber-600'
  },
  [STATUS.HOLIDAY]: {
    icon: Clock,
    label: 'Holiday',
    className: 'text-blue-800 bg-blue-50 border-blue-200 hover:bg-blue-100',
    iconColor: 'text-blue-600'
  },
  [STATUS.NOT_SET]: {
    icon: MinusCircle,
    label: 'Select Status',
    className: 'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100',
    iconColor: 'text-gray-500'
  }
};

const STATUS_OPTIONS = [
  STATUS.PRESENT,
  STATUS.ABSENT,
  STATUS.LEAVE,
  STATUS.HOLIDAY
];

const StatusSelect = ({
  status = STATUS.NOT_SET,
  onChange,
  isDisabled = false,
  size = 'medium'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useClickOutside(() => setIsOpen(false));

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'pl-2 pr-8 py-1.5 text-xs';
      case 'large':
        return 'pl-3 pr-10 py-3 text-base';
      default:
        return 'pl-3 pr-10 py-2 text-sm';
    }
  };

  const config = STATUS_CONFIG[status] || STATUS_CONFIG[STATUS.NOT_SET];
  const IconComponent = config.icon;

  const handleOptionClick = useCallback((newStatus) => {
    if (!isDisabled && newStatus !== status) {
      onChange(newStatus);
      setIsOpen(false);
    }
  }, [isDisabled, status, onChange]);

  const handleKeyDown = (event) => {
    if (isDisabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        setIsOpen(prev => !prev);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => !isDisabled && setIsOpen(prev => !prev)}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Current status: ${config.label}. Click to change status`}
        className={`
          relative w-full appearance-none
          flex items-center gap-2
          font-medium border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
          transition-all duration-200 ease-in-out
          border-opacity-60
          ${getSizeClasses()}
          ${config.className}
          ${isDisabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:shadow-sm'
          }
        `}
      >
        <IconComponent
          size={size === 'small' ? 16 : 18}
          className={config.iconColor}
        />
        <span className="flex-1 text-left font-medium truncate">
          {config.label}
        </span>
        <ChevronDown
          size={size === 'small' ? 14 : 16}
          className={`absolute right-2 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          } ${config.iconColor}`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && !isDisabled && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg shadow-gray-200/50 backdrop-blur-sm"
            role="listbox"
          >
            <div className="p-1.5">
              {STATUS_OPTIONS.map(option => {
                const optionConfig = STATUS_CONFIG[option];
                const OptionIcon = optionConfig.icon;
                const isSelected = status === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleOptionClick(option)}
                    role="option"
                    aria-selected={isSelected}
                    className={`
                      w-full text-left flex items-center gap-3 px-3 py-2 rounded-md
                      text-gray-700 transition-colors duration-150
                      hover:bg-gray-50 active:bg-gray-100
                      focus:outline-none focus:bg-gray-50
                      ${isSelected ? 'bg-blue-50 text-blue-700 font-semibold' : ''}
                    `}
                  >
                    <OptionIcon
                      size={16}
                      className={optionConfig.iconColor}
                    />
                    <span className="text-sm font-medium">{optionConfig.label}</span>
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

export default StatusSelect;

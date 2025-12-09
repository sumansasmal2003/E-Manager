import React from 'react';

const Input = React.forwardRef(({ type, placeholder, icon, className = '', label, name, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          ref={ref}
          {...props}
          className={`
            w-full pl-10 pr-4 py-3
            bg-white border border-gray-300 rounded-lg
            text-primary placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
        />
      </div>
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

import React from 'react';

const Input = React.forwardRef(({ type, placeholder, icon, className = '', ...props }, ref) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {icon}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        ref={ref}
        {...props}
        className={`
          w-full pl-10 pr-4 py-3
          bg-white border border-gray-300 rounded-lg
          text-gray-900 placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      />
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

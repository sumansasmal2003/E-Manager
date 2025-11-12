import { useState, useEffect } from 'react';

// This hook delays updating a value until after a specified delay.
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timer to update the value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timer if the value changes (e.g., user keeps typing)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

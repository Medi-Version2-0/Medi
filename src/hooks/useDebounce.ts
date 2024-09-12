import { useEffect, useState } from 'react';

/**
 * This hook debounces a value by a specified delay.
 * It clears the timeout if the value changes within the delay and sets the value after the delay.
 * @param {string} value The value to debounce.
 * @param {number} delay The debounce delay in milliseconds.
 * @returns {string} The debounced value.
 */
function useDebounce(value: string = '', delay: number = 500): string {
  const [debouncedValue, setDebouncedValue] = useState<string>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;

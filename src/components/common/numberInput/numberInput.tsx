import React, { useEffect, useRef, useState } from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { FaExclamationCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';

interface NumberInputProps {
    label?: string;
    id: string;
    name: string;
    value: string | number | null;
    onChange: (value: string | number | null) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    error?: string;
    placeholder?: string;
    min?: number;
    max?: number;
    isRequired?: boolean;
    className?: string;
    labelClassName?: string;
    inputClassName?: string;
    isDisabled?: boolean;
    prevField?: string;
    nextField?: string;
    autoFocus?: boolean;
    maxLength?: number;
    style?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
    label,
    id,
    name,
    value,
    onChange,
    onBlur,
    onFocus,
    onKeyDown,
    error,
    placeholder,
    min,
    max,
    isRequired = false,
    className = '',
    labelClassName = '',
    inputClassName = '',
    isDisabled = false,
    prevField,
    nextField,
    autoFocus = false,
    maxLength,
    style,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = useState<string>('');

    const { controlRoomSettings } = useSelector((state: any) => state.global);
    const decimalPlaces = controlRoomSettings?.decimalValueCount || 2;

    useEffect(() => {
        if (value !== null && value !== undefined) {
            if(maxLength && String(value).length > maxLength) return;
            setInputValue(String(value));
        } else {
            setInputValue('');
        }
    }, [value]);

    // Prevent value change on scroll
    useEffect(() => {
        const inputElement = inputRef.current;
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
        };
        if (inputElement) {
            inputElement.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (inputElement) {
                inputElement.removeEventListener('wheel', handleWheel);
            }
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;
        if (maxLength && val.length > maxLength) return; // prevent to enter digits more than max length
        // Allow empty input to set value to null
        if (val === '') {
            setInputValue('');
            onChange(null);
            return;
        }

        // Regex to allow numbers with limited decimal places
        const regex = new RegExp(
            `^-?\\d*(\\.\\d{0,${decimalPlaces}})?$`
        );


        if (!regex.test(val)) {
            // Do not update the input if value is invalid
            return;
        }

        // Enforce min and max limits
        let numericValue = parseFloat(val);
        if (!isNaN(numericValue)) {
            if (min !== undefined && numericValue < min) {
                numericValue = min;
                val = String(numericValue);
            }
            if (max !== undefined && numericValue > max) {
                numericValue = max;
                val = String(numericValue);
            }
        }

        setInputValue(val);
        onChange(val);
    };

    const handleBlur = () => {
        if (inputValue !== '') {
            let numericValue = parseFloat(inputValue);
            if (!isNaN(numericValue)) {
                if (min !== undefined && numericValue < min) {
                    numericValue = min;
                }
                if (max !== undefined && numericValue > max) {
                    numericValue = max;
                }
                const formattedValue = numericValue.toFixed(decimalPlaces).replace(/\.?0+$/, '');
                setInputValue(formattedValue);
                onChange(formattedValue);
            } else {
                // If input is invalid, reset to previous valid value or null
                setInputValue('');
                onChange(null);
            }
        }
        onBlur?.()
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === 'ArrowDown') {
          if (nextField) {
            document.getElementById(nextField)?.focus();
            e.preventDefault();
          }
        } else if ((e.key === 'Enter' && e.shiftKey) || e.key === 'ArrowUp') {
          if (prevField) {
            document.getElementById(prevField)?.focus();
          }
        }
        if(onKeyDown){
            onKeyDown(e);
        }
      };

    return (
        <div
            className={`flex  relative w-full text-xs ${isRequired ? 'starlabel' : ''} ${className}`}
        >
            {label && (
                 <label htmlFor={id}className={` bg-white px-1 ${error ? '!text-red-700' : '' } ${labelClassName}`}>
                    {label}
                </label>
            )}
            <input
                ref={inputRef}
                type='text'
                id={id}
                name={name}
                value={inputValue}
                className={`w-full border border-solid border-gray-400 text-sm text-gray-800 rounded-sm appearance-none disabled:text-gray-500 disabled:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-blue-50 ${error ? 'border-red-500' : ''
                    } ${inputClassName}`}
                onChange={handleInputChange}
                onBlur={handleBlur}
                onFocus={onFocus}
                placeholder={placeholder}
                disabled={isDisabled}
                data-next-field={nextField}
                data-prev-field={prevField}
                autoFocus={autoFocus}
                inputMode='decimal'
                onKeyDown={onKeyDown || handleKeyDown}
            />
            {error && (
                <>
                    <FaExclamationCircle data-tooltip-id={`${id}-error-tooltip`} className='absolute top-1/2 right-1 transform -translate-y-1/2 text-red-600'
                    />
                    <ReactTooltip id={`${id}-error-tooltip`} place='bottom' className='text-white border rounded text-sm z-10 p-2 border-solid border-red-700 !bg-red-600'
                    >
                        {error}
                    </ReactTooltip>
                </>
            )}
        </div>
    );
};

export default NumberInput;
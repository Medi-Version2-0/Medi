import React, { useEffect, useRef } from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { FaExclamationCircle } from 'react-icons/fa';
import titleCase from '../../utilities/titleCase';

interface FormikInputFieldProps {
  label?: string;
  id: string;
  name: string;
  type?: string;
  placeholder?: string;
  isTitleCase?: boolean;
  maxLength?: number;
  formik: {
    handleBlur: (e: React.FocusEvent<any>) => void;
    handleChange: (e: React.ChangeEvent<any>) => void;
    values: {
      [key: string]: any;
    };
    touched: {
      [key: string]: boolean;
    };
    errors: {
      [key: string]: string;
    };
  };
  showErrorTooltip?: boolean;
  isRequired?: boolean;
  children?: React.ReactNode;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
  nextField?: string;
  prevField?: string;
  sideField?: string;
  isPopupOpen?: boolean;
  allowNegative?: boolean;
  autoFocus?: boolean;
}

const FormikInputField: React.FC<FormikInputFieldProps> = ({
  label,
  id,
  formik,
  type = 'text',
  maxLength,
  showErrorTooltip = false,
  isRequired = false,
  children,
  isTitleCase = true,
  name,
  onChange,
  onKeyDown,
  className,
  labelClassName,
  inputClassName,
  onClick,
  placeholder,
  isDisabled = false,
  nextField,
  prevField,
  sideField,
  isPopupOpen = true,
  allowNegative = false,
  autoFocus = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const isNumber = allowNegative ? /^-?\d*$/ : /^\d*\.?\d{0,2}$/;
    if (type === 'number' && !isNumber.test(value)) {
      return;
    }
    formik.handleChange({
      ...e,
      target: {
        ...e.target,
        id,
        value: isTitleCase ? titleCase(value) : value,
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const validKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete'];
    const isNumericKey = /\d/.test(e.key);
    const isNegativeSign = e.key === '-' && allowNegative;
    if (type === 'number' && !isNumericKey && !validKeys.includes(e.key) && !isNegativeSign) {
      e.preventDefault();
    }

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

    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  useEffect(() => {
    const inputElement = inputRef.current;
    const handleWheel = (e: any) => {
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

  return (
    <div
      className={`${isPopupOpen ? `flex flex-col relative w-full h-7 text-xs ${isRequired && 'starlabel'} ${className}` : `flex flex-row gap-2 items-center relative w-full h-6 text-xs ${isRequired && 'starlabel'} ${className}`}`}
    >
      <label
        htmlFor={id}
        className={`${isPopupOpen ? `${labelClassName} absolute top-0 left-1 -translate-y-1/2 bg-white px-1 ${!!(formik.touched[id] && formik.errors[id]) && '!text-red-700'}` : `${labelClassName} `} `}
      >
        {label}
      </label>
      {children}
      <input
        ref={inputRef}
        type={type}
        id={id}
        name={name}
        maxLength={maxLength}
        className={`w-full border border-solid border-[#9ca3af] text-[12px] text-gray-800 h-full rounded-sm p-1 appearance-none disabled:text-[#A9A9A9] disabled:bg-[#f5f5f5] focus:bg-[#EAFBFCFF] ${!!(formik.touched[id] && formik.errors[id]) && '!border-red-500'} ${inputClassName}`}
        onBlur={formik.handleBlur}
        onChange={onChange || handleChange}
        onKeyDown={handleKeyDown}
        onClick={onClick}
        placeholder={placeholder}
        disabled={isDisabled}
        data-next-field={nextField}
        data-prev-field={prevField}
        data-side-field={sideField}
        {...(type !== 'file' && { value: formik.values[id] })}
        {...(type === 'file' && { accept: "image/*" })}
        autoFocus={autoFocus}
      />
      {showErrorTooltip && formik.touched[id] && formik.errors[id] && (
        <>
          <FaExclamationCircle
            data-tooltip-id={`${id}-error-tooltip`}
            className='absolute -translate-y-2/4 top-2/4 right-1 text-red-600'
          />
          <ReactTooltip
            id={`${id}-error-tooltip`}
            place='bottom'
            className='text-[white] border rounded text-sm z-10 p-2 border-solid border-[#d8000c] !bg-red-600'
          >
            {formik.errors[id]}
          </ReactTooltip>
        </>
      )}
    </div>
  );
};

export default FormikInputField;

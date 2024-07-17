import React from 'react';
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
  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    formik.handleChange({
      ...e,
      target: {
        ...e.target,
        id,
        value: isTitleCase ? titleCase(value) : value,
      },
    });
  },
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
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      if (nextField) {
        document.getElementById(nextField)?.focus();
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
        type={type}
        id={id}
        name={name}
        maxLength={maxLength}
        className={`w-full border border-solid border-[#9ca3af] text-[10px] text-gray-800 h-full rounded-sm p-1 disabled:text-[#A9A9A9] disabled:bg-[#f5f5f5] focus:bg-[#EAFBFCFF] ${!!(formik.touched[id] && formik.errors[id]) && '!border-red-500'} ${inputClassName}`}
        onBlur={formik.handleBlur}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        onClick={onClick}
        placeholder={placeholder}
        disabled={isDisabled}
        data-next-field={nextField}
        data-prev-field={prevField}
        data-side-field={sideField}
        {...(type !== 'file' && { value: formik.values[id] })}
        {...(type === 'file' && { accept: "image/*" })}
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
            className=' text-[white] border rounded text-sm z-10 p-2 border-solid border-[#d8000c] !bg-red-600'
          >
            {formik.errors[id]}
          </ReactTooltip>
        </>
      )}
    </div>
  );
};

export default FormikInputField;

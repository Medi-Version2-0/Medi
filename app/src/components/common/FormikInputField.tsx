import React from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { FaExclamationCircle } from 'react-icons/fa';

interface FormikInputFieldProps {
  label: string;
  id: string;
  name: string;
  type?: string;
  placeholder?: string;
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
  inputContainerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FormikInputField: React.FC<FormikInputFieldProps> = ({
  label,
  id,
  formik,
  type = 'text',
  showErrorTooltip = false,
  isRequired = false,
  children,
  name,
  onChange = formik.handleChange,
  onKeyDown,
  className,
  inputContainerClassName,
  labelClassName,
  inputClassName,
  onClick,
  placeholder
}) => {
  return (
    <div className={`flex flex-row gap-2 items-center mb-2 relative w-full  ${isRequired ? ' starlabel' : ''} ${className || ''}`}>
      <label htmlFor={id} className={`font-bold text-gray-600 min-w-fit ${labelClassName}`}>
        {label}
      </label>
      {children}
      <div className={`relative ${inputContainerClassName}`}>
      <input
        type={type}
        id={id}
        name={name}
        className={`w-full ml-1 h-6 ${inputClassName}`}
        onBlur={formik.handleBlur}
        onChange={onChange}
        value={formik.values[id]}
        onKeyDown={onKeyDown}
        onClick={onClick}
        placeholder={placeholder}
      />
      {showErrorTooltip && formik.touched[id] && formik.errors[id] && (
        <>
          <FaExclamationCircle data-tooltip-id={`${id}-error-tooltip`} className='absolute -translate-y-2/4 top-2/4 right-1 text-red-600' />
          <ReactTooltip id={`${id}-error-tooltip`} place='bottom' className='bg-[#89050b] text-[white] border rounded text-sm z-10 p-2 border-solid border-[#d8000c]'>
            {formik.errors[id]}
          </ReactTooltip>
        </>
      )}
      </div>
    </div>
  );
};

export default FormikInputField;

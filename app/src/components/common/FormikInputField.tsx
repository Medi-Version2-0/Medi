import React from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { FaExclamationCircle } from 'react-icons/fa';

interface FormikInputFieldProps {
  label?: string;
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
  labelClassName?: string;
  inputClassName?: string;
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
  nextField?: string;
  prevField?: string;
  sideField?: string;
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
  labelClassName,
  inputClassName,
  onClick,
  placeholder,
  isDisabled=false,
  nextField,
  prevField,
  sideField
}) => {
  return (
    <div className={`flex flex-row gap-2 items-center relative w-full h-6 text-xs ${isRequired && 'starlabel'} ${className}`}>
      <label htmlFor={id} className={`${labelClassName}`}>
        {label}
      </label>
      {children}
      <input
        type={type}
        id={id}
        name={name}
        className={`w-full border border-solid border-[#9ca3af] text-gray-800 h-full rounded-sm p-1 disabled:text-[#A9A9A9] disabled:bg-[#f5f5f5] ${!!(formik.touched[id] && formik.errors[id]) && ('!border-red-500')} ${inputClassName}`}
        onBlur={formik.handleBlur}
        onChange={onChange}
        value={formik.values[id]}
        onKeyDown={onKeyDown}
        onClick={onClick}
        placeholder={placeholder}
        disabled={isDisabled}
        data-next-field={nextField}
        data-prev-field={prevField}
        data-side-field={sideField}
      />
      {showErrorTooltip && formik.touched[id] && formik.errors[id] && (
        <>
          <FaExclamationCircle data-tooltip-id={`${id}-error-tooltip`} className='absolute -translate-y-2/4 top-2/4 right-1 text-red-600' />
          <ReactTooltip id={`${id}-error-tooltip`} place='bottom' className=' text-[white] border rounded text-sm z-10 p-2 border-solid border-[#d8000c] !bg-red-600'>
            {formik.errors[id]}
          </ReactTooltip>
        </>
      )}
    </div>
  );
};

export default FormikInputField;

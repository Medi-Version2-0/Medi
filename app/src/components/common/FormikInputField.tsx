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
  onClick,
  placeholder
}) => {
  return (
    <div className={`ledger_inputs${isRequired ? ' starlabel' : ''} ${className || ''}`}>
      <label htmlFor={id} className={`label_name_css`}>
        {label}
      </label>
      {children}
      <input
        type={type}
        id={id}
        name={name}
        className='input_class'
        onBlur={formik.handleBlur}
        onChange={onChange}
        value={formik.values[id]}
        onKeyDown={onKeyDown}
        onClick={onClick}
        placeholder={placeholder}
      />
      {showErrorTooltip && formik.touched[id] && formik.errors[id] && (
        <>
          <FaExclamationCircle data-tooltip-id={`${id}-error-tooltip`} className='error_icon' />
          <ReactTooltip id={`${id}-error-tooltip`} place='bottom' className='custom-tooltip'>
            {formik.errors[id]}
          </ReactTooltip>
        </>
      )}
    </div>
  );
};

export default FormikInputField;

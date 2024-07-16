import React, { useEffect, useRef, useState } from 'react';
import Select, { Props as SelectProps } from 'react-select';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { FaExclamationCircle } from 'react-icons/fa';
import { Option } from '../../interface/global';
import './CustomSelect.css';
import titleCase from '../../utilities/titleCase';

interface CustomSelectProps extends Omit<SelectProps<Option>, 'onChange'> {
  label?: string;
  id?: string;
  name?: string;
  labelClass?: string;
  containerClass?: string;
  options: Option[];
  value: Option | null;
  onChange: (option: Option | null, id: string) => void;
  placeholder?: string;
  isSearchable?: boolean;
  disableArrow?: boolean;
  hidePlaceholder?: boolean;
  className?: string;
  onKeyDown?: any;
  isFocused?: boolean;
  isTouched?: boolean;
  error?: string;
  onBlur?: () => void;
  isRequired?: boolean;
  showErrorTooltip?: boolean;
  noOptionsMsg?: string;
  isPopupOpen?: boolean;
  nextField?: string;
  prevField?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  isPopupOpen = true,
  isDisabled = false,
  label,
  id,
  name = '',
  labelClass,
  containerClass,
  options,
  value,
  onChange,
  placeholder = '',
  isSearchable = true,
  disableArrow = true,
  hidePlaceholder = true,
  className = '',
  onKeyDown,
  isFocused = false,
  isTouched = false,
  error = '',
  onBlur,
  isRequired,
  showErrorTooltip = false,
  noOptionsMsg = 'No Options',
  nextField,
  prevField,
  ...props
}) => {
  const customComponents = disableArrow
    ? { DropdownIndicator: () => null, IndicatorSeparator: () => null }
    : {};
  const selectRef = useRef<any>(null);
  const [inputValue, setInputValue] = useState('');
  const [active, setActive] = useState(false);
  const handleFocus = () => setActive(!active);
  const handleBlur = () => {
    setActive(false);
    if (onBlur) onBlur();
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(titleCase(newValue));
    return titleCase(newValue);
  };

  useEffect(() => {
    if (isFocused && selectRef.current) {
      selectRef.current.focus();
    }
  }, [isFocused]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      if (nextField) {
        document.getElementById(nextField)?.focus();
      }
    } else if ((e.key === 'Enter' && e.shiftKey) || e.key === '') {
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
      className={`${isPopupOpen ? `flex flex-col w-full h-fit relative text-xs${isRequired ? ' starlabel' : ''} ${containerClass}` : `flex flex-row gap-2 justify-center items-center w-full h-fit ${isRequired ? ' starlabel' : ''} ${containerClass}`}`}
    >
      {label && (
        <label
          htmlFor={id}
          className={`${isPopupOpen ? `absolute top-0 left-1 -translate-y-1/2 bg-white px-1 z-10 ${isTouched && error && !active && '!text-red-700'} ${labelClass}` : `flex items-start h-full ${labelClass}`}`}
        >
          {label}
        </label>
      )}
      <div
        className={` ${isPopupOpen ? `w-full relative border border-solid border-[#9ca3af] h-10 rounded-md ${className}  ${isTouched && error && !active && '!border-red-500'} ${active && '!border-2 !border-yellow-500 outline-none'}` : `w-full relative border border-solid border-[#9ca3af] h-fit rounded-md ${className}  ${isTouched && error && !active && '!border-red-500'} ${active && '!border-2 !border-yellow-500 outline-none'}`} `}
      >
        <Select
          ref={selectRef}
          id={id || ''}
          name={name || ''}
          classNamePrefix='custom-select'
          components={customComponents}
          options={options}
          value={value}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onChange={(selectedOption) =>
            onChange(selectedOption as Option | null, id!)
          }
          placeholder={hidePlaceholder ? '' : placeholder}
          isSearchable={isSearchable}
          className={`w-full h-full text-gray-700 `}
          {...props}
          onKeyDown={handleKeyDown}
          isDisabled={isDisabled}
          onBlur={handleBlur}
          onFocus={handleFocus}
          noOptionsMessage={() => noOptionsMsg}
        />
        {showErrorTooltip && isTouched && error && (
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
              {error}
            </ReactTooltip>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomSelect;

import React, { useEffect, useRef, useState } from 'react';
import Select, { Props as SelectProps } from 'react-select';
import './CustomSelect.css';
import { Option } from '../../interface/global';

interface CustomSelectProps extends Omit<SelectProps<Option>, 'onChange'> {
  label?: string;
  id?: string;
  name?: string;
  labelClass?: string;
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
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  isDisabled = false,
  label,
  id,
  name = "",
  labelClass,
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
  ...props
}) => {
  const customComponents = disableArrow ? { DropdownIndicator: () => null, IndicatorSeparator: () => null } : {};
  const selectRef = useRef<any>(null);
  const [active, setActive] = useState(false);
  const handleFocus = () => setActive(!active);
  const handleBlur = () => {
    setActive(false);
    if (onBlur) onBlur();
  };

  useEffect(() => {
    if (isFocused && selectRef.current) {
      selectRef.current.focus();
    }
  }, [isFocused]);

  return (
    <div className={`flex flex-row gap-1 justify-center items-center w-full h-fit ${isRequired ? ' starlabel' : ''}`}>
      {label && (
        <label htmlFor={id} className={`flex items-start h-full ${labelClass}`}>
          {label}
        </label>
      )}
      <div className={`w-full border border-solid border-[#9ca3af] h-fit rounded-md ${className}  ${isTouched && error && !active && '!border-red-500'} ${active && "!border-2 !border-yellow-500 outline-none"}`}>
        <Select
          ref={selectRef}
          id={id || ""}
          name={name || ""}
          classNamePrefix='custom-select'
          components={customComponents}
          options={options}
          value={value}
          onChange={(selectedOption) =>
            onChange(selectedOption as Option | null, id!)
          }
          placeholder={hidePlaceholder ? '' : placeholder}
          isSearchable={isSearchable}
          className={`w-full h-full text-gray-700`}
          {...props}
          onKeyDown={onKeyDown}
          isDisabled={isDisabled}
          onBlur={handleBlur}
          onFocus={handleFocus}
        />
      </div>
    </div>
  );
};

export default CustomSelect;

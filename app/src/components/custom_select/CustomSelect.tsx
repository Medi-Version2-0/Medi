import React from 'react';
import Select, { Props as SelectProps } from 'react-select';
import './CustomSelect.css';
import { Option } from '../../interface/global';

interface CustomSelectProps extends Omit<SelectProps<Option>, 'onChange'> {
  label?: string;
  id?: string;
  labelClass?: string;
  options: Option[];
  value: Option | null;
  onChange: (option: Option | null,id: string) => void;
  placeholder?: string;
  isSearchable?: boolean;
  disableArrow?: boolean;
  hidePlaceholder?: boolean;
  className?: string;
  onKeyDown?: any;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  isDisabled = false,
  label,
  id,
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
  ...props
}) => {
  const customComponents = disableArrow
    ? {
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null,
      }
    : {};

  return (
    <>
      {label && (
        <label htmlFor={id} className={labelClass} >
          {label}
        </label>
      )}
      <Select
        classNamePrefix='custom-select'
        components={customComponents}
        options={options}
        value={value}
        onChange={(selectedOption) =>
          onChange(selectedOption as Option | null,id!)
        }
        placeholder={hidePlaceholder ? '' : placeholder}
        isSearchable={isSearchable}
        className={className}
        {...props}
        onKeyDown={onKeyDown}
        isDisabled={isDisabled}
      />
    </>
  );
};

export default CustomSelect;

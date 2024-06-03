import React from 'react';
import Select, { Props as SelectProps, ActionMeta } from 'react-select';
import './CustomSelect.css';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps extends Omit<SelectProps<Option>, 'onChange'> {
  options: Option[];
  value: Option | null;
  onChange: (option: Option | null, actionMeta: ActionMeta<Option>) => void;
  placeholder?: string;
  isSearchable?: boolean;
  disableArrow?: boolean;
  hidePlaceholder?: boolean;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "",
  isSearchable = true,
  disableArrow = true,
  hidePlaceholder = true,
  className = '',
  ...props
}) => (
  <Select
    classNamePrefix="custom-select"
    components={{
      DropdownIndicator: disableArrow ? () => null : undefined,
      IndicatorSeparator: disableArrow ? () => null : undefined
    }}
    options={options}
    value={value}
    onChange={(selectedOption, actionMeta) =>
      onChange(selectedOption as Option | null, actionMeta)
    }
    placeholder={hidePlaceholder ? "" : placeholder}
    isSearchable={isSearchable}
    className={className}
    {...props}
  />
);

export default CustomSelect;

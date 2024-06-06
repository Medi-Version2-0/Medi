import React from 'react';

interface FormikSelectFieldProps {
  label: string;
  id: string;
  name: string;
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
  options: { value: string; label: string }[];
}

const FormikSelectField: React.FC<FormikSelectFieldProps> = ({
  label,
  id,
  name,
  formik,
  options,
}) => {
  return (
    <>
    <div className='ledger_inputs'>
      <label htmlFor={id} className='label_name label_name_css'>
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={formik.values[id]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      >
        <option value='Select'>Select an Option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>


    {/* <div className='ledger_inputs'>
    <label
      htmlFor='State In Out'
      className='label_name label_name_css starlabel'
    >
      State In Out
    </label>
    <CustomSelect
      value={formik.values.stateInout==='' ? null : { label: formik.values.stateInout, value: formik.values.stateInout }}
      onChange={handleStateInOutChange}
      options={[
        { value: 'Within state', label: 'Within state' },
        { value: 'Out of state', label: 'Out of state' },
      ]}
      isSearchable={false}
      placeholder="Select an option"
      disableArrow={false}
      hidePlaceholder={false}
      className="custom-select-field"
    />
  </div> */}


    </>
  );
};

export default FormikSelectField;

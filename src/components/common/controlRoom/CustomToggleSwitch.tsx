import React from 'react';
import '../../../index.css';

const CustomToggleSwitch = ({ field, form, label, index, formik }: any) => {
  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget.value;
    let numericInput = input.replace(/[^0-9.]/g, '');
    const decimalCount = (numericInput.match(/\./g) || []).length;
    if (decimalCount > 1) {
      numericInput = numericInput.replace(/\.(?=.*\.)/, '');
    }
    formik.setFieldValue('dpcoDiscount', numericInput);
  };

  const handleToggleChange = () => {
    const newValue = !field.value;
    form.setFieldValue(field.name, newValue);
    if (field.name === 'dpcoAct' && !newValue) {
      form.setFieldValue('dpcoDiscount', 0);
    }
  };

  return (
    <div
      className={`flex flex-col w-full ${index !== 0 ? 'border-t-0' : ''} pr-8`}
    >
      <div className='flex flex-row justify-between items-center border-[1px] border-solid border-[#009196FF]'>
        <span className='ml-[0.7rem] w-[70%] p-2 border-r-[1px] border-solid border-[#009196FF]'>
          {label}
        </span>
        <label className='relative inline-block w-[3rem] h-[1.3rem]'>
          <input
            type='checkbox'
            {...field}
            name={field.name}
            checked={field.value}
            onChange={handleToggleChange}
            className='opacity-0 w-0 h-0 p-2'
          />
          <span className='slider round rounded-[34px] before:rounded-[50%]'></span>
        </label>
      </div>
      {field.name === 'dpcoAct' && formik.values.dpcoAct && (
        <div className='flex flex-row justify-between items-center border-[1px] border-solid border-[#009196FF]'>
          <span className='ml-[0.7rem] w-[70%] p-2 border-r-[1px] border-solid border-[#009196FF]'>
            Discount
          </span>
          <label className='w-[12rem] h-[1.3rem]'>
            <input
              name='dpcoDiscount'
              type='text'
              value={formik.values.dpcoDiscount}
              placeholder='Enter discount'
              className='input-class w-full h-full text-right border-none outline-none'
              onChange={handleDiscountChange}
              required
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default CustomToggleSwitch;

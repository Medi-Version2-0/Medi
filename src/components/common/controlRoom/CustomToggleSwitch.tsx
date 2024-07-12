import React from 'react';
import '../../../index.css'

const CustomToggleSwitch = ({ field, form, label, index}: any) => {
  return (
    <div className={`flex flex-row justify-between items-center border-[1px] border-solid border-[#009196FF] ${index !== 0 ? 'border-t-0' : ''} pr-8`}>
      <span className='ml-[0.7rem] w-[70%] p-2 border-r-[1px] border-solid border-[#009196FF]'>{label}</span>
      <label className='relative inline-block w-[3rem] h-[1.3rem]'>
        <input
          type='checkbox'
          {...field}
          name={field.name}
          checked={field.value}
          onChange={() => {
            return form.setFieldValue(field.name, !field.value)}}
          className='opacity-0 w-0 h-0 p-2'
        />
        <span className='slider round rounded-[34px] before:rounded-[50%]'></span>
      </label>
    </div>
  );
};

export default CustomToggleSwitch;

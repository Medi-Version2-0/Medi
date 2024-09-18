import React from 'react';
import FormikInputField from '../common/FormikInputField';

interface TaxInfoProps {
  formik?: any;
}

export const TaxDetails: React.FC<TaxInfoProps> = ({
  formik,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = e.target.id;
    const value = e.target.value;
    if(id === 'gstIn'){
      if(value.length <= 15){
        formik.setFieldValue('gstIn', value);
      }else{
        formik.setFieldValue('gstIn', value.slice(0, 15));
      }
    }
    else if(id === 'panCard'){
      if(value.length <= 10){
        formik.setFieldValue('panCard', value);
      }else{
        formik.setFieldValue('panCard', value.slice(0, 10));
      }
    }
  };

  // const handleClick = () => {
  //   document.getElementById('Licence_Info')?.focus();
  // }

  return (
    <div className='flex flex-col  gap-x-4 gap-y-2 w-1/2 px-2 m-2 text-xs leading-3 text-gray-600'>
      <FormikInputField
      isPopupOpen={false}
        label='GSTIN'
        id='gstIn'
        name='gstIn'
        maxLength={15}
        isTitleCase={false}
        isRequired={false}
        formik={formik}
        labelClassName='min-w-[90px]'
        onChange={handleChange}
        prevField='gstIn'
        nextField='panCard'
        showErrorTooltip={formik.touched.gstIn && formik.errors.gstIn}
      />
      <FormikInputField
      isPopupOpen={false}
        label='Pan No.'
        id='panCard'
        name='panCard'
        onChange={handleChange}
        isTitleCase={false}
        maxLength={10}
        formik={formik}
        labelClassName='min-w-[90px]'
        prevField='gstIn'
        nextField='Licence_Info'
        // onKeyDown={handleClick}
        showErrorTooltip={formik.touched.panCard && formik.errors.panCard}
      />
    </div>
  );
};
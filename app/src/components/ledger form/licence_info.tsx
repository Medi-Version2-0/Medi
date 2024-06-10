import React from 'react';
import FormikInputField from '../common/FormikInputField';

interface LicenceInfoProps {
  formik?: any;
}

export const LicenceInfo: React.FC<LicenceInfoProps> = ({ formik }) => {
  return (
    <div className='flex gap-2 w-2/3 m-2 text-xs px-2 leading-3 text-gray-600'>
      <FormikInputField
        label='Drug Lic. No.'
        id='drugLicenceNo1'
        name='drugLicenceNo1'
        labelClassName='min-w-[90px]'
        formik={formik}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter') {
            document.getElementById('expiryDate')?.focus();
            e.preventDefault();
          } else if (e.key === 'ArrowUp') {
            document.getElementById('Licence_Info')?.focus();
          }
        }}
      />
      <button type='button' className='mx-2 text-[24px] leading-3'> + </button>
    </div>
  );
};

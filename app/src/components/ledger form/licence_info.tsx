import React from 'react';
import FormikInputField from '../common/FormikInputField';

interface LicenceInfoProps {
  formik?: any;
}

export const LicenceInfo: React.FC<LicenceInfoProps> = ({ formik }) => {
  return (
    <div className='flex w-2/3 m-2'>
      <FormikInputField
        label='Drug Lic. No.'
        id='drugLicenceNo1'
        name='drugLicenceNo1'
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
      <button type='button' className='p-4 flex items-center text-[30px] h-12'> + </button>
    </div>
  );
};

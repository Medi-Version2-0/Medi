import React from 'react';
import FormikInputField from '../common/FormikInputField';

interface TaxInfoProps {
  formik?: any;
}

export const TaxDetails: React.FC<TaxInfoProps> = ({
  formik,
}) => {
  return (
    <div className='flex flex-col  gap-x-4 gap-y-2 w-1/2 px-2 m-2 text-xs leading-3 text-gray-600'>
      <FormikInputField
        label='GSTIN'
        id='gstIn'
        name='gstIn'
        maxLength={15}
        isRequired={true}
        formik={formik}
        labelClassName='min-w-[90px]'
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter') {
            document.getElementById('registrationDate')?.focus();
            e.preventDefault();
          } else if (e.key === 'ArrowUp') {
            document.getElementById('ledgerType')?.focus();
            e.preventDefault();
          }
        }}
        showErrorTooltip={formik.touched.gstIn && formik.errors.gstIn}
      />
      <FormikInputField
        label='Pan No.'
        id='panCard'
        name='panCard'
        maxLength={15}
        formik={formik}
        labelClassName='min-w-[90px]'
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter') {
            document.getElementById('Licence_Info')?.focus();
            e.preventDefault();
          } else if (e.key === 'ArrowUp') {
            document.getElementById('gstIn')?.focus();
            e.preventDefault();
          }
        }}
      />
    </div>
  );
};

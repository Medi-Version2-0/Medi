import React from 'react';
import FormikInputField from '../common/FormikInputField';

interface personalInfoProps {
  formik?: any;
}

export const ContactDetails: React.FC<personalInfoProps> = ({
  formik,
}) => {
  return (
    <div className='grid grid-cols-2  gap-x-4 gap-y-2 px-2 m-2 text-xs leading-3 text-gray-600'>
      <FormikInputField
      isPopupOpen={false}
        labelClassName='min-w-[90px] text-nowrap'
        label='First Name'
        id='firstName'
        name='firstName'
        formik={formik}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter') {
            document.getElementById('lastName')?.focus();
            e.preventDefault();
          } else if (e.key === 'ArrowUp') {
            document.getElementById('Contact_Info')?.focus();
          }
        }}
      />
      <FormikInputField
      isPopupOpen={false}
        labelClassName='min-w-[90px] text-nowrap'
        label='Last Name'
        id='lastName'
        name='lastName'
        formik={formik}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter') {
            document.getElementById('emailId1')?.focus();
            e.preventDefault();
          } else if (e.key === 'ArrowUp') {
            document.getElementById('firstName')?.focus();
          }
        }}
      />
      <FormikInputField
      isPopupOpen={false}
        labelClassName='min-w-[90px] text-nowrap'
        label='Email ID'
        id='emailId1'
        name='emailId1'
        placeholder='abc@example.com'
        formik={formik}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter') {
            document.getElementById('emailId2')?.focus();
            e.preventDefault();
          } else if (e.key === 'ArrowUp') {
            document.getElementById('lastName')?.focus();
          }
        }}
        showErrorTooltip={formik.touched.emailId1 && formik.errors.emailId1}
      />
      <FormikInputField
      isPopupOpen={false}
        labelClassName='min-w-[90px] text-nowrap'
        label='Email ID 2'
        id='emailId2'
        name='emailId2'
        placeholder='abc@example.com'
        formik={formik}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter') {
            document.getElementById('Bank_Details')?.focus();
            e.preventDefault();
          } else if (e.key === 'ArrowUp') {
            document.getElementById('emailId1')?.focus();
          }
        }}
        showErrorTooltip={formik.touched.emailId2 && formik.errors.emailId2}
      />
    </div>
  );
};

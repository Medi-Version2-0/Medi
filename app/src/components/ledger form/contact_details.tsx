import React from 'react';
import FormikInputField from '../common/FormikInputField';

interface personalInfoProps {
  formik?: any;
}

export const ContactDetails: React.FC<personalInfoProps> = ({
  formik,
}) => {
  return (
    <div className='tax_details_page'>
      <div className='tax_ledger_inputs'>
        <div className='name_input'>
          <FormikInputField
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
        </div>
        <div className='name_input'>
          <FormikInputField
            label='Last Name'
            id='lastName'
            name='lastName'
            formik={formik}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'ArrowDown' || e.key === 'Enter') {
                document.getElementById('gender')?.focus();
                e.preventDefault();
              } else if (e.key === 'ArrowUp') {
                document.getElementById('firstName')?.focus();
              }
            }}
          />
        </div>
      </div>
      <div className='tax_ledger_inputs'>
        <div className='name_input'>
          <FormikInputField
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
                document.getElementById('website_input')?.focus();
              }
            }}
            showErrorTooltip={formik.touched.emailId1 && formik.errors.emailId1}
          />
        </div>
        <div className='name_input'>
          <FormikInputField
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
      </div>
    </div>
  );
};

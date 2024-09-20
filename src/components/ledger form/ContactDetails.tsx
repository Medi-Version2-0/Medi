import React from 'react';
import FormikInputField from '../common/FormikInputField';

interface personalInfoProps {
  formik?: any;
}

export const ContactDetails: React.FC<personalInfoProps> = ({ formik }) => {
  const handleClick = () => {
    document.getElementById('Bank_Details')?.focus();
  }
  return (
    <div className='grid grid-cols-2  gap-x-4 gap-y-2 px-2 m-2 text-xs leading-3 text-gray-600'>
      <FormikInputField
        isPopupOpen={false}
        labelClassName='min-w-[90px] text-nowrap'
        label='First Name'
        id='firstName'
        name='firstName'
        formik={formik}
        prevField='Contact_Info'
        nextField='lastName'
      />
      <FormikInputField
        isPopupOpen={false}
        labelClassName='min-w-[90px] text-nowrap'
        label='Last Name'
        id='lastName'
        name='lastName'
        formik={formik}
        prevField='firstName'
        nextField='emailId1'
      />
      <FormikInputField
        isPopupOpen={false}
        labelClassName='min-w-[90px] text-nowrap'
        label='Email ID'
        id='emailId1'
        name='emailId1'
        isTitleCase={false}
        placeholder='abc@example.com'
        formik={formik}
        prevField='lastName'
        nextField='emailId2'
        showErrorTooltip={formik.touched.emailId1 && formik.errors.emailId1}
      />
      <FormikInputField
        isPopupOpen={false}
        labelClassName='min-w-[90px] text-nowrap'
        label='Email ID 2'
        id='emailId2'
        name='emailId2'
        isTitleCase={false}
        placeholder='abc@example.com'
        formik={formik}
        prevField='emailId1'
        nextField='Bank_Details'
        // onKeyDown={handleClick}
        showErrorTooltip={formik.touched.emailId2 && formik.errors.emailId2}
      />
    </div>
  );
};

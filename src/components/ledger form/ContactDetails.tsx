import React from 'react';
import FormikInputField from '../common/FormikInputField';

interface personalInfoProps {
  formik?: any;
}

export const ContactDetails: React.FC<personalInfoProps> = ({ formik }) => {
  return (
    <div className='grid grid-cols-2  gap-x-4 gap-y-2 px-2 m-2 text-xs leading-3 text-gray-600'>
      <FormikInputField
        isPopupOpen={false}
        labelClassName='min-w-[90px] text-nowrap'
        label='First Name'
        isUpperCase={true}
        id='firstName'
        name='firstName'
        formik={formik}
      />
      <FormikInputField
        isPopupOpen={false}
        labelClassName='min-w-[90px] text-nowrap'
        label='Last Name'
        isUpperCase={true}
        id='lastName'
        name='lastName'
        formik={formik}
      />
      <FormikInputField
        isPopupOpen={false}
        labelClassName='min-w-[90px] text-nowrap'
        label='Email ID'
        isUpperCase={true}
        id='emailId1'
        name='emailId1'
        isTitleCase={false}
        placeholder='abc@example.com'
        formik={formik}
        showErrorTooltip={formik.touched.emailId1 && formik.errors.emailId1}
      />
      <FormikInputField
        isPopupOpen={false}
        labelClassName='min-w-[90px] text-nowrap'
        label='Email ID 2'
        isUpperCase={true}
        id='emailId2'
        name='emailId2'
        isTitleCase={false}
        placeholder='abc@example.com'
        formik={formik}
        showErrorTooltip={formik.touched.emailId2 && formik.errors.emailId2}
      />
    </div>
  );
};

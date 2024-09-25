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
      isPopupOpen={false}
        label='GSTIN'
        id='gstIn'
        name='gstIn'
        maxLength={15}
        isTitleCase={false}
        isRequired={false}
        formik={formik}
        isUpperCase={true}
        labelClassName='min-w-[90px]'
        prevField='GST/Tax_Details'
        nextField='gstExpiry'
        showErrorTooltip={formik.touched.gstIn && formik.errors.gstIn}
      />
      <FormikInputField
        isPopupOpen={false}
        type='date'
        label='GST Expiry'
        id='gstExpiry'
        name='gstExpiry'
        labelClassName='min-w-[90px]'
        formik={formik}
        prevField='gstIn'
        nextField='panCard'
      />
      <FormikInputField
      isPopupOpen={false}
        label='Pan No.'
        id='panCard'
        name='panCard'
        isTitleCase={false}
        isUpperCase={true}
        maxLength={10}
        formik={formik}
        labelClassName='min-w-[90px]'
        prevField='gstExpiry'
        nextField='Licence_Info'
        showErrorTooltip={formik.touched.panCard && formik.errors.panCard}
      />
    </div>
  );
};
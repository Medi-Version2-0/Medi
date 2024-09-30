import React, { useState } from 'react';
import FormikInputField from '../common/FormikInputField';

interface LicenceDetailsProps {
  formik?: any;
  addDl2 : ()=> void
}

export const LicenceDetails: React.FC<LicenceDetailsProps> = ({ formik  , addDl2}) => {
  const [licenseId2, setLicenseId2] = useState(formik.values.drugLicenceNo2 !== '');
  return (
    <div className={`flex ${licenseId2 && 'flex-col'} w-full  gap-2 m-2 text-xs px-2 leading-3 text-gray-600`}>
      <FormikInputField
      isPopupOpen={false}
        label='Drug Lic. No.'
        id='drugLicenceNo1'
        maxLength={15}
        name='drugLicenceNo1'
        labelClassName='min-w-[90px]'
        isUpperCase={true}
        className='!w-2/3'
        formik={formik}
        showErrorTooltip={formik.touched.drugLicenceNo1 && formik.errors.drugLicenceNo1}
      />
      <FormikInputField
      isPopupOpen={false}
      type='date'
        label='Expiry Date'
        id='licenceExpiry'
        name='licenceExpiry'
        labelClassName='min-w-[90px]'
        placeholder='MM/YYYY'
        className='!w-2/3'
        formik={formik}
        showErrorTooltip={formik.touched.licenceExpiry && formik.errors.licenceExpiry}
      />
      <div className='flex gap-2 '>
        {(licenseId2 || (formik.values.drugLicenceNo2 !== '')) &&
          <FormikInputField
          isPopupOpen={false}
            label='Drug Lic. No. 2'
            isUpperCase={true}
            maxLength={15}
            id='drugLicenceNo2'
            name='drugLicenceNo2'
            labelClassName='min-w-[90px]'
            className='!w-2/3'
            formik={formik}
            showErrorTooltip={formik.touched.drugLicenceNo2 && formik.errors.drugLicenceNo2}
          />}
        <button type='button' id='dl2' className=' text-[12px] leading-3 w-4'
          onClick={() => {
            setLicenseId2(!licenseId2)
            formik?.setFieldValue('drugLicenceNo2', '');
            setTimeout(() => {
              addDl2()
            }, 0);
          }
          }
        >
          {(licenseId2 || formik.values.drugLicenceNo2) ? '➖' : '➕'}
        </button>
      </div>
    </div>
  );
};
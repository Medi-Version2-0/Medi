import React, { useState } from 'react';
import FormikInputField from '../common/FormikInputField';

interface LicenceDetailsProps {
  formik?: any;
}

export const LicenceDetails: React.FC<LicenceDetailsProps> = ({ formik }) => {
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
        prevField='Licence_Info'
        nextField='licenceExpiry'
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
        prevField='drugLicenceNo1'
        nextField={(licenseId2 || (formik.values.drugLicenceNo2 !== '')) ? 'drugLicenceNo2' : 'Contact_Info'}
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
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'ArrowDown' || e.key === 'Enter') {
                document.getElementById('Contact_Info')?.focus();
                e.preventDefault();
              } else if (e.key === 'ArrowUp') {
                document.getElementById('drugLicenceNo1')?.focus();
              }
            }}
          />}
        <button type='button' className=' text-[12px] leading-3 w-4'
          onClick={() => {
            setLicenseId2(!licenseId2)
            formik?.setFieldValue('drugLicenceNo2', '');
          }
          }
        >
          {(licenseId2 || formik.values.drugLicenceNo2) ? '➖' : '➕'}
        </button>
      </div>
    </div>
  );
};
import React from 'react';
import FormikInputField from '../common/FormikInputField';

interface LicenceInfoProps {
  formik?: any;
}

export const LicenceInfo: React.FC<LicenceInfoProps> = ({ formik }) => {
  return (
    <div className='tax_details_page'>
      <div className='tax_ledger_inputs' key={`tax_ledger_inputs`}>
        <div className='drugLic_input'>
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
        </div>

        <div className='add_drug_inputs'>
          <button type='button' className='drug_add_button'>
            +
          </button>
        </div>
      </div>
    </div>
  );
};

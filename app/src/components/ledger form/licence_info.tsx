import React from 'react';

interface LicenceInfoProps {
  formik?: any;
}

export const LicenceInfo: React.FC<LicenceInfoProps> = ({ formik }) => {
  return (
    <div className='tax_details_page'>
      <div className='tax_ledger_inputs' key={`tax_ledger_inputs`}>
        <div className='drugLic_input'>
          <label
            htmlFor={`drugLicenceNo`}
            className='label_name label_name_css'
          >
            Drug Lic. No.
          </label>
          <input
            type='text'
            id={`drugLicenceNo`}
            name='drugLicenceNo'
            onChange={formik.handleChange}
            value={formik.values.drugLicenceNo}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'ArrowDown' || e.key === 'Enter') {
                document.getElementById('expiryDate')?.focus();
                e.preventDefault();
              } else if (e.key === 'ArrowUp') {
                document.getElementById('Licence_Info')?.focus();
              }
            }}
          />
          <label
            htmlFor={`expiryDate`}
            className='label_name label_name_css expiry_date_space'
          >
            Exp. Date
          </label>
          <input
            type='date'
            id={`expiryDate`}
            name='expiryDate'
            onChange={formik.handleChange}
            min={new Date().toISOString().split("T")[0]}
            value={formik.values.expiryDate}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'ArrowDown' || e.key === 'Enter') {
                document.getElementById('Contact_Info')?.focus();
                e.preventDefault();
              } else if (e.key === 'ArrowUp') {
                document.getElementById('drugLicenceNo')?.focus();
                e.preventDefault();
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

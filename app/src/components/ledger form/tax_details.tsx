import React from 'react';
import FormikInputField from '../common/FormikInputField';

interface TaxInfoProps {
  formik?: any;
}

export const TaxDetails: React.FC<TaxInfoProps> = ({
  formik,
}) => {
  return (
    <div className='tax_details_page'>
        <div className='tax_ledger_inputs'>
          <div className='gstIn_input'>
            <FormikInputField
              label='GSTIN'
              id='gstIn'
              name='gstIn'
              maxLength={15}
              formik={formik}
              className='starlabel formik_input'
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
          </div>
        </div>
        <div className='gstIn_input'>
          <FormikInputField
            label='Pan No.'
            id='panCard'
            name='panCard'
            maxLength={15}
            formik={formik}
            className='input_class'
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
    </div>
  );
};

import React, { useEffect, useMemo } from 'react';
import * as Yup from 'yup';
import FormikInputField from '../common/FormikInputField';
import CustomSelect from '../custom_select/CustomSelect';
import { Option } from '../../interface/global';

interface BankDetailsProps {
  formik?: any;
  receiveValidationSchemaBankDetails: (schema: Yup.ObjectSchema<any>) => void;
}

export const BankDetails: React.FC<BankDetailsProps> = ({
  formik,
  receiveValidationSchemaBankDetails,
}) => {
  const validationSchema = useMemo(
    () =>
      Yup.object({
        accountHolderName: Yup.string().max(
          100,
          'Account Holder Name must be 50 characters or less'
        ),
      }),
    []
  );

  const handleFieldChange = (option: Option | null, id: string) => {
    formik.setFieldValue(id, option?.value);
  };

  useEffect(() => {
    receiveValidationSchemaBankDetails(validationSchema);
  }, [validationSchema, receiveValidationSchemaBankDetails]);

  return (
    <div className='tax_details_page'>
      <div className='tax_ledger_inputs'>

      <div className='name_input'>
            <FormikInputField
              label='Bank Name'
              id='bankName'
              name='bankName'
              formik={formik}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'ArrowDown' || e.key === 'Enter') {
                  document.getElementById('accountNumber')?.focus();
                  e.preventDefault();
                } else if (e.key === 'ArrowUp') {
                  document.getElementById('Bank_Details')?.focus();
                }
              }}
            />
          </div>

        <div className='name_input'>

        <FormikInputField
              label='A/C No.'
              id='accountNumber'
              name='accountNumber'
              formik={formik}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'ArrowDown' || e.key === 'Enter') {
                  document.getElementById('branchName')?.focus();
                  e.preventDefault();
                } else if (e.key === 'ArrowUp') {
                  document.getElementById('bankName')?.focus();
                  e.preventDefault();
                }
              }}
            />
        </div>
      </div>
      <div className='tax_ledger_inputs'>
        <div className='name_input'>

        <FormikInputField
              label='Branch'
              id='branchName'
              name='branchName'
              formik={formik}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'ArrowDown' || e.key === 'Enter') {
                  document.getElementById('accountType')?.focus();
                  e.preventDefault();
                } else if (e.key === 'ArrowUp') {
                  document.getElementById('accountNumber')?.focus();
                }
              }}
            />
        </div>
        <div className='name_input'>

        <CustomSelect
          label='A/C Type'
          id='accountType'
          labelClass='label_name label_name_css'
          value={formik.values.accountType==='' ? null : { label: formik.values.accountType, value: formik.values.accountType }}
          onChange={handleFieldChange}
          options={[
            { value: 'Saving Account', label: 'Saving Account' },
            { value: 'Current Account', label: 'Current Account' },
          ]}
          isSearchable={false}
          placeholder="Select an option"
          disableArrow={false}
          hidePlaceholder={false}
          className="custom-select-field"
          onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
              document.getElementById('ifscCode')?.focus();
              e.preventDefault();
            } else if (e.key === 'ArrowUp') {
              document.getElementById('branchName')?.focus();
              e.preventDefault();
            }
          }}
        />

        </div>
      </div>
      <div className='tax_ledger_inputs'>
        <div className='name_input'>

          

          {/* <label htmlFor='ifscCode' className='label_name label_name_css'>
            IFSC
          </label>
          <input
            type='text'
            id='ifscCode'
            name='ifscCode'
            maxLength={11}
            onChange={formik.handleChange}
            value={formik.values.ifscCode.toUpperCase()}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'ArrowDown' || e.key === 'Enter') {
                document.getElementById('accountHolderName')?.focus();
                e.preventDefault();
              } else if (e.key === 'ArrowUp') {
                document.getElementById('accountType')?.focus();
              }
            }}
          /> */}
        </div>
        <div className='name_input'>
          <label
            htmlFor='accountHolderName'
            className='label_name label_name_css'
          >
            A/C Holder Name
          </label>
          <input
            type='text'
            id='accountHolderName'
            name='accountHolderName'
            onChange={formik.handleChange}
            value={formik.values.accountHolderName}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'ArrowDown' || e.key === 'Enter') {
                document.getElementById('submit_all')?.focus();
                e.preventDefault();
              } else if (e.key === 'ArrowUp') {
                document.getElementById('ifscCode')?.focus();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import FormikInputField from '../common/FormikInputField';
import CustomSelect from '../custom_select/CustomSelect';
import { Option } from '../../interface/global';
import '../stations/stations.css';

interface BalanceInfoProps {
  accountInputValue?: string;
  formik?: any;
}

export const BalanceInfo: React.FC<BalanceInfoProps> = ({
  accountInputValue,
  formik,
}) => {
  const handleOpeningBalInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      formik.setFieldValue('openingBal', value);
    }
  };

  const handleCreditInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (/^\d*$/.test(value)) {
      formik.setFieldValue(id, value);
    }
  };

  const handleFieldChange = (option: Option | null, id: string) => {
    formik.setFieldValue(id, option?.value);
  };

  const resetField = (e: React.MouseEvent<HTMLInputElement>) => {
    const inputElement = e.currentTarget;
    inputElement.setSelectionRange(0, inputElement.value.length);
  };

  return (
    <div className='relative border border-solid border-gray-400'>
      <div className='absolute top-[-14px] left-2 border border-solid border-gray-400 px-2 w-max bg-gray-100'>Balance</div>
      <div className='flex flex-col gap-2 w-full p-4'>
        <div className='grid grid-cols-2 gap-2 items-center'>
          <FormikInputField
            label={`Opening Balance ₹`}
            id='openingBal'
            name='openingBal'
            formik={formik}
            onChange={handleOpeningBalInput}
            placeholder='0.00'
            onClick={resetField}
            className=''
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'ArrowDown' || e.key === 'Enter') {
                document.getElementById('openingBalType')?.focus();
                e.preventDefault();
              } else if (e.key === 'ArrowUp') {
                document
                  .getElementById(
                    accountInputValue?.toUpperCase() === 'CURRENT ASSETS' ||
                      accountInputValue?.toUpperCase() ===
                        'CURRENT LIABILITIES' ||
                      accountInputValue?.toUpperCase() === 'PROVISIONS' ||
                      accountInputValue?.toUpperCase() === 'SECURED LOANS' ||
                      accountInputValue?.toUpperCase() === 'SUNDRY CREDITORS' ||
                      accountInputValue?.toUpperCase() === 'SUNDRY DEBTORS'
                      ? 'balancingMethod'
                      : 'parentLedger'
                  )
                  ?.focus();
                e.preventDefault();
              }
            }}
          />
          <CustomSelect
            value={
              formik.values.openingBal === '' || formik.initialValues.openingBal
                ? null
                : {
                    label: formik.values.openingBal,
                    value: formik.values.openingBal,
                  }
            }
            onChange={handleFieldChange}
            options={[
              { value: 'CR', label: 'CR' },
              { value: 'DR', label: 'DR' },
            ]}
            isSearchable={false}
            placeholder='Select an option'
            disableArrow={false}
            hidePlaceholder={false}
            className=''
          />
        </div>
        {(accountInputValue?.toUpperCase() === 'SUNDRY CREDITORS' ||
          accountInputValue?.toUpperCase() === 'SUNDRY DEBTORS') && (
          <div className='flex flex-col'>
            <FormikInputField
              label='Credit Limit'
              id='creditLimit'
              name='creditLimit'
              formik={formik}
              placeholder='0'
              className=''
              onChange={handleCreditInput}
              onClick={resetField}
            />

            <FormikInputField
              label='Credit Days'
              id='creditDays'
              name='creditDays'
              formik={formik}
              placeholder='0'
              maxLength={3}
              className=''
              onChange={handleCreditInput}
              onClick={resetField}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'ArrowDown' || e.key === 'Enter') {
                  document.getElementById('phone1')?.focus();
                  e.preventDefault();
                } else if (e.key === 'ArrowUp') {
                  document.getElementById('openingBalType')?.focus();
                  e.preventDefault();
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

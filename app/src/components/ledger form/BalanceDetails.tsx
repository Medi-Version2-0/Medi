import React from 'react';
import FormikInputField from '../common/FormikInputField';
import CustomSelect from '../custom_select/CustomSelect';
import { Option } from '../../interface/global';

interface BalanceDetailsProps {
  selectedGroupName: string;
  formik?: any;
}

export const BalanceDetails = ({
  selectedGroupName,
  formik,
}: BalanceDetailsProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = e.target.id;
    const value = e.target.value;
    const filteredValue = value.replace(/[^0-9]/g, '');
    if (id === 'openingBal') {
      if (filteredValue.length <= 12) {
        formik.setFieldValue('openingBal', filteredValue);
      } else {
        formik.setFieldValue('openingBal', filteredValue.slice(0, 12));
      }
    } else if (id === 'creditLimit' || id === 'creditDays') {
      if (filteredValue.length <= 3) {
        formik.setFieldValue(id, filteredValue);
      } else {
        formik.setFieldValue(id, filteredValue.slice(0, 3));
      }
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
    <div className='relative border border-solid border-gray-400 '>
      <div className='absolute top-[-14px] left-2 px-2 w-max bg-[#f3f3f3]'>
        Balance
      </div>
      <div className='flex flex-col gap-2 w-full p-4 text-xs text-gray-600 leading-3'>
        <div className='flex flex-row gap-2 items-center w-full'>
          <FormikInputField
            isPopupOpen={false}
            label={`Opening Balance ₹`}
            id='openingBal'
            name='openingBal'
            formik={formik}
            onChange={handleChange}
            placeholder='0.00'
            onClick={resetField}
            className='!mb-0'
            inputClassName='h-9 text-right'
            labelClassName='w-fit text-nowrap'
            prevField=''
            nextField='openingBalType'
            maxLength={12}
            showErrorTooltip={
              formik.touched.openingBal && formik.errors.openingBal
            }
          />
          <CustomSelect
            isPopupOpen={false}
            value={
              formik.values.openingBalType === ''
                ? null
                : {
                    label: formik.values.openingBalType,
                    value: formik.values.openingBalType,
                  }
            }
            id='openingBalType'
            onChange={handleFieldChange}
            options={[
              { value: 'Cr', label: 'Cr' },
              { value: 'Dr', label: 'Dr' },
            ]}
            isSearchable={false}
            placeholder='Op. Balance Type'
            disableArrow={false}
            hidePlaceholder={false}
            containerClass='!w-1/3'
            className='!rounded-none !h-6'
            onBlur={() => {
              formik.setFieldTouched('openingBalType', true);
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
              const dropdown = document.querySelector('.custom-select__menu');
              if (e.key === 'Enter') {
                !dropdown && e.preventDefault();
                document.getElementById('partyType')?.focus();
              }
            }}
          />
        </div>
        <CustomSelect
          isPopupOpen={false}
          label={`Party Type`}
          value={
            formik.values.partyType === ''
              ? null
              : {
                  label: formik.values.partyType,
                  value: formik.values.partyType,
                }
          }
          id='partyType'
          onChange={handleFieldChange}
          options={[
            { value: 'P & L', label: 'P & L' },
            { value: 'Balance Sheet', label: 'Balance Sheet' },
          ]}
          isSearchable={false}
          placeholder='Type'
          disableArrow={false}
          hidePlaceholder={false}
          containerClass='!w-1/3'
          className='!rounded-none !h-6'
          onBlur={() => {
            formik.setFieldTouched('partyType', true);
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
            const dropdown = document.querySelector('.custom-select__menu');
            if (e.key === 'Enter') {
              !dropdown && e.preventDefault();
              (selectedGroupName.toUpperCase() === 'SUNDRY CREDITORS' ||
                selectedGroupName.toUpperCase() === 'SUNDRY DEBTORS') &&
                document.getElementById('creditLimit')?.focus();
            }
          }}
        />
        {(selectedGroupName.toUpperCase() === 'SUNDRY CREDITORS' ||
          selectedGroupName.toUpperCase() === 'SUNDRY DEBTORS') && (
          <div className='flex flex-col gap-1'>
            <FormikInputField
              isPopupOpen={false}
              label='Credit Limit'
              id='creditLimit'
              name='creditLimit'
              labelClassName='w-1/3'
              onChange={handleChange}
              inputClassName='text-right'
              formik={formik}
              placeholder='0'
              className=''
              maxLength={3}
              onClick={resetField}
              prevField='partyType'
              nextField='creditDays'
            />
            <FormikInputField
              isPopupOpen={false}
              label='Credit Days'
              id='creditDays'
              name='creditDays'
              formik={formik}
              placeholder='0'
              labelClassName='w-1/3'
              inputClassName='text-right'
              onChange={handleChange}
              onClick={resetField}
              maxLength={3}
              prevField='creditLimit'
              nextField=''
            />
          </div>
        )}
      </div>
    </div>
  );
};

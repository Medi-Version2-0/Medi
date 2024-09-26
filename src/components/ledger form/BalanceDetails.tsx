import React , { useState } from 'react';
import CustomSelect from '../custom_select/CustomSelect';
import { Option } from '../../interface/global';
import NumberInput from '../common/numberInput/numberInput';
interface BalanceDetailsProps {
  selectedGroupName: string;
  formik?: any;
}

export const BalanceDetails = ({
  selectedGroupName,
  formik,
}: BalanceDetailsProps) => {
  const [focused, setFocused] = useState('');

  const handleFieldChange = (option: Option | null, id: string) => {
    formik.setFieldValue(id, option?.value);
  };

  const isSpecialGroup = selectedGroupName.toUpperCase() === 'SUNDRY CREDITORS' ||
  selectedGroupName.toUpperCase() === 'SUNDRY DEBTORS' ||
  selectedGroupName?.toUpperCase() === 'GENERAL GROUP' ||
  selectedGroupName?.toUpperCase() === 'DISTRIBUTORS, C & F';
  return (
    <div className='relative border border-solid border-gray-400 '>
      <div className='absolute top-[-14px] left-2 px-2 w-max bg-[#f3f3f3]'>
        Balance
      </div>
      <div className='flex flex-col gap-2 w-full p-4 text-xs text-gray-600 leading-3'>
        <div className='flex flex-row gap-2 items-center w-full'>
          <NumberInput
            label={`Opening Balance ₹`}
            id='openingBal'
            name='openingBal'
            placeholder='0.00'
            maxLength={16}
            value={formik.values.openingBal}
            onChange={(value) => formik.setFieldValue('openingBal', value)}
            onBlur={() => {
              formik.setFieldTouched('openingBal', true);
            }}
            prevField='stateInout'
            nextField='openingBalType'
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setFocused('openingBalType')

              }
            }}
            labelClassName='min-w-[90px] !h-[22px] w-fit text-nowrap me-2'
            inputClassName='text-left !text-[10px] px-1 !h-[22px] !w-[70%]'
            error={formik.touched.openingBal && formik.errors.openingBal}
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
            containerClass='!w-[25%]'
            className='!rounded-none !h-6'
            isFocused={focused === 'openingBalType'}
            onBlur={() => {
              formik.setFieldTouched('openingBalType', true);
              setFocused('')
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
              const dropdown = document.querySelector('.custom-select__menu');
              if (e.key === 'Enter') {
                !dropdown && e.preventDefault();
                setFocused('partyType');
              }
            }}
          />
        </div>
        <div className='flex w-full !important'>
          <CustomSelect
            isPopupOpen={false}
            label={`Party Type`}
            labelClass='whitespace-nowrap'
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
            isFocused={focused === 'partyType'}
            placeholder='Type'
            disableArrow={false}
            hidePlaceholder={false}
            containerClass='gap-[3.28rem] !w-114% !justify-between'
            className='!rounded-none !h-6 w-full width: fit-content !important text-wrap: nowrap'
            onBlur={() => {
              formik.setFieldTouched('partyType', true);
              setFocused('')
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
              const dropdown = document.querySelector('.custom-select__menu');
              if (e.key === 'Enter') {
                if (!dropdown) {
                  e.preventDefault();
                }
                const nextFieldId = (formik.isValid && !isSpecialGroup) ? 'submit_all' : (!formik.isValid && !isSpecialGroup) ? 'partyName' : 'creditLimit';
                document.getElementById(nextFieldId)?.focus();
                setFocused(nextFieldId);
              } else if (e.key === 'Tab' && e.shiftKey) {
                if (!dropdown) {
                  e.preventDefault();
                }
                const prevFieldId = 'openingBalType'
                document.getElementById(prevFieldId)?.focus();
                setFocused(prevFieldId);
              }
            }}
          />
        </div>
        {isSpecialGroup && (
          <div className='flex flex-col gap-1'>
            <NumberInput
              label='Credit Limit'
              id='creditLimit'
              name='creditLimit'
              value={formik.values.creditLimit}
              onChange={(value) => formik.setFieldValue('creditLimit', value)}
              onBlur={() => {
                formik.setFieldTouched('creditLimit', true);
              }}
              prevField='partyType'
              nextField='creditDays'
              labelClassName='min-w-[90px] !h-[22px] w-[47%]'
              inputClassName='text-left !text-[10px] px-1 !h-[22px]'
            />
            <NumberInput
              label='Credit Days'
              id='creditDays'
              placeholder='0'
              name='creditDays'
              value={formik.values.creditDays}
              onChange={(value) => formik.setFieldValue('creditDays', value)}
              onBlur={() => {
                formik.setFieldTouched('creditDays', true);
              }}
              prevField='creditLimit'
              nextField='phoneNumber'
              maxLength={3}
              labelClassName='min-w-[90px] !h-[22px] w-[47%]'
              inputClassName='text-left !text-[10px] px-1 !h-[22px]'
            />
          </div>
        )}
      </div>
    </div>
  );
};

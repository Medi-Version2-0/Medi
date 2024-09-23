import React, { useState } from 'react';
import FormikInputField from '../common/FormikInputField';
import CustomSelect from '../custom_select/CustomSelect';
import { Option } from '../../interface/global';
import onKeyDown from '../../utilities/formKeyDown';

interface BankDetailsProps {
  formik?: any;
}

export const BankDetails: React.FC<BankDetailsProps> = ({ formik }) => {
  const [focused, setFocused] = useState('');
  const handleFieldChange = (option: Option | null, id: string) => {
    formik.setFieldValue(id, option?.value);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    radioField?: any
  ) => {
    onKeyDown({
      e,
      radioField: radioField,
      focusedSetter: (field: string) => {
        setFocused(field);
      },
    });
  };

  return (
    <div className='grid grid-cols-2 gap-x-4 gap-y-2 m-2 px-2 text-xs leading-3 text-gray-600'>
      <FormikInputField
        isPopupOpen={false}
        labelClassName='min-w-[90px]'
        label='Bank Name'
        id='bankName'
        name='bankName'
        formik={formik}
        prevField='Bank_Details'
        nextField='accountNumber'
      />
      <FormikInputField
        isPopupOpen={false}
        labelClassName='min-w-[90px]'
        label='A/C No.'
        id='accountNumber'
        name='accountNumber'
        formik={formik}
        prevField='bankName'
        nextField='branchName'
      />
      <FormikInputField
        isPopupOpen={false}
        labelClassName='min-w-[90px]'
        label='Branch'
        id='branchName'
        name='branchName'
        formik={formik}
        prevField='accountNumber'
        nextField='accountType'
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
          handleKeyDown(e)
        }
      />
      <CustomSelect
        isPopupOpen={false}
        label='A/C Type'
        id='accountType'
        labelClass='min-w-[90px]'
        value={
          formik.values.accountType === ''
            ? null
            : {
                label: formik.values.accountType,
                value: formik.values.accountType,
              }
        }
        onChange={handleFieldChange}
        options={[
          {
            value: 'Saving Account',
            label: 'Saving Account',
          },
          {
            value: 'Current Account',
            label: 'Current Account',
          },
        ]}
        isSearchable={false}
        placeholder='Select an option'
        disableArrow={false}
        hidePlaceholder={false}
        isFocused={focused === 'accountType'}
        onBlur={() => {
          formik.setFieldTouched('accountType', true);
          setFocused('');
        }}
        className='!rounded-none'
        onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
          const dropdown = document.querySelector(
            '.custom-select__menu'
          );
          if (e.key === 'Enter') {
            !dropdown && e.preventDefault();
            document.getElementById('ifscCode')?.focus();
            setFocused('ifscCode');
          }
        }}
      />
      <FormikInputField
        isPopupOpen={false}
        labelClassName='min-w-[90px]'
        label='IFSC'
        id='ifscCode'
        name='ifscCode'
        maxLength={11}
        formik={formik}
        className=''
        prevField='accountType'
        nextField='accountHolderName'
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>)=>{
          if(e.key === 'Tab' && e.shiftKey){
            e.preventDefault();
            setFocused('accountType');
          }
        }}
      />
      <FormikInputField
        isPopupOpen={false}
        labelClassName='min-w-[90px]'
        label='A/C Holder Name'
        id='accountHolderName'
        name='accountHolderName'
        formik={formik}
        className=''
        prevField='ifscCode'
        nextField= {formik.isValid ? 'submit_all' : 'partyName'}
      />
    </div>
  );
};

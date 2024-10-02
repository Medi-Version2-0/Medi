import React, { useState } from 'react';
import { useFormik } from 'formik';
import { CreateItemGroupProps, ItemGroupFormInfoType } from '../../interface/global';
import { Popup } from '../../components/popup/Popup';
import { itemGroupValidationSchema } from './validation_schema';
import { PopupFormContainer } from '../../components/common/commonPopupForm';
import { CommonBtn } from '../../components/common/button/CommonFormButtons';

export const CreateItemGroup: React.FC<CreateItemGroupProps> = ({togglePopup, data, handleConfirmPopup, isDelete, handleDeleteFromForm, className, focusChain=[]  }) => {
  const { group_code } = data;
  const [focused, setFocused] = useState('');

  const itemGroupInfo: ItemGroupFormInfoType = useFormik({
    initialValues: {
      group_name: data?.group_name || '',
          type: data?.type || '',
    },
    validationSchema: itemGroupValidationSchema,
    onSubmit: async (values: any) => {
      const formData = group_code ? { ...values, group_code: group_code } : values;
      !group_code && document.getElementById('account_button')?.focus();
      handleConfirmPopup(formData);

    },
  })

  const radioOptions = [
    {label : 'P&L', value: 'P&L'},
    {label : 'Balance Sheet', value: 'Balance Sheet'},
  ]

  const itemGroupFormFields = [
    {id: 'group_name', name: 'group_name', label: 'Group Name', type: 'text', disabled: isDelete && group_code },
    { id: 'type', name: 'type', label: 'Type', type: 'select', disabled: isDelete && group_code, options: radioOptions, isSearchable: false, disableArrow: false, hidePlaceholder: false },
  ]

  return (
    <Popup id='create_itemGroup' onClose={() => togglePopup(false)} focusChain={focusChain} heading={ group_code && isDelete ? 'Delete Group' : group_code ? 'Update Group' : 'Create Group' } className={className} >
      <PopupFormContainer fields={itemGroupFormFields} formik={itemGroupInfo} setFocused={setFocused} focused={focused} />
      <div className='flex justify-between p-4 w-full'>
        <CommonBtn variant='cancel' component='itemGroup' handleOnClick={() => togglePopup(false)} > Cancel </CommonBtn>
        {isDelete ?
          <CommonBtn id='delete' variant='delete' component='itemGroup' handleOnClick={handleDeleteFromForm}  > Delete </CommonBtn>
          : <CommonBtn id='save' variant='submit' component='itemGroup' handleOnClick={() => itemGroupInfo.handleSubmit()} disable={!itemGroupInfo.isValid || itemGroupInfo.isSubmitting} > {group_code ? 'Update' : 'Add'} </CommonBtn>
        }
      </div>
    </Popup>
  );
};

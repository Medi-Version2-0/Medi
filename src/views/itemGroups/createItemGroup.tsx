import React, { useState } from 'react';
import { useEffect } from 'react';
import { useFormik } from 'formik';
import { CreateItemGroupProps, ItemGroupFormInfoType } from '../../interface/global';
import { Popup } from '../../components/popup/Popup';
import { itemGroupValidationSchema } from './validation_schema';
import { PopupFormContainer } from '../../components/common/commonPopupForm';
import { CommonBtn } from '../../components/common/button/CommonFormButtons';

export const CreateItemGroup: React.FC<CreateItemGroupProps> = ({togglePopup, data, handelFormSubmit, isDelete, deleteAcc, className }) => {
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
      handelFormSubmit(formData);
    },
  })

  useEffect(() => {
    const focusTarget = !isDelete ? document.getElementById('group_name') : document.getElementById('cancel_button');
    focusTarget?.focus();
  }, []);

  const radioOptions = [
    {label : 'P&L', value: 'P&L'},
    {label : 'Balance Sheet', value: 'Balance Sheet'},
  ]

  const itemGroupFormFields = [
    {id: 'group_name', name: 'group_name', label: 'Group Name', type: 'text', disabled: isDelete && group_code, nextField: 'type', prevField: 'itemGroup_submitBtn', sideField: 'type' },
    { id: 'type', name: 'type', label: 'Type', type: 'select', disabled: isDelete && group_code, options: radioOptions, isSearchable: false, disableArrow: false, hidePlaceholder: false, nextField: 'itemGroup_submitBtn', prevField: 'group_name' },
  ]

  return (
    <Popup heading={ group_code && isDelete ? 'Delete Group' : group_code ? 'Update Group' : 'Create Group' } className={className} >
      <PopupFormContainer fields={itemGroupFormFields} formik={itemGroupInfo} setFocused={setFocused} focused={focused} />
      <div className='flex justify-between p-4 w-full'>
        <CommonBtn variant='cancel' component='itemGroup' autoFocus={true} setFocused={setFocused} focused={focused} handleOnClick={() => togglePopup(false)} nextField={`${isDelete ? 'itemGroup_deleteBtn' : 'itemGroup_submitBtn'}`} prevField={'type'} > Cancel </CommonBtn>
        {isDelete ?
          <CommonBtn variant='delete' component='itemGroup' setFocused={()=>''} handleOnClick={() => group_code && deleteAcc(group_code)} nextField={`itemGroup_cancelBtn`} prevField={'itemGroup_cancelBtn'} > Delete </CommonBtn>
          : <CommonBtn variant='submit' component='itemGroup' autoFocus={true} setFocused={()=>''} handleOnClick={() => itemGroupInfo.handleSubmit()} disable={!itemGroupInfo.isValid || itemGroupInfo.isSubmitting} nextField={`group_name`} prevField={'itemGroup_cancelBtn'} > {group_code ? 'Update' : 'Add'} </CommonBtn>
        }
      </div>
    </Popup>
  );
};

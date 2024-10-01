import React, { useRef } from 'react';
import { Formik, Form } from 'formik';
import { CreateGroupProps } from '../../interface/global';
import { Popup } from '../../components/popup/Popup';
import Button from '../../components/common/button/Button';
import FormikInputField from '../../components/common/FormikInputField';
import { groupValidationSchema } from './validation_schema';
import CustomSelect from '../../components/custom_select/CustomSelect';
import { TabManager } from '../../components/class/tabManager';
import { createGroupFieldsChain, deleteGroupFieldsChain } from '../../constants/focusChain/groupsFocusChain';

export const CreateGroup = ({
  togglePopup,
  data,
  handleConfirmPopup,
  isDelete,
  handleDeleteFromForm,
  className
}:CreateGroupProps) => {
  const formikRef = useRef<any>(null);
  const tabManager = TabManager.getInstance()
  const { group_code } = data;

  const handleSubmit = async (values: object) => {
    const formData = group_code
      ? { ...values, group_code: group_code }
      : values;
    handleConfirmPopup(formData);
  };

  const handleFieldChange = (option:any) => {
    if(formikRef.current){
      formikRef.current.setFieldValue('type', option.value);
    }
  };

  return (
    <Popup
      togglePopup={togglePopup}
      className={className}
      id='createGroupPopup'
      focusChain={isDelete ? deleteGroupFieldsChain : createGroupFieldsChain}
      heading={
        group_code && isDelete
          ? 'Delete Group'
          : group_code
            ? 'Update Group'
            : 'Create Group'
      }
    >
      <Formik
        innerRef={formikRef}
        initialValues={{
          group_name: data?.group_name || '',
          type: data?.type || 'Balance Sheet',
        }}
        validationSchema={groupValidationSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form className='flex flex-col gap-3 min-w-[18rem] items-center px-4'>
            <div className='flex flex-col w-full'>
              <FormikInputField
                label='Group Name'
                id='group_name'
                name='group_name'
                isUpperCase={true}
                formik={formik}
                className='!gap-0'
                isDisabled={isDelete && group_code}
                showErrorTooltip={
                  !!(formik.touched.group_name && formik.errors.group_name)
                }
              />
            </div>
            <CustomSelect
              isPopupOpen={false}
              label='Type'
              value={
                {
                  label: formik.values.type,
                  value: formik.values.type,
                }
              }
              id='Type'
              isDisabled={isDelete && group_code}
              error={formik.errors.type}
              onChange={handleFieldChange}
              options={[
                { value: 'Balance Sheet', label: 'Balance Sheet' },
                { value: 'P&L', label: 'P&L' },
              ]}
              labelClass='absolute !max-h-4 whitespace-nowrap z-10 -top-[10px] !bg-white h-[17px] px-1 left-[6px]'
              isSearchable={false}
              disableArrow={false}
              containerClass='gap-[3.28rem] !w-114% !justify-between relative mt-2 h-8 !text-[12px]'
              className='!rounded-[2px] !h-7  w-full width: fit-content !important text-wrap: nowrap'
              onBlur={() => {
                formik.setFieldTouched('Type', true);
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                const dropdown = document.querySelector('.custom-select__menu');
                if (e.key === 'Enter') {
                  if (!dropdown) {
                    e.preventDefault();
                    e.stopPropagation();
                    tabManager.focusManager()
                  }
                }
              }}
            />

            <div className='flex justify-between my-4 w-full'>
              <Button
                autoFocus={true}
                type='fog'
                id='cancel_button'
                handleOnClick={() => togglePopup(false)}
              >
                Cancel
              </Button>
              {isDelete ? (
                <Button
                  id='del_button'
                  type='fill'
                  btnType='button'
                  handleOnClick={handleDeleteFromForm}
                >
                  Delete
                </Button>
              ) : (
                <Button
                  id='save'
                  type='fill'
                  autoFocus
                  disable={!formik.isValid ||formik.isSubmitting}
                >
                  {group_code ? 'Update' : 'Add'}
                </Button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </Popup>
  );
};

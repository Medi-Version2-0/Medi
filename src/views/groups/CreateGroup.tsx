import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import { Formik, Form } from 'formik';
import { CreateGroupProps } from '../../interface/global';
import { Popup } from '../../components/popup/Popup';
import Button from '../../components/common/button/Button';
import FormikInputField from '../../components/common/FormikInputField';
import { groupValidationSchema } from './validation_schema';
import useHandleKeydown from '../../hooks/useHandleKeydown';
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import CustomSelect from '../../components/custom_select/CustomSelect';

export const CreateGroup = ({
  togglePopup,
  data,
  handelFormSubmit,
  isDelete,
  deleteAcc,
  className
}:CreateGroupProps) => {
  const formikRef = useRef<any>(null);
  const [focused, setFocused] = useState<string>('');
  const { group_code } = data;

  console.log('hello')
  useEffect(() => {
    const focusTarget = !isDelete
      ? document.getElementById('group_name')
      : document.getElementById('cancel_button');
    focusTarget?.focus();
  }, []);

  const handleSubmit = async (values: object) => {
    const formData = group_code
      ? { ...values, group_code: group_code }
      : values;
    !group_code && document.getElementById('account_button')?.focus();
    handelFormSubmit(formData);
  };

  const handleFieldChange = (option:any) => {
    if(formikRef.current){
      formikRef.current.setFieldValue('type', option.value);
    }
  };

  const keyDown = (event: KeyboardEvent) => {
    handleKeyDownCommon(
      event,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      handleSubmit,
      formikRef.current?.values,
    );
  };
  useHandleKeydown(keyDown, [])   // to implement ctrl + s 

  return (
    <Popup
      togglePopup={togglePopup}
      className={className}
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
                prevField='group_name'
                sideField='p_and_l'
                nextField='p_and_l'
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>{
                  const key = e.key;
                  const shiftPressed = e.shiftKey;
                  if(key === 'ArrowDown' || key === 'Enter'){
                    e.preventDefault();
                    setFocused('Type');
                  }
                  if(shiftPressed && key === 'Tab'){
                    e.preventDefault();
                  }
                }}
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
              labelClass='absolute whitespace-nowrap z-10 -top-3 !bg-white h-[17px] px-1 left-[6px]'
              isSearchable={false}
              isFocused={focused === 'Type'}
              disableArrow={false}
              containerClass='gap-[3.28rem] !w-114% !justify-between relative mt-2 h-8 !text-[12px]'
              className='!rounded-[2px] !h-7  w-full width: fit-content !important text-wrap: nowrap'
              onBlur={() => {
                formik.setFieldTouched('Type', true);
                setFocused('')
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                const dropdown = document.querySelector('.custom-select__menu');
                if (e.key === 'Enter') {
                  if (!dropdown) {
                    e.preventDefault();
                  }
                  document.getElementById('submit_button')?.focus();
                } else if (e.key === 'Tab' && e.shiftKey) {
                  e.preventDefault();
                  if (dropdown) {
                    return
                  }
                  document.getElementById('group_name')?.focus();
                }
              }}
            />

            <div className='flex justify-between my-4 w-full'>
              <Button
                autoFocus={true}
                type='fog'
                id='cancel_button'
                handleOnClick={() => togglePopup(false)}
                handleOnKeyDown={(e) => {
                  if (e.key === 'Tab') {
                    document.getElementById('del_button')?.focus();
                    e.preventDefault();
                    document
                      .getElementById(
                        `${isDelete ? 'del_button' : 'submit_button'}`
                      )
                      ?.focus();
                  }
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    togglePopup(false);
                  }
                  if (e.key === 'ArrowUp' || (e.shiftKey && e.key === 'Tab')) {
                    e.preventDefault();
                    setFocused('Type');
                  }
                }}
              >
                Cancel
              </Button>
              {isDelete ? (
                <Button
                  id='del_button'
                  type='fill'
                  handleOnClick={() => group_code && deleteAcc(group_code)}
                  handleOnKeyDown={(e) => {
                    if (e.key === 'Tab') {
                      document.getElementById('cancel_button')?.focus();
                      e.preventDefault();
                    }
                    if (
                      e.key === 'ArrowUp' ||
                      (e.shiftKey && e.key === 'Tab')
                    ) {
                      document.getElementById('cancel_button')?.focus();
                    }
                  }}
                >
                  Delete
                </Button>
              ) : (
                <Button
                  id='submit_button'
                  type='fill'
                  autoFocus
                  disable={formik.isSubmitting}  // disable if form is submitting i.e., prevent multiple submissions
                  handleOnKeyDown={(e) => {
                    if (e.key === 'Tab' || (!formik.isValid && e.key === 'Enter')) {
                      document.getElementById('group_name')?.focus();
                      e.preventDefault();
                    }
                    if (e.key === 'ArrowUp' || (e.shiftKey && e.key === 'Tab')) {
                      document.getElementById('cancel_button')?.focus();
                    }
                  }}
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

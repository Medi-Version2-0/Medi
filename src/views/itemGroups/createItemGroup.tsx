import React from 'react';
import { useEffect } from 'react';
import { Formik, Form, Field, FormikProps } from 'formik';
import {
  CreateItemGroupProps,
  ItemGroupFormDataProps,
} from '../../interface/global';
import { Popup } from '../../components/popup/Popup';
import Button from '../../components/common/button/Button';
import onKeyDown from '../../utilities/formKeyDown';
import FormikInputField from '../../components/common/FormikInputField';
import { FaExclamationCircle } from 'react-icons/fa';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { itemGroupValidationSchema } from './validation_schema';

export const CreateItemGroup: React.FC<CreateItemGroupProps> = ({
  togglePopup,
  data,
  handelFormSubmit,
  isDelete,
  deleteAcc,
  className,
}) => {
  const { group_code } = data;

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

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    formik?: FormikProps<ItemGroupFormDataProps>,
    radioField?: any
  ) => {
    onKeyDown({
      e,
      formik: formik,
      radioField: radioField,
    });
  };

  return (
    <Popup
      togglePopup={togglePopup}
      heading={
        group_code && isDelete
          ? 'Delete Group'
          : group_code
            ? 'Update Group'
            : 'Create Group'
      }
      className={className}
    >
      <Formik
        initialValues={{
          group_name: data?.group_name || '',
          type: data?.type || '',
        }}
        validationSchema={itemGroupValidationSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form className='flex flex-col gap-3 min-w-[18rem] items-center px-4'>
            <div className='flex flex-col w-full'>
              <FormikInputField
                label='Group Name'
                id='group_name'
                name='group_name'
                formik={formik}
                className='!gap-0'
                isDisabled={isDelete && group_code}
                prevField='group_name'
                sideField='p_and_l'
                nextField='p_and_l'
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleKeyDown(e)
                }
                showErrorTooltip={
                  !!(formik.touched.group_name && formik.errors.group_name)
                }
              />
            </div>
            <div className='radio_fields relative w-full rounded-sm border border-solid border-[#9ca3af] p-[3px]'>
              <span
                className={`label_prefix bg-white px-1 absolute top-0 left-1 -translate-y-1/2 text-xs ${!!(formik.touched.type && formik.errors.type) && '!text-red-700'}`}
              >
                Type
              </span>
              <div
                className={`relative flex items-center justify-evenly w-full p-[3px] ${group_code && isDelete && 'bg-[#f5f5f5]'} ${!!(formik.touched.type && formik.errors.type) && '!border-red-500'}`}
              >
                <label
                  className={`flex items-center justify-center text-xs cursor-pointer text-center font-medium ${group_code && isDelete ? 'disabled' : ''}`}
                >
                  <Field
                    type='radio'
                    name='type'
                    value='P&L'
                    id='p_and_l'
                    className='text-xs mr-1'
                    required={true}
                    checked={formik.values.type === 'P&L'}
                    disabled={group_code && isDelete}
                    data-prev-field='group_name'
                    data-next-field='submit_button'
                    data-side-field='balance_sheet'
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                      handleKeyDown(e, formik, {
                        typeField: 'type',
                        sideField: 'balance_sheet',
                      })
                    }
                  />
                  <span>P & L</span>
                </label>
                <label
                  className={`flex items-center justify-center text-xs cursor-pointer text-center font-medium ${group_code && isDelete ? 'disabled' : ''}`}
                >
                  <Field
                    type='radio'
                    name='type'
                    value='Balance Sheet'
                    id='balance_sheet'
                    className='text-xs mr-1'
                    checked={formik.values.type === 'Balance Sheet'}
                    disabled={group_code && isDelete}
                    data-prev-field='group_name'
                    data-next-field='submit_button'
                    data-side-field='p_and_l'
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                      handleKeyDown(e, formik, {
                        typeField: 'type',
                        sideField: 'p_and_l',
                      })
                    }
                  />
                  <span>Bl. Sheet</span>
                </label>
                {formik.touched.type && formik.errors.type && (
                  <>
                    <FaExclamationCircle
                      data-tooltip-id='typeError'
                      className='absolute -translate-y-2/4 top-2/4 right-1 text-xs text-red-600'
                    />
                    <ReactTooltip
                      id='typeError'
                      place='bottom'
                      className=' text-[white] border rounded !text-xs z-10 p-2 border-solid border-[#d8000c] !bg-red-600'
                    >
                      {formik.errors.type}
                    </ReactTooltip>
                  </>
                )}
              </div>
            </div>
            <div className='flex justify-between my-4 w-full'>
              <Button
                autoFocus={true}
                type='fog'
                id='cancel_button'
                handleOnClick={() => togglePopup(false)}
                handleOnKeyDown={(e) => {
                  if (e.key === 'Tab') {
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
                    document
                      .getElementById(
                        `${isDelete ? 'cancel_button' : 'balance_sheet'}`
                      )
                      ?.focus();
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
                  handleOnKeyDown={(e) => {
                    if (e.key === 'Tab') {
                      document.getElementById('group_name')?.focus();
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

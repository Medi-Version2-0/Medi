import { useEffect, useRef, useState } from 'react';
import { Formik, Form, Field, FormikProps } from 'formik';
import * as Yup from 'yup';
import {
  CreateSubGroupProps,
  Option,
  SubGroupFormDataProps,
} from '../../interface/global';
import { Popup } from '../../components/popup/Popup';
import CustomSelect from '../../components/custom_select/CustomSelect';
import Button from '../../components/common/button/Button';
import onKeyDown from '../../utilities/formKeyDown';
import FormikInputField from '../../components/common/FormikInputField';
import { FaExclamationCircle } from 'react-icons/fa';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { sendAPIRequest } from '../../helper/api';

export const CreateSubGroup: React.FC<CreateSubGroupProps> = ({
  togglePopup,
  data,
  handelFormSubmit,
  isDelete,
  deleteAcc,
  className,
}) => {
  const { group_code } = data;
  const formikRef = useRef<FormikProps<SubGroupFormDataProps>>(null);
  const [parentGrpOptions, setParentGrpOptions] = useState<Option[]>([]);
  const [focused, setFocused] = useState('');

  useEffect(() => {
    const focusTarget = !isDelete
      ? document.getElementById('group_name')
      : document.getElementById('cancel_button');
    focusTarget?.focus();
  }, []);

  const getGroups = async () => {
    const grpList = await sendAPIRequest<any[]>('/group');
    setParentGrpOptions(
      grpList.map((grp: any) => ({
        value: grp.group_code,
        label: grp.group_name.toUpperCase(),
      }))
    );
  };

  useEffect(() => {
    getGroups();
  }, []);

  const handleParentChange = (option: Option | null) => {
    formikRef.current?.setFieldValue('parent_code', option?.value);
  };

  const validationSchema = Yup.object({
    group_name: Yup.string()
      .required('Group name is required')
      .matches(/[a-zA-Z]/, 'Only Numbers not allowed')
      .matches(
        /^[a-zA-Z0-9\s_.-]*$/,
        'Group name can contain alphanumeric characters, "-", "_", and spaces only'
      )
      .max(100, 'Group name cannot exceeds 100 characters'),
    parent_code: Yup.string().required('Parent Group is required'),
    type: Yup.string().required('Type is required'),
  });

  const handleSubmit = async (values: object) => {
    const formData = {
      ...values,
      ...(group_code && { group_code }),
    };
    !group_code && document.getElementById('account_button')?.focus();
    handelFormSubmit(formData);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    formik?: FormikProps<SubGroupFormDataProps>,
    radioField?: any
  ) => {
    onKeyDown({
      e,
      formik: formik,
      radioField: radioField,
      focusedSetter: (field: string) => {
        setFocused(field);
      },
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
            : 'Create Sub-Group'
      }
      className={className}
    >
      <Formik
        innerRef={formikRef}
        initialValues={{
          group_name: data?.group_name || '',
          parent_code: data?.parent_code || '',
          type: data?.type || '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form className='flex flex-col gap-3 min-w-[18rem] items-center px-4 '>
            <FormikInputField
              label='Sub Group Name'
              id='group_name'
              name='group_name'
              formik={formik}
              className='!gap-0'
              isDisabled={isDelete && group_code}
              nextField='parent_code'
              prevField='group_name'
              sideField='parent_code'
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                handleKeyDown(e)
              }
              showErrorTooltip={
                !!(formik.touched.group_name && formik.errors.group_name)
              }
            />

            <div className='flex flex-col w-full'>
              {parentGrpOptions.length > 0 && (
                <Field name='parent_code' className=''>
                  {() => (
                    <CustomSelect
                      label='Parent Group'
                      id='parent_code'
                      name='parent_code'
                      value={
                        formik.values.parent_code === ''
                          ? null
                          : {
                              label:
                                parentGrpOptions.find(
                                  (e) => e.value === formik.values.parent_code
                                )?.label || '',
                              value: formik.values.parent_code,
                            }
                      }
                      onChange={handleParentChange}
                      options={parentGrpOptions}
                      isSearchable={true}
                      isDisabled={isDelete && group_code}
                      disableArrow={true}
                      hidePlaceholder={false}
                      className='!h-6 rounded-sm text-xs'
                      isFocused={focused === 'parent_code'}
                      error={formik.errors.parent_code}
                      isTouched={formik.touched.parent_code}
                      onBlur={() => {
                        formik.setFieldTouched('parent_code', true);
                        setFocused('');
                      }}
                      onKeyDown={(
                        e: React.KeyboardEvent<HTMLSelectElement>
                      ) => {
                        const dropdown = document.querySelector(
                          '.custom-select__menu'
                        );
                        if (e.key === 'Enter' || e.key === 'Tab') {
                          if (!dropdown) {
                            e.preventDefault();
                          }
                          document.getElementById('p_and_l')?.focus();
                        }
                        if (e.shiftKey && e.key === 'Tab') {
                          if (!dropdown) {
                            e.preventDefault();
                          }
                          document.getElementById('group_name')?.focus();
                        }
                      }}
                      showErrorTooltip={true}
                    />
                  )}
                </Field>
              )}
            </div>
            <div
              className={`radio_fields relative w-full rounded-sm border border-solid border-[#9ca3af] p-[3px]${!!(formik.touched.type && formik.errors.type) && '!border-red-500'}`}
            >
              <span
                className={`label_prefix bg-white px-1 absolute top-0 left-1 -translate-y-1/2 text-xs ${!!(formik.touched.type && formik.errors.type) && '!text-red-700'}`}
              >
                Type
              </span>
              <div
                className={`flex items-center relative  justify-evenly w-full p-[3px] ${group_code && isDelete && 'bg-[#f5f5f5]'}  `}
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
                    checked={formik.values.type === 'P&L'}
                    disabled={group_code && isDelete}
                    data-next-field='submit_button'
                    data-prev-field='parent_code'
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
                    data-next-field='submit_button'
                    data-prev-field='parent_code'
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
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    togglePopup(false);
                  }
                  if (e.key === 'ArrowUp' || (e.shiftKey && e.key === 'Tab')) {
                    e.preventDefault();
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

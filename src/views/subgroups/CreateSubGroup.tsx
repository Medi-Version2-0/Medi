import { useEffect, useRef, useState } from 'react';
import { Formik, Form, Field, FormikProps } from 'formik';
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
import { subgroupValidationSchema } from './validation_schema';
import useHandleKeydown from '../../hooks/useHandleKeydown';
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';

export const CreateSubGroup: React.FC<CreateSubGroupProps> = ({
  togglePopup,
  data,
  handelFormSubmit,
  isDelete,
  deleteAcc,
  className,
  groupList,
}) => {
  const { group_code } = data;
  const formikRef = useRef<FormikProps<SubGroupFormDataProps>>(null);
  const parentGrpOptions: Option[] = groupList.map((grp: any) => ({
    value: grp.group_code,
    label: grp.group_name.toUpperCase(),
  }))
  const [focused, setFocused] = useState('');

  useEffect(() => {
    const focusTarget = !isDelete
      ? document.getElementById('group_name')
      : document.getElementById('del_button');
    focusTarget?.focus();
  }, []);

  const handleParentChange = (option: Option | null) => {
    formikRef.current?.setFieldValue('parent_code', option?.value);
  };

  const handleSubmit = async (values: object) => {
    const formData = {
      ...values,
      ...(group_code && { group_code }),
    };
    !group_code && document.getElementById('account_button')?.focus();
    handelFormSubmit(formData);
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
          ? 'Delete Sub-Group'
          : group_code
            ? 'Update Sub-Group'
            : 'Create Sub-Group'
      }
      className={className}
    >
      <Formik
        innerRef={formikRef}
        initialValues={{
          group_name: data?.group_name || '',
          parent_code: data?.parent_code || '',
        }}
        validationSchema={subgroupValidationSchema}
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
                      className='!h-8 rounded-sm text-xs'
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
                        if(e.key === 'Tab'){
                          if (!dropdown) {
                            e.preventDefault();
                          }
                          document.getElementById('cancel_button')?.focus();
                        }
                        if (e.key === 'Enter') {
                          if (!dropdown) {
                            e.preventDefault();
                          }
                          document.getElementById('submit_button')?.focus();
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
                    document.getElementById(`${isDelete ? 'del_button' : 'parent_code'}`)?.focus();
                    if(!isDelete){
                      setFocused('parent_code');
                    }
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
                  disable={formik.isSubmitting}  // disable if form is submitting i.e., prevent multiple submissions
                  autoFocus
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

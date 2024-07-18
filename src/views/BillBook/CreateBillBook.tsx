import { useEffect, useRef, useState } from 'react';
import { Formik, Form, Field, FormikProps } from 'formik';
import {
  CreateBillProps,
  BillBookFormDataProps,
  Option,
  BillBookFormData,
} from '../../interface/global';
import { Popup } from '../../components/popup/Popup';
import * as Yup from 'yup';
import Button from '../../components/common/button/Button';
import onKeyDown from '../../utilities/formKeyDown';
import FormikInputField from '../../components/common/FormikInputField';
import CustomSelect from '../../components/custom_select/CustomSelect';

export const CreateBillBook = ({
  togglePopup,
  data,
  handelFormSubmit,
  isDelete,
  deleteAcc,
  className,
}: CreateBillProps) => {
  const { id } = data;
  const formikRef = useRef<FormikProps<BillBookFormData>>(null);
  const [focused, setFocused] = useState('');

  const validationSchema = Yup.object({
    billName: Yup.string()
      .required('Bill name is required')
      .matches(/[a-zA-Z]/, 'Only Numbers not allowed')
      .matches(
        /^[a-zA-Z0-9\s_.-]*$/,
        'Bill name can contain alphanumeric characters, "-", "_", and spaces only'
      )
      .max(100, 'Station name cannot exceeds 100 characters'),
    billBookPrefix: Yup.string()
      .required('Prefix is required')
      .matches(/^[A-Za-z]*$/, 'Only alphabets are allowed'),
    orderOfBill: Yup.string().matches(
      /^[0-9]*$/,
      'Only numeric values are allowed'
    ),
  });

  useEffect(() => {
    const focusTarget = !isDelete
      ? document.getElementById('billName')
      : document.getElementById('cancel_button');
    focusTarget?.focus();
  }, []);

  const handleSubmit = async (values: object) => {
    const formData = {
      ...values,
      ...(id && { id }),
    };
    !id && document.getElementById('account_button')?.focus();
    handelFormSubmit(formData);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    formik?: FormikProps<BillBookFormDataProps>,
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

  const handleFieldChange = (option: Option | null, id: string) => {
    formikRef.current?.setFieldValue(id, option?.value);
  };

  const handleUppercase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    formikRef.current?.setFieldValue(e.target.name, value.toUpperCase());
  };

  const handleNumeric = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (/^[0-9]*$/.test(value)) {
      formikRef.current?.setFieldValue(e.target.name, value);
    }
  };

  return (
    <Popup
      heading={
        id && isDelete
          ? 'Delete Series'
          : id
            ? 'Update Series'
            : 'Create Series'
      }
      className={className}
    >
      <Formik
        innerRef={formikRef}
        initialValues={{
          billName: data?.billName || '',
          billBookPrefix: data?.billBookPrefix || '',
          company: data?.company || 'All Companies',
          billType: data?.billType || 'Both',
          orderOfBill: data?.orderOfBill || '',
          locked: data?.locked || 'No',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form className='flex flex-col gap-3 min-w-[18rem] items-start px-4'>
            <FormikInputField
              label='Series Name'
              id='billName'
              name='billName'
              formik={formik}
              className='!gap-0'
              isDisabled={isDelete && id}
              nextField='billBookPrefix'
              prevField='billName'
              sideField='billBookPrefix'
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                handleKeyDown(e)
              }
              showErrorTooltip={
                !!(formik.touched.billName && formik.errors.billName)
              }
            />
            <FormikInputField
              label='Prefix'
              id='billBookPrefix'
              name='billBookPrefix'
              formik={formik}
              className='!gap-0'
              isDisabled={isDelete && id}
              maxLength={2}
              nextField='company'
              prevField='billName'
              sideField='company'
              onChange={handleUppercase}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                handleKeyDown(e)
              }
              showErrorTooltip={
                !!(
                  formik.touched.billBookPrefix && formik.errors.billBookPrefix
                )
              }
            />
            <div className='flex flex-col w-full '>
              <Field name='company'>
                {() => (
                  <CustomSelect
                    label='Company'
                    id='company'
                    name='company'
                    value={
                      formik.values.company === ''
                        ? null
                        : {
                            label: formik.values.company,
                            value: formik.values.company,
                          }
                    }
                    onChange={handleFieldChange}
                    options={[
                      { value: 'All Companies', label: 'All Companies' },
                      { value: 'One Company', label: 'One Company' },
                    ]}
                    isSearchable={false}
                    disableArrow={false}
                    hidePlaceholder={false}
                    className='!h-6 rounded-sm text-xs'
                    isTouched={formik.touched.company}
                    isFocused={focused === 'company'}
                    error={formik.errors.company}
                    isDisabled={isDelete && id}
                    onBlur={() => {
                      formik.setFieldTouched('company', true);
                      setFocused('');
                    }}
                    onKeyDown={(e: any) => {
                      if (e.key === 'Enter' || e.key === 'Tab') {
                        const dropdown = document.querySelector(
                          '.custom-select__menu'
                        );
                        if (!dropdown) {
                          e.preventDefault();
                        }
                        setFocused('billType');
                      }
                      if (e.shiftKey && e.key === 'Tab') {
                        document.getElementById('billBookPrefix')?.focus();
                        e.preventDefault();
                      }
                    }}
                    showErrorTooltip={true}
                  />
                )}
              </Field>
            </div>
            <div className='flex flex-col w-full '>
              <Field name='billType'>
                {() => (
                  <CustomSelect
                    label='Bill Type'
                    id='billType'
                    name='billType'
                    value={
                      formik.values.billType === ''
                        ? null
                        : {
                            label: formik.values.billType,
                            value: formik.values.billType,
                          }
                    }
                    onChange={handleFieldChange}
                    options={[
                      { value: 'Only Cash', label: 'Only Cash' },
                      { value: 'Only Credit', label: 'Only Credit' },
                      { value: 'Both', label: 'Both' },
                    ]}
                    isSearchable={false}
                    disableArrow={false}
                    hidePlaceholder={false}
                    className='!h-6 rounded-sm text-xs'
                    isTouched={formik.touched.billType}
                    isFocused={focused === 'billType'}
                    error={formik.errors.billType}
                    isDisabled={isDelete && id}
                    onBlur={() => {
                      formik.setFieldTouched('billType', true);
                      setFocused('');
                    }}
                    onKeyDown={(e: any) => {
                      if (e.key === 'Enter' || e.key === 'Tab') {
                        const dropdown = document.querySelector(
                          '.custom-select__menu'
                        );
                        if (!dropdown) {
                          e.preventDefault();
                        }
                        document.getElementById('orderOfBill')?.focus();
                      }
                      if (e.shiftKey && e.key === 'Tab') {
                        document.getElementById('company')?.focus();
                        setFocused('company');                        
                        e.preventDefault();
                      }
                    }}
                    showErrorTooltip={true}
                  />
                )}
              </Field>
            </div>
            <FormikInputField
              label='Sequence of Bill'
              id='orderOfBill'
              name='orderOfBill'
              formik={formik}
              className='!gap-0'
              isDisabled={isDelete && id}
              sideField='orderOfBill'
              nextField={`${id ? 'locked' : 'submit_button'}`}
              prevField='billType'
              onChange={handleNumeric}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                handleKeyDown(e)
              }
              showErrorTooltip={
                !!(formik.touched.orderOfBill && formik.errors.orderOfBill)
              }
            />
            {id && (
              <div className='flex flex-col w-full '>
                <Field name='locked'>
                  {() => (
                    <CustomSelect
                      label='Locked'
                      id='locked'
                      name='locked'
                      value={
                        formik.values.locked === ''
                          ? null
                          : {
                              label: formik.values.locked,
                              value: formik.values.locked,
                            }
                      }
                      onChange={handleFieldChange}
                      options={[
                        { value: 'Yes', label: 'Yes' },
                        { value: 'No', label: 'No' },
                      ]}
                      isSearchable={false}
                      disableArrow={false}
                      hidePlaceholder={false}
                      className='!h-6 rounded-sm text-xs'
                      isTouched={formik.touched.locked}
                      isFocused={focused === 'locked'}
                      error={formik.errors.locked}
                      isDisabled={isDelete && id}
                      onBlur={() => {
                        formik.setFieldTouched('locked', true);
                        setFocused('');
                      }}
                      onKeyDown={(e: any) => {
                        if (e.key === 'Enter' || e.key === 'Tab') {
                          const dropdown = document.querySelector(
                            '.custom-select__menu'
                          );
                          if (!dropdown) {
                            e.preventDefault();
                          }
                          document.getElementById('submit_button')?.focus();
                        }
                        if (e.shiftKey && e.key === 'Tab') {
                          document.getElementById('orderOfBill')?.focus();
                          e.preventDefault();
                        }
                      }}
                      showErrorTooltip={true}
                    />
                  )}
                </Field>
              </div>
            )}
            <div className='flex justify-between my-4 w-full'>
              <Button
                type='fog'
                id='cancel_button'
                handleOnClick={() => togglePopup(false)}
                handleOnKeyDown={(e) => {
                  if (e.key === 'Tab') {
                    document
                      .getElementById(
                        `${isDelete ? 'del_button' : 'submit_button'}`
                      )
                      ?.focus();
                    e.preventDefault();
                  }
                  if (e.key === 'ArrowUp' || (e.shiftKey && e.key === 'Tab')) {
                    e.preventDefault();
                    setFocused('locked');
                  }
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    togglePopup(false);
                  }
                }}
              >
                Cancel
              </Button>
              {isDelete ? (
                <Button
                  id='del_button'
                  type='fill'
                  padding='px-4 py-2'
                  handleOnClick={() => id && deleteAcc(`${id}`)}
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
                  padding='px-8 py-2'
                  autoFocus={true}
                  handleOnKeyDown={(e) => {
                    if (e.key === 'Tab') {
                      document.getElementById('billName')?.focus();
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
                  {id ? 'Update' : 'Add'}
                </Button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </Popup>
  );
};

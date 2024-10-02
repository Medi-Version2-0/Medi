import { useEffect, useRef, useState } from 'react';
import { Formik, Form, Field, FormikProps } from 'formik';
import { billBookValidationSchema } from './validation_schema';
import {
  CreateBillProps,
  Option,
  BillBookFormData,
} from '../../interface/global';
import { Popup } from '../../components/popup/Popup';
import Button from '../../components/common/button/Button';
import FormikInputField from '../../components/common/FormikInputField';
import CustomSelect from '../../components/custom_select/CustomSelect';
import { TabManager } from '../../components/class/tabManager';
import { createBillBookSetupFieldsChain, createBillBookSetupFieldsChainIfId, deleteBillBookSetupFieldsChain } from '../../constants/focusChain/billBookSetupFocusChain';
import NumberInput from '../../components/common/numberInput/numberInput';

export const CreateBillBook = ({
  togglePopup,
  data,
  handleConfirmPopup,
  isDelete,
  className,
  selectedSeries,
  handleDeleteFromForm,
  billBookData
}: CreateBillProps) => {
  const { id } = data;
  const formikRef = useRef<FormikProps<BillBookFormData>>(null);
  const [editing, setEditing] = useState<boolean>(false);
  const tabManager = TabManager.getInstance()


  useEffect(() => {
    if (data.id) {
      setEditing(true);
    } else {
      setEditing(false);
    }
  }, [data]);

  const handleSubmit = async (values: object) => {
    const formData = {
      ...values,
      ...(id && { id }),
    };
    handleConfirmPopup(formData);
  };

  const handleFieldChange = (option: Option | null, id: string) => {
    formikRef.current?.setFieldValue(id, option?.value);
  };

  const handleUppercase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    formikRef.current?.setFieldValue(e.target.name, value.toUpperCase());
  };

  return (
    <Popup
      id='billBookSetupPopup'
      focusChain={isDelete ? deleteBillBookSetupFieldsChain : id ? createBillBookSetupFieldsChainIfId : createBillBookSetupFieldsChain }
      heading={
        id && isDelete
          ? 'Delete Series'
          : id
            ? 'Update Series'
            : 'Create Series'
      }
      className={className}
      onClose={() => togglePopup(false)}
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
        validationSchema={() => billBookValidationSchema(editing)}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form className='flex flex-col gap-3 min-w-[18rem] items-start px-4'>
            <FormikInputField
              label='Series Name'
              id='billName'
              isUpperCase={true}
              name='billName'
              formik={formik}
              className='!gap-0'
              isDisabled={isDelete && id}
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
              onChange={handleUppercase}
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
                    className='!h-8 rounded-sm text-xs'
                    isTouched={formik.touched.company}
                    error={formik.errors.company}
                    isDisabled={isDelete && id}
                    onBlur={() => {
                      formik.setFieldTouched('company', true);
                    }}
                    onKeyDown={(e: any) => {
                      const dropdown = document.querySelector('.custom-select__menu');
                      if (e.key === 'Enter') {
                        if (!dropdown) {
                          e.preventDefault();
                          e.stopPropagation();
                          tabManager.focusManager()
                        }
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
                    className='!h-8 rounded-sm text-xs'
                    isTouched={formik.touched.billType}
                    error={formik.errors.billType}
                    isDisabled={isDelete && id}
                    onBlur={() => {
                      formik.setFieldTouched('billType', true);
                    }}
                    onKeyDown={(e: any) => {
                      const dropdown = document.querySelector('.custom-select__menu');
                      if (e.key === 'Enter') {
                        if (!dropdown) {
                          e.preventDefault();
                          e.stopPropagation();
                          tabManager.focusManager()
                        }
                      }
                    }}
                    showErrorTooltip={true}
                  />
                )}
              </Field>
            </div>
            <NumberInput
              label='Sequence of Bill'
              id='orderOfBill'
              name='orderOfBill'
              min={0}
              value={formik.values.orderOfBill}
              onChange={(value) => formik.setFieldValue('orderOfBill', value)}
              onBlur={() => {
                formik.setFieldTouched('orderOfBill', true);
              }}
              labelClassName='absolute !h-4 !text-[12px] left-1 -top-2'
              inputClassName='!text-left !text-[12px] px-1 !h-8'
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
                      className='!h-8 rounded-sm text-xs'
                      isTouched={formik.touched.locked}
                      error={formik.errors.locked}
                      isDisabled={isDelete && id}
                      onBlur={() => {
                        formik.setFieldTouched('locked', true);
                      }}
                      onKeyDown={(e: any) => {
                        const dropdown = document.querySelector('.custom-select__menu');
                        if (e.key === 'Enter') {
                          if (!dropdown) {
                            e.preventDefault();
                            e.stopPropagation();
                            tabManager.focusManager()
                          }
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
              >
                Cancel
              </Button>
              {isDelete ? (
                <Button
                  id='del_button'
                  type='fill'
                  btnType='button'
                  padding='px-4 py-2'
                  handleOnClick={handleDeleteFromForm}
                >
                  Delete
                </Button>
              ) : (
                <Button
                  id='save'
                  type='fill'
                  disable={formik.isSubmitting || !formik.isValid}
                  padding='px-8 py-2'
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

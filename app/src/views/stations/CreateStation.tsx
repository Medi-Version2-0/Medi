import { useEffect, useRef, useState } from 'react';
import { Formik, Form, Field, FormikProps } from 'formik';
import {
  CreateStationProps,
  FormDataProps,
  Option,
  StationFormData,
} from '../../interface/global';
import { Popup } from '../../components/popup/Popup';
import * as Yup from 'yup';
import CustomSelect from '../../components/custom_select/CustomSelect';
import Button from '../../components/common/button/Button';
import onKeyDown from '../../utilities/formKeyDown';
import FormikInputField from '../../components/common/FormikInputField';
import titleCase from '../../utilities/titleCase';
import { sendAPIRequest } from '../../helper/api';

export const CreateStation: React.FC<CreateStationProps> = ({
  togglePopup,
  data,
  handelFormSubmit,
  isDelete,
  deleteAcc,
  className,
}) => {
  const { station_id } = data;
  const formikRef = useRef<FormikProps<FormDataProps>>(null);
  const [stateOptions, setStateOptions] = useState<Option[]>([]);
  const [focused, setFocused] = useState('');

  const validationSchema = Yup.object({
    station_name: Yup.string()
      .required('Station name is required')
      .matches(/[a-zA-Z]/, 'Only Numbers not allowed')
      .matches(
        /^[a-zA-Z0-9\s_.-]*$/,
        'Station name can contain alphanumeric characters, "-", "_", and spaces only'
      )
      .max(100, 'Station name cannot exceeds 100 characters'),
    state_code: Yup.string().required('Station state is required'),
    station_pinCode: Yup.string()
      .required('Station pincode is required')
      .matches(/^[0-9]+$/, 'Station pincode must contain only numbers')
      .min(6, 'Station pincode must be at least 6 characters long')
      .max(6, 'Station pincode cannot exceed 6 characters'),
    igst_sale: Yup.string().required('CST sale is required'),
  });

  useEffect(() => {
    const focusTarget = !isDelete
      ? document.getElementById('station_name')
      : document.getElementById('cancel_button');
    focusTarget?.focus();
  }, []);

  const getStates = async () => {
    const statesList = await sendAPIRequest<any[]>('/state');
    setStateOptions(
      statesList.map((state) => ({
        value: state.state_code,
        label: titleCase(state.state_name),
      }))
    );
  };

  useEffect(() => {
    getStates();
  }, []);

  const handleSubmit = async (values: object) => {
    const formData = {
      ...values,
      ...(station_id && { station_id }),
    };
    !station_id && document.getElementById('account_button')?.focus();
    handelFormSubmit(formData);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    formik?: FormikProps<StationFormData>,
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const filteredValue = value.replace(/[^0-9]/g, '');
    if (filteredValue.length <= 6) {
      formikRef.current?.setFieldValue(e.target.name, filteredValue);
    } else {
      formikRef.current?.setFieldValue(
        e.target.name,
        filteredValue.slice(0, 6)
      );
    }
  };
  return (
    <Popup
      togglePopup={togglePopup}
      heading={
        station_id && isDelete
          ? 'Delete Station'
          : station_id
            ? 'Update Station'
            : 'Create Station'
      }
      className={className}
    >
      <Formik
        innerRef={formikRef}
        initialValues={{
          station_name: data?.station_name || '',
          igst_sale: data?.igst_sale || '',
          state_code: data?.state_code || '',
          station_pinCode: data?.station_pinCode || '',
          station_headQuarter: data?.station_headQuarter || '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form className='flex flex-col gap-3 min-w-[18rem] items-start px-4'>
            <FormikInputField
              label='Station Name'
              id='station_name'
              name='station_name'
              formik={formik}
              className='!gap-0'
              isDisabled={isDelete && station_id}
              nextField='state_code'
              prevField='station_name'
              sideField='state_code'
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                handleKeyDown(e)
              }
              showErrorTooltip={
                !!(formik.touched.station_name && formik.errors.station_name)
              }
            />
            <div className='flex flex-col w-full '>
              {stateOptions.length > 0 && (
                <Field name='state_code'>
                  {() => (
                    <CustomSelect
                      label='State'
                      id='state_code'
                      name='state_code'
                      value={
                        formik.values.state_code === ''
                          ? null
                          : {
                              label:
                                stateOptions.find(
                                  (e) => e.value === formik.values.state_code
                                )?.label || '',
                              value: formik.values.state_code,
                            }
                      }
                      onChange={handleFieldChange}
                      options={stateOptions}
                      isSearchable={true}
                      disableArrow={true}
                      hidePlaceholder={false}
                      className='!h-6 rounded-sm text-xs'
                      isFocused={focused === 'state_code'}
                      error={formik.errors.state_code}
                      isDisabled={isDelete && station_id}
                      isTouched={formik.touched.state_code}
                      onBlur={() => {
                        formik.setFieldTouched('state_code', true);
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
                          document.getElementById('station_pinCode')?.focus();
                        }
                        if (e.shiftKey && e.key === 'Tab') {
                          document.getElementById('station_name')?.focus();
                          e.preventDefault();
                        }
                      }}
                      showErrorTooltip={true}
                    />
                  )}
                </Field>
              )}
            </div>

            <FormikInputField
              label='Pin Code'
              id='station_pinCode'
              name='station_pinCode'
              formik={formik}
              className='!gap-0'
              isDisabled={isDelete && station_id}
              sideField='igst_sale'
              nextField='igst_sale'
              prevField='state_code'
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                handleKeyDown(e)
              }
              onChange={handleChange}
              showErrorTooltip={
                !!(
                  formik.touched.station_pinCode &&
                  formik.errors.station_pinCode
                )
              }
            />

            <div className='flex flex-col w-full '>
              <Field name='igst_sale'>
                {() => (
                  <CustomSelect
                    label='IGST Sale'
                    id='igst_sale'
                    name='igst_sale'
                    value={
                      formik.values.igst_sale === ''
                        ? null
                        : {
                            label: formik.values.igst_sale,
                            value: formik.values.igst_sale,
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
                    isTouched={formik.touched.igst_sale}
                    isFocused={focused === 'igst_sale'}
                    error={formik.errors.igst_sale}
                    isDisabled={isDelete && station_id}
                    onBlur={() => {
                      formik.setFieldTouched('igst_sale', true);
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
                        document.getElementById('station_pinCode')?.focus();
                        e.preventDefault();
                      }
                    }}
                    showErrorTooltip={true}
                  />
                )}
              </Field>
            </div>
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
                    setFocused('igst_sale');
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
                  handleOnClick={() => station_id && deleteAcc(station_id)}
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
                      document.getElementById('station_name')?.focus();
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
                  {station_id ? 'Update' : 'Add'}
                </Button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </Popup>
  );
};

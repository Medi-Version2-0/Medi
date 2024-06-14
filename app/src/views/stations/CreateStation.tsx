import { useEffect, useRef, useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikProps } from 'formik';
import { CreateStationProps, FormDataProps, Option, State, StationFormData } from '../../interface/global';
import { Popup } from '../../components/popup/Popup';
import * as Yup from 'yup';
import CustomSelect from '../../components/custom_select/CustomSelect';
import Button from '../../components/common/button/Button';
import onKeyDown from '../../utilities/formKeyDown';
import FormikInputField from '../../components/common/FormikInputField';

export const CreateStation: React.FC<CreateStationProps> = ({
  togglePopup,
  data,
  handelFormSubmit,
  isDelete,
  deleteAcc,
}) => {
  const { station_id } = data;
  const electronAPI = (window as any).electronAPI;
  const formikRef = useRef<FormikProps<FormDataProps>>(null);
  const [stateOptions, setStateOptions] = useState<Option[]>([]);
  const [focused, setFocused] = useState("");

  const validationSchema = Yup.object({
    station_name: Yup.string()
      .required('Station name is required')
      .matches(/[a-zA-Z]/, 'Only Numbers not allowed')
      .matches(
        /^[a-zA-Z0-9\s_.-]*$/,
        'Station name can contain alphanumeric characters, "-", "_", and spaces only'
      )
      .max(100, 'Station name cannot exceeds 100 characters'),
    station_state: Yup.string().required("Station state is required"),
    station_pinCode: Yup.string()
      .required("Station pincode is required")
      .matches(/^[0-9]+$/, "Station pincode must contain only numbers")
      .min(6, "Station pincode must be at least 6 characters long")
      .max(6, "Station pincode cannot exceed 6 characters"),
    cst_sale: Yup.string().required("CST sale is required"),
  });


  useEffect(() => {
    const focusTarget = !isDelete
      ? document.getElementById('station_name')
      : document.getElementById('cancel_button');
    focusTarget?.focus();
  }, []);

  const getStates = () => {
    const statesList = electronAPI.getAllStates('', 'state_name', '', '', '');
    setStateOptions(
      statesList.map((state: State) => ({
        value: state.state_name,
        label: state.state_name,
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, formik?: FormikProps<StationFormData>, radioField?: any) => {
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
      formikRef.current?.setFieldValue(e.target.name, filteredValue.slice(0, 6));
    }
  };
  return (
    <Popup
      togglePopup={togglePopup}
      heading={station_id && isDelete ? 'Delete Station'
        : station_id ? 'Update Station'
          : 'Create Station'
      }
    >
      <Formik
        innerRef={formikRef}
        initialValues={{
          station_name: data?.station_name || '',
          cst_sale: data?.cst_sale || '',
          station_state: data?.station_state || '',
          station_pinCode: data?.station_pinCode || '',
          station_headQuarter: data?.station_headQuarter || "",
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form className='flex flex-col gap-1 min-w-[18rem] items-start px-4'>
            <FormikInputField
              placeholder='Station name'
              id='station_name'
              name='station_name'
              formik={formik}
              className='!gap-0'
              isDisabled={isDelete && station_id}
              nextField='station_state'
              prevField='station_name'
              sideField='station_state'
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                handleKeyDown(e)
              }
              showErrorTooltip={
                !!(formik.touched.station_name && formik.errors.station_name)
              }
            />
            <div className='flex flex-col w-full '>
              {stateOptions.length > 0 && (
                <Field name='station_state'>
                  {() => (
                    <CustomSelect
                      id='station_state'
                      name='station_state'
                      value={
                        formik.values.station_state === ''
                          ? null
                          : {
                              label: formik.values.station_state,
                              value: formik.values.station_state,
                            }
                      }
                      onChange={handleFieldChange}
                      options={stateOptions}
                      isSearchable={true}
                      placeholder='Station state'
                      disableArrow={true}
                      hidePlaceholder={false}
                      className='!h-6 rounded-sm text-xs'
                      isFocused={focused === 'station_state'}
                      error={formik.errors.station_state}
                      isDisabled={isDelete && station_id}
                      isTouched={formik.touched.station_state}
                      onBlur={() => {
                        formik.setFieldTouched('station_state', true);
                        setFocused('');
                      }}
                      onKeyDown={(e: any) => {
                        if (
                          e.key === 'Enter' ||
                          e.key === 'Tab' ||
                          e.key === 'ArrowDown'
                        ) {
                          const dropdown = document.querySelector(
                            '.custom-select__menu'
                          );
                          if (!dropdown) {
                            e.preventDefault();
                          }
                          document.getElementById('station_pinCode')?.focus();
                        }
                        if ((e.shiftKey && e.key === 'Tab') || e.key === 'ArrowUp') {
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
              placeholder='Station pin code'
              id='station_pinCode'
              name='station_pinCode'
              formik={formik}
              className='!gap-0'
              isDisabled={isDelete && station_id}
              sideField='cst_sale'
              nextField='cst_sale'
              prevField='station_state'
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
              <Field name='cst_sale'>
                {() => (
                  <CustomSelect
                    id='cst_sale'
                    name='cst_sale'
                    value={
                      formik.values.cst_sale === ''
                        ? null
                        : {
                            label: formik.values.cst_sale,
                            value: formik.values.cst_sale,
                          }
                    }
                    onChange={handleFieldChange}
                    options={[
                      { value: 'Yes', label: 'Yes' },
                      { value: 'No', label: 'No' },
                    ]}
                    isSearchable={false}
                    placeholder='CST Sale'
                    disableArrow={false}
                    hidePlaceholder={false}
                    className='!h-6 rounded-sm text-xs'
                    isTouched={formik.touched.cst_sale}
                    isFocused={focused === 'cst_sale'}
                    error={formik.errors.cst_sale}
                    isDisabled={isDelete && station_id}
                    onBlur={() => {
                      formik.setFieldTouched('cst_sale', true);
                      setFocused('');
                    }}
                    onKeyDown={(e: any) => {
                      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'Tab') {
                        const dropdown = document.querySelector(
                          '.custom-select__menu'
                        );
                        if (!dropdown) {
                          e.preventDefault();
                        }
                        document.getElementById('submit_button')?.focus();
                      }
                      if ((e.shiftKey && e.key === 'Tab') || e.key === 'ArrowUp') {
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
                    document.getElementById(`${isDelete ? 'del_button' : 'submit_button'}`)?.focus();
                    e.preventDefault();
                  } 
                  if (e.key === 'ArrowUp' || (e.shiftKey && e.key === 'Tab') ) {
                    e.preventDefault();
                    setFocused('cst_sale');
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
                    if (e.key === 'ArrowUp' || (e.shiftKey && e.key === 'Tab') ) {
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

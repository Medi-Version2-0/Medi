import { useEffect, useRef, useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikProps } from 'formik';
import { CreateStationProps, FormDataProps, Option, State } from '../../interface/global';
import { Popup } from '../../components/popup/Popup';
import * as Yup from 'yup';
import CustomSelect from '../../components/custom_select/CustomSelect';
import Button from '../../components/common/button/Button';

export const CreateStation: React.FC<CreateStationProps> = ({
  togglePopup,
  data,
  handelFormSubmit,
  isDelete,
  deleteAcc,
}) => {
  const { station_id } = data;
  const inputRef = useRef<HTMLInputElement | null>(null);
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
    const focusTarget = inputRef.current && !isDelete
      ? inputRef.current
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
    (!station_id) && document.getElementById('account_button')?.focus();
    handelFormSubmit(formData);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    formik?: FormikProps<FormDataProps>
  ) => {
    const key = e.key;
    const shiftPressed = e.shiftKey;

    switch (key) {
      case 'ArrowDown':
      case 'Enter':
        {
          const nextField = e.currentTarget.getAttribute('data-next-field') || '';
          document.getElementById(nextField)?.focus();
          e.preventDefault();
        }
        break;
      case 'ArrowUp':
        {
          const prevField = e.currentTarget.getAttribute('data-prev-field') || '';
          document.getElementById(prevField)?.focus();
          e.preventDefault();
        }
        break;
      case 'Tab':
        {
          if (shiftPressed) {
            const prevField = e.currentTarget.getAttribute('data-prev-field') || '';
            setFocused(prevField);
            document.getElementById(prevField)?.focus();
            e.preventDefault();
          } else {
            const sideField = e.currentTarget.getAttribute('data-side-field') || '';
            const value = (document.getElementById(sideField) as HTMLInputElement)?.value;
            setFocused(sideField);
            document.getElementById(sideField)?.focus();
            formik && formik.setFieldValue('cst_sale', value);
            e.preventDefault();
          }
        }
        break;
      default:
        break;
    }
  };

  const handleStateChange = (option: Option | null) => {
    formikRef.current?.setFieldValue('station_state', option?.value);
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
          <Form className='flex flex-col gap-2 min-w-[18rem] items-center px-4 '>
            <div className="flex flex-col w-full " >
              <Field
                type='text'
                id='station_name'
                name='station_name'
                placeholder='Station name'
                disabled={isDelete && station_id}
                className={`w-full p-3 rounded-md text-3  border border-solid  ${formik.touched.station_name && formik.errors.station_name ? 'border-red-600 ' : ''}`}
                innerRef={inputRef}
                data-side-field='station_state'
                data-next-field='station_state'
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleKeyDown(e)
                }
              />
              <ErrorMessage
                name='station_name'
                component='div'
                className="text-red-600 font-xs ml-[1px]  "
              />
            </div>
            <div className="flex flex-col w-full " >
              {stateOptions.length > 0 && (
                <Field name="station_state">
                  {() => (
                    <CustomSelect
                      id="station_state"
                      name='station_state'
                      value={formik.values.station_state === '' ? null : { label: formik.values.station_state, value: formik.values.station_state }}
                      onChange={handleStateChange}
                      options={stateOptions}
                      isSearchable={true}
                      placeholder="Station state"
                      disableArrow={true}
                      hidePlaceholder={false}
                      className="!h-12"
                      isFocused={focused === "station_state"}
                      error={formik.errors.station_state}
                      isDisabled={isDelete && station_id}
                      isTouched={formik.touched.station_state}
                      onBlur={() => { formik.setFieldTouched('station_state', true); setFocused(""); }}
                    />
                  )}
                </Field>
              )}
              <ErrorMessage name='station_state' component='div' className='text-red-600 font-xs ml-[1px]' />
            </div>
            <div className="flex flex-col w-full " >
              <Field
                type='text'
                id='station_pinCode'
                name='station_pinCode'
                placeholder='Station pin code'
                disabled={isDelete && station_id}
                className={`w-full p-3 rounded-md text-3  border border-solid border-[#9ca3af]  ${(formik.touched.station_pinCode && formik.errors.station_pinCode) ? '!border-red-600 ' : ''}`}
                data-side-field='cst_yes'
                data-next-field='cst_yes'
                data-prev-field='station_state'
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleKeyDown(e)
                }
                onChange={handleChange}
              />
              <ErrorMessage
                name='station_pinCode'
                component='div'
                className="text-red-600 font-xs ml-[1px]  "
              />
            </div>
            <div className="flex flex-col w-full " >
              <div className='flex items-center justify-between gap-2'>
                <CustomSelect
                  label=''
                  id='cst_sale'
                  value={formik.values.cst_sale === '' ? null : { label: formik.values.cst_sale, value: formik.values.cst_sale }}
                  onChange={handleFieldChange}
                  options={[
                    { value: 'Yes', label: 'Yes' },
                    { value: 'No', label: 'No' },
                  ]}
                  isSearchable={false}
                  placeholder="CST Sale"
                  disableArrow={false}
                  hidePlaceholder={false}
                  className="w-full !h-12"
                  isTouched={formik.touched.cst_sale}
                  error={formik.errors.cst_sale}
                  onBlur={() => { formik.setFieldTouched('cst_sale', true); setFocused(""); }}
                />
              </div>
              <ErrorMessage
                name='cst_sale'
                component='div'
                className="text-red-600 font-xs ml-[1px]  "
              />
            </div>
            <div className='flex justify-between p-4 w-full'>
              <Button type='fog' id='cancel_button' handleOnClick={() => togglePopup(false)}
                handleOnKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    togglePopup(false);
                  }
                }}
              >
                Cancel
              </Button>
              {isDelete ? (
                <Button id='del_button' type='fill' handleOnClick={() => station_id && deleteAcc(station_id)}
                  handleOnKeyDown={(e) => {
                    if (e.key === 'Tab') {
                      e.preventDefault();
                    }
                  }}
                >
                  Delete
                </Button>
              ) : (
                <Button id="submit_button" type="fill" autoFocus={true}
                  handleOnKeyDown={(e) => {
                    if (e.key === 'Tab') {
                      document.getElementById('station_name')?.focus();
                      e.preventDefault();
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

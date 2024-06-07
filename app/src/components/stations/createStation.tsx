import { 
  // KeyboardEvent, 
  useEffect, useRef, useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikProps } from 'formik';
import { CreateStationProps, FormDataProps, Option, State } from '../../interface/global';
import { Popup } from '../helpers/popup';
import * as Yup from 'yup';
import './stations.css';
import CustomSelect from '../custom_select/CustomSelect';

export const CreateStation: React.FC<CreateStationProps> = ({
  togglePopup,
  data,
  handelFormSubmit,
  isDelete,
  deleteAcc,
}) => {
  const { station_id } = data;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [stationState, setStationState] = useState<{
    inputValue: string,
    data: State[],
    suggestions: State[]
  }>({
    inputValue: '',
    data: [],
    suggestions: []
  });

  // const [selectedIndex, setSelectedIndex] = useState(0);
  const [, setErr] = useState("");
  const electronAPI = (window as any).electronAPI;
  const formikRef = useRef<FormikProps<FormDataProps>>(null);
  const [stateOptions, setStateOptions] = useState<Option[]>([]);

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
    setStationState((prevState) => ({
      ...prevState,
      data: statesList
    }));
    setStateOptions(
      statesList.map((state: State) => ({
        value: state.state_name,
        label: state.state_name.toLowerCase(),
      }))
    );
  };

  const handleStateChange = (option: Option | null) => {
    setStationState((prevState) => ({
      ...prevState,
      inputValue: option?.value || "",
      suggestions: [],
    }));
    formikRef.current?.setFieldValue('station_state', option?.value);
    setErr("");
  };

  useEffect(() => {
    getStates();
    setStationState((prevState) => ({
      ...prevState,
      inputValue: data?.station_state ? data.station_state : '',
    }));
  }, []);

  // const validateInputs = () => {
  //   const { value, id } = (document.getElementById('station_state') as HTMLInputElement);

  //   setErr("");

  //   const isState = stationState.data.some(
  //     (state: any) => state.state_name === value
  //   );
  //   if (id === 'station_state') {
  //     if (!value) {
  //       setErr('State is required');
  //     } else if (value && isState === false) {
  //       setErr('Invalid State');
  //     }
  //   }
  // };

  const handleSubmit = async (values: object) => {
    // validateInputs();
    // if(err){
    //   return;
    // }

    const formData = station_id
      ? {
        ...values,
        station_id: station_id,
        station_state: stationState.inputValue,
      }
      : stationState.inputValue
        ? {
          ...values,
          station_state: stationState.inputValue,
        }
        : values;
    !station_id && document.getElementById('account_button')?.focus();
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
          const nextField =
            e.currentTarget.getAttribute('data-next-field') || '';
          document.getElementById(nextField)?.focus();
          e.preventDefault();
        }
        break;
      case 'ArrowUp':
        {
          const prevField =
            e.currentTarget.getAttribute('data-prev-field') || '';
          document.getElementById(prevField)?.focus();
          e.preventDefault();
        }
        break;
      case 'Tab':
        {
          if (shiftPressed) {
            const prevField =
              e.currentTarget.getAttribute('data-prev-field') || '';
            document.getElementById(prevField)?.focus();
            e.preventDefault();
          } else {
            const sideField = e.currentTarget.getAttribute('data-side-field') || '';
            const value = (document.getElementById(sideField) as HTMLInputElement)?.value;
            formik && formik.setFieldValue('cst_sale', value);
            document.getElementById(sideField)?.focus();
            e.preventDefault();
          }
        }
        break;
      default:
        break;
    }
  };

  return (
    <Popup
      togglePopup={togglePopup}
      headding={
        station_id && isDelete
          ? 'Delete Station'
          : station_id
            ? 'Update Station'
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
        enableReinitialize={true}
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
              {stateOptions.length >0 && (
                <CustomSelect
                value={formik.values.station_state==='' ? null : { label: formik.values.station_state, value: formik.values.station_state }}
                onChange={handleStateChange}
                options={stateOptions}
                isSearchable={true}
                placeholder="Station state"
                disableArrow={true}
                hidePlaceholder={false}
                className={`${(formik.touched.station_state && formik.errors.station_state) ? 'border-red-600 ' : ''}`}
                isDisabled={isDelete && station_id}
              />
              )}
            </div>

            <div className="flex flex-col w-full " >
              <Field
                type='number'
                id='station_pinCode'
                name='station_pinCode'
                placeholder='Station pin code'
                disabled={isDelete && station_id}
                className={`w-full p-3 rounded-md text-3  border border-solid  ${(formik.touched.station_pinCode && formik.errors.station_pinCode) ? 'border-red-600 ' : ''}`}
                data-side-field='cst_yes'
                data-next-field='cst_yes'
                data-prev-field='station_state'
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleKeyDown(e)
                }
              />
              <ErrorMessage
                name='station_pinCode'
                component='div'
                className="text-red-600 font-xs ml-[1px]  "
              />
            </div>
            <div className="flex flex-col w-full " >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.8rem',
                  borderRadius: '0.4rem',
                  border: '1px solid #c1c1c1',
                }}
              >
                <label
                  className={`w-1/2 text-base cursor-pointer text-center p-3 font-bold  ${station_id && isDelete ? 'disabled' : ''}`}
                >
                  <Field
                    type='radio'
                    name='cst_sale'
                    value='yes'
                    id='cst_yes'
                    checked={formik.values.cst_sale === 'yes'}
                    disabled={station_id && isDelete}
                    data-prev-field='cst_yes'
                    data-next-field='submit_button'
                    data-side-field='cst_no'
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                      handleKeyDown(e, formik)
                    }
                  />
                  Yes
                </label>
                <label
                  className={`w-1/2 text-base cursor-pointer text-center p-3 font-bold  ${station_id && isDelete ? 'disabled' : ''}`}
                >
                  <Field
                    type='radio'
                    name='cst_sale'
                    value='no'
                    id='cst_no'
                    checked={formik.values.cst_sale === 'no'}
                    disabled={station_id && isDelete}
                    data-prev-field='station_pinCode'
                    data-next-field='submit_button'
                    data-side-field='cst_yes'
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                      handleKeyDown(e, formik)
                    }
                  />
                  No
                </label>
              </div>
              <ErrorMessage
                name='cst_sale'
                component='div'
                className="text-red-600 font-xs ml-[1px]  "
              />
            </div>
            <div className='flex justify-between p-4 w-full'>
              <button
                autoFocus
                id='cancel_button'
                className='acc_button'
                onMouseDown={() => togglePopup(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    togglePopup(false);
                  }
                }}
              >
                Cancel
              </button>
              {isDelete ? (
                <button
                  id='del_button'
                  className='account_add_button'
                  onClick={() => station_id && deleteAcc(station_id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Tab') {
                      e.preventDefault();
                    }
                  }}
                >
                  Delete
                </button>
              ) : (
                <button
                  type='submit'
                  id='submit_button'
                  className='account_add_button'
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Tab') {
                      document.getElementById('station_name')?.focus();
                      e.preventDefault();
                    }
                  }}
                >
                  {station_id ? 'Update' : 'Add'}
                </button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </Popup>
  );
};

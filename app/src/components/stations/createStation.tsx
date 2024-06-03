import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikProps } from 'formik';
import { CreateStationProps, FormDataProps, State } from '../../interface/global';
import { Popup } from '../helpers/popup';
import * as Yup from 'yup';
import './stations.css';

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

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [err, setErr] = useState("");
  const stateRef = useRef<HTMLDivElement>(null);
  const hqRef = useRef<HTMLDivElement>(null);
  const electronAPI = (window as any).electronAPI;
  const formikRef = useRef<FormikProps<FormDataProps>>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stateRef.current && !stateRef.current.contains(event.target as Node)) {
        setStationState((prevState) => ({
          ...prevState,
          suggestions: []
        }))
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [hqRef, stateRef]);

  const getStates = () => {
    setStationState((prevState) => ({
      ...prevState,
      data: electronAPI.getAllStates('', 'state_name', '', '', '')
    }));
  };

  useEffect(() => {
    getStates();
    setStationState((prevState) => ({
      ...prevState,
      inputValue: data?.station_state ? data.station_state : '',
    }));
  }, []);

  const handleInputChange = (
    e: { target: { value: any } },
  ) => {
    const value = e.target.value;
    formikRef.current?.setFieldValue('station_state', value);
    setStationState((prevState) => ({
      ...prevState,
      inputValue: value,
    }))
    // Filter statesSuggestions based on input value
    setStationState((prevState) => ({
      ...prevState,
      suggestions: stationState.data.filter((item: State) =>
        item.state_name.toLowerCase().includes(value.toLowerCase())
      ),
    }))
  };

  const handleOnKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
  ) => {
    const Suggestions = stationState.suggestions;
    if (Suggestions.length) {
      if (e.key === 'Enter') {
        e.preventDefault();
        setStationState((prevState) => ({
          ...prevState,
          inputValue: stationState.suggestions[selectedIndex].state_name,
          suggestions: [],
        }));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : prevIndex
        );
        if (selectedIndex > 0) {
          document
            .getElementById(`suggestion_${selectedIndex - 1}`)
            ?.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
            });
        }
      } else if (e.key === 'ArrowDown') {
        const reqSuggestion = stationState.suggestions;
        e.preventDefault();
        setSelectedIndex((prevIndex) =>
          prevIndex < reqSuggestion.length - 1 ? prevIndex + 1 : prevIndex
        );
        if (selectedIndex < reqSuggestion.length - 1) {
          document
            .getElementById(`suggestion_${selectedIndex + 1}`)
            ?.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
            });
        }
      } else if (e.key === 'Tab') {
        setStationState((prevState) => ({
          ...prevState,
          suggestions: [],
        }));
      }
    }
  };

  const validateInputs = () => {
    const { value, id } = (document.getElementById('station_state') as HTMLInputElement);

    setErr("");

    const isState = stationState.data.some(
      (state: any) => state.state_name === value
    );
    if (id === 'station_state') {
      if (!value) {
        setErr('State is required');
      } else if (value && isState === false) {
        setErr('Invalid State');
      }
    }
  };

  const handleSubmit = async (values: object) => {
    validateInputs();
    if(err){
      return;
    }

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
          <Form className='account-form'>
            <div className='inputs'>
              <Field
                type='text'
                id='station_name'
                name='station_name'
                placeholder='Station name'
                disabled={isDelete && station_id}
                className={`input-field ${formik.touched.station_name && formik.errors.station_name ? 'error-field' : ''}`}
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
                className='error'
              />
            </div>
            <div className='inputs' ref={stateRef}>
              <Field
                type='text'
                id='station_state'
                name='station_state'
                placeholder='Station state'
                value={stationState.inputValue}
                onBlur={validateInputs}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange(e)
                }
                disabled={isDelete && station_id}
                className={`input-field ${(formik.touched.station_state && formik.errors.station_state) ? 'error-field' : ''}`}
                data-side-field='station_pinCode'
                data-next-field='station_pinCode'
                data-prev-field='station_name'
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (stationState.suggestions.length !== 0) {
                    handleOnKeyDown(e);
                  } else {
                    handleKeyDown(e);
                  }
                }}
              />
              {!!stationState.suggestions.length && (
                <ul className={'suggestion'}>
                  {stationState.suggestions.map((state: any, index: number) => (
                    <li
                      key={state.state_code}
                      onClick={() => {
                        setStationState((prevState) => ({
                          ...prevState,
                          inputValue: state.state_name,
                          suggestions: [],
                        }));
                        formikRef.current?.setFieldValue('station_state', state.state_name);
                        setErr("");
                        document.getElementById('station_state')?.focus();
                      }}
                      className={`${index === selectedIndex ? 'selected' : 'suggestion_list'}`}
                      id={`suggestion_${index}`}
                    >
                      {state.state_name}
                    </li>
                  ))}
                </ul>
              )}
              <ErrorMessage
                name='station_state'
                component='div'
                className='error'
              />
              {(err && !formik.errors.station_state) && (
                <span className='err'>{err}</span>
              )}
            </div>

            <div className='inputs'>
              <Field
                type='number'
                id='station_pinCode'
                name='station_pinCode'
                placeholder='Station pin code'
                disabled={isDelete && station_id}
                className={`input-field ${(formik.touched.station_pinCode && formik.errors.station_pinCode) ? 'error-field' : ''}`}
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
                className='error'
              />
            </div>
            <div className='inputs'>
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
                  className={`credit-type ${station_id && isDelete ? 'disabled' : ''}`}
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
                  className={`credit-type ${station_id && isDelete ? 'disabled' : ''}`}
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
                className='error'
              />
            </div>
            <div className='modal-actions'>
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

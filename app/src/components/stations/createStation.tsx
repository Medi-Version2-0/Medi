import {KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikProps } from 'formik';
import { CreateStationProps, FormDataProps, State, StationFormData } from '../../interface/global';
import { Popup } from '../helpers/popup';
import './stations.css';

const errValue = {
  station_name: '',
  station_state: '',
  station_pinCode: '',
  station_headQuarter: '',
};

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

  const [headquarters, setHeadquarters] = useState<{
    inputValue: string,
    data: StationFormData[],
    suggestions: StationFormData[]
  }>({
    inputValue: '',
    data: [],
    suggestions: []
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [err, setErr] = useState(errValue);

  const stateRef = useRef<HTMLDivElement>(null);
  const hqRef = useRef<HTMLDivElement>(null);

  const electronAPI = (window as any).electronAPI;

  useEffect(() => {
    const focusTarget = inputRef.current && !isDelete
        ? inputRef.current
        : document.getElementById('cancel_button');
    focusTarget?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hqRef.current && !hqRef.current.contains(event.target as Node)) {
        setHeadquarters((prevState) => ({
          ...prevState,
          suggestions: []
        }))
      }
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

  const getHq = () => {
    setHeadquarters((prevState) => ({
      ...prevState,
      data: electronAPI.getAllStations('', 'station_name', '', '', '')
    }));
  };

  useEffect(() => {
    getStates();
    getHq();
    setStationState((prevState) => ({
      ...prevState,
      inputValue: data?.station_state ? data.station_state : '',
    }));
    setHeadquarters((prevState) => ({
      ...prevState,
      inputValue: data?.station_headQuarter ? data.station_headQuarter : '',
    }));
  }, []);

  const handleInputChange = (
    e: { target: { value: any } },
    isState: boolean
  ) => {
    const value = e.target.value;
    isState
      ? setStationState((prevState) => ({
          ...prevState,
          inputValue: value,
        }))
      : setHeadquarters((prevState) => ({
          ...prevState,
          inputValue: value,
        }));
    // Filter statesSuggestions based on input value
    isState
      ? setStationState((prevState) => ({
          ...prevState,
          suggestions: stationState.data.filter((item: State) =>
            item.state_name.toLowerCase().includes(value.toLowerCase())
          ),
        }))
      : setHeadquarters((prevState) => ({
          ...prevState,
          suggestions: headquarters.data.filter((item: StationFormData) =>
            item.station_name.toLowerCase().includes(value.toLowerCase())
          ),
        }));
  };

  const handleOnKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    isState: boolean
  ) => {
    const Suggestions = isState
      ? stationState.suggestions
      : headquarters.suggestions;
    if (Suggestions.length) {
      if (e.key === 'Enter') {
        e.preventDefault();
        isState
          ? setStationState((prevState) => ({
              ...prevState,
              inputValue: stationState.suggestions[selectedIndex].state_name,
              suggestions: [],
            }))
          : setHeadquarters((prevState) => ({
              ...prevState,
              inputValue: headquarters.suggestions[selectedIndex].station_name,
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
        const reqSuggestion = isState
          ? stationState.suggestions
          : headquarters.suggestions;
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
      }
    }
  };

  const validateInputs = (e: { target: { value: any; id: any } }) => {
    const { value, id } = e.target;

    setErr({ ...err, [id]: '' });

    const isState = stationState.data.some(
      (state: any) => state.state_name === value
    );
    const isHeadQuarter = headquarters.data.some(
      (hq: any) => hq.station_name === value
    );

    if (id === 'station_name') {
      if (!value) {
        setErr({ ...err, [id]: 'Station name is required' });
      } else if (!/[a-zA-Z]/.test(value)) {
        setErr({ ...err, [id]: 'Only Numbers not allowed' });
      } else if (!/^[a-zA-Z0-9\s_-]*$/.test(value)) {
        setErr({
          ...err,
          [id]: `Station name can contain alphanumeric characters, "-", "_", and spaces only`,
        });
      } else if (value.length > 100) {
        setErr({ ...err, [id]: 'Station name cannot exceeds 100 characters' });
      }
    } else if (id === 'station_state') {
      if (!value) {
        setErr({ ...err, [id]: 'State is required' });
      } else if (value && isState === false) {
        setErr({ ...err, [id]: 'Invalid State' });
      }
    } else if (id === 'station_pinCode') {
      if (!value) {
        setErr({ ...err, [id]: 'PIN code is required' });
      } else if (!!value && value.length !== 6) {
        setErr({ ...err, [id]: 'Length of PIN code must be exactly 6 digits' });
      } else if (!!value && value[0] === '0') {
        setErr({ ...err, [id]: "PIN code doesn't start from zero" });
      }
    } else if (id === 'station_headQuarter') {
      if (!value) {
        setErr({ ...err, [id]: 'State headquarter is required' });
      } else if (value && isHeadQuarter === false) {
        setErr({ ...err, [id]: 'Invalid State headquarter' });
      }
    }
  };

  const handleSubmit = async (values: object) => {
    const formData = station_id
      ? {
          ...values,
          station_id: station_id,
          station_state: stationState.inputValue,
          station_headQuarter: headquarters.inputValue,
        }
      : stationState.inputValue
        ? {
            ...values,
            station_state: stationState.inputValue,
            station_headQuarter: headquarters.inputValue,
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
            const sideField =
              e.currentTarget.getAttribute('data-side-field') || '';
            formik && formik.setFieldValue('type', sideField);
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
        initialValues={{
          station_name: data?.station_name || '',
          cst_sale: data?.cst_sale || '',
          station_state: data?.station_state || '',
          station_pinCode: data?.station_pinCode || '',
          station_headQuarter: data?.station_headQuarter || '',
        }}
        enableReinitialize={true}
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
                // onBlur={validateInputs}
                data-side-field='station_state'
                data-next-field='station_state'
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleKeyDown(e)
                }
                onBlur={(e: any) => {
                  validateInputs(e);
                  setHeadquarters((prevState) => ({
                    ...prevState,
                    data: [
                      ...prevState.data,
                      {
                        station_name: formik.values.station_name,
                        cst_sale: '',
                        station_state: '',
                        station_pinCode: '',
                        station_headQuarter: '',
                      },
                    ],
                  }));
                }}
              />
              <ErrorMessage
                name='station_name'
                component='div'
                className='error'
              />
              {!!err.station_name && (
                <span className='err'>{err.station_name}</span>
              )}
            </div>

            <div className='inputs'>
              <Field
                type='text'
                id='station_state'
                name='station_state'
                placeholder='Station state'
                value={stationState.inputValue}
                onBlur={validateInputs}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange(e, true)
                }
                disabled={isDelete && station_id}
                className={`input-field ${(formik.touched.station_state && formik.errors.station_state) || !!err.station_state ? 'error-field' : ''}`}
                data-side-field='station_pinCode'
                data-next-field='station_pinCode'
                data-prev-field='station_name'
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (stationState.suggestions.length !== 0) {
                    handleOnKeyDown(e, true);
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
              {!!err.station_state && (
                <span className='err'>{err.station_state}</span>
              )}
            </div>

            <div className='inputs'>
              <Field
                type='text'
                id='station_pinCode'
                name='station_pinCode'
                placeholder='Station pin code'
                maxLength={6}
                disabled={isDelete && station_id}
                className={`input-field ${(formik.touched.station_pinCode && formik.errors.station_pinCode) || !!err.station_pinCode ? 'error-field' : ''}`}
                onBlur={validateInputs}
                data-side-field='station_headQuarter'
                data-next-field='station_headQuarter'
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
              {!!err.station_pinCode && (
                <span className='err'>{err.station_pinCode}</span>
              )}
            </div>

            <div className='inputs hq_suggestion_input' ref={hqRef}>
              <Field
                type='text'
                id='station_headQuarter'
                name='station_headQuarter'
                placeholder='Station head quarter'
                value={headquarters.inputValue}
                onBlur={validateInputs}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, false)}
                disabled={isDelete && station_id}
                className={`input-field ${(formik.touched.station_headQuarter && formik.errors.station_headQuarter) || !!err.station_headQuarter ? 'error-field' : ''}`}
                data-side-field='cst_yes'
                data-next-field='cst_yes'
                data-prev-field='station_pinCode'
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (headquarters.suggestions.length !== 0) {
                    handleOnKeyDown(e,false);
                  }else{
                    handleKeyDown(e);
                  }
                }}
              />
                {!!headquarters.suggestions.length && (
                <ul className={'suggestion'} style={{ top : "67%" }}>
                  {headquarters.suggestions.map((hq:any, index: number) => (
                    <li
                      key={index}
                      onClick={() => {
                        setHeadquarters((prevState) => ({
                          ...prevState,
                          inputValue: hq.station_name,
                          suggestions: []
                        }))
                        document.getElementById('station_headQuarter')?.focus();
                      }}
                      className={`${index === selectedIndex ? 'selected' : 'suggestion_list'}`}
                      id={`suggestion_${index}`}
                    >
                      {hq.station_name}
                    </li>
                  ))}
                </ul>
              )}
              <ErrorMessage
                name='station_headQuarter'
                component='div'
                className='error'
              />
              {!!err.station_headQuarter && (
                <span className='err'>{err.station_headQuarter}</span>
              )}
            </div>

            <div
              className='inputs'
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
                  data-prev-field='station_headQuarter'
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
                  data-prev-field='station_headQuarter'
                  data-next-field='submit_button'
                  data-side-field='cst_yes'
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                    handleKeyDown(e, formik)
                  }
                />
                No
              </label>
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
                  id='submit_button'
                  className='account_add_button'
                  type='submit'
                  autoFocus
                  disabled={
                    !formik.isValid ||
                    formik.isSubmitting ||
                    !!err.station_state ||
                    !!err.station_pinCode ||
                    !!err.station_headQuarter
                  }
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

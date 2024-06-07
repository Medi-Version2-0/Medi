import { useEffect, useRef, useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikProps } from 'formik';
import { CreateStationProps, Option, StationFormData } from '../../interface/global';
import { Popup } from '../helpers/popup';
import CustomSelect from '../custom_select/CustomSelect';
// import '../stations/stations.css';

const errValue = {
  station_name: '',
  station_headQuarter: '',
};

export const CreateHeadquarters: React.FC<CreateStationProps> = ({
  togglePopup,
  data,
  handelFormSubmit,
  isDelete,
  deleteAcc,
}) => {
  const { station_id } = data;
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [hqOptions, setHqOptions] =  useState<Option[]>([]);
  const formikRef = useRef<FormikProps<StationFormData>>(null);

  const [headquarters, setHeadquarters] = useState<{
    inputValue: string,
    data: StationFormData[],
    suggestions: StationFormData[] | undefined
  }>({
    inputValue: '',
    data: [],
    suggestions: []
  });
  const [err, setErr] = useState(errValue);


  const electronAPI = (window as any).electronAPI;

  useEffect(() => {
    const focusTarget = inputRef.current && !isDelete
        ? inputRef.current
        : document.getElementById('cancel_button');
    focusTarget?.focus();
  }, []);

  const getHq = () => {
    const hqList=electronAPI.getAllStations('', 'station_name', '', '', '')
    setHeadquarters((prevState) => ({
      ...prevState,
      data: hqList,
    }));
    setHqOptions(
      hqList.map((hq: StationFormData) => ({
      value: hq.station_name,
      label: hq.station_name.toLowerCase(),
    })))
  };

  useEffect(() => {
    getHq();
    setHeadquarters((prevState) => ({
      ...prevState,
      inputValue: data?.station_headQuarter ? data.station_headQuarter : '',
    }));
  }, []);

  const handleHqChange = (option: Option | null) => {
    setHeadquarters((prevState) => ({
      ...prevState,
      inputValue: option?.value || '',
    }));
    setHeadquarters((prevState) => ({
      ...prevState,
      suggestions: headquarters.data.filter((item: StationFormData) =>
        item.station_name.toLowerCase().includes(option?.value?.toLowerCase() || '')
      ),
    }));
    formikRef.current?.setFieldValue('station_headQuarter',option?.value);
  };

  const validateInputs = (e: { target: { value: any; id: any } }) => {
    const { value, id } = e.target;

    setErr({ ...err, [id]: '' });
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
    } else if (id === 'station_headQuarter') {
      if (!value) {
        setErr({ ...err, [id]: 'State headquarter is required' });
      } else if (value && isHeadQuarter === false) {
        setErr({ ...err, [id]: 'Invalid State headquarter' });
      }
    }
  };

  const handleSubmit = async (values: object) => {
    console.log(">>>>>>>.vlaues hq : ",values);
    const formData = station_id
      ? {
          ...values,
          station_id: station_id,
          station_headQuarter: headquarters.inputValue,
        }
      : values;
    !station_id && document.getElementById('account_button')?.focus();
    handelFormSubmit(formData);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    formik?: FormikProps<StationFormData>
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
        innerRef={formikRef}
        initialValues={{
          station_name: data?.station_name || '',
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
                className={`input-field ${formik.touched.station_name && formik.errors.station_name ? 'border-red-600 ' : ''}`}
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
                        station_headQuarter: '',
                      },
                    ],
                  }));
                  setHqOptions((prevState) => [...prevState, {
                    value: formik.values.station_name,
                    label: formik.values.station_name.toLowerCase(),
                  }]);
                }}
              />
              <ErrorMessage
                name='station_name'
                component='div'
                className="text-red-600 font-xs ml-[1px]  "
              />
              {!!err.station_name && (
                <span className='err'>{err.station_name}</span>
              )}
            </div>

            <div className='inputs'>
              {hqOptions.length >0 && (
                <CustomSelect
                value={formik.values.station_headQuarter==='' ? null : { label: formik.values.station_headQuarter, value: formik.values.station_headQuarter }}
                onChange={handleHqChange}
                options={hqOptions}
                isSearchable={true}
                placeholder="Station headquarter"
                disableArrow={true}
                hidePlaceholder={false}
                className={`${(formik.touched.station_headQuarter && formik.errors.station_headQuarter) ? 'border-red-600 ' : ''}`}
                isDisabled={isDelete && station_id}
              />
              )}
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
                  id='submit_button'
                  className='account_add_button'
                  type='submit'
                  autoFocus
                  disabled={
                    !formik.isValid ||
                    formik.isSubmitting ||
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

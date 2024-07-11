import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Formik, Form, Field, FormikProps } from 'formik';
import {
  CreateStationProps,
  Option,
  StationFormData,
} from '../../interface/global';
import { Popup } from '../../components/popup/Popup';
import CustomSelect from '../../components/custom_select/CustomSelect';
import Button from '../../components/common/button/Button';
import * as Yup from 'yup';
import titleCase from '../../utilities/titleCase';
import { sendAPIRequest } from '../../helper/api';
import { useParams } from 'react-router-dom';

const useStations = () => {
  const { organizationId } = useParams();
  const [stations, setStations] = useState<StationFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStations = useCallback(async () => {
    try {
      const stationsData = await sendAPIRequest<any[]>(`/${organizationId}/station`);
      const transformedStations = stationsData.map((station) => ({
        ...station,
        state_code: station.State?.state_name,
      }));
      setStations(transformedStations);
    } catch (err) {
      setError('Failed to fetch stations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  return { stations, loading, error, fetchStations };
};

const useOptions = (stations: StationFormData[]) => {
  const hqOptions = useMemo(
    () =>
      stations.map((station) => ({
        value: station.station_id,
        label: titleCase(station.station_name),
      })),
    [stations]
  );

  const stationOptions = useMemo(
    () =>
      stations
        .filter((station) => station.station_headQuarter === null)
        .map((station) => ({
          value: titleCase(station.station_name),
          label: titleCase(station.station_name),
        })),
    [stations]
  );

  return { hqOptions, stationOptions };
};

const validationSchema = Yup.object({
  station_name: Yup.string()
    .required('Station name is required')
    .matches(/[a-zA-Z]/, 'Only Numbers not allowed')
    .matches(
      /^[a-zA-Z0-9\s_.-]*$/,
      'Station name can contain alphanumeric characters, "-", "_", and spaces only'
    )
    .max(100, 'Station name cannot exceed 100 characters'),
  station_headQuarter: Yup.string().required(
    'Station HeadQuarter is required.'
  ),
});

export const CreateHQ = ({
  togglePopup,
  data,
  handelFormSubmit,
  isDelete,
  deleteAcc,
  className,
}: CreateStationProps) => {
  const { station_id } = data;
  const { stations, loading, error } = useStations();
  const { hqOptions, stationOptions } = useOptions(stations);
  const formikRef = useRef<FormikProps<StationFormData>>(null);
  const [focused, setFocused] = useState('station_name');

  const handleFieldChange = useCallback((option: Option | null, id: string) => {
    formikRef.current?.setFieldValue(id, option?.value);
  }, []);

  const handleSubmit = useCallback(
    async (values: StationFormData) => {
      handelFormSubmit(values);
    },
    [handelFormSubmit]
  );

  const fetchType = useCallback(
    (isDelete: boolean, station_id?: string) => {
      const selectedHq = stations.find(
        (item: StationFormData) => item.station_id === station_id
      );
      if (!selectedHq) {
        return isDelete ? 'Delete' : 'Create';
      }
      return selectedHq.station_headQuarter !== ''
        ? isDelete
          ? 'Delete'
          : 'Update'
        : 'Create';
    },
    [stations]
  );

  useEffect(() => {
    if (isDelete) {
      document.getElementById('cancel_button')?.focus();
    }
  }, [isDelete]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Popup
      togglePopup={togglePopup}
      heading={`${fetchType(isDelete,station_id)} Headquarter`}
      className={className}
    >
      <Formik
        innerRef={formikRef}
        initialValues={{
          station_name: data?.station_name || '',
          station_headQuarter: data?.station_headQuarter || '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form className='flex flex-col gap-3 min-w-[18rem] items-center px-4 '>
            <div className='flex flex-col w-full '>
              <Field name='station_name'>
                {() => (
                  <CustomSelect
                    label='Station Name'
                    id='station_name'
                    name='station_name'
                    value={
                      formik.values.station_name === ''
                        ? null
                        : {
                            label: formik.values.station_name,
                            value: formik.values.station_name,
                          }
                    }
                    onChange={handleFieldChange}
                    options={stationOptions}
                    isSearchable={true}
                    disableArrow={true}
                    hidePlaceholder={false}
                    className='!h-6 rounded-sm text-xs'
                    isFocused={focused === 'station_name'}
                    error={formik.errors.station_name}
                    isDisabled={
                      fetchType(isDelete, station_id) === 'Delete' ||
                      fetchType(isDelete, station_id) === 'Update'
                    }
                    isTouched={formik.touched.station_name}
                    onBlur={() => {
                      formik.setFieldTouched('station_name', true);
                      setFocused('');
                    }}
                    noOptionsMsg='No station found, create one...'
                    onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                      const dropdown = document.querySelector(
                        '.custom-select__menu'
                      );
                      if (e.key === 'Enter' || e.key === 'Tab') {
                        if (!dropdown) {
                          e.preventDefault();
                        }
                        setFocused('station_headQuarter');
                      }
                      if (e.shiftKey && e.key === 'Tab') {
                        if (!dropdown) {
                          e.preventDefault();
                        }
                        setFocused('station_name');
                      }
                    }}
                    showErrorTooltip={true}
                  />
                )}
              </Field>
            </div>
            <div className='flex flex-col w-full '>
              <Field name='station_headQuarter'>
                {() => (
                  <CustomSelect
                    label='Headquarter'
                    id='station_headQuarter'
                    name='station_headQuarter'
                    value={
                      formik.values.station_headQuarter === ''
                        ? null
                        : {
                            label:
                              hqOptions?.find(
                                (e) =>
                                  e.value === formik.values.station_headQuarter
                              )?.label || '',
                            value: formik.values.station_headQuarter,
                          }
                    }
                    onChange={handleFieldChange}
                    options={hqOptions}
                    isSearchable={true}
                    disableArrow={true}
                    hidePlaceholder={false}
                    className='!h-6 rounded-sm text-xs'
                    isFocused={focused === 'station_headQuarter'}
                    error={formik.errors.station_headQuarter}
                    isDisabled={isDelete && station_id}
                    isTouched={formik.touched.station_headQuarter}
                    onBlur={() => {
                      formik.setFieldTouched('station_headQuarter', true);
                      setFocused('');
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                      const dropdown = document.querySelector(
                        '.custom-select__menu'
                      );
                      if (e.key === 'Enter' || e.key === 'Tab') {
                        if (!dropdown) {
                          e.preventDefault();
                        }
                        document
                          .getElementById(
                            `${e.key === 'Tab' ? 'cancel_button' : 'submit_button'}`
                          )
                          ?.focus();
                      }
                      if (e.shiftKey && e.key === 'Tab') {
                        if (!dropdown) {
                          e.preventDefault();
                        }
                        setFocused('station_name');
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
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    togglePopup(false);
                  }
                  if ((e.shiftKey && e.key === 'Tab') || e.key === 'ArrowUp') {
                    setFocused('station_headQuarter');
                    e.preventDefault();
                  }
                }}
              >
                Cancel
              </Button>
              {isDelete ? (
                <Button
                  id='del_button'
                  type='fill'
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
                  autoFocus={true}
                  handleOnKeyDown={(e) => {
                    if (e.key === 'Tab') {
                      setFocused('station_name');
                      e.preventDefault();
                    }
                    if (
                      e.key === 'ArrowUp' ||
                      (e.shiftKey && e.key === 'Tab')
                    ) {
                      document.getElementById('cancel_button')?.focus();
                      e.preventDefault();
                    }
                  }}
                >
                  {fetchType(isDelete, station_id) === 'Update'
                    ? 'Update'
                    : 'Add'}
                </Button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </Popup>
  );
};

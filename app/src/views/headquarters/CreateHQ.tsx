import { useEffect, useRef, useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikProps } from 'formik';
import { CreateStationProps, Option, StationFormData } from '../../interface/global';
import { Popup } from '../../components/popup/Popup';
import CustomSelect from '../../components/custom_select/CustomSelect';
import Button from '../../components/common/button/Button';
import * as Yup from 'yup';
import onKeyDown from '../../utilities/formKeyDown';

export const CreateHQ: React.FC<CreateStationProps> = ({
  togglePopup,
  data,
  handelFormSubmit,
  isDelete,
  deleteAcc,
}) => {
  const { station_id } = data;
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [hqOptions, setHqOptions] = useState<Option[]>([]);
  const formikRef = useRef<FormikProps<StationFormData>>(null);
  const [focused, setFocused] = useState("");
  const electronAPI = (window as any).electronAPI;

  const validationSchema = Yup.object({
    station_name: Yup.string()
      .required('Station name is required')
      .matches(/[a-zA-Z]/, 'Only Numbers not allowed')
      .matches(
        /^[a-zA-Z0-9\s_.-]*$/,
        'Station name can contain alphanumeric characters, "-", "_", and spaces only'
      )
      .max(100, 'Station name cannot exceeds 100 characters'),
    station_headQuarter: Yup.string().required('Station HeadQuarter is required.')

  });

  useEffect(() => {
    const focusTarget = inputRef.current && !isDelete
      ? inputRef.current
      : document.getElementById('cancel_button');
    focusTarget?.focus();
  }, []);

  const getHq = () => {
    const hqList = electronAPI.getAllStations('', 'station_name', '', '', '');
    setHqOptions(
      hqList.map((hq: StationFormData) => ({
        value: hq.station_name,
        label: hq.station_name,
      })))
  };

  useEffect(() => {
    getHq();
  }, []);

  const handleHQChange = (option: Option | null) => {
    formikRef.current?.setFieldValue('station_headQuarter', option?.value);
  };

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
                data-side-field='station_headQuarter'
                data-next-field='station_headQuarter'
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
              {hqOptions.length > 0 && (
                <Field name="station_headQuarter">
                  {() => (
                    <CustomSelect
                      id="station_headQuarter"
                      name='station_headQuarter'
                      value={formik.values.station_headQuarter === '' ? null : { label: formik.values.station_headQuarter, value: formik.values.station_headQuarter }}
                      onChange={handleHQChange}
                      options={hqOptions}
                      isSearchable={true}
                      placeholder="Station HeadQuarter"
                      disableArrow={true}
                      hidePlaceholder={false}
                      className="!h-12"
                      isFocused={focused === "station_headQuarter"}
                      error={formik.errors.station_headQuarter}
                      isDisabled={isDelete && station_id}
                      isTouched={formik.touched.station_headQuarter}
                      onBlur={() => { formik.setFieldTouched('station_headQuarter', true); setFocused(""); }}
                    />
                  )}
                </Field>
              )}
              <ErrorMessage name='station_headQuarter' component='div' className='text-red-600 font-xs ml-[1px]' />
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

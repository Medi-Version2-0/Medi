import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { CreateHeadQuarterProps, StationFormData, StationFormInfoType } from '../../interface/global';
import { Popup } from '../../components/popup/Popup';
import titleCase from '../../utilities/titleCase';
import { headQuarterValidationSchema } from './validation_schema';
import { PopupFormContainer } from '../../components/common/commonPopupForm';
import { CommonBtn } from '../../components/common/button/CommonFormButtons';

export const CreateHQ = ({ togglePopup, data, handelFormSubmit, isDelete, deleteAcc, className, stations }: CreateHeadQuarterProps) => {
  const [focused, setFocused] = useState('');

  const HQFormInfo: StationFormInfoType = useFormik({
    initialValues: {
      station_id: data?.station_id || '',
      station_headQuarter: data?.station_headQuarter || '',
    },
    validationSchema: headQuarterValidationSchema,
    onSubmit: async (values: any) => {
      handelFormSubmit(values);
    },
  })

  useEffect(() => {
    const focusTarget = fetchType(isDelete, data.station_id) === 'Create' ? 'station_id' : (fetchType(isDelete, data.station_id) === 'Update' ? 'station_headQuarter' : 'hq_cancelBtn');
    document.getElementById(focusTarget)?.focus();
    setFocused(focusTarget);
  }, []);

  const hqOptions = stations!.map((station) => ({ value: station.station_id, label: titleCase(station.station_name) }));

  const stationOptions = stations!.filter((station) => station.station_headQuarter === null).map((station) => ({
    value: station.station_id,
    label: titleCase(station.station_name),
  }));

  const fetchType = (isDelete: boolean, station_id?: string) => {
    const selectedHq = stations.find((station: StationFormData) => station.station_id === station_id);
    if(!selectedHq) return isDelete ? 'Delete' : 'Create';
    return selectedHq.station_headQuarter !== '' ? (isDelete ? 'Delete' : 'Update') : 'Create';
  }

  const headquartersFields = [
    { id: 'station_id', name: 'station_id', label: 'Station Name', type: 'select', disabled: (fetchType(isDelete, data.station_id) === 'Delete' || fetchType(isDelete, data.station_id) === 'Update'), options: data.station_id !== '' ? hqOptions : stationOptions, isSearchable: true, disableArrow: true, hidePlaceholder: false, nextField: 'station_headQuarter', prevField: 'hq_submitBtn'},
    { id: 'station_headQuarter', name: 'station_headQuarter', label: 'Headquarter', type: 'select', disabled: isDelete && data.station_id, options: hqOptions, isSearchable: true, disableArrow: true, hidePlaceholder: false, nextField: 'hq_submitBtn', prevField: 'station_id', sideField: 'hq_submitBtn' },
  ]

  return (
    <Popup heading={`${fetchType(isDelete, data.station_id)} Headquarter`} className={className}>
      <PopupFormContainer fields={headquartersFields} formik={HQFormInfo} setFocused={setFocused} focused={focused} />
      <div className='flex justify-between p-4 w-full'>
        <CommonBtn variant='cancel' component='hq' focused={focused} setFocused={setFocused} handleOnClick={() => togglePopup(false)} nextField={`${isDelete ? 'hq_deleteBtn' : 'hq_submitBtn'}`} prevField={'station_headQuarter'} > Cancel </CommonBtn>
        {isDelete ?
          <CommonBtn variant='delete' component='hq' focused={focused} setFocused={setFocused} handleOnClick={() => data.station_id && deleteAcc(data.station_id)} nextField={`hq_cancelBtn`} prevField={'hq_cancelBtn'} > Delete </CommonBtn>
          : <CommonBtn variant='submit' component='hq' focused={focused} setFocused={setFocused} handleOnClick={() => HQFormInfo.handleSubmit()} disable={!HQFormInfo.isValid || HQFormInfo.isSubmitting} nextField={`station_id`} prevField={'hq_cancelBtn'} > {data.station_id ? 'Update' : 'Add'} </CommonBtn>
        }
      </div>
    </Popup>
  );
};

import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { CreateHeadQuarterProps, StationFormData, StationFormInfoType } from '../../interface/global';
import { Popup } from '../../components/popup/Popup';
import titleCase from '../../utilities/titleCase';
import { headQuarterValidationSchema } from './validation_schema';
import { PopupFormContainer } from '../../components/common/commonPopupForm';
import { CommonBtn } from '../../components/common/button/CommonFormButtons';

export const CreateHQ = ({ togglePopup, data, handleConfirmPopup, isDelete, handleDeleteFromForm, className, stations, focusChain=[] }: CreateHeadQuarterProps) => {
  const [focused, setFocused] = useState('');

  const HQFormInfo: StationFormInfoType = useFormik({
    initialValues: {
      station_id: data?.station_id || '',
      station_headQuarter: data?.station_headQuarter || '',
    },
    validationSchema: headQuarterValidationSchema,
    onSubmit: async (values: any) => {
      handleConfirmPopup(values);
    },
  })

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
    { id: 'station_id', name: 'station_id', label: 'Station Name', type: 'select', disabled: (fetchType(isDelete, data.station_id) === 'Delete' || fetchType(isDelete, data.station_id) === 'Update'), options: data.station_id !== '' ? hqOptions : stationOptions, isSearchable: true, disableArrow: true, hidePlaceholder: false},
    { id: 'station_headQuarter', name: 'station_headQuarter', label: 'Headquarter', type: 'select', disabled: isDelete && data.station_id, options: hqOptions, isSearchable: true, disableArrow: true, hidePlaceholder: false},
  ]

  return (
    <Popup id='create_hq' heading={`${fetchType(isDelete, data.station_id)} Headquarter`} focusChain={focusChain} className={className}>
      <PopupFormContainer fields={headquartersFields} formik={HQFormInfo} setFocused={setFocused} focused={focused} />
      <div className='flex justify-between p-4 w-full'>
        <CommonBtn variant='cancel' component='hq' handleOnClick={() => togglePopup(false)} > Cancel </CommonBtn>
        {isDelete ?
          <CommonBtn id='delete' variant='delete' component='hq' handleOnClick={handleDeleteFromForm} > Delete </CommonBtn>
          : <CommonBtn id='save' variant='submit' component='hq' handleOnClick={() => HQFormInfo.handleSubmit()} disable={!HQFormInfo.isValid || HQFormInfo.isSubmitting} > {data.station_id ? 'Update' : 'Add'} </CommonBtn>
        }
      </div>
    </Popup>
  );
};

import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { CreateStationProps, StationFormInfoType } from '../../interface/global';
import { Popup } from '../../components/popup/Popup';
import titleCase from '../../utilities/titleCase';
import { stationValidationSchema } from './validation_schema';
import { PopupFormContainer } from '../../components/common/commonPopupForm';
import { CommonBtn } from '../../components/common/button/CommonFormButtons';

export const CreateStation = ({ togglePopup, data, handelFormSubmit, isDelete, deleteAcc, className, states , focusChain=[] }: CreateStationProps) => {
  const { station_id } = data;
  const [focused, setFocused] = useState('');

  const StationFormInfo: StationFormInfoType = useFormik({
    initialValues: {
      station_name: data?.station_name || '',
      state_code: data?.state_code || '',
      station_pinCode: data?.station_pinCode || '',
    },
    validationSchema: stationValidationSchema,
    onSubmit: async (values: any) => {
      const formData = { ...values, ...(station_id && { station_id }) };
      !station_id && document.getElementById('account_button')?.focus();
      handelFormSubmit(formData);
    },
  })

  const stateOptions = states!.map((state) => ({
    value: state.state_code,
    label: titleCase(state.state_name),
  }))

  // useEffect(() => {
  //   const focusTarget = !isDelete ? document.getElementById('station_name') : document.getElementById('station_cancelBtn');
  //   focusTarget?.focus();
  // }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const filteredValue = value.replace(/[^0-9]/g, '');
    if (filteredValue.length <= 6) {
      StationFormInfo.setFieldValue(e.target.name, filteredValue);
    } else {
      StationFormInfo.setFieldValue(e.target.name, filteredValue.slice(0, 6));
    }
  };

  const stationFormFields = [
    { id: 'station_name', name: 'station_name', label: 'Station Name', type: 'text', disabled: isDelete && station_id, nextField: 'state_code', prevField: 'station_name', sideField: 'state_code' },
    { id: 'state_code', name: 'state_code', label: 'State', type: 'select', disabled: isDelete && station_id, options: stateOptions, isSearchable: true, disableArrow: true, hidePlaceholder: false, nextField: 'station_pinCode', prevField: 'station_name' },
    { id: 'station_pinCode', name: 'station_pinCode', label: 'Pin Code', type: 'text', disabled: isDelete && station_id, onChange: (e: any) => handleChange(e), nextField: 'station_submitBtn', prevField: 'state_code' },
  ];

  return (
    <Popup id='create_station' focusChain={focusChain} heading={station_id && isDelete ? 'Delete Station' : station_id ? 'Update Station' : 'Create Station'} className={className}>
      <PopupFormContainer fields={stationFormFields} formik={StationFormInfo} setFocused={setFocused} focused={focused} />
      <div className='flex justify-between p-4 w-full'>
        <CommonBtn variant='cancel' component='station' focused={focused} setFocused={setFocused} handleOnClick={() => togglePopup(false)} > Cancel </CommonBtn>
        {isDelete ?
          <CommonBtn id='delete' variant='delete' component='station' focused={focused} setFocused={setFocused} handleOnClick={() => station_id && deleteAcc(station_id)} > Delete </CommonBtn>
          : <CommonBtn id='save' variant='submit' component='station' focused={focused} setFocused={setFocused} handleOnClick={() => StationFormInfo.handleSubmit()} disable={!StationFormInfo.isValid || StationFormInfo.isSubmitting} > {station_id ? 'Update' : 'Add'} </CommonBtn>
        }
      </div>
    </Popup>
  );
};

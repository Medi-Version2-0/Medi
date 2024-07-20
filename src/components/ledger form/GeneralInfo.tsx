import React, { useEffect, useState } from 'react';
import { Option } from '../../interface/global';
import CustomSelect from '../custom_select/CustomSelect';
import FormikInputField from '../common/FormikInputField';
import titleCase from '../../utilities/titleCase';
import { sendAPIRequest } from '../../helper/api';
import { useParams } from 'react-router-dom';
import onKeyDown from '../../utilities/formKeyDown';

interface GeneralInfoProps {
  onValueChange?: any;
  formik?: any;
  selectedGroup: string;
  groupOptions: Option[];
}

export const GeneralInfo = ({
  onValueChange,
  formik,
  selectedGroup,
  groupOptions,
}: GeneralInfoProps) => {
  const { organizationId } = useParams();
  const [stationData, setStationData] = useState<any[]>([]);
  const [stationOptions, setStationOptions] = useState<Option[]>([]);
  const isSUNDRY =
    selectedGroup.toUpperCase() === 'SUNDRY CREDITORS' ||
    selectedGroup.toUpperCase() === 'SUNDRY DEBTORS' ||
    selectedGroup.toUpperCase() === 'GENERAL GROUP' ||
    selectedGroup.toUpperCase() === 'DISTRIBUTORS, C & F';
  const [focused, setFocused] = useState('');
  const fetchAllData = async () => {
    const stationList = await sendAPIRequest<{ station_id: number; station_name: string }[]>(`/${organizationId}/station`);
    setStationData(stationList);

    setStationOptions(
      stationList.map((station: any) => ({
        value: station.station_id,
        label: titleCase(station.station_name),
      }))
    );

  };


  useEffect(() => {
    fetchAllData();
    document.getElementById('partyName')?.focus();
  }, []);

  const handleFieldChange = (option: Option | null, id: string) => {
    if (id === 'accountGroup') {
      onValueChange(option?.label);
      const groupId = groupOptions.find(
        (e) => e.label === option?.value
      )?.value;
      formik.setFieldValue('accountCode', groupId);
      formik.setFieldValue(id, option?.value);
    }
    if (id === 'stationName') {
      formik.setFieldValue('station_id', option?.value);
    }

    formik.setFieldValue(id, option?.value);
  };

  useEffect(() => {
    if (formik.values.stationName) {
      const matchingStation = stationData.find(
        (station) => formik.values.station_id === station.station_id
      );
      const state = matchingStation ? matchingStation.station_state : '';
      const pinCode = matchingStation ? matchingStation.station_pinCode : ' ';
      formik.setFieldValue('state', state);
      formik.setFieldValue('pinCode', pinCode);
    }
  }, [formik.values.stationName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const filteredValue = value.replace(/[^0-9]/g, '');
    if (filteredValue.length <= 6) {
      formik.setFieldValue(e.target.name, filteredValue);
    } else {
      formik.setFieldValue(e.target.name, filteredValue.slice(0, 6));
    }
  };

  const isSpecialGroup = selectedGroup?.toUpperCase() === 'SUNDRY CREDITORS' ||
  selectedGroup?.toUpperCase() === 'SUNDRY DEBTORS' ||
  selectedGroup?.toUpperCase() === 'GENERAL GROUP' ||
  selectedGroup?.toUpperCase() === 'DISTRIBUTORS, C & F';

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,

  ) => {
    onKeyDown({
      e,

      focusedSetter: (field: string) => {

        setFocused(field);
      },
    });

  };

  return (
    <div className='relative border w-3/5 h-full pt-4 border-solid border-gray-400'>
      <div className='absolute top-[-14px] left-2  px-2 w-max bg-[#f3f3f3]'>
        General Info
      </div>
      <div className='flex flex-col gap-2 w-full px-4 py-2 text-xs leading-3 text-gray-600'>
        <FormikInputField
          isPopupOpen={false}
          label='Party Name'
          id='partyName'
          name='partyName'
          formik={formik}
          className='!mb-0'
          labelClassName='min-w-[90px] '
          isRequired={true}
          nextField='accountGroup'
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
            handleKeyDown(e)
          }
          showErrorTooltip={formik.touched.partyName && formik.errors.partyName}
        />
        <div className='flex justify-between m-[1px] w-full items-center'>
          <div className='w-[50%]'>
            {groupOptions.length > 0 && (
              <CustomSelect
                isPopupOpen={false}
                label='Account Group'
                id='accountGroup'
                labelClass='min-w-[90px]'
                value={
                  formik.values.accountGroup === ''
                    ? null
                    : {
                        label: groupOptions.find(
                          (e) => e.value === formik.values.accountGroup
                        )?.label,
                        value: formik.values.accountGroup,
                      }
                }
                onChange={handleFieldChange}
                options={groupOptions}
                isSearchable={true}
                placeholder='Account Group'
                isRequired={true}
                isFocused={focused === 'accountGroup'}
                disableArrow={true}
                hidePlaceholder={false}
                className='!h-6 rounded-sm'
                prevField='partyName'
                // nextField='stationName'
                onBlur={() => {
                  formik.setFieldTouched('accountGroup', true);
                  setFocused('');
                }}
                onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                  const dropdown = document.querySelector(
                    '.custom-select__menu'
                  );
                  if (e.key === 'Enter' && selectedGroup) {
                    !dropdown && e.preventDefault();
                    console.log('isSpecialGroup:', isSpecialGroup,selectedGroup);
                    const nextFieldId = isSpecialGroup ? 'stationName' : 'stateInout';
                    console.log('Next field to focus:', nextFieldId);
                    document.getElementById(nextFieldId)?.focus();                    
                    setFocused(nextFieldId);
                  }
                }}
                error={formik.errors.accountGroup}
                isTouched={formik.touched.accountGroup}
                showErrorTooltip={true}
              />
            )}
          </div>
          {isSUNDRY && (
            <div className='flex items-center w-[40%]'>
              <CustomSelect
                isPopupOpen={false}
                label='Station'
                id='stationName'
                labelClass='items-center w-1/3'
                value={
                  formik.values.station_id === ''
                    ? null
                    : {
                        value: formik.values.station_id,
                        label: stationOptions.find(
                          (e) => e.value === formik.values.station_id
                        )?.label,
                      }
                }
                onChange={handleFieldChange}
                options={stationOptions}
                isSearchable={true}
                placeholder='Station Name'
                disableArrow={true}
                hidePlaceholder={false}
                className='!h-6 rounded-sm'
                isRequired={false}
                isFocused={focused === 'stationName'}
                error={formik.errors.stationName}
                isTouched={formik.touched.stationName}
                  onBlur={() => {
                    formik.setFieldTouched('stationName', true);
                    setFocused('');
                  }}
                  onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                    const dropdown = document.querySelector(
                      '.custom-select__menu'
                    );
                    if (e.key === 'Enter') {
                      !dropdown && e.preventDefault();
                      document.getElementById('address1')?.focus();
                      setFocused('address1')
                    }
                  }}
                showErrorTooltip={true}
                noOptionsMsg='No station found,create one...'
              />
            </div>
          )}
        </div>
        {isSUNDRY && (
          <div className='flex items-center m-[1px]'>
            <label htmlFor='address1' className='min-w-[90px]'>
              Address
            </label>
            <div className='flex flex-col gap-[0.15rem] w-full'>
              <FormikInputField
                isPopupOpen={false}
                label=''
                id='address1'
                name='address1'
                formik={formik}
                placeholder='Address 1'
                className='!mb-0'
                prevField='stationName'
                nextField='address2'
              />
              <FormikInputField
                isPopupOpen={false}
                label=''
                id='address2'
                name='address2'
                formik={formik}
                placeholder='Address 2'
                className='!mb-0'
                prevField='address1'
                nextField='address3'
              />
              <FormikInputField
                isPopupOpen={false}
                label=''
                id='address3'
                name='address3'
                formik={formik}
                placeholder='Address 3'
                className='!mb-0'
                prevField='address2'
                nextField='pinCode'
              />
            </div>
          </div>
        )}

        {isSUNDRY && (
          <div className='flex flex-row justify-between m-[1px] w-full items-center'>
            <div className='w-[50.1%]'>
              <FormikInputField
                isPopupOpen={false}
                label='Pincode'
                id='pinCode'
                name='pinCode'
                placeholder='Pin Code'
                formik={formik}
                isRequired={false}
                labelClassName='min-w-[90px]'
                inputClassName='w-[35%]'
                showErrorTooltip={true}
                maxLength={6}
                className=''
                isDisabled={false}
                onChange={handleChange}
                prevField='address3'
                nextField={
                  isSpecialGroup
                    ? 'transport'
                    : 'excessRate'
                }
              />
            </div>
            {isSpecialGroup && (
                <div className='flex w-[40%]'>
                  <FormikInputField
                    isPopupOpen={false}
                    label='Transport'
                    id='transport'
                    name='transport'
                    inputClassName='w-5/12'
                    labelClassName='w-1/2'
                    formik={formik}
                    prevField='pinCode'
                    nextField='mailTo'
                  />
                </div>
            )}
          </div>
        )}
        <div className='flex flex-row justify-between w-full items-center'>
        {isSpecialGroup && (
            <div className='w-[50.3%]'>
              <FormikInputField
                isPopupOpen={false}
                label='Email to'
                id='mailTo'
                name='mailTo'
                isTitleCase={false}
                formik={formik}
                showErrorTooltip={formik.touched.mailTo && formik.errors.mailTo}
                labelClassName='min-w-[90px]'
                inputClassName='w-[50%]'
                prevField='transport'
                nextField='stateInout'
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleKeyDown(e)
                }
              />
            </div>
        )}
        <div className={`flex items-center ${isSpecialGroup ? 'w-[40%]' : 'w-[50%]'}`}>
          <CustomSelect
            isPopupOpen={false}
            label='State In Out'
            id='stateInout'
            labelClass={`${isSpecialGroup ? 'items-center w-1/2 ' : 'min-w-[90px]'}`}
            value={
              formik.values.stateInout === ''
                ? null
                : {
                    label: formik.values.stateInout,
                    value: formik.values.stateInout,
                  }
            }
            onChange={handleFieldChange}
            options={[
              { value: 'Within State', label: 'Within State' },
              { value: 'Out Of State', label: 'Out Of State' },
            ]}
            isSearchable={false}
            isFocused={focused === 'stateInout'}
            placeholder='Select an option'
            disableArrow={false}
            hidePlaceholder={false}
            className='!h-6 rounded-sm'
            onBlur={() => {
              formik.setFieldTouched('stateInout', true);
              setFocused('');
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
              const dropdown = document.querySelector('.custom-select__menu');
              if (e.key === 'Enter') {
                !dropdown && e.preventDefault();
                document.getElementById('openingBal')?.focus();
              }
            }}
          />
        </div>
        </div>
      </div>
    </div>
  );
};

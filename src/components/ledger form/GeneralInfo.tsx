import React, { useEffect, useState } from 'react';
import { Option, StationFormData } from '../../interface/global';
import CustomSelect from '../custom_select/CustomSelect';
import FormikInputField from '../common/FormikInputField';
import titleCase from '../../utilities/titleCase';
import onKeyDown from '../../utilities/formKeyDown';
import { useControls } from '../../ControlRoomContext';
import { useUser } from '../../UserContext';
import useApi from '../../hooks/useApi';
import NumberInput from '../common/numberInput/numberInput';

interface GeneralInfoProps {
  onValueChange?: any;
  formik?: any;
  selectedGroup: string;
  groupOptions: Option[];
  stationData: any[];
}

export const GeneralInfo = ({
  onValueChange,
  formik,
  selectedGroup,
  groupOptions,
  stationData,
}: GeneralInfoProps) => {
  const {selectedCompany} = useUser();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [stationOptions, setStationOptions] = useState<Option[]>([]);
  const isSUNDRY =
    selectedGroup.toUpperCase() === 'SUNDRY CREDITORS' ||
    selectedGroup.toUpperCase() === 'SUNDRY DEBTORS' ||
    selectedGroup.toUpperCase() === 'GENERAL GROUP' ||
    selectedGroup.toUpperCase() === 'DISTRIBUTORS, C & F';
  const [focused, setFocused] = useState('');
  const { controlRoomSettings } = useControls();
  const { sendAPIRequest } = useApi();


  useEffect(() => {
    setStationOptions(
      stationData.map((station: StationFormData) => ({
        value: station.station_id,
        label: titleCase(station.station_name),
      }))
    );
  }, [stationData])

  useEffect(() => {
    async function getAndSetOrganizations() {
      try{
        const allOrganizations = await sendAPIRequest('/organization');
        setOrganizations(allOrganizations);
      }catch(err) {
        console.log("Organizations could not be retrieved in GeneralInfo")
      }
    }

    getAndSetOrganizations();
  },[]);

  useEffect(() => {
    document.getElementById('partyName')?.focus();
  }, []);

  const handleFieldChange = (option: Option | null, id: string) => {
    if (id === 'accountGroup') {
      // onValueChange(option?.label);
      const groupId = groupOptions.find(
        (e:Option) => e.label === option?.value
      )?.value;
      formik.setFieldValue('accountCode', groupId);
      formik.setFieldValue(id, option?.value);
    }
    if (id === 'stationName') {
      formik.setFieldValue('station_id', option?.value);
      const currOrganization = organizations.find((o:any) => o.id === selectedCompany)
      const selectedState = stationData.find((s:any)=> s.station_id === option?.value)
      if (currOrganization.stateId !== selectedState.state_code){
        formik.setFieldValue('stateInout', 'Out Of State');
      }else{
        formik.setFieldValue('stateInout', 'Within State');
      }
    }
    if (id === 'salesPriceList') {
      formik.setFieldValue(id, option?.label);
    }

    formik.setFieldValue(id, option?.value);
  };

  useEffect(() => {
    if (formik.values.stationName) {
      const matchingStation = stationData.find(
        (station:StationFormData) => formik.values.station_id === station.station_id
      );
      const state = matchingStation ? matchingStation.station_state : '';
      const pinCode = matchingStation ? matchingStation.station_pinCode : ' ';
      formik.setFieldValue('state', state);
      formik.setFieldValue('pinCode', String(pinCode));
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
          isUpperCase={true}
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
                labelClass='min-w-[90px] !inline-block'
                value={
                  formik.values.accountGroup === ''
                    ? null
                    : {
                        label: groupOptions.find(
                          (e: Option) => e.value === formik.values.accountGroup
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
                disableArrow={false}
                hidePlaceholder={false}
                className='!h-6 rounded-sm'
                prevField='partyName'
                onBlur={() => {
                  formik.setFieldTouched('accountGroup', true);
                  setFocused('');
                }}
                onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                  const dropdown = document.querySelector(
                    '.custom-select__menu'
                  );
                  if (e.key === 'Enter' && selectedGroup) {
                    if(!dropdown){
                      e.preventDefault();
                      const nextFieldId = isSUNDRY ? 'stationName' : 'stateInout';
                      document.getElementById(nextFieldId)?.focus();
                      setFocused(nextFieldId);
                    }}
                }}
                error={formik.errors.accountGroup}
                isTouched={formik.touched.accountGroup}
                showErrorTooltip={true}
              />
            )}
          </div>
          {isSUNDRY && (
            <div className="flex items-center w-[40%]">
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
                disableArrow={false}
                hidePlaceholder={false}
                className='!h-6 rounded-sm'
                isRequired={isSUNDRY ? true : false}
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
                    const nextFieldId = 'address1';
                    document.getElementById(nextFieldId)?.focus();
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
                isUpperCase={true}
                formik={formik}
                placeholder='Address 1'
                className='!mb-0'
                prevField='stationName'
                nextField='address2'
                onKeyDown={(e) => {
                  if (e.key === 'Tab' && e.shiftKey) {
                    e.preventDefault();
                    setFocused('stationName');
                  }
                }}
              />
              <FormikInputField
                isPopupOpen={false}
                label=''
                id='address2'
                isUpperCase={true}
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
                isUpperCase={true}
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
                  isSUNDRY
                    ? 'transport'
                    : 'excessRate'
                }
              />
            </div>
            {isSUNDRY && (
                <div className='flex w-[40%]'>
                  <FormikInputField
                    isPopupOpen={false}
                    label='Transport'
                    id='transport'
                    isUpperCase={true}
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
        <div className='flex flex-row justify-between m-[1px] w-full items-center'>
          {isSUNDRY && (
              <FormikInputField
                isPopupOpen={false}
                label='Email to'
                id='mailTo'
                name='mailTo'
                placeholder='abc@example.com'
                isUpperCase={false}
                className='!w-[50%]'
                formik={formik}
                showErrorTooltip={formik.touched.mailTo && formik.errors.mailTo}
                labelClassName='min-w-[90px]'
                inputClassName='w-[50%]'
                prevField='transport'
                nextField='openingBal'  // stateInout is disabled so nextfield is openingBal
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleKeyDown(e)
                }
              />
        )}
            <div className={`${isSUNDRY ? 'w-[40%]': '!min-w-[50%]'}`}>
          <CustomSelect
            isPopupOpen={false}
            label='State In Out'
            id='stateInout'
            isRequired={true}
            labelClass={`${isSUNDRY ? 'w-1/3' : 'min-w-[90px]'} !inline-block`}
            value={
              {
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
            isDisabled={isSUNDRY}
            placeholder='Select an option'
            disableArrow={false}
            hidePlaceholder={false}
            className='!h-6 rounded-sm w-full'
            onBlur={() => {
              formik.setFieldTouched('stateInout', true);
              setFocused('');
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
              const dropdown = document.querySelector('.custom-select__menu');
              if (e.key === 'Enter') {
                !dropdown && e.preventDefault();
                const nextFieldId = isSUNDRY && controlRoomSettings.multiPriceList ? 'salesPriceList' : 'openingBal';
                document.getElementById(nextFieldId)?.focus();
                setFocused(nextFieldId);
              }
            }}
          />
          </div>
        </div>
        <div className='flex justify-between'>
          {isSUNDRY &&  controlRoomSettings.multiPriceList && (
              <div className='w-[50%]'>
                <CustomSelect
                  isPopupOpen={false}
                  label='Select Price List'
                  id='salesPriceList'
                  labelClass='items-center min-w-[90px]'
                  placeholder='Sales Price'
                  value={
                    formik.values.salesPriceList === ''
                      ? null
                      : {
                          value: formik.values.salesPriceList,
                          label: `Sales Price ${formik.values.salesPriceList}`
                        }
                  }
                  onChange={(option) => handleFieldChange(option, 'salesPriceList')}
                  disableArrow={false}
                  options={
                    controlRoomSettings.salesPriceLimit < 1 
                      ? [{ value: 1, label: 'Sales Price' }]
                      : Array.from({ length: controlRoomSettings.salesPriceLimit }, (_, i) => ({
                          value: i + 1,
                          label: `Sales Price ${i + 1}`
                        }))
                  }
                  isSearchable={true}
                  hidePlaceholder={false}
                  className='!h-6 rounded-sm'
                  isRequired={false}
                  isFocused={focused === 'salesPriceList'}
                  error={formik.errors.salesPriceList}
                  isTouched={formik.touched.salesPriceList}
                    onBlur={() => {
                      formik.setFieldTouched('salesPriceList', true);
                      setFocused('');
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                      const dropdown = document.querySelector(
                        '.custom-select__menu'
                      );
                      if (e.key === 'Enter') {
                        !dropdown && e.preventDefault();
                        document.getElementById('openingBal')?.focus();
                        setFocused('openingBal')
                      }
                    }}
                  showErrorTooltip={true}
                  noOptionsMsg='No Sales Price found,create one...'
                />
              </div>
          )}
          {isSUNDRY && <div className={`${isSUNDRY && controlRoomSettings.multiPriceList ? '!min-w-[40%]' : '!min-w-[50%]'}`}>
            <NumberInput
              label={`Excess Rate %`}
              id='excessRate'
              name='excessRate'
              max={1000}
              placeholder='0.00'
              min={0}
              value={formik.values.excessRate}
              onChange={(value) => formik.setFieldValue('excessRate', value)}
              onBlur={() => {
                formik.setFieldTouched('excessRate', true);
              }}
              className='flex items-center'
              labelClassName='!min-w-[90px] !h-[16px] w-fit text-nowrap me-2 !ps-0'
              inputClassName='text-left !text-[10px] px-1 !h-[24px]'
              error={formik.touched.excessRate && formik.errors.excessRate}
            />
          </div>}
        </div>
      </div>
    </div>
  );
};

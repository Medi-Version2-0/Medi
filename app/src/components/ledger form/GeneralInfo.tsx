import React, { useEffect, useState } from 'react';
import { Option } from '../../interface/global';
import CustomSelect from '../custom_select/CustomSelect';
import FormikInputField from '../common/FormikInputField';
import titleCase from '../../utilities/titleCase';

interface GeneralInfoProps {
  onValueChange?: any;
  formik?: any;
}

export const GeneralInfo: React.FC<GeneralInfoProps> = ({
  onValueChange,
  formik,
}) => {
  const [accountInputValue, setAccountInputValue] = useState<string>(
    formik.values.accountGroup || ''
  );
  const [stationData, setStationData] = useState<any[]>([]);
  const [, setGroupData] = useState<any[]>([]);
  const [, setStateData] = useState<any[]>([]);
  const [groupOptions, setGroupOptions] = useState<Option[]>([]);
  const [stationOptions, setStationOptions] = useState<Option[]>([]);
  const isSUNDRY =
    accountInputValue.toUpperCase() === 'SUNDRY CREDITORS' ||
    accountInputValue.toUpperCase() === 'SUNDRY DEBTORS';
  const electronAPI = (window as any).electronAPI;
  const [focused, setFocused] = useState('');

  const fetchAllData = () => {
    const stateList = electronAPI.getAllStations(
      '',
      'station_name',
      '',
      '',
      ''
    );
    const groupDataList = electronAPI.getAllGroups(
      '',
      'group_name',
      '',
      '',
      ''
    );
    const statesList = electronAPI.getAllStates('', 'state_name', '', '', '');

    setStationData(stateList);
    setGroupData(groupDataList);
    setStateData(statesList);

    setStationOptions(
      stateList.map((station: any) => ({
        value: titleCase(station.station_name),
        label: titleCase(station.station_name),
      }))
    );
    setGroupOptions(
      groupDataList.map((group: any) => ({
        value: titleCase(group.group_name),
        label: titleCase(group.group_name),
      }))
    );
  };

  useEffect(() => {
    fetchAllData();
    document.getElementById('partyName')?.focus();
  }, []);

  const handleFieldChange = (option: Option | null, id: string) => {
    if (id === 'accountGroup') {
      setAccountInputValue(option?.value || '');
      onValueChange(option?.value);
    }
    formik.setFieldValue(id, option?.value);
  };

  useEffect(() => {
    if (formik.values.stationName) {
      const matchingStation = stationData.find(
        (station) => formik.values.stationName === station.station_name
      );
      const state = matchingStation ? matchingStation.station_state : '';
      const pinCode = matchingStation ? matchingStation.station_pinCode : '';
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

  const handleAddressInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      document.getElementById('state')?.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      document.getElementById('mailTo')?.focus();
    }
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
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
              e.preventDefault();
              setFocused('accountGroup');
            }
          }}
          showErrorTooltip={formik.touched.partyName && formik.errors.partyName}
        />
        <div className='flex justify-between m-[1px] w-full items-center'>
          <div className=' starlabel w-[42%]'>
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
                        label: formik.values.accountGroup,
                        value: formik.values.accountGroup,
                      }
                }
                onChange={handleFieldChange}
                options={groupOptions}
                isSearchable={true}
                placeholder='Account Group'
                isFocused={focused === 'accountGroup'}
                disableArrow={true}
                hidePlaceholder={false}
                className='!h-6 rounded-sm'
                error={formik.errors.accountGroup}
                isTouched={formik.touched.accountGroup}
                onBlur={() => {
                  formik.setFieldTouched('accountGroup', true);
                }}
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
                  formik.values.stationName === ''
                    ? null
                    : {
                        label: formik.values.stationName,
                        value: formik.values.stationName,
                      }
                }
                onChange={handleFieldChange}
                options={stationOptions}
                isSearchable={true}
                placeholder='Station Name'
                disableArrow={true}
                hidePlaceholder={false}
                className='!h-6 rounded-sm'
                isRequired={true}
                error={formik.errors.stationName}
                isTouched={formik.touched.stationName}
                onBlur={() => {
                  formik.setFieldTouched('stationName', true);
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
            <div className='flex flex-col gap-0 w-full'>
              <FormikInputField
                isPopupOpen={false}
                label=''
                id='address1'
                name='address1'
                formik={formik}
                className='!mb-0'
                onKeyDown={handleAddressInputKeyDown}
              />
              <FormikInputField
                isPopupOpen={false}
                label=''
                id='address2'
                name='address2'
                formik={formik}
                className='!mb-0'
                onKeyDown={handleAddressInputKeyDown}
              />
              <FormikInputField
                isPopupOpen={false}
                label=''
                id='address3'
                name='address3'
                formik={formik}
                className='!mb-0'
                onKeyDown={handleAddressInputKeyDown}
              />
            </div>
          </div>
        )}

        {isSUNDRY && (
          <div className='flex justify-between m-[1px] w-full items-center'>
            <div className='flex justify-between items-center w-[64%]'>
              <FormikInputField
                isPopupOpen={false}
                label='Pincode'
                id='pinCode'
                name='pinCode'
                placeholder='Pin Code'
                formik={formik}
                isRequired={true}
                labelClassName='w-1/3'
                inputClassName='w-[35%]'
                showErrorTooltip={true}
                maxLength={6}
                className=''
                isDisabled={true}
                onChange={handleChange}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'ArrowDown' || e.key === 'Enter') {
                    e.preventDefault();
                  } else if (e.key === 'ArrowUp') {
                    document.getElementById('city')?.focus();
                  }
                }}
              />
            </div>
            {accountInputValue?.toUpperCase() === 'SUNDRY CREDITORS' && (
              <div className='flex justify-between items-center w-full'>
                <div className='flex w-[45%]'>
                  <FormikInputField
                    isPopupOpen={false}
                    label='Transport'
                    id='transport'
                    name='transport'
                    inputClassName='w-5/12'
                    labelClassName='w-1/3'
                    formik={formik}
                  />
                </div>
                <div className='flex w-[45%]'>
                  <FormikInputField
                    isPopupOpen={false}
                    label='Credit Privilege'
                    id='creditPrivilege'
                    name='creditPrivilege'
                    labelClassName='min-w-[90px]'
                    inputClassName='w-5/12'
                    formik={formik}
                  />
                </div>
              </div>
            )}
            {accountInputValue?.toUpperCase() === 'SUNDRY DEBTORS' && (
              <div className='flex justify-between items-center w-full'>
                <div className='flex w-[45%]'>
                  <FormikInputField
                    isPopupOpen={false}
                    label='Excess Rate'
                    id='excessRate'
                    name='excessRate'
                    inputClassName='w-5/12'
                    labelClassName='min-w-[90px]'
                    formik={formik}
                  />
                </div>
                <div className='flex w-[45%]'>
                  <FormikInputField
                    isPopupOpen={false}
                    label='Grace Day'
                    id='graceDay'
                    name='graceDay'
                    inputClassName='w-5/12'
                    labelClassName='min-w-[90px]'
                    formik={formik}
                  />
                </div>
              </div>
            )}
          </div>
        )}
        {accountInputValue?.toUpperCase() === 'SUNDRY DEBTORS' && (
          <>
            <div className='flex flex-col m-[1px] w-full gap-2'>
              <div className='flex w-full m-[1px] justify-between'>
                <div className='flex w-[42%]'>
                  <FormikInputField
                    isPopupOpen={false}
                    label='Manual Ledger Folio 1'
                    id='manualLedger1'
                    name='manualLedger1'
                    labelClassName='min-w-[90px]'
                    formik={formik}
                  />
                </div>
                <div className='flex w-[42%]'>
                  <FormikInputField
                    isPopupOpen={false}
                    label='Manual Ledger Folio 2'
                    id='manualLedger2'
                    name='manualLedger2'
                    labelClassName='min-w-1/3'
                    formik={formik}
                  />
                </div>
              </div>
              <div className='flex w-full m-[1px] justify-between'>
                <div className='flex w-[54%]'>
                  <FormikInputField
                    isPopupOpen={false}
                    label='Route No'
                    id='routeNo'
                    name='routeNo'
                    inputClassName='w-[51.7%]'
                    labelClassName='min-w-[90px]'
                    formik={formik}
                  />
                </div>

                <div className='flex w-[42%]'>
                  <CustomSelect
                    isPopupOpen={false}
                    label='Party CACR'
                    id='party_cash_credit_invoice'
                    labelClass='min-w-[90px]'
                    value={
                      formik.values.party_cash_credit_invoice === ''
                        ? null
                        : {
                            label: formik.values.party_cash_credit_invoice,
                            value: formik.values.party_cash_credit_invoice,
                          }
                    }
                    onChange={handleFieldChange}
                    options={[
                      { value: 'Cash Invoice', label: 'Cash Invoice' },
                      { value: 'Credit Invoice', label: 'Credit Invoice' },
                    ]}
                    isSearchable={false}
                    placeholder='Select an option'
                    disableArrow={false}
                    hidePlaceholder={false}
                    className='!h-6 rounded-sm'
                  />
                </div>
              </div>
            </div>
            <div className='flex w-full m-[1px] justify-between'>
              <div className='flex w-[30%]'>
                <CustomSelect
                  isPopupOpen={false}
                  label='Deduct Discount'
                  id='deductDiscount'
                  labelClass='min-w-[90px]'
                  value={
                    formik.values.deductDiscount === ''
                      ? null
                      : {
                          label: formik.values.deductDiscount,
                          value: formik.values.deductDiscount,
                        }
                  }
                  onChange={handleFieldChange}
                  options={[
                    { value: 'Yes', label: 'Yes' },
                    { value: 'No', label: 'No' },
                  ]}
                  isSearchable={false}
                  placeholder='Select an option'
                  disableArrow={false}
                  hidePlaceholder={false}
                  className='!h-6 rounded-sm'
                />
              </div>
                <div className='flex w-[67%]'>
                  <FormikInputField
                    isPopupOpen={false}
                    label='Mail to'
                    id='mailTo'
                    name='mailTo'
                    formik={formik}
                    showErrorTooltip={
                      formik.touched.mailTo && formik.errors.mailTo
                    }
                    labelClassName='min-w-[90px]'
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'ArrowDown' || e.key === 'Enter') {
                        document.getElementById('address')?.focus();
                        e.preventDefault();
                      } else if (e.key === 'ArrowUp') {
                        document.getElementById('stationName')?.focus();
                      }
                    }}
                  />
                </div>
            </div>
            
            <div className='flex gap-4 items-center w-full'>
              <CustomSelect
                isPopupOpen={false}
                label='STOP NRX'
                id='stopNrx'
                labelClass='min-w-[90px]'
                value={
                  formik.values.stopNrx === ''
                    ? null
                    : {
                        label: formik.values.stopNrx,
                        value: formik.values.stopNrx,
                      }
                }
                onChange={handleFieldChange}
                options={[
                  { value: 'Yes', label: 'Yes' },
                  { value: 'No', label: 'No' },
                ]}
                isSearchable={false}
                placeholder='Select an option'
                disableArrow={false}
                hidePlaceholder={false}
                containerClass='w-max'
                className='!h-6 rounded-sm w-max'
              />
              <CustomSelect
                isPopupOpen={false}
                label='STOP HI'
                id='stopHi'
                labelClass='w-max'
                value={
                  formik.values.stopHi === ''
                    ? null
                    : {
                        label: formik.values.stopHi,
                        value: formik.values.stopHi,
                      }
                }
                onChange={handleFieldChange}
                options={[
                  { value: 'Yes', label: 'Yes' },
                  { value: 'No', label: 'No' },
                ]}
                isSearchable={false}
                placeholder='Select an option'
                disableArrow={false}
                hidePlaceholder={false}
                containerClass='w-min'
                className='!h-6 rounded-sm w-max'
              />
              <FormikInputField
                isPopupOpen={false}
                label='Not PRINPBA'
                id='notPrinpba'
                name='notPrinpba'
                labelClassName=''
                className='w-auto'
                formik={formik}
              />
            </div>
          </>
        )}
        {accountInputValue?.toUpperCase() === 'SUNDRY CREDITORS' && (
                  <FormikInputField
                    isPopupOpen={false}
                    label='Mail to'
                    id='mailTo'
                    name='mailTo'
                    formik={formik}
                    showErrorTooltip={
                      formik.touched.mailTo && formik.errors.mailTo
                    }
                    labelClassName='min-w-[90px]'
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'ArrowDown' || e.key === 'Enter') {
                        document.getElementById('address')?.focus();
                        e.preventDefault();
                      } else if (e.key === 'ArrowUp') {
                        document.getElementById('stationName')?.focus();
                      }
                    }}
                  />
              )}
        <div className='flex m-[1px] items-center w-[42%]'>
          <CustomSelect
            isPopupOpen={false}
            label='State In Out'
            id='stateInout'
            labelClass='starlabel min-w-[90px] items-center'
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
            placeholder='Select an option'
            disableArrow={false}
            hidePlaceholder={false}
            className='!h-6 rounded-sm'
          />
        </div>
      </div>
    </div>
  );
};

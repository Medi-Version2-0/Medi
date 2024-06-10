import React, { useEffect, useState } from 'react';
import { Option } from '../../interface/global';
import CustomSelect from '../custom_select/CustomSelect';
import FormikInputField from "../common/FormikInputField";

interface GeneralInfoProps {
  onValueChange?: any;
  formik?: any;
}

export const GeneralInfo: React.FC<GeneralInfoProps> = ({
  onValueChange,
  formik,
}) => {
  const [accountInputValue, setAccountInputValue] = useState<string>(formik.values.accountGroup || "");
  const [, setStationData] = useState<any[]>([]);
  const [, setGroupData] = useState<any[]>([]);
  const [, setStateData] = useState<any[]>([]);
  const [groupOptions, setGroupOptions] = useState<Option[]>([]);
  const [stationOptions, setStationOptions] = useState<Option[]>([]);
  const [stateOptions, setStateOptions] = useState<Option[]>([]);
  const isSUNDRY = accountInputValue === 'SUNDRY CREDITORS' || 'SUNDRY DEBTORS';
  const electronAPI = (window as any).electronAPI;

  const fetchAllData = () => {
    const stateList = electronAPI.getAllStations('', 'station_name', '', '', '');
    const groupDataList = electronAPI.getAllGroups('', 'group_name', '', '', '');
    const statesList = electronAPI.getAllStates('', 'state_name', '', '', '');

    setStationData(stateList);
    setGroupData(groupDataList);
    setStateData(statesList);

    setStationOptions(
      stateList.map((station: any) => ({
        value: station.station_name,
        label: station.station_name.toLowerCase(),
      }))
    );

    setGroupOptions(
      groupDataList.map((group: any) => ({
        value: group.group_name,
        label: group.group_name.toLowerCase(),
      }))
    );

    setStateOptions(
      statesList.map((state: any) => ({
        value: state.state_name,
        label: state.state_name.toLowerCase(),
      }))
    );
  };

  useEffect(() => {
    fetchAllData();
    document.getElementById('partyName')?.focus();
  }, []);

  const handleFieldChange = (option: Option | null, id: string) => {
    if (id === 'accountGroup') {
      setAccountInputValue(option?.value || "");
      onValueChange(option?.value);
    }
    formik.setFieldValue(id, option?.value);
  };

  const handleAddressInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      document.getElementById('state')?.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      document.getElementById('mailTo')?.focus();
    }
  };

  return (
    <div className='relative border w-3/5 h-full pt-4 border-solid border-gray-400'>
      <div className='absolute top-[-14px] left-2 border border-solid border-gray-400 px-2 w-max bg-gray-100'>General Info</div>
      <div className='flex flex-col gap-2 w-full px-4 py-2'>
        <FormikInputField
          label='Party Name'
          id='partyName'
          name='partyName'
          formik={formik}
          className=''
          inputClassName=''
          labelClassName='w-1/5'
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
              e.preventDefault();
              document.getElementById('accountGroup')?.focus();
            }
          }}
          showErrorTooltip={formik.touched.partyName && formik.errors.partyName}
        />
        <div className='grid grid-cols-2 gap-2 w-full h-fit'>
          <div className=' starlabel'>
            {groupOptions.length > 0 && (
              <CustomSelect
                label='Account Group'
                id='accountGroup'
                labelClass=' font-bold text-gray-600 '
                value={formik.values.accountGroup === '' ? null : { label: formik.values.accountGroup, value: formik.values.accountGroup }}
                onChange={handleFieldChange}
                options={groupOptions}
                isSearchable={true}
                placeholder="Account Group"
                disableArrow={true}
                hidePlaceholder={false}
                className="h-9 rounded-sm"
              />
            )}
          </div>
          {(isSUNDRY) && (
            <div className='flex items-center'>
              {stationOptions.length > 0 && (
                <CustomSelect
                  label='Station'
                  id='stationName'
                  labelClass='font-bold text-gray-600 items-center'
                  value={formik.values.stationName === '' ? null : { label: formik.values.stationName, value: formik.values.stationName }}
                  onChange={handleFieldChange}
                  options={stationOptions}
                  isSearchable={true}
                  placeholder="Station Name"
                  disableArrow={true}
                  hidePlaceholder={false}
                  className="h-9 rounded-sm"
                />
              )}
            </div>
          )}
        </div>
        {(isSUNDRY) && (
          <div className='flex items-center'>
            <label htmlFor='address1' className='font-bold text-gray-600'>
              Address
            </label>
            <div className='flex flex-col gap-0 w-full'>
              <FormikInputField
                label=''
                id='address1'
                name='address1'
                formik={formik}
                className='!mb-0'
                onKeyDown={handleAddressInputKeyDown}
              />
              <FormikInputField
                label=''
                id='address2'
                name='address2'
                formik={formik}
                className='!mb-0'
                onKeyDown={handleAddressInputKeyDown}
              />
              <FormikInputField
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
        {(isSUNDRY) && (
          <div className='grid grid-cols-2 gap-2 items-center'>
            <FormikInputField
              label='Country'
              id='country'
              name='country'
              formik={formik}
              isRequired={true}
            />
            {stateOptions.length > 0 && (
              <CustomSelect
                label='State'
                id='state'
                labelClass='font-bold text-gray-600 items-center'
                value={formik.values.state === '' ? null : { label: formik.values.state, value: formik.values.state }}
                onChange={handleFieldChange}
                options={stateOptions}
                isSearchable={true}
                placeholder="State"
                disableArrow={true}
                hidePlaceholder={false}
                className="h-9 rounded-sm"
                isRequired={true}
              />
            )}
          </div>
        )}
        {(isSUNDRY) && (
          <div className='grid grid-cols-2 gap-2'>
            <FormikInputField
              label='City'
              id='city'
              name='city'
              formik={formik}
              className=''
              labelClassName='font-bold'
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'ArrowDown' || e.key === 'Enter') {
                  document.getElementById('pinCode')?.focus();
                  e.preventDefault();
                } else if (e.key === 'ArrowUp') {
                  document.getElementById('state')?.focus();
                }
              }}
            />
            <FormikInputField
              label='Pincode'
              id='pinCode'
              name='pinCode'
              formik={formik}
              isRequired={true}
              showErrorTooltip={true}
              className=''
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'ArrowDown' || e.key === 'Enter') {
                  e.preventDefault();
                } else if (e.key === 'ArrowUp') {
                  document.getElementById('city')?.focus();
                }
              }}
            />
          </div>
        )}
        {(isSUNDRY) && (
          <FormikInputField
            label='Mail to'
            id='mailTo'
            name='mailTo'
            formik={formik}
            showErrorTooltip={true}
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
        {(accountInputValue?.toUpperCase() === 'SUNDRY DEBTORS') && (
          <>
            <FormikInputField
              label='VAT Number'
              id='vatNumber'
              name='vatNumber'
              formik={formik}
            />
            <div className='grid grid-cols-2 gap-2'>
              <FormikInputField
                label='Excess Rate'
                id='excessRate'
                name='excessRate'
                formik={formik}
              />
              <FormikInputField
                label='Route No.'
                id='routeNo'
                name='routeNo'
                formik={formik}
              />
            </div>
            <div className='grid grid-cols-2 gap-2'>
              <CustomSelect
                label='Party CACR'
                id='party_cash_credit_invoice'
                labelClass='font-bold text-gray-600'
                value={formik.values.party_cash_credit_invoice === '' ? null : { label: formik.values.party_cash_credit_invoice, value: formik.values.party_cash_credit_invoice }}
                onChange={handleFieldChange}
                options={[
                  { value: 'Cash Invoice', label: 'Cash Invoice' },
                  { value: 'Credit Invoice', label: 'Credit Invoice' },
                ]}
                isSearchable={false}
                placeholder="Select an option"
                disableArrow={false}
                hidePlaceholder={false}
                className="h-9 rounded-sm"
              />
              <CustomSelect
                label='Deduct Discount'
                id='deductDiscount'
                labelClass='font-bold text-gray-600'
                value={formik.values.deductDiscount === '' ? null : { label: formik.values.deductDiscount, value: formik.values.deductDiscount }}
                onChange={handleFieldChange}
                options={[
                  { value: 'Yes', label: 'Yes' },
                  { value: 'No', label: 'No' },
                ]}
                isSearchable={false}
                placeholder="Select an option"
                disableArrow={false}
                hidePlaceholder={false}
                className="h-9 rounded-sm"
              />
            </div>
            <div className='grid grid-cols-3 gap-2'>
              <CustomSelect
                label='STOP NRX'
                id='stopNrx'
                labelClass=' font-bold text-gray-600'
                value={formik.values.stopNrx === '' ? null : { label: formik.values.stopNrx, value: formik.values.stopNrx }}
                onChange={handleFieldChange}
                options={[
                  { value: 'Yes', label: 'Yes' },
                  { value: 'No', label: 'No' },
                ]}
                isSearchable={false}
                placeholder="Select an option"
                disableArrow={false}
                hidePlaceholder={false}
                className="h-9 rounded-sm"
              />
              <CustomSelect
                label='STOP HI'
                id='stopHi'
                labelClass=' font-bold text-gray-600'
                value={formik.values.stopHi === '' ? null : { label: formik.values.stopHi, value: formik.values.stopHi }}
                onChange={handleFieldChange}
                options={[
                  { value: 'Yes', label: 'Yes' },
                  { value: 'No', label: 'No' },
                ]}
                isSearchable={false}
                placeholder="Select an option"
                disableArrow={false}
                hidePlaceholder={false}
                className="h-9 rounded-sm"
              />
              <FormikInputField
                label='Not PRINPBA'
                id='notPrinpba'
                name='notPrinpba'
                formik={formik}
                labelClassName=''
              />
            </div>
          </>
        )}
        {(accountInputValue?.toUpperCase() === 'SUNDRY CREDITORS') && (
          <div className='grid grid-cols-2 gap-2'>
            <FormikInputField
              label='Credit Privilege'
              id='creditPrivilege'
              name='creditPrivilege'
              formik={formik}
            />
            <FormikInputField
              label='Transport'
              id='transport'
              name='transport'
              formik={formik}
            />
          </div>
        )}
        <CustomSelect
          label='State In Out'
          id='stateInout'
          labelClass=' font-bold text-gray-600 starlabel w-1/5 items-center'
          value={formik.values.stateInout === '' ? null : { label: formik.values.stateInout, value: formik.values.stateInout }}
          onChange={handleFieldChange}
          options={[
            { value: 'Within state', label: 'Within state' },
            { value: 'Out of state', label: 'Out of state' },
          ]}
          isSearchable={false}
          placeholder="Select an option"
          disableArrow={false}
          hidePlaceholder={false}
          className="h-9 rounded-sm"
        />
      </div>
    </div>
  );
};

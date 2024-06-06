import React, { useEffect, useState, useMemo } from 'react';
import * as Yup from 'yup';
import { Option, State } from '../../interface/global';
import CustomSelect from '../custom_select/CustomSelect';
import FormikInputField from "../common/FormikInputField";

interface GeneralInfoProps {
  onValueChange?: any;
  formik?: any;
  receiveValidationSchemaGeneralInfo: (schema: Yup.ObjectSchema<any>) => void;
}

export const GeneralInfo: React.FC<GeneralInfoProps> = ({
  onValueChange,
  formik,
  receiveValidationSchemaGeneralInfo,
}) => {
  const [accountInputValue, setAccountInputValue] = useState<string>(formik.values.accountGroup || "");
  const [stationData, setStationData] = useState<any[]>([]);
  const [groupData, setGroupData] = useState<any[]>([]);
  const [stateData, setStateData] = useState<any[]>([]);
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
    if(id==='accountGroup') {
      setAccountInputValue(option?.value || "");
      onValueChange(option?.value);
    }
    formik.setFieldValue(id, option?.value);
  };

  const validationSchema = useMemo(
    () =>
      Yup.object({
        partyName: Yup.string()
          .max(100, 'Party Name must be 100 characters or less')
          .required('Party Name is required'),
        accountGroup: Yup.string()
          .required('Account group is required')
          .transform((value) => (value ? value?.toLowerCase() : ''))
          .test(
            'valid-account-group',
            'Invalid Account Group',
            function (value) {
              return groupData
                .map((group) => group.group_name?.toLowerCase())
                .includes(value);
            }
          ),
        country: isSUNDRY ? Yup.string().required('Country is required') : Yup.string(),
        state: isSUNDRY ? Yup.string()
          .required('State is required')
          .transform((value) => (value ? value?.toLowerCase() : ''))
          .test(
            'valid-state',
            'Invalid State',
            function (value) {
              return stateData
                .map((state: State) => state.state_name?.toLowerCase())
                .includes(value);
            }
          )
          : Yup.string(),
        stationName: isSUNDRY ? Yup.string()
          .required('Station is required')
          .transform((value) => (value ? value?.toLowerCase() : ''))
          .test(
            'valid-station-name',
            'Invalid Station name',
            function (value) {
              return stationData
                .map((station) => station.station_name?.toLowerCase())
                .includes(value);
            }
          )
          : Yup.string(),
        mailTo: Yup.string().email('Invalid email'),
        pinCode: isSUNDRY ? Yup.string()
          .matches(/^[0-9]+$/, 'PIN code must be a number')
          .matches(/^[1-9]/, 'PIN code must not start with zero')
          .matches(/^[0-9]{6}$/, 'PIN code must be exactly 6 digits')
          : Yup.string(),
      }),
    [groupData, stationData, accountInputValue, stateData]
  );

  useEffect(() => {
    receiveValidationSchemaGeneralInfo(validationSchema);
  }, [validationSchema, receiveValidationSchemaGeneralInfo]);

  const handleAddressInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      document.getElementById('state')?.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      document.getElementById('mailTo')?.focus();
    }
  };

  return (
    <div className='ledger_general_info'>
      <div className='general_info_prefix'>General Info</div>
      <form onSubmit={formik.handleSubmit} className='general_info_inputs'>
        <FormikInputField
          label='Party Name'
          id='partyName'
          name='partyName'
          formik={formik}
          className=''
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
              e.preventDefault();
              document.getElementById('accountGroup')?.focus();
            }
          }}
          showErrorTooltip={formik.touched.partyName && formik.errors.partyName}
        />
        <div className='ledger_inputs'>
          <div className='fixed_assets_input starlabel'>
            {groupOptions.length > 0 && (
              <CustomSelect
                label='Account Group'
                id='accountGroup'
                labelClass='label_name label_name_css starlabel'
                value={formik.values.accountGroup==='' ? null : { label: formik.values.accountGroup, value: formik.values.accountGroup }}
                onChange={handleFieldChange}
                options={groupOptions}
                isSearchable={true}
                placeholder="Account Group"
                disableArrow={true}
                hidePlaceholder={false}
                className="custom-select-field"
              />
            )}
          </div>
          {(isSUNDRY) && (
            <div className='stations_input starlabel'>
              {stationOptions.length > 0 && (
                <CustomSelect
                  label='Station'
                  id='stationName'
                  labelClass='label_name_css'
                  value={formik.values.stationName==='' ? null : { label: formik.values.stationName, value: formik.values.stationName }}
                  onChange={handleFieldChange}
                  options={stationOptions}
                  isSearchable={true}
                  placeholder="Station Name"
                  disableArrow={true}
                  hidePlaceholder={false}
                  className="custom-select-field"
                />
              )}
            </div>
          )}
        </div>
        {(isSUNDRY) && (
          <div className='ledger_inputs'>
            <label htmlFor='address1' className='address_label_name label_name_css'>
              Address
            </label>
            <div className='address_input'>
              <FormikInputField
                label=''
                id='address1'
                name='address1'
                formik={formik}
                className='input_class'
                onKeyDown={handleAddressInputKeyDown}
              />
              <FormikInputField
                label=''
                id='address2'
                name='address2'
                formik={formik}
                className='input_class'
                onKeyDown={handleAddressInputKeyDown}
              />
              <FormikInputField
                label=''
                id='address3'
                name='address3'
                formik={formik}
                className='input_class'
                onKeyDown={handleAddressInputKeyDown}
              />
            </div>
          </div>

        )}
        {(isSUNDRY) && (
          <div className='ledger_inputs'>
            <FormikInputField label='Country' id='country' name='country' formik={formik} isRequired={true} />
            <div className='country_div starlabel'>
              {stateOptions.length > 0 && (
                <CustomSelect
                  label='State'
                  id='state'
                  labelClass='label_name_css'
                  value={formik.values.state==='' ? null : { label: formik.values.state, value: formik.values.state }}
                  onChange={handleFieldChange}
                  options={stateOptions}
                  isSearchable={true}
                  placeholder="State"
                  disableArrow={true}
                  hidePlaceholder={false}
                  className="custom-select-field"
                />
              )}
            </div>
          </div>
        )}
        {(isSUNDRY) && (
          <div className='flex'>
            <FormikInputField
              label='City'
              id='city'
              name='city'
              formik={formik}
              className='max-w-1/2'
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
              className='max-w-1/2'
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
            <FormikInputField label='VAT Number' id='vatNumber' name='vatNumber' formik={formik} />
            <div className='ledger_inputs'>
              <FormikInputField label='Excess Rate' id='excessRate' name='excessRate' formik={formik} />
              <FormikInputField label='Route No.' id='routeNo' name='routeNo' formik={formik} />
            </div>
            <div className='ledger_inputs'>
            <CustomSelect
              label='Party CACR'
              id='party_cash_credit_invoice'
              labelClass='label_name label_name_css'
              value={formik.values.party_cash_credit_invoice==='' ? null : { label: formik.values.party_cash_credit_invoice, value: formik.values.party_cash_credit_invoice }}
              onChange={handleFieldChange}
              options={[
                { value: 'Cash Invoice', label: 'Cash Invoice' },
                { value: 'Credit Invoice', label: 'Credit Invoice' },
              ]}
              isSearchable={false}
              placeholder="Select an option"
              disableArrow={false}
              hidePlaceholder={false}
              className="custom-select-field"
            />

            <CustomSelect
              label='Deduct Discount'
              id='deductDiscount'
              labelClass='label_name label_name_css'
              value={formik.values.deductDiscount==='' ? null : { label: formik.values.deductDiscount, value: formik.values.deductDiscount }}
              onChange={handleFieldChange}
              options={[
                { value: 'Yes', label: 'Yes' },
                { value: 'No', label: 'No' },
              ]}
              isSearchable={false}
              placeholder="Select an option"
              disableArrow={false}
              hidePlaceholder={false}
              className="custom-select-field"
            />
            </div>
            <div className='ledger_inputs'>
              <CustomSelect
                label='STOP NRX'
                id='stopNrx'
                labelClass='label_name label_name_css'
                value={formik.values.stopNrx==='' ? null : { label: formik.values.stopNrx, value: formik.values.stopNrx }}
                onChange={handleFieldChange}
                options={[
                  { value: 'Yes', label: 'Yes' },
                  { value: 'No', label: 'No' },
                ]}
                isSearchable={false}
                placeholder="Select an option"
                disableArrow={false}
                hidePlaceholder={false}
                className="custom-select-field"
              />
              <CustomSelect
                label='STOP HI'
                id='stopHi'
                labelClass='label_name label_name_css'
                value={formik.values.stopHi==='' ? null : { label: formik.values.stopHi, value: formik.values.stopHi }}
                onChange={handleFieldChange}
                options={[
                  { value: 'Yes', label: 'Yes' },
                  { value: 'No', label: 'No' },
                ]}
                isSearchable={false}
                placeholder="Select an option"
                disableArrow={false}
                hidePlaceholder={false}
                className="custom-select-field"
              />
              <FormikInputField
                label='Not PRINPBA'
                id='notPrinpba'
                name='notPrinpba'
                formik={formik}
              />
            </div>
          </>
        )}
        {accountInputValue?.toUpperCase() === 'SUNDRY CREDITORS' && (
          <div className='ledger_inputs'>
            <FormikInputField label='Credit Privilege' id='creditPrivilege' name='creditPrivilege' formik={formik} />
            <FormikInputField label='Transport' id='transport' name='transport' formik={formik} />
            </div>
        )}
          <div className='ledger_inputs'>
            <CustomSelect
              label='State In Out'
              id='stateInout'
              labelClass='label_name label_name_css starlabel'
              value={formik.values.stateInout==='' ? null : { label: formik.values.stateInout, value: formik.values.stateInout }}
              onChange={handleFieldChange}
              options={[
                { value: 'Within state', label: 'Within state' },
                { value: 'Out of state', label: 'Out of state' },
              ]}
              isSearchable={false}
              placeholder="Select an option"
              disableArrow={false}
              hidePlaceholder={false}
              className="custom-select-field"
            />
          </div>
      </form>
    </div>
  );
};

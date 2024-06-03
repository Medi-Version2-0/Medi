import React, { useEffect, useState, useMemo } from 'react';
import * as Yup from 'yup';
import { State } from '../../interface/global';
import CustomSelect from '../custom_select/CustomSelect';
import FormikInputField from "../common/FormikInputField";
import FormikSelectField from '../common/FormikSelectField';
interface Option {
  value: string;
  label: string;
}

interface GeneralInfoProps {
  onValueChange?: any;
  formik?: any;
  receiveValidationSchemaGeneralInfo: (schema: Yup.ObjectSchema<any>) => void;
}

export const GeneralInfo: React.FC<GeneralInfoProps> = ({
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

  const handleChange = (option: Option | null) => {
    setAccountInputValue(option?.value || "");
    formik.setFieldValue('accountGroup', option?.value);
  };
  const handleStateChange = (option: Option | null) => {
    formik.setFieldValue('state', option?.value);
  };

  const handleStationChange = (option: Option | null) => {
    formik.setFieldValue('stationName', option?.value);
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
          className='starlabel'
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
            <label
              htmlFor='accountGroup'
              className='label_name label_name_css starlabel'
            >
              Account Group
            </label>
            {groupOptions.length > 0 && (
              <CustomSelect
                value={{ label: formik.values.accountGroup, value: formik.values.accountGroup }}
                onChange={handleChange}
                options={groupOptions}
                isSearchable={true}
                placeholder=""
                disableArrow={true}
                hidePlaceholder={true}
                className="custom-select-field"
              />
            )}
          </div>
          {(isSUNDRY) && (
            <div className='stations_input starlabel'>
              <label htmlFor='stationName' className='label_name_css'>
                Station
              </label>
              {stationOptions.length > 0 && (
                <CustomSelect
                  value={{ label: formik.values.stationName, value: formik.values.stationName }}
                  onChange={handleStationChange}
                  options={stationOptions}
                  isSearchable={true}
                  placeholder=""
                  disableArrow={true}
                  hidePlaceholder={true}
                  className="custom-select-field"
                />
              )}
            </div>
          )}
        </div>
        {(accountInputValue?.toUpperCase() === 'SUNDRY DEBTORS') && (
          <>
            <FormikInputField label='VAT Number' id='vatNumber' name='vatNumber' formik={formik} />
            <FormikInputField label='Excess Rate' id='excessRate' name='excessRate' formik={formik} />
            <FormikInputField label='Route No.' id='routeNo' name='routeNo' formik={formik} />
            <FormikSelectField
              label='Party CACR'
              id='party_cash_credit_invoice'
              name='party_cash_credit_invoice'
              formik={formik}
              options={[
                { value: 'Cash Invoice', label: 'Cash Invoice' },
                { value: 'Credit Invoice', label: 'Credit Invoice' },
              ]}
            />
            <FormikSelectField
              label='Deduct Discount'
              id='deductDiscount'
              name='deductDiscount'
              formik={formik}
              options={[
                { value: 'Yes', label: 'Yes' },
                { value: 'No', label: 'No' },
              ]}
            />
            <FormikSelectField
              label='STOP NRX'
              id='stopNrx'
              name='stopNrx'
              formik={formik}
              options={[
                { value: 'Yes', label: 'Yes' },
                { value: 'No', label: 'No' },
              ]}
            />
            <FormikSelectField
              label='STOP HI'
              id='stopHi'
              name='stopHi'
              formik={formik}
              options={[
                { value: 'Yes', label: 'Yes' },
                { value: 'No', label: 'No' },
              ]}
            />
            <FormikInputField
              label='Not PRINPBA'
              id='notPrinpba'
              name='notPrinpba'
              formik={formik}
            />
          </>
        )}
        {accountInputValue?.toUpperCase() === 'SUNDRY CREDITORS' && (
          <>
            <FormikInputField label='Credit Privilege' id='creditPrivilege' name='creditPrivilege' formik={formik} />
            <FormikInputField label='Transport' id='transport' name='transport' formik={formik} />
          </>
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
              <label htmlFor='state' className='label_name_css'>
                State
              </label>
              {stateOptions.length > 0 && (
                <CustomSelect
                  value={{ label: formik.values.state, value: formik.values.state }}
                  onChange={handleStateChange}
                  options={stateOptions}
                  isSearchable={true}
                  placeholder=""
                  disableArrow={true}
                  hidePlaceholder={true}
                  className="custom-select-field"
                />
              )}
            </div>
          </div>
        )}
        {(isSUNDRY) && (
          <div className='ledger_inputs'>
            <FormikInputField
              label='City'
              id='city'
              name='city'
              formik={formik}
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
        <FormikInputField
          label='State In Out'
          id='stateInout'
          name='stateInout'
          formik={formik}
        />
      </form>
    </div>
  );
};

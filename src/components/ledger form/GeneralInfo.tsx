import React, { useEffect, useState } from 'react';
import { Option } from '../../interface/global';
import CustomSelect from '../custom_select/CustomSelect';
import FormikInputField from '../common/FormikInputField';
import titleCase from '../../utilities/titleCase';
import { sendAPIRequest } from '../../helper/api';
import { useParams } from 'react-router-dom';

interface GeneralInfoProps {
  onValueChange?: any;
  formik?: any;
  selectedGroup: string;
}

export const GeneralInfo = ({
  onValueChange,
  formik,
  selectedGroup,
}: GeneralInfoProps) => {
  const { companyId } = useParams();
  const [stationData, setStationData] = useState<any[]>([]);
  const [groupOptions, setGroupOptions] = useState<Option[]>([]);
  const [stationOptions, setStationOptions] = useState<Option[]>([]);
  const isSUNDRY =
    selectedGroup.toUpperCase() === 'SUNDRY CREDITORS' ||
    selectedGroup.toUpperCase() === 'SUNDRY DEBTORS';
  const [focused, setFocused] = useState('');

  const fetchAllData = async () => {
    const stationList =
      await sendAPIRequest<{ station_id: number; station_name: string }[]>(
        `/${companyId}/station`
      );
    const groupDataList = await sendAPIRequest<any[]>('/group');

    setStationData(stationList);

    setStationOptions(
      stationList.map((station: any) => ({
        value: station.station_id,
        label: titleCase(station.station_name),
      }))
    );

    setGroupOptions(
      groupDataList.map((group: any) => ({
        value: group.group_code,
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
                isFocused={focused === 'accountGroup'}
                disableArrow={true}
                hidePlaceholder={false}
                className='!h-6 rounded-sm'
                error={formik.errors.accountGroup}
                isTouched={formik.touched.accountGroup}
                onBlur={() => {
                  formik.setFieldTouched('accountGroup', true);
                  setFocused('');
                }}
                onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                  const dropdown = document.querySelector(
                    '.custom-select__menu'
                  );
                  if (e.key === 'Enter') {
                    !dropdown && e.preventDefault();
                    isSUNDRY
                      ? document.getElementById('stationName')?.focus()
                      : document.getElementById('stateInout')?.focus();
                  }
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
                isRequired={true}
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
            <div className='flex flex-col gap-0 w-full'>
              <FormikInputField
                isPopupOpen={false}
                label=''
                id='address1'
                name='address1'
                formik={formik}
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
                className='!mb-0'
                prevField='address2'
                nextField={
                  selectedGroup?.toUpperCase() === 'SUNDRY CREDITORS'
                    ? 'transport'
                    : 'excessRate'
                }
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
                prevField='address3'
                nextField={
                  selectedGroup?.toUpperCase() === 'SUNDRY CREDITORS'
                    ? 'transport'
                    : 'excessRate'
                }
              />
            </div>
            {selectedGroup?.toUpperCase() === 'SUNDRY CREDITORS' && (
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
                    prevField='pinCode'
                    nextField='creditPrivilege'
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
                    prevField='transport'
                    nextField={
                      selectedGroup?.toUpperCase() === 'SUNDRY DEBTORS'
                        ? 'excessRate'
                        : 'mailTo'
                    }
                  />
                </div>
              </div>
            )}
            {selectedGroup?.toUpperCase() === 'SUNDRY DEBTORS' && (
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
                    prevField='creditPrivilege'
                    nextField='graceDay'
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
                    prevField='excessRate'
                    nextField={
                      selectedGroup?.toUpperCase() === 'SUNDRY DEBTORS'
                        ? 'manualLedger1'
                        : 'mailTo'
                    }
                  />
                </div>
              </div>
            )}
          </div>
        )}
        {selectedGroup?.toUpperCase() === 'SUNDRY DEBTORS' && (
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
                    prevField='graceDay'
                    nextField='manualLedger2'
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
                    prevField='manualLedger1'
                    nextField='routeNo'
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
                    prevField='manualLedger2'
                    nextField='partyCashCreditInvoice'
                  />
                </div>

                <div className='flex w-[42%]'>
                  <CustomSelect
                    isPopupOpen={false}
                    label='Party CACR'
                    id='partyCashCreditInvoice'
                    labelClass='min-w-[90px]'
                    value={
                      formik.values.partyCashCreditInvoice === ''
                        ? null
                        : {
                            label: formik.values.partyCashCreditInvoice,
                            value: formik.values.partyCashCreditInvoice,
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
                    onBlur={() => {
                      formik.setFieldTouched('partyCashCreditInvoice', true);
                      setFocused('');
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                      const dropdown = document.querySelector(
                        '.custom-select__menu'
                      );
                      if (e.key === 'Enter') {
                        !dropdown && e.preventDefault();
                        document.getElementById('deductDiscount')?.focus();
                      }
                    }}
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
                  onBlur={() => {
                    formik.setFieldTouched('deductDiscount', true);
                    setFocused('');
                  }}
                  onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                    const dropdown = document.querySelector(
                      '.custom-select__menu'
                    );
                    if (e.key === 'Enter') {
                      !dropdown && e.preventDefault();
                      document.getElementById('mailTo')?.focus();
                    }
                  }}
                />
              </div>
              <div className='flex w-[67%]'>
                <FormikInputField
                  isPopupOpen={false}
                  label='Mail to'
                  id='mailTo'
                  name='mailTo'
                  isTitleCase={false}
                  formik={formik}
                  showErrorTooltip={
                    formik.touched.mailTo && formik.errors.mailTo
                  }
                  labelClassName='min-w-[90px]'
                  prevField='deductDiscount'
                  nextField='stopNrx'
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
                onBlur={() => {
                  formik.setFieldTouched('stopNrx', true);
                  setFocused('');
                }}
                onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                  const dropdown = document.querySelector(
                    '.custom-select__menu'
                  );
                  if (e.key === 'Enter') {
                    !dropdown && e.preventDefault();
                    document.getElementById('stopHi')?.focus();
                  }
                }}
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
                onBlur={() => {
                  formik.setFieldTouched('stopHi', true);
                  setFocused('');
                }}
                onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                  const dropdown = document.querySelector(
                    '.custom-select__menu'
                  );
                  if (e.key === 'Enter') {
                    !dropdown && e.preventDefault();
                    document.getElementById('notPrinpba')?.focus();
                  }
                }}
              />
              <FormikInputField
                isPopupOpen={false}
                label='Not PRINPBA'
                id='notPrinpba'
                name='notPrinpba'
                labelClassName=''
                className='w-auto'
                formik={formik}
                prevField='stopHi'
                nextField={
                  selectedGroup?.toUpperCase() === 'SUNDRY CREDITORS'
                    ? 'mailTo'
                    : 'stateInout'
                }
              />
            </div>
          </>
        )}
        {selectedGroup?.toUpperCase() === 'SUNDRY CREDITORS' && (
          <FormikInputField
            isPopupOpen={false}
            label='Mail to'
            id='mailTo'
            name='mailTo'
            isTitleCase={false}
            formik={formik}
            showErrorTooltip={formik.touched.mailTo && formik.errors.mailTo}
            labelClassName='min-w-[90px]'
            prevField='notPrinpba'
            nextField='stateInout'
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
            onBlur={() => {
              formik.setFieldTouched('stateInout', true);
              setFocused('');
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
              const dropdown = document.querySelector('.custom-select__menu');
              if (e.key === 'Enter') {
                !dropdown && e.preventDefault();
                document.getElementById('stateInout')?.focus();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

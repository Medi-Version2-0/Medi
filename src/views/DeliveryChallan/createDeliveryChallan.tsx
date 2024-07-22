import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FormikProps, useFormik } from 'formik';
import Button from '../../components/common/button/Button';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { sendAPIRequest } from '../../helper/api';
import { useQueryClient } from '@tanstack/react-query';
import { CompanyFormData, Option } from '../../interface/global';
import onKeyDown from '../../utilities/formKeyDown';
import FormikInputField from '../../components/common/FormikInputField';
import CustomSelect from '../../components/custom_select/CustomSelect';
import titleCase from '../../utilities/titleCase';
import { CreateDeliveryChallanTable } from './createDeliveryChallanTable';

export interface DeliveryChallanFormValues {
  oneStation: string;
  stationId: string;
  partyId: string;
  runningBalance: number;
  challanNumber: string;
  netRateSymbol: string;
  personName: string;
  // qtyTotal: string;f
  // total: string;
}

export type DeliveryChallanFormInfoType =
  FormikProps<DeliveryChallanFormValues>;

const CreateDeliveryChallan = ({ setView, data }: any) => {
  const { organizationId } = useParams();
  const [stationOptions, setStationOptions] = useState<Option[]>([]);
  const [partyOptions, setPartyOptions] = useState<Option[]>([]);
  const [dataFromTable, setDataFromTable] = useState<any[]>([]);
  const queryClient = useQueryClient();
  const [focused, setFocused] = useState('');
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  const formik: DeliveryChallanFormInfoType = useFormik({
    initialValues: {
      oneStation: data?.oneStation || 'One Station',
      stationId: data?.stationId || '',
      partyId: data?.partyId || '',
      runningBalance: data?.runningBalance || 0.0,
      challanNumber: data?.challanNumber || '',
      netRateSymbol: data?.netRateSymbol || '',
      personName: data?.personName || '',
      // qtyTotal: data?.qtyTotal || '',
      // total: data?.total || '',
    },

    onSubmit: async (values: any) => {
      try {
        const formData = new FormData();
        Object.keys(values).forEach((key) => {
          if (values[key] instanceof File) {
            formData.append('file', values[key]);
            formData.append(key, 'upload');
          } else {
            formData.append(key, values[key]);
          }
        });
        const finalData = {...values, challans: dataFromTable}
        if (data.id) {
          await sendAPIRequest(
            `/${organizationId}/deliveryChallan/${data.id}`,
            {
              method: 'PUT',
              body: values,
            }
          );
        } else {
          console.log( "data to be send ----------------> ", finalData);
          // await sendAPIRequest(`/${organizationId}/deliveryChallan`, {
          //   method: 'POST',
          //   body: finalData,
          // });
        }
        await queryClient.invalidateQueries({
          queryKey: ['get-deliveryChallan'],
        });

        setPopupState({
          isModalOpen: false,
          isAlertOpen: true,
          message: `Delivery Challan ${data.id ? 'updated' : 'created'} successfully`,
        });
      } catch (error) {
        setPopupState({
          isModalOpen: false,
          isAlertOpen: true,
          message: `Failed to ${data.id ? 'update' : 'create'} delivery challan`,
        });
      }
    },
  });

  const fetchAllData = async () => {
    const stations = await sendAPIRequest<any[]>(`/${organizationId}/station`);
    const partyList = await sendAPIRequest<any[]>(`/${organizationId}/ledger`);
    const requiredParty = partyList.filter(party => party.station_id === formik.values.stationId);
    setStationOptions(
      stations.map((station: any) => ({
        value: station.station_id,
        label: titleCase(station.station_name),
      }))
    );

    setPartyOptions(
      requiredParty.map((party: any) => ({
        value: party.party_id,
        label: titleCase(party.partyName),
      }))
    );
  };

  useEffect(() => {
    fetchAllData();
  }, [formik.values.stationId]);

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
    setView({ type: '', data: {} });
  };

  //   const handleClosePopup = () => {
  //     setPopupState({ ...popupState, isModalOpen: false });
  //   };

  const handleFieldChange = (option: Option | null, id: string) => {
    formik.setFieldValue(id, option?.value);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    formik?: FormikProps<CompanyFormData>,
    radioField?: any
  ) => {
    onKeyDown({
      e,
      formik: formik,
      radioField: radioField,
      focusedSetter: (field: string) => {
        setFocused(field);
      },
    });
  };

  useEffect(() => {
    document.getElementById('oneStation')?.focus();
    setFocused('oneStation');
  }, []);

  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between px-8 py-1'>
        <h1 className='font-bold'>
          {data.id ? 'Update Challan' : 'Create Challan'}
        </h1>
        <Button
          type='highlight'
          id='challan_button'
          handleOnClick={() => {
            setView({ type: '', data: {} });
          }}
        >
          Back
        </Button>
      </div>
      <form onSubmit={formik.handleSubmit} className='flex flex-col w-full'>
        <div className='flex flex-col px-5 mx-8 my-4 py-5 gap-3 border-2 border-solid border-gray-400'>
          <div className='flex justify-between'>
            <div className='w-[30%]'>
              <CustomSelect
                isPopupOpen={false}
                label='Station'
                id='oneStation'
                name='oneStation'
                labelClass='min-w-[140px] text-base text-gray-700'
                value={
                  formik.values.oneStation === ''
                    ? null
                    : {
                        label: formik.values.oneStation,
                        value: formik.values.oneStation,
                      }
                }
                onChange={handleFieldChange}
                options={[
                  { value: 'One Station', label: 'One Station' },
                  { value: 'All Stations', label: 'All Stations' },
                ]}
                isSearchable={false}
                disableArrow={false}
                hidePlaceholder={false}
                className='!h-6 rounded-sm'
                isTouched={formik.touched.oneStation}
                isFocused={focused === 'oneStation'}
                error={formik.errors.oneStation}
                onBlur={() => {
                  formik.setFieldTouched('oneStation', true);
                  setFocused('');
                }}
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter' || e.key === 'Tab') {
                    const dropdown = document.querySelector(
                      '.custom-select__menu'
                    );
                    if (!dropdown) {
                      e.preventDefault();
                    }
                    if (formik.values.oneStation === 'One Station') {
                      // document.getElementById('stationId')?.focus();
                      setFocused('stationId');
                    } else if (formik.values.oneStation === 'All Stations') {
                      setFocused('partyId');
                    }
                  }
                }}
                showErrorTooltip={true}
              />
            </div>
            <div className='w-[35%]'>
              {formik.values.oneStation &&
                formik.values.oneStation === 'One Station' && (
                  <CustomSelect
                    isPopupOpen={false}
                    label='Station Name'
                    id='stationId'
                    labelClass='min-w-[140px] text-base mr-[3rem]  text-gray-700'
                    isFocused={focused === 'stationId'}
                    value={
                      formik.values.stationId === ''
                        ? null
                        : {
                            label: stationOptions.find(
                              (e) => e.value === formik.values.stationId
                            )?.label,
                            value: formik.values.stationId,
                          }
                    }
                    onChange={handleFieldChange}
                    options={stationOptions}
                    isSearchable={true}
                    // placeholder='Station Name'
                    disableArrow={true}
                    hidePlaceholder={false}
                    className='!h-6 rounded-sm'
                    isRequired={false}
                    error={formik.errors.stationId}
                    isTouched={formik.touched.stationId}
                    showErrorTooltip={true}
                    onBlur={() => {
                      formik.setFieldTouched('stationId', true);
                      setFocused('');
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                      if (e.key === 'Enter' || e.key === 'Tab') {
                        const dropdown = document.querySelector(
                          '.custom-select__menu'
                        );
                        if (!dropdown) {
                          e.preventDefault();
                        }
                        setFocused('partyId');
                      }
                      if (e.shiftKey && e.key === 'Tab') {
                        setFocused('oneStation');
                      }
                    }}
                  />
                )}
            </div>
          </div>
          <div className='flex justify-between'>
            <div className='w-[30%]'>
              <CustomSelect
                isPopupOpen={false}
                label='Party Name'
                id='partyId'
                labelClass='min-w-[140px] text-base  text-gray-700'
                isFocused={focused === 'partyId'}
                value={
                  formik.values.partyId === ''
                    ? null
                    : {
                        label: partyOptions.find(
                          (e) => e.value === formik.values.partyId
                        )?.label,
                        value: formik.values.partyId,
                      }
                }
                onChange={handleFieldChange}
                options={partyOptions}
                isSearchable={true}
                disableArrow={true}
                hidePlaceholder={false}
                className='!h-6 rounded-sm'
                isRequired={false}
                error={formik.errors.partyId}
                isTouched={formik.touched.partyId}
                showErrorTooltip={true}
                onBlur={() => {
                  formik.setFieldTouched('partyId', true);
                  setFocused('');
                }}
                onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                  if (e.key === 'Enter' || e.key === 'Tab') {
                    const dropdown = document.querySelector(
                      '.custom-select__menu'
                    );
                    if (!dropdown) {
                      e.preventDefault();
                    }
                    document.getElementById('runningBalance')?.focus();
                  }
                  if (e.shiftKey && e.key === 'Tab') {
                    if (formik.values.oneStation === 'One Station') {
                      setFocused('stationId');
                    } else if (formik.values.oneStation === 'All Stations') {
                      setFocused('oneStation');
                    }
                  }
                }}
              />
            </div>
            <div className='w-[35%]'>
              <FormikInputField
                isPopupOpen={false}
                type='number'
                label='Balance'
                id='runningBalance'
                name='runningBalance'
                formik={formik}
                className='!mb-0'
                labelClassName='min-w-[140px] text-base mr-[3rem]  text-gray-700'
                isRequired={false}
                nextField='challanNumber'
                prevField='partyId'
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleKeyDown(e)
                }
                showErrorTooltip={
                  formik.touched.runningBalance &&
                  !!formik.errors.runningBalance
                }
              />
            </div>
          </div>
          <div className='flex justify-between'>
            <div className='w-[30%]'>
              <FormikInputField
                isPopupOpen={false}
                label='Challan Number'
                id='challanNumber'
                name='challanNumber'
                formik={formik}
                className='!mb-0'
                nextField='netRateSymbol'
                prevField='runningBalance'
                labelClassName='min-w-[140px] text-base  text-gray-700'
                isRequired={false}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleKeyDown(e)
                }
                showErrorTooltip={
                  formik.touched.challanNumber && !!formik.errors.challanNumber
                }
              />
            </div>
            <div className='w-[35%]'>
              <CustomSelect
                isPopupOpen={false}
                label='Net Rate Symbol'
                id='netRateSymbol'
                name='netRateSymbol'
                labelClass='min-w-[140px] text-base mr-[3rem] text-gray-700'
                value={
                  formik.values.netRateSymbol === ''
                    ? null
                    : {
                        label: formik.values.netRateSymbol,
                        value: formik.values.netRateSymbol,
                      }
                }
                onChange={handleFieldChange}
                options={[
                  { value: 'Yes', label: 'Yes' },
                  { value: 'No', label: 'No' },
                ]}
                isSearchable={false}
                disableArrow={false}
                hidePlaceholder={false}
                className='!h-6 rounded-sm'
                isTouched={formik.touched.netRateSymbol}
                isFocused={focused === 'netRateSymbol'}
                error={formik.errors.netRateSymbol}
                onBlur={() => {
                  formik.setFieldTouched('netRateSymbol', true);
                  setFocused('');
                }}
                onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                  if (e.key === 'Enter' || e.key === 'Tab') {
                    const dropdown = document.querySelector(
                      '.custom-select__menu'
                    );
                    if (!dropdown) {
                      e.preventDefault();
                    }
                    document.getElementById('personName')?.focus();
                  }
                  if (e.shiftKey && e.key === 'Tab') {
                    document.getElementById('challanNumber')?.focus();
                  }
                }}
                showErrorTooltip={true}
              />
            </div>
          </div>
          <div className='flex justify-between'>
            <div className='w-[30%]'>
              <FormikInputField
                isPopupOpen={false}
                label='Person Name'
                id='personName'
                name='personName'
                formik={formik}
                className='!mb-0'
                nextField='submit_button'
                prevField='netRateSymbol'
                labelClassName='min-w-[140px] text-base text-gray-700'
                isRequired={false}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleKeyDown(e)
                }
                showErrorTooltip={
                  formik.touched.personName && !!formik.errors.personName
                }
              />
            </div>
          </div>
        </div>
        <div className='my-4 mx-8 max-w-[100%] overflow-scroll'>
          <CreateDeliveryChallanTable setDataFromTable={setDataFromTable}/>
        </div>
        <div className='border-2 border-solid border-red-600 my-4 p-4 mx-8'>
          <div className='flex gap-10'>
            <span className='flex gap-2 text-base text-gray-700'>
              Quantity Total :{' '}
              <span className='w-[50px] border-b-2 border-solid border-gray-400'>
                {data.qtyTotal}
              </span>
            </span>
            <span className='flex gap-2 text-base text-gray-700'>
              Total :{' '}
              <span className='w-[50px] border-b-2 border-solid border-gray-400'>
                {data.total}
              </span>
            </span>
          </div>
        </div>
        <div className='w-full px-8 py-2'>
          <Button
            type='fill'
            padding='px-4 py-2'
            id='submit_all'
            handleOnClick={formik.handleSubmit}
            handleOnKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
              if (e.key === 'ArrowUp') {
                e.preventDefault();
              }
            }}
          >
            {data.id ? 'Update' : 'Submit'}
          </Button>
        </div>
      </form>
      {(popupState.isModalOpen || popupState.isAlertOpen) && (
        <Confirm_Alert_Popup
          onClose={handleAlertCloseModal}
          onConfirm={handleAlertCloseModal}
          message={popupState.message}
          isAlert={popupState.isAlertOpen}
        />
      )}
    </div>
  );
};

export default CreateDeliveryChallan;

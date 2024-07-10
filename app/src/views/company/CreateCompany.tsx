import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FormikProps, useFormik } from 'formik';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import Button from '../../components/common/button/Button';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import FormikInputField from '../../components/common/FormikInputField';
import { getCompanyFormSchema } from './validation_schema';
import { CompanyFormData, Option } from '../../interface/global';
import CustomSelect from '../../components/custom_select/CustomSelect';
import onKeyDown from '../../utilities/formKeyDown';
import titleCase from '../../utilities/titleCase';
import { sendAPIRequest } from '../../helper/api';
import { useQueryClient } from '@tanstack/react-query';

export const CreateCompany = ({ setView }: any) => {
  const location = useLocation();
  const data = location.state || {};
  const [stationOptions, setStationOptions] = useState<Option[]>([]);
  const [salesOptions, setSalesOptions] = useState<Option[]>([]);
  const [purchaseOptions, setPurchaseOptions] = useState<Option[]>([]);
  const [focused, setFocused] = useState('');
  const queryClient = useQueryClient();
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  const formik: any = useFormik({
    initialValues: {
      //general
      companyName: data?.companyName || '',
      shortName: data?.shortName || '',
      //address
      address1: data?.address1 || '',
      address2: data?.address2 || '',
      address3: data?.address3 || '',
      stationId: data?.stationId || '',
      //balance
      openingBal: data?.openingBal || '0.00',
      openingBalType: data?.openingBalType || 'Dr',
      salesId: data?.salesId || '',
      purchaseId: data?.purchaseId || '',
      discPercent: data?.discPercent || '',
      isDiscountPercent: data?.isDiscountPercent || '',
      //tax
      gstIn: data?.gstIn || '',
      drugLicenceNo1: data?.drugLicenceNo1 || '',

      stateInOut: data?.stateInOut || '',
      //personal
      phoneNumber: data?.phoneNumber || '',
      mobileNumber: data?.mobileNumber || '',
      panNumber: data?.panNumber || '',
      emailId1: data?.emailId1 || '',
      emailId2: data?.emailId2 || '',
      emailId3: data?.emailId3 || '',

      purSaleAc: data?.purSaleAc || '',
    },
    validationSchema: getCompanyFormSchema(),
    onSubmit: async (values) => {
      const allData = { ...values };

      if (data.company_id) {
        await sendAPIRequest(`/company/${data.company_id}`, {
          method: 'PUT',
          body: allData,
        });
      } else {
        await sendAPIRequest('/company', { method: 'POST', body: allData });
      }
      queryClient.invalidateQueries({ queryKey: ['get-companies'] });
    },
  });

  const fetchAllData = async () => {
    const stations = await sendAPIRequest<any[]>('/station');
    const salesList = await sendAPIRequest<any[]>('/sale');
    const purchaseList = await sendAPIRequest<any[]>('/purchase');
    setStationOptions(
      stations.map((station: any) => ({
        value: station.station_id,
        label: titleCase(station.station_name),
      }))
    );
    //Check This .....
    setSalesOptions(
      salesList.map((sales: any) => ({
        value: sales.sp_id,
        label: titleCase(sales.sptype),
      }))
    );

    setPurchaseOptions(
      purchaseList.map((purchase: any) => ({
        value: purchase.sp_id,
        label: titleCase(purchase.sptype),
      }))
    );
  };

  useEffect(() => {
    fetchAllData();
    document.getElementById('companyName')?.focus();
  }, []);

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
    setView('');
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

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

  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between px-8 py-1'>
        <h1 className='font-bold'>
          {!!data.company_id ? 'Update company' : 'Create company'}
        </h1>
        <Button
          type='highlight'
          id='company_button'
          handleOnClick={() => {
            setView('');
          }}
        >
          Back
        </Button>
      </div>
      <form onSubmit={formik.handleSubmit} className='flex flex-col w-full'>
        <div className='flex flex-row px-4 mx-4 py-2 gap-2'>
          <div className='relative border w-full h-full pt-4 border-solid border-gray-400'>
            <div className='absolute top-[-14px] left-2  px-2 w-max bg-[#f3f3f3]'>
              Company
            </div>
            <div className='flex flex-col gap-2 w-full px-4 py-2 text-xs leading-3 text-gray-600'>
              <div className='flex gap-12'>
                <FormikInputField
                  isPopupOpen={false}
                  label='Company Name'
                  id='companyName'
                  name='companyName'
                  formik={formik}
                  className='!mb-0'
                  labelClassName='min-w-[110px]'
                  isRequired={true}
                  nextField='shortName'
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                    handleKeyDown(e)
                  }
                  showErrorTooltip={
                    formik.touched.companyName && !!formik.errors.companyName
                  }
                />
                <FormikInputField
                  isPopupOpen={false}
                  label='MFG Code'
                  id='shortName'
                  name='shortName'
                  isTitleCase={false}
                  formik={formik}
                  className='!mb-0 '
                  labelClassName='min-w-[110px]'
                  inputClassName='w-[150px]'
                  isRequired={true}
                  prevField='companyName'
                  nextField='address1'
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                    handleKeyDown(e)
                  }
                  showErrorTooltip={
                    formik.touched.shortName && !!formik.errors.shortName
                  }
                />
              </div>
              <div className='flex items-center m-[1px] gap-11 w-full'>
                <div className='flex items-center m-[1px] w-[47.9%]'>
                  <label htmlFor='address1' className='min-w-[110px]'>
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
                      prevField='shortName'
                      nextField='address2'
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                        handleKeyDown(e)
                      }
                      showErrorTooltip={
                        formik.touched.address1 && !!formik.errors.address1
                      }
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
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                        handleKeyDown(e)
                      }
                      showErrorTooltip={
                        formik.touched.address2 && !!formik.errors.address2
                      }
                    />
                    <FormikInputField
                      isPopupOpen={false}
                      label=''
                      id='address3'
                      name='address3'
                      formik={formik}
                      className='!mb-0'
                      prevField='address2'
                      nextField='stationId'
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                        handleKeyDown(e)
                      }
                      showErrorTooltip={
                        formik.touched.address3 && !!formik.errors.address3
                      }
                    />
                  </div>
                </div>
                <div className='flex flex-col gap-3'>
                  <CustomSelect
                    isPopupOpen={false}
                    label='Station'
                    id='stationId'
                    labelClass='min-w-[110px]'
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
                    placeholder='Station Name'
                    disableArrow={true}
                    hidePlaceholder={false}
                    className='!h-6 rounded-sm'
                    isRequired={true}
                    error={formik.errors.stationId}
                    isTouched={formik.touched.stationId}
                    showErrorTooltip={true}
                    onBlur={() => {
                      formik.setFieldTouched('stationId', true);
                      setFocused('');
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                      const dropdown = document.querySelector(
                        '.custom-select__menu'
                      );
                      if (e.key === 'Enter') {
                        !dropdown && e.preventDefault();
                        document.getElementById('openingBal')?.focus();
                      }
                    }}
                  />
                  <div className='flex gap-2'>
                    <FormikInputField
                      isPopupOpen={false}
                      label={`Opening Balance ₹`}
                      id='openingBal'
                      name='openingBal'
                      formik={formik}
                      placeholder='0.00'
                      className='!mb-0'
                      inputClassName='h-9 text-right w-[105px]'
                      labelClassName='min-w-[110px]'
                      prevField='stationId'
                      nextField='openingBalType'
                      maxLength={12}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                        handleKeyDown(e)
                      }
                      showErrorTooltip={
                        formik.touched.openingBal && !!formik.errors.openingBal
                      }
                    />
                    <CustomSelect
                      isPopupOpen={false}
                      value={
                        formik.values.openingBalType === ''
                          ? null
                          : {
                              label: formik.values.openingBalType,
                              value: formik.values.openingBalType,
                            }
                      }
                      id='openingBalType'
                      onChange={handleFieldChange}
                      options={[
                        { value: 'Cr', label: 'Cr' },
                        { value: 'Dr', label: 'Dr' },
                      ]}
                      isSearchable={false}
                      placeholder='Op. Balance Type'
                      disableArrow={false}
                      hidePlaceholder={false}
                      containerClass='!w-1/4'
                      className='!rounded-none !h-6'
                      isFocused={focused === 'openingBalType'}
                      onBlur={() => {
                        formik.setFieldTouched('openingBalType', true);
                        setFocused('');
                      }}
                      onKeyDown={(
                        e: React.KeyboardEvent<HTMLSelectElement>
                      ) => {
                        const dropdown = document.querySelector(
                          '.custom-select__menu'
                        );
                        if (e.key === 'Enter') {
                          !dropdown && e.preventDefault();
                          setFocused('salesId');
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-3 m-[1px] w-full'>
                <div className='w-[24.6%]'>
                  <CustomSelect
                    isPopupOpen={false}
                    label='Sales'
                    id='salesId'
                    labelClass='min-w-[110px]'
                    isFocused={focused === 'salesId'}
                    value={
                      formik.values.salesId === ''
                        ? null
                        : {
                            label: salesOptions.find(
                              (e) => e.value == formik.values.salesId
                            )?.label,
                            value: formik.values.salesId,
                          }
                    }
                    onChange={handleFieldChange}
                    options={salesOptions}
                    isSearchable={true}
                    placeholder='Sales'
                    disableArrow={true}
                    hidePlaceholder={false}
                    className='!h-6 rounded-sm'
                    isRequired={true}
                    error={formik.errors.salesId}
                    isTouched={formik.touched.salesId}
                    showErrorTooltip={true}
                    onBlur={() => {
                      formik.setFieldTouched('salesId', true);
                      setFocused('');
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                      const dropdown = document.querySelector(
                        '.custom-select__menu'
                      );
                      if (e.key === 'Enter') {
                        !dropdown && e.preventDefault();
                        document.getElementById('purchaseId')?.focus();
                        setFocused('purchaseId');
                      }
                    }}
                  />
                </div>
                <div className='w-[22.4%]'>
                  <CustomSelect
                    isPopupOpen={false}
                    label='Purchase'
                    id='purchaseId'
                    labelClass='min-w-[110px]'
                    isFocused={focused === 'purchaseId'}
                    value={
                      formik.values.purchaseId === ''
                        ? null
                        : {
                            label: purchaseOptions.find(
                              (e) => e.value == formik.values.purchaseId
                            )?.label,
                            value: formik.values.purchaseId,
                          }
                    }
                    onChange={handleFieldChange}
                    options={purchaseOptions}
                    isSearchable={true}
                    placeholder='Purchase'
                    disableArrow={true}
                    hidePlaceholder={false}
                    className='!h-6 rounded-sm'
                    isRequired={true}
                    error={formik.errors.purchaseId}
                    isTouched={formik.touched.purchaseId}
                    showErrorTooltip={true}
                    onBlur={() => {
                      formik.setFieldTouched('purchaseId', true);
                      setFocused('');
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                      const dropdown = document.querySelector(
                        '.custom-select__menu'
                      );
                      if (e.key === 'Enter') {
                        !dropdown && e.preventDefault();
                        document.getElementById('gstIn')?.focus();
                      }
                    }}
                  />
                </div>
              </div>
              <div className='flex items-center m-[1px]'>
                <div className='w-[4/12] mr-3'>
                  <FormikInputField
                    isPopupOpen={false}
                    label='GST In'
                    id='gstIn'
                    name='gstIn'
                    inputClassName='w-[170px]'
                    formik={formik}
                    isTitleCase={false}
                    className='!mb-0'
                    maxLength={15}
                    labelClassName='min-w-[110px]'
                    isRequired={true}
                    prevField='purchaseId'
                    nextField='drugLicenceNo1'
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                      handleKeyDown(e)
                    }
                    showErrorTooltip={
                      formik.touched.gstIn && !!formik.errors.gstIn
                    }
                  />
                </div>
                <div className='w-[4/12] mr-10'>
                  <FormikInputField
                    isPopupOpen={false}
                    label='Drug Licence'
                    id='drugLicenceNo1'
                    name='drugLicenceNo1'
                    isTitleCase={false}
                    inputClassName='w-[147px]'
                    formik={formik}
                    maxLength={17}
                    className='!mb-0'
                    labelClassName='min-w-[110px]'
                    isRequired={true}
                    prevField='gstIn'
                    nextField='panNumber'
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                      handleKeyDown(e)
                    }
                    showErrorTooltip={
                      formik.touched.drugLicenceNo1 &&
                      !!formik.errors.drugLicenceNo1
                    }
                  />
                </div>
                <div className='w-[4/12]'>
                  <FormikInputField
                    isPopupOpen={false}
                    label='PAN Number'
                    id='panNumber'
                    name='panNumber'
                    maxLength={10}
                    inputClassName='w-[158px]'
                    isTitleCase={false}
                    formik={formik}
                    className='!mb-0'
                    labelClassName='min-w-[110px]'
                    isRequired={true}
                    prevField='drugLicenceNo1'
                    nextField='discPercent'
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                      handleKeyDown(e)
                    }
                    showErrorTooltip={
                      formik.touched.panNumber && !!formik.errors.panNumber
                    }
                  />
                </div>
              </div>

              <div className='flex gap-3 m-[1px]'>
                <div className='w-[24.5%]'>
                  <FormikInputField
                    isPopupOpen={false}
                    label='CD% CUSD'
                    id='discPercent'
                    name='discPercent'
                    formik={formik}
                    className='!mb-0'
                    maxLength={5}
                    labelClassName='min-w-[110px]'
                    isRequired={true}
                    prevField='panNumber'
                    nextField='isDiscountPercent'
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                      handleKeyDown(e)
                    }
                    showErrorTooltip={
                      formik.touched.discPercent && !!formik.errors.discPercent
                    }
                  />
                </div>
                <div className='w-[22.7%]'>
                  <CustomSelect
                    isPopupOpen={false}
                    id='isDiscountPercent'
                    label='CD% CUCD Same'
                    onChange={handleFieldChange}
                    options={[
                      { value: 'No', label: 'No' },
                      { value: 'Yes', label: 'Yes' },
                    ]}
                    value={
                      formik.values.isDiscountPercent === ''
                        ? null
                        : {
                            label: formik.values.isDiscountPercent,
                            value: formik.values.isDiscountPercent,
                          }
                    }
                    isSearchable={false}
                    disableArrow={false}
                    hidePlaceholder={false}
                    labelClass='min-w-[190px]'
                    containerClass=''
                    className='!rounded-none !h-6'
                    isFocused={focused === 'isDiscountPercent'}
                    onBlur={() => {
                      formik.setFieldTouched('isDiscountPercent', true);
                      setFocused('');
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                      const dropdown = document.querySelector(
                        '.custom-select__menu'
                      );
                      if (e.key === 'Enter') {
                        !dropdown && e.preventDefault();
                        document.getElementById('stateInOut')?.focus();
                      }
                    }}
                  />
                </div>
              </div>
              <div className='flex gap-3 m-[1px]'>
                <div className='w-[24.5%]'>
                  <CustomSelect
                    isPopupOpen={false}
                    label='State In Out'
                    id='stateInOut'
                    labelClass='starlabel min-w-[110px]'
                    value={
                      formik.values.stateInOut === ''
                        ? null
                        : {
                            label: formik.values.stateInOut,
                            value: formik.values.stateInOut,
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
                    isFocused={focused === 'stateInOut'}
                    onBlur={() => {
                      formik.setFieldTouched('stateInOut', true);
                      setFocused('');
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                      const dropdown = document.querySelector(
                        '.custom-select__menu'
                      );
                      if (e.key === 'Enter') {
                        !dropdown && e.preventDefault();
                        document.getElementById('purSaleAc')?.focus();
                      }
                    }}
                  />
                </div>
                <div className='w-[22.7%]'>
                  <CustomSelect
                    isPopupOpen={false}
                    id='purSaleAc'
                    label='Is Sale/Purchase Account Same'
                    value={
                      formik.values.purSaleAc === ''
                        ? null
                        : {
                            label: formik.values.purSaleAc,
                            value: formik.values.purSaleAc,
                          }
                    }
                    onChange={handleFieldChange}
                    options={[
                      { value: 'No', label: 'No' },
                      { value: 'Yes', label: 'Yes' },
                    ]}
                    isSearchable={false}
                    placeholder=''
                    disableArrow={false}
                    hidePlaceholder={false}
                    labelClass='min-w-[190px]'
                    className='!rounded-none !h-6'
                    isFocused={focused === 'purSaleAc'}
                    onBlur={() => {
                      formik.setFieldTouched('purSaleAc', true);
                      setFocused('');
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                      const dropdown = document.querySelector(
                        '.custom-select__menu'
                      );
                      if (e.key === 'Enter') {
                        !dropdown && e.preventDefault();
                        document.getElementById('phoneNumber')?.focus();
                        setFocused('phoneNumber');
                      }
                    }}
                  />
                </div>
              </div>

              <div className='flex gap-3 m-[1px]'>
                <div className='flex'>
                  <FormikInputField
                    isPopupOpen={false}
                    label='Phone Number'
                    id='phoneNumber'
                    name='phoneNumber'
                    maxLength={10}
                    formik={formik}
                    inputClassName=' border-l-0 w-[140px]'
                    labelClassName='min-w-[118px]'
                    className='!gap-0 text-xs text-gray-600'
                    isRequired={true}
                    children={
                      <span className='border border-solid border-gray-400 bg-gray-100 p-1 h-full select-none'>
                        +91
                      </span>
                    }
                    prevField='purSaleAc'
                    nextField='mobileNumber'
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                      handleKeyDown(e)
                    }
                    showErrorTooltip={
                      formik.touched.phoneNumber && !!formik.errors.phoneNumber
                    }
                  />
                </div>
                <div className='flex'>
                  <FormikInputField
                    isPopupOpen={false}
                    label='Mobile Number'
                    id='mobileNumber'
                    name='mobileNumber'
                    maxLength={10}
                    formik={formik}
                    inputClassName='!ml-0 border-l-0 w-[132px]'
                    labelClassName='min-w-[80px] mr-3'
                    className='!gap-0 text-xs text-gray-600'
                    isRequired={true}
                    children={
                      <span className='border border-solid border-gray-400 bg-gray-100 p-1 h-full select-none'>
                        +91
                      </span>
                    }
                    prevField='phoneNumber'
                    nextField='emailId1'
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                      handleKeyDown(e)
                    }
                    showErrorTooltip={
                      formik.touched.mobileNumber &&
                      !!formik.errors.mobileNumber
                    }
                  />
                </div>
              </div>
              <div className='flex flex-col m-[1px] items-center gap-2'>
                <FormikInputField
                  isPopupOpen={false}
                  labelClassName='min-w-[110px] text-nowrap'
                  label='Email ID 1'
                  id='emailId1'
                  name='emailId1'
                  isTitleCase={false}
                  inputClassName='w-[38.2%]'
                  placeholder='abc@example.com'
                  formik={formik}
                  showErrorTooltip={
                    formik.touched.emailId1 && formik.errors.emailId1
                  }
                  prevField='mobileNumber'
                  nextField='emailId2'
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                    handleKeyDown(e)
                  }
                />
                <FormikInputField
                  isPopupOpen={false}
                  labelClassName='min-w-[110px] text-nowrap'
                  label='Email ID 2'
                  id='emailId2'
                  name='emailId2'
                  isTitleCase={false}
                  inputClassName='w-[38.2%]'
                  placeholder='abc@example.com'
                  formik={formik}
                  showErrorTooltip={
                    formik.touched.emailId2 && formik.errors.emailId2
                  }
                  prevField='emailId1'
                  nextField='emailId3'
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                    handleKeyDown(e)
                  }
                />
                <FormikInputField
                  isPopupOpen={false}
                  labelClassName='min-w-[110px] text-nowrap'
                  label='Email ID 3'
                  id='emailId3'
                  isTitleCase={false}
                  inputClassName='w-[38.2%]'
                  name='emailId3'
                  placeholder='abc@example.com'
                  formik={formik}
                  showErrorTooltip={
                    formik.touched.emailId3 && formik.errors.emailId3
                  }
                  prevField='emailId2'
                  nextField='submit_company'
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                    handleKeyDown(e)
                  }
                />
              </div>
            </div>
          </div>
        </div>
        <div className='w-full px-8 py-2'>
          <Button
            type='fill'
            padding='px-4 py-2'
            id='submit_company'
            btnType='submit'
            disable={!(formik.isValid && formik.dirty)}
            handleOnClick={() => {
              setPopupState({
                ...popupState,
                isAlertOpen: true,
                message: `Company ${!!data.company_id ? 'updated' : 'created'} successfully`,
              });
            }}
            handleOnKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
              if (e.key === 'ArrowUp') {
                e.preventDefault();
              }
            }}
          >
            {!!data.company_id ? 'Update' : 'Submit'}
          </Button>
        </div>
      </form>
      {(popupState.isModalOpen || popupState.isAlertOpen) && (
        <Confirm_Alert_Popup
          onClose={handleClosePopup}
          onConfirm={handleAlertCloseModal}
          message={popupState.message}
          isAlert={popupState.isAlertOpen}
        />
      )}
    </div>
  );
};

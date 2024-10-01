import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import Button from '../../components/common/button/Button';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import FormikInputField from '../../components/common/FormikInputField';
import { getCompanyFormSchema } from './validation_schema';
import { Option, StationFormData, SalesPurchaseFormData } from '../../interface/global';
import CustomSelect from '../../components/custom_select/CustomSelect';
import titleCase from '../../utilities/titleCase';
import useApi from '../../hooks/useApi';
import NumberInput from '../../components/common/numberInput/numberInput'
import { companyViewChain, createCompanyChain } from '../../constants/focusChain/companyFocusChain';
import { TabManager } from '../../components/class/tabManager';

export const CreateCompany = ({ setView , data, stations, getAndSetTableData}: any) => {
  const [stationOptions, setStationOptions] = useState<Option[]>([]);
  const [salesOptions, setSalesOptions] = useState<Option[]>([]);
  const [purchaseOptions, setPurchaseOptions] = useState<Option[]>([]);
  const tabManager = TabManager.getInstance()
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });
  const { sendAPIRequest } = useApi();
  const [salesList, setSalesList] = useState<any[]>([]);
  const [purchaseList, setPurchaseList] = useState<any[]>([]);

  const formik: any = useFormik({
    initialValues: {
      //general
      companyName: data?.companyName || '',
      shortName: data?.shortName || '',
      //address
      address1: data?.address1 || '',
      address2: data?.address2 || '',
      address3: data?.address3 || '',
      stationId: data?.stationId || null,
      //balance
      openingBal: data?.openingBal || 0,
      openingBalType: data?.openingBalType || 'Dr',
      salesId: data?.salesId || '',
      purchaseId: data?.purchaseId || '',
      discPercent: data?.discPercent|| 0,
      isDiscountPercent: data?.isDiscountPercent || false,
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

      purSaleAc: data?.purSaleAc || false,
    },
    validationSchema: getCompanyFormSchema,
    onSubmit: async (values) => {
      const allData = { ...values };
      const filteredData = Object.fromEntries(
        Object.entries(allData).filter(([_, value]) => value !== null && value !== '')
      );
      try {
        if (data.company_id) {
          await sendAPIRequest(`/company/${data.company_id}`, {
            method: 'PUT',
            body: allData,
          });
        } else {
          await sendAPIRequest(`/company`, {
            method: 'POST',
            body: filteredData,
          });
        }
        getAndSetTableData();
        // setPopupState({
        //   ...popupState,
        //   isAlertOpen: true,
        //   message: `Company ${!!data.company_id ? 'updated' : 'created'} successfully`,
        // });
        setView({type : '' , data : {}});
      } catch (error: any) {
        if (!error?.isErrorHandled) {
          console.log(`Company not ${!!data.company_id ? 'updated' : 'created'}`);
        }
      }
    },
  });

  useEffect(() => {
    async function initSalesAndPurchase() {
      try {
        const allSalesAccounts = await sendAPIRequest('/saleAccount');
        const allPurchaseAccounts = await sendAPIRequest('/purchaseAccount');
        setSalesList(allSalesAccounts);
        setPurchaseList(allPurchaseAccounts);
      } catch (err) {
        console.error('SaleAccounts or PuchaseAccounts data in createCompany not being fetched');
      }
    }

    initSalesAndPurchase();
  }, []);
  useEffect(() => {
    tabManager.updateFocusChainAndSetFocus(createCompanyChain, 'companyName')
  }, [])


  useEffect(() => {
    setStationOptions(
      stations.map((station: StationFormData) => ({
        value: station.station_id,
        label: titleCase(station.station_name),
      }))
    );
    document.getElementById('companyName')?.focus();
  }, [stations])

  useEffect(() => {
    setSalesOptions(
      salesList.map((sales: SalesPurchaseFormData) => ({
        value: sales.sp_id,
        label: titleCase(sales.sptype ?? ''),
      }))
    );
  }, [salesList])

  useEffect(() => {
    setPurchaseOptions(
      purchaseList.map((purchase: SalesPurchaseFormData) => ({
        value: purchase.sp_id,
        label: titleCase(purchase.sptype ?? ''),
      }))
    );
  }, [purchaseList])


  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
    setView({ type: '', data: {} });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleFieldChange = (option: Option | null, id: string) => {
    formik.setFieldValue(id, option?.value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let filteredValue = value.replace(/[^0-9.]/g, '');
    const decimalIndex = filteredValue.indexOf('.');
    if (decimalIndex !== -1) {
      const beforeDecimal = filteredValue.slice(0, decimalIndex);
      const afterDecimal = filteredValue.slice(decimalIndex + 1);

      filteredValue = beforeDecimal + '.' + afterDecimal.slice(0, 2);
    }
    if (filteredValue.length <= 12) {
      formik.setFieldValue('openingBal', filteredValue);
    } else {
      formik.setFieldValue('openingBal', filteredValue.slice(0, 12));
    }
  };


  const handleKeyDownCustomSelect = (e: React.KeyboardEvent<HTMLSelectElement>) => {
    const dropdown = document.querySelector(
      '.custom-select__menu'
    );
    if (e.key === 'Enter' && !dropdown) {
      e.preventDefault();
      e.stopPropagation();
      tabManager.focusManager()
    }
  }


  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between px-8 py-1'>
        <h1 className='font-bold'>
          {!!data.company_id ? 'Update company' : 'Create company'}
        </h1>
        <Button
          type='highlight'
          id='back'
          handleOnClick={() => {
            setView({ type: '', data: {} });
            setTimeout(() => {
              tabManager.updateFocusChainAndSetFocus(companyViewChain, 'add')
            }, 0);

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
                  labelClassName='min-w-[112px]'
                  isRequired={true}
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
                  isRequired={false}
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
                  <div className='flex flex-col gap-1 w-full'>
                    <FormikInputField
                      isPopupOpen={false}
                      label=''
                      id='address1'
                      name='address1'
                      placeholder='Address 1'
                      formik={formik}
                      className='!mb-0'
                      showErrorTooltip={
                        formik.touched.address1 && !!formik.errors.address1
                      }
                    />
                    <FormikInputField
                      isPopupOpen={false}
                      label=''
                      id='address2'
                      name='address2'
                      placeholder='Address 2'
                      formik={formik}
                      className='!mb-0'
                      showErrorTooltip={
                        formik.touched.address2 && !!formik.errors.address2
                      }
                    />
                    <FormikInputField
                      isPopupOpen={false}
                      label=''
                      id='address3'
                      name='address3'
                      placeholder='Address 3'
                      formik={formik}
                      className='!mb-0'
                      showErrorTooltip={
                        formik.touched.address3 && !!formik.errors.address3
                      }
                    />
                  </div>
                </div>
                <div className='flex flex-col gap-3 w-[48%]'>
                  <CustomSelect
                    isPopupOpen={false}
                    label='Station'
                    id='stationId'
                    labelClass='min-w-[110px]'
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
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                      handleKeyDownCustomSelect(e)
                    }}
                  />
                  <div className='flex gap-2'>
                     <NumberInput
                        label={`Opening Balance ₹`}
                        id='openingBal'
                        name='openingBal'
                        placeholder='0.00'
                        maxLength={16}
                        min={0}
                        value={formik.values.openingBal}
                        onChange={(value) => formik.setFieldValue('openingBal', value)}
                        onBlur={() => {
                          formik.setFieldTouched('openingBal', true);
                        }}
                        prevField='stateInout'
                        nextField='openingBalType'
                        labelClassName='min-w-[90px] !h-[22px] w-fit text-nowrap me-2'
                        inputClassName='text-left !text-[10px] px-1 !h-[22px] !w-[70%]'
                        error={formik.touched.openingBal && formik.errors.openingBal}
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
                      onBlur={() => {
                        formik.setFieldTouched('openingBalType', true);
                      }}
                      onKeyDown={(
                        e: React.KeyboardEvent<HTMLSelectElement>
                      ) => {
                        handleKeyDownCustomSelect(e)
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-[1.4rem] m-[1px] w-full'>
                <div className='w-[33%]'>
                  <CustomSelect
                    isPopupOpen={false}
                    label='Sales Account'
                    id='salesId'
                    labelClass='min-w-[110px]'
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
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                      handleKeyDownCustomSelect(e)
                    }}
                  />
                </div>
                <div className='w-[33%]'>
                  <CustomSelect
                    isPopupOpen={false}
                    label='Purchase Account'
                    id='purchaseId'
                    labelClass='min-w-[110px]'
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
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                      handleKeyDownCustomSelect(e)
                    }}
                  />
                </div>
                <div className=' w-[33%]'>
                  <CustomSelect
                    isPopupOpen={false}
                    id='purSaleAc'
                    label='Sale/Purchase Account Same for Every Item'
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
                    labelClass='min-w-[170px]'
                    className='!rounded-none !h-6'
                    onBlur={() => {
                      formik.setFieldTouched('purSaleAc', true);
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                      handleKeyDownCustomSelect(e)
                    }}
                  />
                </div>
              </div>
              <div className='flex items-center gap-[0.8rem] m-[1px] w-full'>
                <div className='w-[33%] mr-3'>
                  <FormikInputField
                    isPopupOpen={false}
                    label='GSTIN'
                    id='gstIn'
                    name='gstIn'
                    inputClassName='w-[170px]'
                    isTitleCase={false}
                    formik={formik}
                    className='!mb-0'
                    maxLength={15}
                    labelClassName='min-w-[110px]'
                    isRequired={false}
                    showErrorTooltip={
                      formik.touched.gstIn && !!formik.errors.gstIn
                    }
                  />
                </div>
                <div className='w-[33%] mr-3'>
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
                    isRequired={false}
                    showErrorTooltip={
                      formik.touched.drugLicenceNo1 &&
                      !!formik.errors.drugLicenceNo1
                    }
                  />
                </div>
                <div className='w-[33%]'>
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
                    isRequired={false}
                    showErrorTooltip={
                      formik.touched.panNumber && !!formik.errors.panNumber
                    }
                  />
                </div>
              </div>
              <div className='flex gap-[3rem] m-[1px] w-full'>
                <div className='w-[50%]'>
                  <FormikInputField
                    isPopupOpen={false}
                    label='CD% CUST'
                    id='discPercent'
                    name='discPercent'
                    formik={formik}
                    className='!mb-0'
                    maxLength={5}
                    labelClassName='min-w-[110px]'
                    isRequired={false}
                    showErrorTooltip={
                      formik.touched.discPercent && !!formik.errors.discPercent
                    }
                  />
                </div>
                <div className='w-[50%]'>
                  <CustomSelect
                    isPopupOpen={false}
                    id='isDiscountPercent'
                    label='CD% CUST Same for Every Item'
                    onChange={handleFieldChange}
                    options={[
                      { value: false, label: 'No' },
                      { value: true, label: 'Yes' },
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
                    labelClass='w-[30.6%]'
                    containerClass=''
                    className='!rounded-none !h-6'
                    onBlur={() => {
                      formik.setFieldTouched('isDiscountPercent', true);
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                      handleKeyDownCustomSelect(e)
                    }}
                  />
                </div>
              </div>
              <div className='flex gap-3 m-[1px]'>
                <div className='w-[47.9%]'>
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
                    isRequired={true}
                    placeholder='Select an option'
                    disableArrow={false}
                    hidePlaceholder={false}
                    className='!h-6 rounded-sm'
                    onBlur={() => {
                      formik.setFieldTouched('stateInOut', true);
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                      handleKeyDownCustomSelect(e)
                    }}
                  />
                </div>
              </div>

              <div className='flex gap-[4.4%] m-[1px]'>
                <div className='flex'>
                  <FormikInputField
                    isPopupOpen={false}
                    label='Phone Number'
                    id='phoneNumber'
                    name='phoneNumber'
                    maxLength={10}
                    formik={formik}
                    inputClassName=' border-l-0 w-[349px]'
                    labelClassName='min-w-[118px]'
                    className='!gap-0 text-xs text-gray-600'
                    isRequired={false}
                    children={
                      <span className='border border-solid border-gray-400 bg-gray-100 p-1 h-full select-none'>
                        +91
                      </span>
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
                    inputClassName='!ml-0 border-l-0 w-[342px]'
                    labelClassName='min-w-[110px] mr-3'
                    className='!gap-0 text-xs text-gray-600'
                    isRequired={false}
                    children={
                      <span className='border border-solid border-gray-400 bg-gray-100 p-1 h-full select-none'>
                        +91
                      </span>
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
                  inputClassName='w-[36.6%]'
                  placeholder='abc@example.com'
                  formik={formik}
                  showErrorTooltip={
                    formik.touched.emailId1 && formik.errors.emailId1
                  }
                />
                <FormikInputField
                  isPopupOpen={false}
                  labelClassName='min-w-[110px] text-nowrap'
                  label='Email ID 2'
                  id='emailId2'
                  name='emailId2'
                  isTitleCase={false}
                  inputClassName='w-[36.6%]'
                  placeholder='abc@example.com'
                  formik={formik}
                  showErrorTooltip={
                    formik.touched.emailId2 && formik.errors.emailId2
                  }
                />
                <FormikInputField
                  isPopupOpen={false}
                  labelClassName='min-w-[110px] text-nowrap'
                  label='Email ID 3'
                  id='emailId3'
                  isTitleCase={false}
                  inputClassName='w-[36.6%]'
                  name='emailId3'
                  placeholder='abc@example.com'
                  formik={formik}
                  showErrorTooltip={
                    formik.touched.emailId3 && formik.errors.emailId3
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
            id='save'
            btnType='submit'
            disable={!(formik.isValid) || formik.isSubmitting}
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

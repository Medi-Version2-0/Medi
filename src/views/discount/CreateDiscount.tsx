import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import Button from '../../components/common/button/Button';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import FormikInputField from '../../components/common/FormikInputField';
import { Option } from '../../interface/global';
import CustomSelect from '../../components/custom_select/CustomSelect';
import './discount.css';
import { discountValidationSchema } from './validation_schema';
import { useGetSetData } from '../../hooks/useGetSetData';
import { getAndSetPartywiseDiscount } from '../../store/action/globalAction';
import useApi from '../../hooks/useApi';
import usePartyFooterData from '../../hooks/usePartyFooterData';
import { partyHeaders, companyHeader, companyFooterData} from './partyHeaders'
import { useTabs } from '../../TabsContext';
import { Ledger } from '../ledger';
import { Company } from '../company'
import { SelectList } from '../../components/common/customSelectList/customSelectList';
import NumberInput from '../../components/common/numberInput/numberInput'
import { TabManager } from '../../components/class/tabManager';
import { partywiseDiscountViewChain, createPartywiseDiscountChain, createPartywiseDiscountChainWithAllCompanies } from '../../constants/focusChain/partywiseDiscount';

export const CreateDiscount = ({
  setView,
  data,
  discountTypeOptions,
}: any) => {
  const { sendAPIRequest } = useApi();
  const [focused, setFocused] = useState('');
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });
  const { openTab } = useTabs()
  const partyFooterData = usePartyFooterData();
  const getAndSetPartywiseDiscountHandler = useGetSetData(getAndSetPartywiseDiscount);
  const settingPopupState = (isModal: boolean, message: string) => {
    setPopupState({
      ...popupState,
      [isModal ? 'isModalOpen' : 'isAlertOpen']: true,
      message: message,
    });
  };
  const [popupList, setPopupList] = useState<{ isOpen: boolean, data: any }>({
    isOpen: false,
    data: {}
  })
  const [selectedParty, setSelectedParty] = useState<any>(null);
  const [selectedCompany, setSelectedCompany] = useState<any>();
  const tabManager = TabManager.getInstance()

  useEffect(()=>{
    fecthData();
    tabManager.updateFocusChainAndSetFocus([...createPartywiseDiscountChain ] , 'partyId')    
  },[])

  const fecthData = async()=>{
      try {
        const allCompanies = await sendAPIRequest('/company');
        const matchedCompanies = allCompanies.find((company: any) => company.company_id === formik.values.companyId);
        setSelectedCompany(matchedCompanies)

        const allParties = await sendAPIRequest('/ledger');
        const matchedParties = allParties.find((party: any) => party.party_id === formik.values.partyId);
        setSelectedParty(matchedParties)    
      } catch (err) {
        console.error('data is not being fetched');
      }
    }


  const formik: any = useFormik({
    initialValues: {
      companyId: data?.companyId || selectedCompany,
      discountType: data?.discountType || '',
      partyId: data?.partyId || selectedParty ,
      discount: data?.discount || 0,
    },
    validationSchema: discountValidationSchema,
    onSubmit: async (values) => {
      try{
      values.partyId = selectedParty?.party_id
      values.companyId = selectedCompany?.company_id
      const allData = { ...values, discount: Number(values.discount) };

      if (data.discount_id) {
        if (allData.discountType === 'allCompanies') {
          allData.companyId = null;
        }
        await sendAPIRequest(
          `/partyWiseDiscount/${data.discount_id}`,
          {
            method: 'PUT',
            body: allData,

          }
          )
        } else {
          await sendAPIRequest(`/partyWiseDiscount`, {
            method: 'POST',
            body: allData,
          });
        }
        // settingPopupState(false, `Partywise discount ${!!data.discount_id ? 'updated' : 'created'} successfully`)
        setView({ type: '', data: {} });
        getAndSetPartywiseDiscountHandler();
      }catch(error: any){
        if (!error?.isErrorHandled && error.response.status === 409) {
          settingPopupState(false, `${error.response.data} please check in tabledata`)
        }
      }
    },
  });

  useEffect(() => {
      const focusChain = formik.values.discountType === 'allCompanies' ? createPartywiseDiscountChainWithAllCompanies : createPartywiseDiscountChain;
      const focusedCol = formik.values.discountType === 'allCompanies' ? 'custom_select_discountType' : 'partyId'
      tabManager.updateFocusChainAndSetFocus([...focusChain], focusedCol);
  }, [formik.values.discountType])

  const handlePartyList = () => {
      setPopupList({
        isOpen: true,
        data: {
          heading: 'Party',
          headers: [...partyHeaders],
          footers: partyFooterData,
          newItem: () => openTab('Ledger', <Ledger type='add' />),
          autoClose: true,
          apiRoute: '/ledger',
          extraQueryParams: { locked: "!Y" },
          searchFrom: 'partyName',
          handleSelect: (rowData: any) => {
            formik.setFieldValue('partyId', rowData.partyName);
            handleFieldChange({ label: rowData.partyName, value: rowData.party_id }, 'partyId');
            setSelectedParty(rowData);
            tabManager.setTabLastFocusedElementId('custom_select_discountType')
           }
        }
      })
  }

  useEffect(() => {
    if(!!formik.values.discountType && formik.values.discountType === 'allCompanies'){
      formik.setFieldValue('companyId', null)
    }
  }, [formik.values.discountType])

  const handleCompanyList = () => {
    setPopupList({
      isOpen: true,
      data: {
        heading: 'Company',
        headers: [...companyHeader],
        footers: companyFooterData,
        newItem: () => openTab('Company', <Company type='add' />),
        autoClose: true,
        apiRoute: '/company',
        searchFrom: 'companyName',
        handleSelect: (rowData: any) => { handleFieldChange({ label: rowData.companyName, value: rowData.company_id }, 'companyId'),
        tabManager.focusManager();
         setSelectedCompany(rowData) }
      }
    })
}


  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
    setView({ type: '', data: {} });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleFieldChange = (option: Option | null, id: string) => {
    formik.setFieldValue(id, option?.label);
  };

  const handleCustomFieldChange = (option: Option | null, id: string) => {
    formik.setFieldValue(id, option?.value);    
  };

  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between px-8 py-1'>
        <h1 className='font-bold'>
          {!!data.discount_id
            ? 'Update part-wise discount'
            : 'Create party-wise discount'}
        </h1>
        <Button
          type='highlight'
          id='back'
          handleOnClick={() => {
            setView({ type: '', data: {} });
            tabManager.updateFocusChainAndSetFocus(partywiseDiscountViewChain, 'add')
          }}
        >
          Back
        </Button>
      </div>
      <form onSubmit={formik.handleSubmit} className='flex flex-col w-full'>
        <div className='flex flex-row px-4 mx-4 py-2 gap-2'>
          <div className='relative border w-full h-full pt-4 border-solid border-gray-400'>
            <div className='absolute top-[-14px] left-2  px-2 w-max bg-[#f3f3f3]'>
              Party-wise discount
            </div>
            <div className='flex flex-col gap-2 w-full px-4 py-2 text-xs leading-3 text-gray-600 h-full'>
              <div className='flex items-center m-[1px] gap-11 w-full h-full'>
                <div className='flex flex-col items-start gap-5 w-[40%] h-full'>
                  <FormikInputField
                      inputClassName ="!text-base !w-[70%]"
                      isPopupOpen={false}
                      label="Party Name"
                      id="partyId"
                      readOnly={true}
                      name="partyId"
                      type="text"
                      formik={formik}
                      value={                        
                        formik.values.partyId === '' || !selectedParty
                          ? null : selectedParty?.partyName
                      }
                      className="!h-7 rounded-sm justify-between"
                      onChange={() => handleFieldChange}
                      labelClassName="min-w-[110px] text-base"
                      isRequired={true}
                      onClick={() => { handlePartyList() }}
                      showErrorTooltip={
                        formik.touched.partyId && !!formik.errors.partyId
                      }
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter' ) {
                          handlePartyList();
                          tabManager.focusManager();
                        }
                        
                      }}
                    />


                  <div className='flex flex-row gap-5 w-full text-xs leading-3 text-gray-600 items-start justify-between whitespace-nowrap'>
                          <CustomSelect
                            labelClass = '!text-base '
                            isPopupOpen={false}
                            id= 'discountType'
                            name= "discountType"
                            label= "Discount Type"
                            value={discountTypeOptions.find((option: any) => option.value === formik.values['discountType']) || null}
                            onChange={handleCustomFieldChange}
                            options={discountTypeOptions}
                            isSearchable={true}
                            placeholder='Discount Type'
                            disableArrow={false}
                            hidePlaceholder={false}
                            containerClass='justify-between !w-[100%]'
                            className='!rounded-none !h-7 !w-[70%]'
                            isFocused={focused === 'discountType'}
                            onBlur={() => {
                              formik.setFieldTouched('discountType', true);
                            }}
                            onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                              const dropdown = document.querySelector('.custom-select__menu');
                              if (e.key === 'Enter') {
                                if(!dropdown){
                                  e.preventDefault();
                                  e.stopPropagation();
                                  tabManager.focusManager();
                                }
                              }
                            }}
                          />
                  </div>

                  {formik.values.discountType && (
                  <FormikInputField
                    inputClassName ="!text-base !w-[70%]"
                    isPopupOpen={false}
                    label='Company'
                    id='companyId'
                    name= 'companyId'
                    type='text'
                    readOnly ={true}
                    formik={formik}
                    value={  
                      formik.values.discountType === 'allCompanies'? formik.values.companyId = '' : 
                      formik.values.companyId === '' || !selectedCompany
                        ? null : selectedCompany?.companyName
                    }
                    className='!mb-0 h-7 justify-between'
                    onChange={() => handleFieldChange}
                    labelClassName='min-w-[110px] text-base'
                    isRequired={true}
                    placeholder={formik.values.discountType === 'allCompanies' ? 'All' : ''}
                    isDisabled = {formik.values.discountType === 'allCompanies'}
                    showErrorTooltip={
                      formik.touched.companyId && !!formik.errors.companyId
                    }
                    onClick={() => { handleCompanyList() }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter' ) {
                        handleCompanyList();
                      }
                    }}
                  />
                  )}
                      <NumberInput
                        label={'Discount'}
                        id='discount'
                        name='Discount'
                        placeholder='0.00'
                        maxLength={16}
                        min={0}
                        value={formik.values.discount}
                        onChange={(value) => formik.setFieldValue('discount', value)}
                        onBlur={() => {
                          formik.setFieldTouched('discount', true);
                        }}
                        className = '!mb-0 h-'
                        labelClassName='min-w-[90px] !h-[22px] w-fit text-nowrap me-2 !text-base !gap-6'
                        inputClassName='text-left  px-1 !h-[28px] !w-[70%] !text-base'
                        error={formik.touched.discount && formik.errors.discount}
                      />
                </div>
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
            disable={!(formik.isValid && formik.dirty)}
            handleOnKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                tabManager.focusManager();
              }
            }}
          >
            {!!data.discount_id ? 'Update' : 'Submit'}
          </Button>
        </div>
      </form>
      {(popupState.isModalOpen || popupState.isAlertOpen) && (
        <Confirm_Alert_Popup
          id='createDiscountAlert'
          onClose={handleClosePopup}
          onConfirm={handleAlertCloseModal}
          message={popupState.message}
          isAlert={popupState.isAlertOpen}
        />
      )}
      {popupList.isOpen && <SelectList
        tableData={[]}
        heading={popupList.data.heading}
        closeList={() => setPopupList({ isOpen: false, data: {} })}
        headers={popupList.data.headers}
        footers={popupList.data.footers}
        apiRoute={popupList.data.apiRoute}
        handleSelect={(rowData) => { popupList.data.handleSelect(rowData) }}
        handleNewItem={popupList.data?.newItem}
        searchFrom={popupList.data.searchFrom}
        autoClose={popupList.data.autoClose}
        onEsc={popupList.data.onEsc}
        extraQueryParams={popupList.data.extraQueryParams || {}}
      />}
    </div>
  );
};

import { useEffect, useRef, useState } from 'react';
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
import useApi from '../../hooks/useApi';
import usePartyFooterData from '../../hooks/usePartyFooterData';
import { partyHeaders } from './partyHeaders'
import { useTabs } from '../../TabsContext';
import { Ledger } from '../ledger';
import { SelectList } from '../../components/common/customSelectList/customSelectList';
import NumberInput from '../../components/common/numberInput/numberInput'
import { TabManager } from '../../components/class/tabManager';
import { partywiseDiscountViewChain, createPartywiseDiscountChain, createPartywiseDiscountChainWithAllCompanies } from '../../constants/focusChain/partywiseDiscount';
import { AgGridReact } from 'ag-grid-react';
import { CellEditingStoppedEvent, ColDef, GridOptions, ValueFormatterParams, ValueParserParams } from 'ag-grid-community';
import { useControls } from '../../ControlRoomContext';

interface requiredTableData{
  companyId: number,
  companyName: string,
  partyId: number | undefined,
  discountType: string | undefined,
  discount_id: number | null,
  discount: number | null,
}

interface updatePartyWiseDiscountData{
  discountId?: number,
  discountType: string,
  partyId: number,
  discount: number,
  dpcoDiscount?: number,
  companyId?: number,
}

export const CreateDiscount = ({ setView, data, getAndSetTableData, discountTypeOptions, }: any) => {
  const { sendAPIRequest } = useApi();
  const { decimalValueCount, dpcoDiscount, dpcoAct } = useControls().controlRoomSettings;
  const [popupState, setPopupState] = useState({ isModalOpen: false, isAlertOpen: false, message: '' });
  const { openTab } = useTabs()
  const partyFooterData = usePartyFooterData();
  const settingPopupState = (isModal: boolean, message: string) => {
    setPopupState({ ...popupState, [isModal ? 'isModalOpen' : 'isAlertOpen']: true, message: message, });
  };
  const [popupList, setPopupList] = useState<{ isOpen: boolean, data: any }>({
    isOpen: false,
    data: {}
  })
  const [selectedCompany, setSelectedCompany] = useState<any>();
  const [selectedParty, setSelectedParty] = useState<any>(null);
  // const [partyWiseDiscounts, setPartyWiseDiscounts] = useState<any[]>([]);
  const [companiesData, setCompaniesData] = useState<any[]>([]);
  const [gridTableData, setGridTableData] = useState<any[]>([]);
  const [discountsOfCorrespondingParty, setDiscountsOfCorrespondingParty] = useState<any[]>([]);
  const tabManager = TabManager.getInstance()
  const gridRef = useRef<AgGridReact>(null);

  async function updateDiscount(payload: updatePartyWiseDiscountData){
    try{
      await sendAPIRequest(`/partyWiseDiscount`,{
          method: 'POST',
          body: payload,
      });
    }catch(err:any){
      console.log('Eroor in updating ==> ',err)
    }
  }

  async function createDiscount(payload:any){
    try{
      await sendAPIRequest(`/partyWiseDiscount`,{
          method: 'POST',
          body: payload,
      });
    }catch(err:any){
      console.log('Eroor in creating ==> ',err)
    }
  }

  useEffect(()=>{
    fecthData();
    // getAndSetPartyWiseDiscounts();
    tabManager.updateFocusChainAndSetFocus([...createPartywiseDiscountChain ] , 'partyId')    
  },[])

  // async function getAndSetPartyWiseDiscounts() {
  //   try {
  //     const allPartywiseDiscounts = await sendAPIRequest('/partyWiseDiscount');
  //     setPartyWiseDiscounts(allPartywiseDiscounts);
  //   } catch (err) {
  //     console.error(`PartyWise Discount data in partywiseDiscount (index) not being fetched`);
  //   }
  // }

  const fecthData = async()=>{
    try {
      const allCompanies = await sendAPIRequest('/company');
      // const matchedCompanies = allCompanies.find((company: any) => company.party_id === formik.values.company_id);
      // setSelectedCompany(matchedCompanies);
      setCompaniesData(allCompanies);
      const allParties = await sendAPIRequest('/ledger');
      const matchedParties = allParties.find((party: any) => party.party_id === formik.values.partyId);
      setSelectedParty(matchedParties)    
    } catch (err) {
      console.error('data is not being fetched');
    }
  }
  


  const formik: any = useFormik({
    initialValues: {
      companyId: data?.companyId,
      discountType: data?.discountType || '',
      partyId: data?.partyId || selectedParty ,
      discount: data?.discount || null,
      dpcoDiscount: data?.dpcoDiscount || null,
    },
    validationSchema: discountValidationSchema,
    onSubmit: async (values) => {
      try{
      values.partyId = selectedParty?.party_id;
      const allData:any = { ...values, discount: Number(values.discount), ...( dpcoAct ? {dpcoDiscount: Number(values.dpcoDiscount)} : {}) };

      if (data.discount_id || discountsOfCorrespondingParty.length !== 0) {
        if (allData.discountType === 'allCompanies') {
          allData.companyId = null;
        }
        if(data.discount_id){
          allData.discountId = data.discount_id;
        }
        await updateDiscount(allData);
      } else {
        await createDiscount(allData);
      }
        setView({ type: '', data: {} });
        await getAndSetTableData();
      }catch(error: any){
        if (!error?.isErrorHandled) {
          if(error.response.data.error) {
            settingPopupState(false,error.response.data.error.message);
            return;
          }
        }
      }
    },
  });

  useEffect(() => {
    if (formik.values.discountType === 'companyWise'){
      const requiredTableData: requiredTableData[] = companiesData.map((company: { company_id: number, companyName: string }) => {
        const correspondingDiscountSetup = discountsOfCorrespondingParty.find(discount => discount.companyId === company.company_id && discount.discountType === 'companyWise');
        if (correspondingDiscountSetup) return correspondingDiscountSetup;
        return {
          companyId: company.company_id,
          companyName: company.companyName,
          partyId: +selectedParty?.party_id,
          discountType: String(formik.values.discountType),
          discount_id: null,
          discount: null,
        }
      });
      setGridTableData(requiredTableData);
    }else{
      setGridTableData([]);
    }
  }, [formik.values.discountType, discountsOfCorrespondingParty])

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
          newItem: () => tabManager.openTab('Ledger', <Ledger type='add' />, [], openTab),
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

//   const handleCompanyList = () => {
//     setPopupList({
//       isOpen: true,
//       data: {
//         heading: 'Company',
//         headers: [...companyHeader],
//         footers: companyFooterData,
//         newItem: () => openTab('Company', <Company type='add' />),
//         autoClose: true,
//         apiRoute: '/company',
//         searchFrom: 'companyName',
//         handleSelect: (rowData: any) => { handleFieldChange({ label: rowData.companyName, value: rowData.company_id }, 'companyId'),
//         tabManager.focusManager();
//          setSelectedCompany(rowData) }
//       }
//     })
// }

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

  const defaultColDef: ColDef = {
    editable: false,
    floatingFilter: true,
    flex: 1,
    suppressMovable: true,
    filter: true,
    headerClass: 'custom-header',
  }

  async function handleCellEditingStopped(event: CellEditingStoppedEvent) {
    const { valueChanged } = event;
    const { discount, discountType, discount_id, partyId, companyId } = event.data;
    if (!valueChanged) return;
    if(discount_id){
      await updateDiscount({
        discountId: discount_id,
        discount,
        discountType,
        partyId,
        companyId
      });
    }else{
      await createDiscount({
        discount,
        discountType,
        partyId,
        companyId
      })
    }
  }

  async function setDiscountsAssociatedToParty(){
    try {
      const id = selectedParty?.party_id;
      if (id){
        const response = await sendAPIRequest(`/partyWiseDiscount/${id}`);
        if(response.length !== 0) {
          formik.values.discountType = response[0].discountType;
          if (formik.values.discountType === 'companyWise') {
            const modifiedResponse = response.map((r: any) => {
              return { ...r, companyName: r.company.companyName }
            })
            setDiscountsOfCorrespondingParty(modifiedResponse);
            return;
          }
          if (formik.values.discountType === 'allCompanies') {
            formik.values.discount = response[0].discount;
            setDiscountsOfCorrespondingParty(response);
            return;
          }
        }
        setDiscountsOfCorrespondingParty([]);
      }
    }catch (err: any) {
      if (!err.isErrorHandled) {
        console.log('Discount of given party not fetched')
      }
    }
  }

  useEffect(()=>{
    setDiscountsAssociatedToParty();
  }, [selectedParty?.party_id])

  async function handleDPCODiscountBlur(){
    if(selectedParty?.party_id){
      const payload = {
        partyId: selectedParty.party_id,
        companyId: null,
        discountType: 'dpcoact',
        dpcoDiscount: Number(formik.values.dpcoDiscount)
      }
      await sendAPIRequest(`/partyWiseDiscount`, {
        method: 'POST',
        body: payload,
      });
    }
  }


  const colDefs: any[] = [
    {
      headerName: 'Company Name',
      field: 'companyName',
      suppressMovable: false,
      headerClass: 'custom-header',
      valueFormatter: (params:ValueFormatterParams) => params.value ? params.value : 'All Companies'
    },
    {
      headerName: 'Discount',
      field: 'discount',
      type: 'numberColumn',
      cellEditor: 'agNumberCellEditor', 
      editable: true,
      valueFormatter: (params: ValueFormatterParams) =>{
        if(!params.value){
          // return parseFloat('0').toFixed(decimalValueCount);
          return params.value;
        }
        return params.value.toFixed(decimalValueCount);
      },
    },
  ];

  const gridOptions: GridOptions<any> = {
    pagination: true,
    paginationPageSize: 20,
    paginationPageSizeSelector: [20, 30, 40],
    defaultColDef,
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
            getAndSetTableData();
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

                  {/* dpco discount field only show if dpco setting is enabled */}
                  {dpcoAct && <NumberInput
                    label={'DPCO %'}
                    id='dpcoDiscount'
                    name='dpcoDiscount'
                    min={0}
                    value={dpcoDiscount}
                    onBlur={handleDPCODiscountBlur}
                    onChange={(value) => {
                      // formik.setFieldValue('dpcoDiscount',value);
                    }}
                    className='!mb-0 justify-between'
                    labelClassName='min-w-[110px] !h-[22px] w-fit text-nowrap !ps-0 me-2 !text-base !gap-6'
                    inputClassName='text-left  px-1 !h-[28px] !w-[70%] !text-base'
                  />}

                  {/* discount Type field  */}
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
                      onBlur={() => {
                        formik.setFieldTouched('discountType', true);
                      }}
                      onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                        const dropdown = document.querySelector('.custom-select__menu');
                        if (e.key === 'Enter') {
                          if(!dropdown){
                            e.preventDefault();
                            e.stopPropagation();
                            if(formik.values.discountType === 'companyWise'){ // focus on grid cell
                              const api = gridRef.current?.api;
                              if (api) {
                                api.setFocusedCell(0, 'discount');
                              }
                              return;
                            }
                            tabManager.focusManager();
                          }
                        }
                      }}
                    />
                  </div>
                  {/* company field only show if discount type is allCompanies  */}
                  {formik.values.discountType === "allCompanies" && (
                    <FormikInputField
                      inputClassName ="!text-base !w-[70%]"
                      isPopupOpen={false}
                      label='Company'
                      id='companyId'
                      name= 'companyId'
                      type='text'
                      readOnly ={true}
                      formik={formik}
                      value= 'All'
                      className='!mb-0 h-7 justify-between'
                      onChange={() => handleFieldChange}
                      labelClassName='min-w-[110px] text-base'
                      isRequired={true}
                      isDisabled = {formik.values.discountType === 'allCompanies'}
                    />
                  )}

                  {(formik.values.discountType !== 'companyWise') && <NumberInput
                    label={`Discount %`}
                    id='discount'
                    name='Discount'
                    placeholder='0.00'
                    maxLength={16}
                    min={0}
                    value={formik.values.discountType === 'dpcoact' ? formik.values.discount || dpcoDiscount : formik.values.discount }
                    onChange={(value) => formik.setFieldValue('discount', value)}
                    onBlur={() => {
                      formik.setFieldTouched('discount', true); 
                    }}
                    className = '!mb-0 justify-between'
                    labelClassName='min-w-[110px] !h-[22px] w-fit text-nowrap !ps-0 me-2 !text-base !gap-6'
                    inputClassName='text-left  px-1 !h-[28px] !w-[70%] !text-base'
                    error={formik.touched.discount && formik.errors.discount}
                  />}
                </div>
              </div>
            </div>
            {/* ag grid  */}
             {(formik.values.discountType === "companyWise" && gridTableData.length !== 0) && <div id='companiesGridInDiscount' className='ag-theme-quartz'>
                 {
                   <AgGridReact
                     ref={gridRef}
                     rowData={gridTableData}
                     columnDefs={colDefs}
                     gridOptions={gridOptions}
                     onCellEditingStopped={handleCellEditingStopped}
                   />
                 }
               </div>
             }
          </div>
        </div>
        {formik.values.discountType !== 'companyWise' && <div className='w-full px-8 py-2'>
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
            {!!data.discount_id || discountsOfCorrespondingParty.length ? 'Update' : 'Submit'}
          </Button>
        </div>}
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

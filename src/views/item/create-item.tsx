import React, { useEffect, useRef, useState } from 'react';
import { useFormik } from 'formik';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import Button from '../../components/common/button/Button';
import { itemFormValidations } from './validation_schema';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { CommonBtn } from '../../components/common/button/CommonFormButtons';
import { ItemGroupFormData, Option, CompanyFormData, SalesPurchaseFormData, ItemFormInfoType } from '../../interface/global';
import { useControls } from '../../ControlRoomContext';
import { SelectList } from '../../components/common/customSelectList/customSelectList';
import { Container } from '../../components/common/commonFormFields';
import { TabManager } from '../../components/class/tabManager';
import { useTabs } from '../../TabsContext';
import { Company } from '../company';
import useApi from '../../hooks/useApi';
import { createItemFieldsChain, itemFocusChain } from '../../constants/focusChain/itemsFocusChain';

const root = process.env.REACT_APP_API_URL;

export const companyHeader = [
  { label: 'Company Name', key: 'companyName',width: '50%'},
  { label: 'Station', key: 'Station.station_name',width: '50%'},
  { label: 'OB', key: 'openingBal', width: '14%',fullForm: 'Opening Balance' },
  { label: 'OBT', key: 'openingBalType', width: '6%', fullForm: 'Opening Balance Type'},
]

export const companyFooterData = [
  {
    label: 'Comapny Info',
    data: [ {label: 'GSTIN', key: 'gstIn'}, {label: 'Sales Account', key: 'salesId'}, {label: 'Purchase Account', key: 'purchaseId'}, {label: 'MFG Code', key: 'shortName'}]
  }
]

const CreateItem = ({ setView, data, setShowBatch , fetchItemData, fieldOptions }: any) => {
  const [newItem, setNewItem] = useState();
  const [focused, setFocused] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [popupList, setPopupList] = useState<{ isOpen: boolean, data: any }>({ isOpen: false, data: {} })
  const [popupState, setPopupState] = useState({ isModalOpen: false, isAlertOpen: false, message: '', addText: '' });
  const [options, setOptions] = useState<{ companiesOptions: Option[]; salesOptions: Option[]; purchaseOptions: Option[]; groupOptions: Option[]; }>({ companiesOptions: [], salesOptions: [], purchaseOptions: [], groupOptions: [] });
  const { controlRoomSettings } = useControls();
  const tabManager = TabManager.getInstance()
  const { sendAPIRequest } = useApi();
  const { openTab } = useTabs();
  const lastElementRef = useRef('')


  const settingPopupState = (isModal: boolean, message: string, addText: string) => {
    setPopupState({ ...popupState, [isModal ? 'isModalOpen' : 'isAlertOpen']: true, message: message, addText: addText });
  };

  const itemFormInfo: ItemFormInfoType = useFormik({
    initialValues: {
      name: data?.name || '',
      packing: data?.packing || '',
      service: data?.service || 'Goods',
      shortName: data?.shortName || '',
      hsnCode: data?.hsnCode || '',
      compId: data?.compId || '',
      itemGroupCode: data?.itemGroupCode || '',
      discountPer: data?.discountPer || '',
      saleAccId: data?.saleAccId || '',
      purAccId: data?.purAccId || '',
      scheduleDrug: data?.scheduleDrug || 'NON-H1',
      itemDiscPer: data?.itemDiscPer || '',
      minQty: data?.minQty || '',
      maxQty: data?.maxQty || '',
      selected: data?.selected || '',
      rackNumber: data?.rackNumber || '',
      dpcoact: data?.dpcoact || 'No',
      marginPercentage: data?.marginPercentage || '',
      prescriptionType: data?.prescriptionType || "RX",
      upload: data?.upload || '',
    },

    validationSchema: itemFormValidations,
    onSubmit: async (values: any) => {
      try {
        const finalValues = {
          ...values,
          itemGroupCode: values.itemGroupCode === '' ? null : values.itemGroupCode,
          discountPer: +values.discountPer,
          marginPercentage: +values.marginPercentage,
          maxQty: +values.maxQty,
          minQty: +values.minQty,
        }
        const formData = new FormData();

        if (finalValues.upload instanceof File) {
          formData.append('file', finalValues.upload);
        }

        if (data.id) {
          await sendAPIRequest(`/item/${data.id}`, { method: 'PUT', body: finalValues });
          if (formData.has('file')) await sendAPIRequest(`/item/${data.id}`, { method: 'PUT', body: formData });
        } else {
          const resp: any = await sendAPIRequest(`/item`, { method: 'POST', body: finalValues });
          if (formData.has('file')) {
            const resp: any = await sendAPIRequest(`/item`, { method: 'POST', body: formData })
            console.log(" resp ====> ", formData, resp);
            setNewItem(resp);
          }
          setNewItem(resp);
        }
        fetchItemData();
        settingPopupState(false, `Do you want to create Batches for this item`, 'Add Batch');
      } catch (error: any) {
        if (!error?.isErrorHandled) {
          settingPopupState(false, `Failed to ${data.id ? 'update' : 'create'} item`, '');
        }
      }
    },
  });

  useEffect(() => {
      setCompanyOptions();
      setSalesOptions();
      setPurchaseOptions();
      setItemGroupsOptions();
  }, [])

  useEffect(() => {
    tabManager.updateFocusChainAndSetFocus([...createItemFieldsChain] , 'name');
    if(controlRoomSettings.rackNumber){
      tabManager.updateFocusChainAndSetFocus([...createItemFieldsChain] , 'name');
    }
  }, [])

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
    setView('');
  };

  const setCompanyOptions = () => {
    setOptions((prevOption) => ({
      ...prevOption,
      company: fieldOptions.companiesOptions,
      companiesOptions: fieldOptions.companiesOptions?.map((company: CompanyFormData) => ({
        value: company.company_id,
        label: company.companyName,
      })),
    }));
  }

  const setSalesOptions = () => {
    setOptions((prevOption) => ({
      ...prevOption,
      salesOptions: fieldOptions.salesOptions?.map((sales: SalesPurchaseFormData) => ({
        value: sales.sp_id,
        label: sales.sptype,
      })),
    }));
  }

  const setPurchaseOptions = () => {
    setOptions((prevOption) => ({
      ...prevOption,
      purchaseOptions: fieldOptions.purchaseOptions?.map((purchase: SalesPurchaseFormData) => ({
        value: purchase.sp_id,
        label: purchase.sptype,
      })),
    }));
  }
  const setItemGroupsOptions = () => {
    setOptions((prevOption) => ({
      ...prevOption,
      groupOptions: fieldOptions.itemGroupsOptions?.map((group: ItemGroupFormData) => ({
        value: group.group_code,
        label: group.group_name,
      })),
    }));
  }

  const handleFieldChange = (option: Option | null, id: string) => {
    itemFormInfo.setFieldValue(id, option?.value);
  };

  const handleFieldValue = (name: string, id: number) => {
    if (name === 'compId') {
      const selectedCompany = fieldOptions.companiesOptions?.find((company: any) => company.company_id === id);
      if (selectedCompany) {
        itemFormInfo.setFieldValue('purAccId', selectedCompany?.purchaseId);
        itemFormInfo.setFieldValue('saleAccId', selectedCompany?.salesId);
        selectedCompany?.isDiscountPercent === 'Yes' ? itemFormInfo.setFieldValue('discountPer', selectedCompany?.discPercent) : itemFormInfo.setFieldValue('discountPer', 0);
        itemFormInfo.setFieldValue('shortName', selectedCompany?.shortName);
      }
    }
  }

  const handleFocusShift = (field: string) => {
    document.getElementById(field)?.focus();
    setFocused(field);
  }

  const handleCompanyList = () => {
    setPopupList({
      isOpen: true,
      data: {
        heading: 'Select Company',
        headers: [...companyHeader],
        footers: companyFooterData,
        newItem: () => openTab('Company', <Company type='add' />),
        autoClose: true,
        apiRoute: '/company',
        searchFrom: 'companyName',
        handleSelect: (rowData: any) => {
          handleFieldChange({ label: rowData.companyName, value: rowData.company_id }, 'compId');
          handleFieldValue('compId', rowData.company_id);
          console.log("row data ===> ", rowData);
          setSelectedCompany(rowData);
          // controlRoomSettings.packaging ? handleFocusShift('packing') : (controlRoomSettings.batchWiseManufacturingCode ? handleFocusShift('shortName') : handleFocusShift('service'));
        },
        onEsc: () => {
          setPopupList({ isOpen: false, data: {} });
          // controlRoomSettings.packaging ? document.getElementById('packing')?.focus() : (controlRoomSettings.batchWiseManufacturingCode ? 'shortName' : 'service')
        },
      }
    })
    lastElementRef.current='compId';
  }

  useEffect(() => {
    console.log('comp id ===> ', itemFormInfo.values.compId === '' || !selectedCompany ? null : selectedCompany?.companyName)
  }, [itemFormInfo.values.compId])

  const handleCompanyValue = () => {
    return itemFormInfo.values.compId === '' || !selectedCompany ? null : selectedCompany?.companyName;
  }

  const basicInfoFields = [
    { label: 'Item Name', id: 'name', name: 'name', isRequired: true, type: 'text', nextField: 'compId', autoFocus: true },
    {
      label: 'Company',
      id: 'compId',
      name: 'compId',
      isRequired: true,
      type: 'text',
      // value: `${itemFormInfo.values.compId === '' || !selectedCompany ? null : selectedCompany?.companyName}`, 
      value: itemFormInfo.values.compId === '' || !selectedCompany ? null : selectedCompany?.companyName,
      onClick: handleCompanyList
    },
    ...controlRoomSettings.packaging ? [{ label: 'Packing', id: 'packing', name: 'packing', type: 'text', nextField: 'shortName', prevField: 'compId' }] : [],
  ];

  const container1Fields = [
    ...controlRoomSettings.batchWiseManufacturingCode ? [{ label: 'MFG. Code', id: 'shortName', name: 'shortName', type: 'text', prevField: controlRoomSettings.packaging ? 'packing' : 'compId', nextField: 'service' }] : [],
    {
      label: 'Type',
      id: 'service',
      name: 'service',
      type: 'select',
      options: controlRoomSettings.allowItemAsService
        ? [{ label: 'Goods', value: 'Goods' }, { label: 'Services', value: 'Services' }]
        : [{ label: 'Goods', value: 'Goods' }],
      // nextField: 'hsnCode',
      // prevField: controlRoomSettings.batchWiseManufacturingCode ? 'shortName' : controlRoomSettings.packaging ? 'packing' : 'compId',
    },
    { label: 'HSN/SAC', id: 'hsnCode', name: 'hsnCode', type: 'text', isRequired: true, nextField: 'itemGroupCode', prevField: 'service' },
    { label: 'Item Group', id: 'itemGroupCode', name: 'itemGroupCode', type: 'select', nextField: 'scheduleDrug', prevField: 'hsnCode', options: options.groupOptions },
    {
      label: 'Schedule Drug',
      id: 'scheduleDrug',
      name: 'scheduleDrug',
      type: 'select',
      options: [{ label: 'Non-H1', value: 'NON-H1' }, { label: 'Schedule H1', value: 'H1' }],
      // prevField: 'itemGroupCode',
      // nextField: controlRoomSettings.rxNonrx ? 'prescriptionType' : 'saleAccId',
    },
    ...controlRoomSettings.rxNonrx
      ? [{
        label: 'Prescription Type',
        id: 'prescriptionType',
        name: 'prescriptionType',
        type: 'select',
        // nextField: 'saleAccId',
        // prevField: 'scheduleDrug',
        options: [{ label: 'RX', value: 'RX' }, { label: 'Non-RX', value: 'NON-RX' }],
      }] : [],
  ];

  const container2Fields = [
    { label: 'Sales Account', id: 'saleAccId', name: 'saleAccId', type: 'select', options: options.salesOptions, prevField: controlRoomSettings.rxNonrx ? 'prescriptionType' : 'scheduleDrug', nextField: 'purAccId' },
    { label: 'Purchase Account', id: 'purAccId', name: 'purAccId', type: 'select', options: options.purchaseOptions, prevField: 'saleAccId', nextField: 'discountPer' },
    { label: 'Cash Discount %', id: 'discountPer', name: 'cashDiscountPer', type: 'number', nextField: 'marginPercentage', prevField: 'purAccId' },
    { label: 'Margin %', id: 'marginPercentage', name: 'marginPercentage', type: 'number', nextField: 'minQty', prevField: 'discountPer' },
    { label: 'Min. Quantity', id: 'minQty', name: 'minQty', nextField: 'maxQty', type: 'number', prevField: 'marginPercentage' },
    { label: 'Max. Quantity', id: 'maxQty', name: 'maxQty', prevField: 'minQty', type: 'number', nextField: controlRoomSettings.rackNumber ? 'rackNumber' : controlRoomSettings.dpcoAct ? 'dpcoact' : 'upload' },
  ];

  const container3Fields = [
    ...controlRoomSettings.rackNumber ? [{ label: 'Rack No.', id: 'rackNumber', name: 'rackNumber', type: 'text', nextField: 'dpcoact', prevField: 'maxQty' }] : [],
    ...controlRoomSettings.dpcoAct
      ? [{
        label: 'DPCO Act.',
        id: 'dpcoact',
        name: 'dpcoact',
        type: 'select',
        // nextField: 'upload',
        // prevField: controlRoomSettings.rackNumber ? 'rackNumber' : 'maxQty',
        options: [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }],
      }] : [],
    { label: 'Upload Img.', id: 'upload', name: 'upload', type: 'file', nextField: (itemFormInfo.isValid) ? 'submit_all' : 'name', prevField: controlRoomSettings.dpcoAct ? 'dpcoact' : controlRoomSettings.rackNumber ? 'rackNumber' : 'maxQty' },
  ];

//   useEffect(() => {
//     const handleFocusChange = (event: CustomEvent) => {
//         const { tabId, focusedElementId } = event.detail;
//       if (tabManager.activeTabId === tabId) {
//         if (focusedElementId?.includes('compId')) {
//           if(lastElementRef.current !== 'compId'){
//             // handlePartyList()
//             handleCompanyList()
//           }

//         }
//         else {
//           lastElementRef.current = ''
//         }
//       }
//     };

//     window.addEventListener('tabFocusChange', handleFocusChange as EventListener);

//     return () => {
//         window.removeEventListener('tabFocusChange', handleFocusChange as EventListener);
//     };
// }, []);




  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between px-8 py-1'>
        <h1 className='font-bold'>{data.id ? 'Update Item' : 'Create Item'}</h1>
        <div className='flex gap-2'>
          {data?.id && <Button
            type='fill'
            id='item_button'
            handleOnClick={() => {
              setView('');
              setShowBatch(data);
            }}
          >
            Add Batch
          </Button>
          }
          <Button type='highlight' id='item_button' handleOnClick={() => {setView(''); tabManager.updateFocusChainAndSetFocus(itemFocusChain, 'add')}} > Back </Button>
        </div>
      </div>
      <form onSubmit={itemFormInfo.handleSubmit} className='flex flex-col w-full'>
        <div className='flex flex-row px-4 mx-4 py-2 gap-2'>
          <div className='flex flex-col w-full gap-14 my-4'>
            <Container title='Basic Info' fields={basicInfoFields} formik={itemFormInfo} focused={focused} setFocused={setFocused} className={'!grid-cols-3 !gap-6'} labelClassName={'!min-w-[150px]'} />
            <div className='flex flex-row gap-8'>
              <Container title='Item Info' fields={container1Fields} formik={itemFormInfo} focused={focused} setFocused={setFocused} className={'!flex flex-col !gap-6'} labelClassName={'!min-w-[150px]'} />
              <Container title='Cost Details' fields={container2Fields} formik={itemFormInfo} focused={focused} setFocused={setFocused} className={'!flex flex-col !gap-6'} labelClassName={'!min-w-[150px]'} />
              <Container title='Misc.' fields={container3Fields} formik={itemFormInfo} focused={focused} setFocused={setFocused} className={'!flex flex-col !gap-6'} labelClassName={'!min-w-[150px]'} />
            </div>
          </div>
        </div>
        <div className='w-full px-8 py-2'>
          <CommonBtn id='save' variant='submit' component='itemGroup' setFocused={() => ''} handleOnClick={() => itemFormInfo.handleSubmit()} disable={!itemFormInfo.isValid || itemFormInfo.isSubmitting} prevField='' nextField='' > {data.id ? 'Update' : 'Submit'} </CommonBtn>
        </div>
      </form>
      {(popupState.isModalOpen || popupState.isAlertOpen) && (
        <Confirm_Alert_Popup
          onClose={handleAlertCloseModal}
          onConfirm={handleAlertCloseModal}
          message={popupState.message}
          isAlert={popupState.isAlertOpen}
          {...(popupState.addText ? {
            onAdd: () => {
              setView('');
              setShowBatch(newItem || data);
            }
          } : {})}
          {...(popupState.addText ? { addText: popupState.addText } : {})}
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

export default CreateItem;

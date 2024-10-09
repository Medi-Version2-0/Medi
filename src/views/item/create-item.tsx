import React, { useEffect, useRef, useState } from 'react';
import { useFormik } from 'formik';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import Button from '../../components/common/button/Button';
import { itemFormValidations } from './validation_schema';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { CommonBtn } from '../../components/common/button/CommonFormButtons';
import { ItemGroupFormData, Option, CompanyFormData, SalesPurchaseFormData, ItemFormInfoType } from '../../interface/global';
import {  basicInfoChain, basicInfoChainPacking, costDetailsChain, itemFocusChain, itemInfoChain, itemInfoChianIG, miscChain } from '../../constants/focusChain/itemsFocusChain';
import { useControls } from '../../ControlRoomContext';
import { SelectList } from '../../components/common/customSelectList/customSelectList';
import { Container } from '../../components/common/commonFormFields';
import { TabManager } from '../../components/class/tabManager';
import { useTabs } from '../../TabsContext';
import { Company } from '../company';
import useApi from '../../hooks/useApi';
import { useCompanyPopupData } from '../../hooks/useCompanyPopupData';

const root = process.env.REACT_APP_API_URL;

const CreateItem = ({ setView, data, setShowBatch , fetchItemData, fieldOptions }: any) => {
  const [newItem, setNewItem] = useState();
  const [focused, setFocused] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<any>(data?.company || null);
  const [popupList, setPopupList] = useState<{ isOpen: boolean, data: any }>({ isOpen: false, data: {} })
  const [popupState, setPopupState] = useState({ isModalOpen: false, isAlertOpen: false, message: '', addText: '' });
  const [options, setOptions] = useState<{ companiesOptions: Option[]; salesOptions: Option[]; purchaseOptions: Option[]; groupOptions: Option[]; }>({ companiesOptions: [], salesOptions: [], purchaseOptions: [], groupOptions: [] });
  const { controlRoomSettings } = useControls();
  const tabManager = TabManager.getInstance()
  const { sendAPIRequest } = useApi();
  const { openTab } = useTabs();
  const lastElementRef = useRef('')
  const { companyHeader, companyFooterData } = useCompanyPopupData();

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
        const formData = new FormData();
        Object.keys(values).forEach((key) => {
          if (values[key] instanceof File) {
            formData.append('file', values[key]);
            formData.append(key, 'upload');
          } else {
            formData.append(key, values[key]);
          }
        });

        if (data.id) {
          await sendAPIRequest(`/item/${data.id}`, { method: 'PUT', body: formData });
        } else {
          const resp: any = await sendAPIRequest(`/item`, { method: 'POST', body: formData });
          setNewItem(resp);
        }
        fetchItemData();
        settingPopupState(false, `Item ${data.id ? 'updated' : 'created'} successfully.`, 'Add Batch');
        
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
    const focusChain = getFocusChain()
    tabManager.updateFocusChainAndSetFocus([...focusChain , 'save'] , 'name');    
  }, [controlRoomSettings.allowItemAsService , options.groupOptions?.length])

  const getFocusChain = () => {
    let modifiedBasicInfoChain = [...basicInfoChain];
    let modifiedItemInfoChain = [...itemInfoChianIG];
    let modifiedMiscChain = [...miscChain];
  
    if (controlRoomSettings.packaging) {
      modifiedBasicInfoChain = [...basicInfoChainPacking];
    }

    if (data?.id){
      modifiedBasicInfoChain = ['addBatch' , ...modifiedBasicInfoChain]
    }

    if(!options.groupOptions?.length){
      modifiedItemInfoChain = [...itemInfoChain];
    }

    if(controlRoomSettings.allowItemAsService){
      modifiedItemInfoChain = ['custom_select_service', ...modifiedItemInfoChain];
    }
  
    if (controlRoomSettings.batchWiseManufacturingCode) {
      modifiedItemInfoChain = ['shortName', ...modifiedItemInfoChain];
    }
  
    if (controlRoomSettings.rxNonrx) {
      modifiedItemInfoChain = [...modifiedItemInfoChain, 'custom_select_prescriptionType'];
    }
  
    if (controlRoomSettings.dpcoAct) {
      modifiedMiscChain = ['custom_select_dpcoAct', ...modifiedMiscChain];
    }
  
    if (controlRoomSettings.rackNumber) {
      modifiedMiscChain = ['rackNumber', ...modifiedMiscChain];
    }
  
    const combinedFocusChain = [...modifiedBasicInfoChain, ...modifiedItemInfoChain, ...costDetailsChain, ...modifiedMiscChain];  
    return combinedFocusChain;
  };

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

  const handleCompanyList = () => {
    setPopupList({
      isOpen: true,
      data: {
        heading: 'Select Company',
        headers: [...companyHeader],
        footers: companyFooterData,
        newItem: () => tabManager.openTab('Company', <Company type='add' /> , [] , openTab),
        autoClose: true,
        apiRoute: '/company',
        searchFrom: 'companyName',
        handleSelect: (rowData: any) => {
          handleFieldChange({ label: rowData.companyName, value: rowData.company_id }, 'compId');
          handleFieldValue('compId', rowData.company_id);
          setSelectedCompany(rowData);
          tabManager.setTabLastFocusedElementId(controlRoomSettings.batchWiseManufacturingCode ? 'shortName' : controlRoomSettings.allowItemAsService ? 'service' : 'hsnCode' )
          setTimeout(() => {
            itemFormInfo.setFieldTouched('compId', true, true);
          }, 0);
        },
        onEsc: () => setPopupList({ isOpen: false, data: {} }),
      }
    })
    lastElementRef.current='compId';
  }
  

  const basicInfoFields = [
    { label: 'Item Name', id: 'name', name: 'name', isRequired: true, type: 'text', autoFocus: true },
    ...controlRoomSettings.packaging ? [{ label: 'Packing', id: 'packing', name: 'packing', type: 'text'}] : [],

    {
      label: 'Company',
      id: 'compId',
      name: 'compId',
      readOnly : true,
      isRequired: true,
      type: 'text',
      value: itemFormInfo.values.compId === '' || !selectedCompany ? null : selectedCompany?.companyName.toUpperCase(),
      onClick: handleCompanyList
    },
  ];

  const container1Fields = [
    ...controlRoomSettings.batchWiseManufacturingCode ? [{ label: 'MFG. Code', id: 'shortName', name: 'shortName', type: 'text', maxLength: 8 }] : [],
    {
      label: 'Type',
      id: 'service',
      name: 'service',
      type: 'select',
      disabled: !controlRoomSettings.allowItemAsService,
      options: controlRoomSettings.allowItemAsService
        ? [{ label: 'Goods', value: 'Goods' }, { label: 'Services', value: 'Services' }]
        : [{ label: 'Goods', value: 'Goods' }],
    },
    { label: 'HSN/SAC', id: 'hsnCode', name: 'hsnCode', type: 'text', isRequired: true, maxLength: 8 },
    { label: 'Item Group', id:'itemGroupCode', name: 'itemGroupCode', type: 'select', options: options.groupOptions , disabled : !options.groupOptions?.length},
    { label: 'H1 Schedule', id: 'scheduleDrug', name: 'scheduleDrug', type: 'select', options: [{ label: 'Non-H1', value: 'NON-H1' }, { label: 'Schedule H1', value: 'H1' }]},
    ...controlRoomSettings.rxNonrx ? [{ label: <><b>RX</b>/Non RX</> as any, id: 'prescriptionType', name: 'prescriptionType', type: 'select', options: [{ label: 'RX', value: 'RX' }, { label: 'Non-RX', value: 'NON-RX' }]}] : []];

  const container2Fields = [
    { label: 'Sale A/C', id: 'saleAccId', name: 'saleAccId', type: 'select', options: options.salesOptions},
    { label: 'Purchase A/C', id: 'purAccId', name: 'purAccId', type: 'select', options: options.purchaseOptions},
    { label: 'CD %', id: 'discountPer', name: 'cashDiscountPer', type: 'number', minLength : 0 , max :100},
    { label: 'Margin %', id: 'marginPercentage', name: 'marginPercentage', type: 'number'},
    { label: 'Min. QTY', id: 'minQty', name: 'minQty', type: 'number'},
    { label: 'Max. QTY', id: 'maxQty', name: 'maxQty', type: 'number' },
  ];

  const container3Fields = [
    ...controlRoomSettings.rackNumber ? [{ label: 'Rack No.', id: 'rackNumber', name: 'rackNumber', type: 'text', nextField: 'dpcoact', prevField: 'maxQty' }] : [],
    ...controlRoomSettings.dpcoAct ? [{ label: 'DPCO Act.', id: 'dpcoAct', name: 'dpcoact', type: 'select', options: [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }]}] : [],
    { label: 'Upload Img.', id: 'upload', name: 'upload', type: 'file' },
  ];


  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between px-8 py-1'>
        <h1 className='font-bold'>{data.id ? 'Update Item' : 'Create Item'}</h1>
        <div className='flex gap-2'>
          {data?.id && <Button
            type='fill'
            id='addBatch'
            handleOnClick={() => {
              setView('');
              setShowBatch(data);
            }}
          >
            Add Batch
          </Button>
          }
          <Button type='highlight' id='back' handleOnClick={() => {setView(''); tabManager.updateFocusChainAndSetFocus(itemFocusChain, 'add')}} > Back </Button>
        </div>
      </div>
      <form  className='flex flex-col w-full'>
        <div className='flex flex-row px-4 mx-4 py-2 gap-2'>
          <div className='flex flex-col w-full gap-14 my-4'>
            <Container title='Basic Info' fields={basicInfoFields} formik={itemFormInfo} focused={focused} setFocused={setFocused} className={'!grid-cols-3 !gap-6'} labelClassName={'!min-w-[134px]'} />
            <div className='flex flex-row gap-2'>
              <Container title='Item Info' fields={container1Fields} formik={itemFormInfo} focused={focused} setFocused={setFocused} className={'!flex flex-col !gap-6'} labelClassName={'!min-w-[134px]'} />
              <Container title='Cost Details' fields={container2Fields} formik={itemFormInfo} focused={focused} setFocused={setFocused} className={'!flex flex-col !gap-6'} labelClassName={'!min-w-[100px]'} />
              <Container title='Misc.' fields={container3Fields} formik={itemFormInfo} focused={focused} setFocused={setFocused} className={'!flex flex-col !gap-6'} labelClassName={'!min-w-[134px]'} />
            </div>
          </div>
        </div>
        <div className='w-full px-8 py-2'>
          <CommonBtn id='save' variant='submit' component='itemGroup' handleOnClick={(e:any) => {e.preventDefault(); itemFormInfo.handleSubmit()}} disable={!itemFormInfo.isValid || itemFormInfo.isSubmitting}> {data.id ? 'Update' : 'Submit'} </CommonBtn>
        </div>
      </form>
      {(popupState.isModalOpen || popupState.isAlertOpen) && (
        <Confirm_Alert_Popup
          id='createItemAlert'
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

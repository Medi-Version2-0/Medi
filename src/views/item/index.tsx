import React, { useEffect, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { CompanyFormData, ItemFormData, View, Option } from '../../interface/global';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import Button from '../../components/common/button/Button';
import { ICellRendererParams } from 'ag-grid-community';
import CreateItem from './create-item';
import { Batch } from '../itembatch';
import { useControls } from '../../ControlRoomContext';
import { ControlRoomSettings } from '../../components/common/controlRoom/ControlRoomSettings';
import { itemSettingFields } from '../../components/common/controlRoom/settings';
import { IoSettingsOutline } from 'react-icons/io5';
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import { itemFormValidations } from './validation_schema';
import usePermission from '../../hooks/useRole';
import useApi from '../../hooks/useApi';
import { extractKeys, lookupValue } from '../../helper/helper';
import useHandleKeydown from '../../hooks/useHandleKeydown';

const initialPopupState = { setting: false, search: false };

const Items = ({type = '' , batchData = null}) => {
  const { sendAPIRequest } = useApi();
  const [open, setOpen] = useState(initialPopupState);
  const [view, setView] = useState<View>({ type, data: {} });
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [showBatch, setShowBatch] = useState<any>(batchData);
  const [tableData, setTableData] = useState<ItemFormData | any>(null);
  const [options, setOptions] = useState<{ companiesOptions: Option[]; salesOptions: Option[]; purchaseOptions: Option[]; itemGroupsOptions: Option[]; }>({ companiesOptions: [], salesOptions: [], purchaseOptions: [], itemGroupsOptions: [] });
  const [popupState, setPopupState] = useState({ isModalOpen: false, isAlertOpen: false, message: '' });
  const { createAccess, updateAccess, deleteAccess } = usePermission('item')
  const { controlRoomSettings } = useControls();
  const editing = useRef(false);
  const id = useRef('');

  const fetchData = async () => {
    const items = await sendAPIRequest<ItemFormData[]>('/item');
    const companies = await sendAPIRequest<CompanyFormData[]>('/company');
    const sales = await sendAPIRequest<any[]>('/saleAccount');
    const purchases = await sendAPIRequest<any[]>('/purchaseAccount');
    const itemGroups = await sendAPIRequest<any[]>('/itemGroup');
    setOptions({ companiesOptions: companies, salesOptions: sales, purchaseOptions: purchases, itemGroupsOptions: itemGroups });
    setTableData(items);
  }

  useEffect(() => {
    fetchData();
  }, [view.type]);

  const itemSettingsInitialValues = {
    generateBarcodeBatchWise: controlRoomSettings.generateBarcodeBatchWise || false,
    allowItemAsService: controlRoomSettings.allowItemAsService || false,
    batchWiseManufacturingCode: controlRoomSettings.batchWiseManufacturingCode,
    rxNonrx: controlRoomSettings.rxNonrx || false,
    dpcoAct: controlRoomSettings.dpcoAct || false,
    dpcoDiscount: controlRoomSettings.dpcoDiscount || 0,
    packaging: controlRoomSettings.packaging || false,
    rackNumber: controlRoomSettings.rackNumber || false,
    multiPriceList: controlRoomSettings.multiPriceList || false,
    salesPriceLimit: controlRoomSettings.salesPriceLimit || 0,
  };

  const togglePopup = (isOpen: boolean, key?: string) => {
    if (key) {
      setOpen({ ...open, [key]: isOpen });
    } else {
      setOpen(initialPopupState);
    }
  };

  const companyCodeMap: { [key: number]: string } = {};
  const groupCodeMap: { [key: number]: string } = {};
  const salesCodeMap: { [key: number]: string } = {};
  const purchaseCodeMap: { [key: number]: string } = {};

  options.itemGroupsOptions?.forEach((group: any) => groupCodeMap[group.group_code] = group.group_name);
  options.salesOptions?.forEach((sale: any) => salesCodeMap[sale.sp_id] = sale.sptype);
  options.purchaseOptions?.forEach((sale: any) => purchaseCodeMap[sale.sp_id] = sale.sptype);
  options.companiesOptions?.forEach((company: any) => companyCodeMap[company.company_id] = company.companyName);

  const companies = extractKeys(companyCodeMap);
  const groups = extractKeys(groupCodeMap);
  const sales = extractKeys(salesCodeMap);
  const purchases = extractKeys(purchaseCodeMap);

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false, isModalOpen: false });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleConfirmPopup = async () => {
    setPopupState({ ...popupState, isModalOpen: false });
    try{
      await sendAPIRequest(`/item/${id.current}`, { method: 'DELETE' });
    fetchData();
    }catch(error:any){
      if (!error?.isErrorHandled) {
        setPopupState({ ...popupState, isAlertOpen: true, message:'This item is associated' });
      }
    }
  }
  const handleDelete = (oldData: any) => {
    setPopupState({
      ...popupState,
      isModalOpen: true,
      message: 'Are you sure you want to delete the selected record?',
    });
    id.current = oldData.id;
  };

  const handleCellEditingStopped = async (e: any) => {
    editing.current = false;
    const { column, oldValue, valueChanged, node, data } = e;
    let { newValue } = e;
    if (oldValue === newValue) return;
    const field = column.colId;

    try {
      await itemFormValidations.validateAt(field, { [field]: newValue });

      if (field === 'name') {
        newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
      }
    } catch (error: any) {
      setPopupState({
        ...popupState,
        isAlertOpen: true,
        message: error.message,
      });
      node.setDataValue(field, oldValue);
      return;
    }

    node.setDataValue(field, newValue);

    try{
      await sendAPIRequest(`/item/${data.id}`, { method: 'PUT', body: { [field]: newValue }});
      fetchData();
    }catch (error: any) {
      if (!error?.isErrorHandled) {
        console.log('Item not updated');
      }
    }
  };

  const onCellClicked = (params: { data: any }) => {
    setSelectedRow(selectedRow !== null ? null : params.data);
  };

  const cellEditingStarted = () => {
    editing.current = true;
  };

  const BatchCellRenderer = (props: ICellRendererParams) => {
    const handleClick = () => {
      setShowBatch(props.data);
    };
    return <div onClick={handleClick}>{props.value}</div>;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    handleKeyDownCommon(event, handleDelete, undefined, undefined, selectedRow, setView);
  };

  useHandleKeydown(handleKeyDown, [selectedRow, popupState]);

  const commonColDefConfig = {
    flex: 1,
    filter: true,
    editable: (params: any) => params.node.rowIndex === 0 ? createAccess : updateAccess,
    suppressMovable: true,
    headerClass: 'custom-header',
    floatingFilter: true
  };

  const colDefs: any[] = [
    { headerName: 'Item Name', field: 'name', cellRenderer: BatchCellRenderer, menuTabs: ['filterMenuTab'], editable: false },
    { headerName: 'MFG. Code', field: 'shortName', type: 'rightAligned', headerClass: 'custom-header custom_header_class ag-right-aligned-header', hide: !controlRoomSettings.batchWiseManufacturingCode },
    {
      headerName: 'Company',
      field: 'compId',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: companies, valueListMaxHeight: 120, valueListMaxWidth: 172, valueListGap: 8 },
      valueFormatter: (params: { value: string | number }) => lookupValue(companyCodeMap, params.value),
    },
    {
      headerName: 'Item Group',
      field: 'itemGroupCode',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: groups, valueListMaxHeight: 120, valueListMaxWidth: 172, valueListGap: 8 },
      valueFormatter: (params: { value: string | number }) => lookupValue(groupCodeMap, params.value),
    },
    {
      headerName: 'Sale Account',
      field: 'saleAccId',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: sales, valueListMaxHeight: 120, valueListMaxWidth: 172, valueListGap: 8 },
      valueFormatter: (params: { value: string | number }) => lookupValue(salesCodeMap, params.value),
    },
    {
      headerName: 'Purchase Account',
      field: 'purAccId',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: purchases, valueListMaxHeight: 120, valueListMaxWidth: 172, valueListGap: 8 },
      valueFormatter: (params: { value: string | number }) =>lookupValue(purchaseCodeMap, params.value),
    },
    {
      headerName: 'Actions',
      headerClass: 'custom-header-class custom-header',
      sortable: false,
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
      cellRenderer: (params: { data: any }) => (
        <div className='table_edit_buttons'>
          <FaEdit style={{ cursor: 'pointer', fontSize: '1.1rem' }} onClick={() => setView({ type: 'add', data: params.data })} />
          <MdDeleteForever style={{ cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => handleDelete(params.data)} />
        </div>
      ),
    },
  ];

  const items = () => {
    return (
      <>
        {showBatch ? ( <Batch params={{ showBatch, setShowBatch }} /> ) : (
          <div className='w-full relative'>
            <div className='flex w-full items-center justify-between px-8 py-1'>
              <h1 className='font-bold'>Item Master</h1>
              <div className='flex gap-5 items-center'>
                <Button id='settings' type='highlight' handleOnClick={() => togglePopup(true, 'setting')} > <IoSettingsOutline /> </Button>
                {createAccess && <Button id='add' type='highlight' autoFocus={true} handleOnClick={() => setView({ type: 'add', data: {} })} > Add Item </Button>}
              </div>
            </div>

            <div id='account_table' className='ag-theme-quartz'>
              <AgGridReact rowData={tableData} columnDefs={colDefs} defaultColDef={commonColDefConfig} onCellClicked={onCellClicked} onCellEditingStarted={cellEditingStarted} onCellEditingStopped={handleCellEditingStopped} />
            </div>
            {open.setting && ( <ControlRoomSettings togglePopup={togglePopup} heading={'Item Settings'} fields={itemSettingFields} initialValues={itemSettingsInitialValues} />
            )}
            {(popupState.isModalOpen || popupState.isAlertOpen) && (
              <Confirm_Alert_Popup
                id='viewItemAlert'
                onClose={handleClosePopup}
                onConfirm={ popupState.isAlertOpen ? handleAlertCloseModal : handleConfirmPopup }
                message={popupState.message}
                isAlert={popupState.isAlertOpen}
              />
            )}
          </div>
        )}
      </>
    );
  };

  const renderView = () => {
    switch (view.type) {
      case 'add':
        return <CreateItem setView={setView} data={view.data} setShowBatch={setShowBatch} fetchItemData={fetchData} fieldOptions={options}/>;
      default:
        return items();
    }
  };
  return <div className='w-full'>{renderView()}</div>;
};
export default Items;

import React, { useEffect, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import {
  CompanyFormData,
  ItemFormData,
  ItemGroupFormData,
  View,
} from '../../interface/global';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { useParams } from 'react-router-dom';
import Button from '../../components/common/button/Button';
import { sendAPIRequest } from '../../helper/api';
import { ICellRendererParams } from 'ag-grid-community';
import CreateItem from './create-item';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Batch } from '../itembatch';
import { useControls } from '../../ControlRoomContext';
import { ControlRoomSettings } from '../../components/common/controlRoom/ControlRoomSettings';
import { itemSettingFields } from '../../components/common/controlRoom/settings';
import { GiHamburgerMenu } from "react-icons/gi";
import DropdownTippy from '../../components/common/dropdown/dropdown';
import PriceList from './PriceList';
import SearchItem from './searchItem';

const initialPopupState = {
  setting: false,
  search: false
}

const Items = () => {
  const [view, setView] = useState<View>({ type: '', data: {} });
  const { organizationId } = useParams();
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<ItemFormData | any>(null);
  const [open, setOpen] = useState(initialPopupState);
  const { controlRoomSettings } = useControls();
  const [companyData, setCompanyData] = useState<CompanyFormData | any>(null);
  const [itemGroupData, setItemGroupData] = useState<ItemGroupFormData | any>(
    null
  );
  const [salesData, setSalesData] = useState<any[]>([]);
  const [purchaseData, setPurchaseData] = useState<any[]>([]);
  const [showBatch, setShowBatch] = useState<any>(null);
  const [showPriceList, setShowPriceList] = useState<boolean>(false);

  const editing = useRef(false);
  const id = useRef('');
  const queryClient = useQueryClient();
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  const itemSettingsInitialValues = {
    generateBarcodeBatchWise: controlRoomSettings.generateBarcodeBatchWise || false,
    allowItemAsService: controlRoomSettings.allowItemAsService || false,
    batchWiseManufacturingCode: controlRoomSettings.batchWiseManufacturingCode,
    rxNonrx: controlRoomSettings.rxNonrx || false,
    dpcoAct: controlRoomSettings.dpcoAct || 0,
    packaging: controlRoomSettings.packaging || false,
    rackNumber:controlRoomSettings.rackNumber || false,
    dualPriceList: controlRoomSettings.dualPriceList || false,
  };

  const { data } = useQuery<{ data: ItemFormData }>({
    queryKey: ['get-items'],
    queryFn: () =>
      sendAPIRequest<{ data: ItemFormData }>(`/${organizationId}/item`),
  });

  const togglePopup = (isOpen: boolean , key? :string) => {
    if(key){
      setOpen({...open , [key] : isOpen})
    }
    else{
      setOpen(initialPopupState)
    }
  };

  const getItemData = async () => {
    setTableData(data);
  };

  const getCompany = async () => {
    const companyData = await sendAPIRequest<{ data: CompanyFormData }>(
      `/${organizationId}/company`,
      {
        method: 'GET',
      }
    );
    setCompanyData(companyData);
  };

  const getGroups = async () => {
    const itemGroup = await sendAPIRequest<{ data: ItemGroupFormData }>(
      `/${organizationId}/itemGroup`,
      { method: 'GET' }
    );
    setItemGroupData(itemGroup);
  };

  const getSales = async () => {
    setSalesData(await sendAPIRequest<any[]>(`/${organizationId}/sale`));
  };
  const getPurchases = async () => {
    setPurchaseData(await sendAPIRequest<any[]>(`/${organizationId}/purchase`));
  };

  useEffect(() => {
    getPurchases();
    getSales();
    getGroups();
    getCompany();
    getItemData();
  }, [data]);

  const companyCodeMap: { [key: number]: string } = {};
  const groupCodeMap: { [key: number]: string } = {};
  const salesCodeMap: { [key: number]: string } = {};
  const purchaseCodeMap: { [key: number]: string } = {};

  (itemGroupData || []).forEach((group: any) => {
    groupCodeMap[group.group_code] = group.group_name;
  });

  (salesData || []).forEach((sale: any) => {
    salesCodeMap[sale.sp_id] = sale.sptype;
  });
  (purchaseData || []).forEach((sale: any) => {
    purchaseCodeMap[sale.sp_id] = sale.sptype;
  });

  (companyData || []).forEach((company: any) => {
    companyCodeMap[company.company_id] = company.companyName;
  });

  const extractKeys = (mappings: { [x: number]: string }) => {
    return Object.keys(mappings).map((key) => Number(key));
  };

  const companies = extractKeys(companyCodeMap);
  const groups = extractKeys(groupCodeMap);
  const sales = extractKeys(salesCodeMap);
  const purchases = extractKeys(purchaseCodeMap);

  const lookupValue = (
    mappings: {
      [x: string]: any;
      [x: number]: string;
    },
    key: string | number
  ) => {
    return mappings[key];
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRow]);

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleConfirmPopup = async () => {
    setPopupState({ ...popupState, isModalOpen: false });
    await sendAPIRequest(`/${organizationId}/item/${id.current}`, {
      method: 'DELETE',
    });
    queryClient.invalidateQueries({ queryKey: ['get-items'] });
  };

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
    if (!valueChanged) return;
    const field = column.colId;

    switch (field) {
      case 'name':
        {
          if (!newValue || /^\d+$/.test(newValue) || newValue.length > 100) {
            setPopupState({
              ...popupState,
              isAlertOpen: true,
              message: !newValue
                ? 'Item Name is required'
                : /^\d+$/.test(newValue)
                  ? 'Only Numbers not allowed'
                  : 'Item name cannot exceed 100 characters',
            });
            node.setDataValue(field, oldValue);
            return;
          }
          newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
        }
        break;
      case 'shortName':
        {
          if (!newValue) {
            setPopupState({
              ...popupState,
              isAlertOpen: true,
              message: 'MFG code is required',
            });
            node.setDataValue(field, oldValue);
            return;
          }
        }
        break;
    }

    await sendAPIRequest(`/${organizationId}/item/${data.id}`, {
      method: 'PUT',
      body: { [field]: newValue },
    });
    queryClient.invalidateQueries({ queryKey: ['get-items'] });
  };

  const onCellClicked = (params: { data: any }) => {
    setSelectedRow(selectedRow !== null ? null : params.data);
  };

  const cellEditingStarted = () => {
    editing.current = true;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'n':
      case 'N':
        if (event.ctrlKey) setView({ type: 'add', data: {} });
        break;
      case 'd':
      case 'D':
        if (event.ctrlKey && selectedRow) {
          handleDelete(selectedRow);
        }
        break;
      case 'e':
      case 'E':
        if (event.ctrlKey && selectedRow) {
          setView({ type: 'add', data: selectedRow });
        }
        break;
      default:
        break;
    }
  };

  const BatchCellRenderer = (props: ICellRendererParams) => {
    const handleClick = () => {
      setShowBatch(props.data);
    };

    return <div onClick={handleClick}>{props.value}</div>;
  };

  const commonColDefConfig = {
    flex: 1,
    filter: true,
    editable: true,
    suppressMovable: true,
    headerClass: 'custom-header',
  };
  const colDefs: any[] = [
    {
      headerName: 'Item Name',
      field: 'name',
      cellRenderer: BatchCellRenderer,
      menuTabs: ['filterMenuTab'],
      ...commonColDefConfig,
    },
    {
      headerName: 'MFG. Code',
      field: 'shortName',
      type: 'rightAligned',
      headerClass: 'custom-header custom_header_class ag-right-aligned-header',
      flex: 1,
      filter: true,
      editable: true,
      suppressMovable: true,
    },
    {
      headerName: 'Company',
      field: 'compId',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: companies,
        valueListMaxHeight: 120,
        valueListMaxWidth: 172,
        valueListGap: 8,
      },
      valueFormatter: (params: { value: string | number }) => {
        return lookupValue(companyCodeMap, params.value);
      },
      ...commonColDefConfig,
    },
    {
      headerName: 'Item Group',
      field: 'itemGroupCode',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: groups,
        valueListMaxHeight: 120,
        valueListMaxWidth: 172,
        valueListGap: 8,
      },
      valueFormatter: (params: { value: string | number }) => {
        return lookupValue(groupCodeMap, params.value);
      },
      ...commonColDefConfig,
    },
    {
      headerName: 'Sale Account',
      field: 'saleAccId',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: sales,
        valueListMaxHeight: 120,
        valueListMaxWidth: 172,
        valueListGap: 8,
      },
      valueFormatter: (params: { value: string | number }) =>
        lookupValue(salesCodeMap, params.value),
      ...commonColDefConfig,
    },
    {
      headerName: 'Purchase Account',
      field: 'purAccId',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: purchases,
        valueListMaxHeight: 120,
        valueListMaxWidth: 172,
        valueListGap: 8,
      },
      valueFormatter: (params: { value: string | number }) =>
        lookupValue(purchaseCodeMap, params.value),
      ...commonColDefConfig,
    },
    {
      headerName: 'Actions',
      headerClass: 'custom-header-class custom-header',
      sortable: false,
      suppressMovable: true,
      flex: 1,
      cellStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      cellRenderer: (params: { data: any }) => (
        <div className='table_edit_buttons'>
          <FaEdit
            style={{ cursor: 'pointer', fontSize: '1.1rem' }}
            onClick={() => {
              setView({ type: 'add', data: params.data });
            }}
          />

          <MdDeleteForever
            style={{ cursor: 'pointer', fontSize: '1.2rem' }}
            onClick={() => handleDelete(params.data)}
          />
        </div>
      ),
    },
  ];

  const items = () => {
    return (
      <>
        {showBatch ? (
          <Batch params={{ showBatch, setShowBatch }} />
        ) : showPriceList ? (
          <PriceList />
        ) : (
          <div className='w-full relative'>
            <div className='flex w-full items-center justify-between px-8 py-1'>
              <h1 className='font-bold'>Item Master</h1>
              <div className='flex gap-5 items-center'>
              <DropdownTippy items={[
                {label : 'Show Price List' , click : () => setShowPriceList(true) , key : 'p'},
                {label : 'Search Item By' , click : ()=> {togglePopup(true , 'search')} , key : 'b'},
                {label : 'Settings' , click : ()=> {togglePopup(true , 'setting')} , key : 's'},

              ]}>
                  <GiHamburgerMenu className='text-xl'/>
              </DropdownTippy>
                <Button
                  type='highlight'
                  handleOnClick={() => {
                    setView({ type: 'add', data: {} });
                  }}
                >
                  Add Item
                </Button>
              </div>
            </div>

            <div id='account_table' className='ag-theme-quartz'>
              <AgGridReact
                rowData={tableData}
                columnDefs={colDefs}
                defaultColDef={{
                  floatingFilter: true,
                }}
                onCellClicked={onCellClicked}
                onCellEditingStarted={cellEditingStarted}
                onCellEditingStopped={handleCellEditingStopped}
              />
            </div>
            {open.setting && (
              <ControlRoomSettings
                togglePopup={togglePopup}
                heading={'Item Settings'}
                fields={itemSettingFields}
                initialValues={itemSettingsInitialValues}
              />
            )}
              {
                open.search && 
                <SearchItem
                  handleClosePopup= {()=> togglePopup(false)} />
              }
            {(popupState.isModalOpen || popupState.isAlertOpen) && (
              <Confirm_Alert_Popup
                onClose={handleClosePopup}
                onConfirm={
                  popupState.isAlertOpen
                    ? handleAlertCloseModal
                    : handleConfirmPopup
                }
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
        return <CreateItem setView={setView} data={view.data} />;
      default:
        return items();
    }
  };

  return <div className='w-full'>{renderView()}</div>;
};

export default Items;

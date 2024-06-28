import React, { useEffect, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import {
  CompanyFormData,
  itemFormData,
  ItemGroupFormData,
} from '../../interface/global';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/button/Button';
import { sendAPIRequest } from '../../helper/api';
import { ICellRendererParams } from 'ag-grid-community';

const Items = () => {
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<itemFormData | any>(null);
  const [companyData, setCompanyData] = useState<CompanyFormData | any>(null);
  const [itemGroupData, setItemGroupData] = useState<ItemGroupFormData | any>(
    []
  );
  const [salesData, setSalesData] = useState([]);
  const [purchaseData, setPurchaseData] = useState([]);
  const editing = useRef(false);
  const id = useRef('');
  const electronAPI = (window as any).electronAPI;
  const navigate = useNavigate();
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  const getItemData = async () => {
    const itemData = (
      await sendAPIRequest<{ data: itemFormData }>('/item', { method: 'GET' })
    );
    setTableData(itemData);
  };

  const getCompany = async () => {
    const companyData = (
      await sendAPIRequest<{ data: CompanyFormData }>('/company', {
        method: 'GET',
      })
    ).data;
    setCompanyData(companyData);
    // setCompanyData(electronAPI.getAllCompany('', 'companyName', '', '', ''));
  };

  const getGroups = async () => {
    const itemGroup = await sendAPIRequest<{ data: ItemGroupFormData }>(
      '/itemGroup',
      { method: 'GET' }
    );
    setItemGroupData(itemGroup);
  };

  const getSales = () => {
    setSalesData(electronAPI.getSalesPurchase('', 'sptype', '', 'Sales'));
  };
  const getPurchases = () => {
    setPurchaseData(electronAPI.getSalesPurchase('', 'sptype', '', 'Purchase'));
  };

  useEffect(() => {
    getPurchases();
    getSales();
    getGroups();
    getCompany();
    getItemData();
  }, []);

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
    await sendAPIRequest(`/item/${id.current}`, { method: 'DELETE' });
    getItemData();
  };

  const handleDelete = (oldData: any) => {
    setPopupState({
      ...popupState,
      isModalOpen: true,
      message: 'Are you sure you want to delete the selected record ?',
    });
    id.current = oldData.id;
  };

  const handleUpdate = (oldData: any) => {
    return navigate(`${oldData.id}/edit`, { state: oldData });
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
      case 'compId':
      case 'itemGroupCode':
      case 'saleAccId':
      case 'purAccId':
        {
          newValue = Number(newValue);
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
    await sendAPIRequest(`/item/${data.id}`, {
      method: 'PUT',
      body: { [field]: newValue },
    });
    getItemData();
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
        if (event.ctrlKey) {
          return navigate('new');
        }
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
          handleUpdate(selectedRow);
        }
        break;
      default:
        break;
    }
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
      cellRenderer: (params: ICellRendererParams) => (
        <Link to={`${params.data.id}/batch`}> {params.value}</Link>
      ),
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
      valueFormatter: (params: { value: string | number }) =>
        lookupValue(groupCodeMap, params.value),
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
            onClick={() => handleUpdate(params.data)}
          />

          <MdDeleteForever
            style={{ cursor: 'pointer', fontSize: '1.2rem' }}
            onClick={() => handleDelete(params.data)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between px-8 py-1'>
        <h1 className='font-bold'>Item Master</h1>
        <Button type='highlight' handleOnClick={() => navigate('new')}>
          Add Item
        </Button>
      </div>
      <div id='account_table' className='ag-theme-quartz'>
        {
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
        }
      </div>
      {(popupState.isModalOpen || popupState.isAlertOpen) && (
        <Confirm_Alert_Popup
          onClose={handleClosePopup}
          onConfirm={
            popupState.isAlertOpen ? handleAlertCloseModal : handleConfirmPopup
          }
          message={popupState.message}
          isAlert={popupState.isAlertOpen}
        />
      )}
    </div>
  );
};

export default Items;

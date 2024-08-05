import React, { useEffect, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { CompanyFormData, View, } from '../../interface/global';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { useParams } from 'react-router-dom';
import { ValueFormatterParams } from 'ag-grid-community';
import Button from '../../components/common/button/Button';
import { sendAPIRequest } from '../../helper/api';
import { CreateCompany } from './CreateCompany';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import { getCompanyFormSchema } from './validation_schema';
import { useSelector } from 'react-redux';
import { setCompany } from '../../store/action/globalAction';
import { useDispatch } from 'react-redux'
import usePermission from '../../hooks/useRole';

export const Company = () => {
  const [view, setView] = useState<View>({ type: '', data: {} });
  const { organizationId } = useParams();
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<CompanyFormData | any>(null);
  const { stations: stationData } = useSelector((state: any) => state.global)

  const editing = useRef(false);
  const companyId = useRef<string>('');
  const dispatch = useDispatch()
  const queryClient = useQueryClient();
  let currTable: any[] = [];
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });
  const { createAccess, updateAccess, deleteAccess } = usePermission('company')


  const { data } = useQuery<CompanyFormData[]>({
    queryKey: ['get-companies'],
    queryFn: () => sendAPIRequest<any[]>(`/${organizationId}/company`),
  });

  const ledgerStationsMap: { [key: number]: string } = {};

  stationData?.forEach((station: any) => {
    ledgerStationsMap[station.station_id] = station.station_name;
  });
  const getCompanyData = async () => {
    const data = await sendAPIRequest<any[]>(`/${organizationId}/company`);
    dispatch(setCompany(data))
    setTableData(data);
  };

  useEffect(() => {
    getCompanyData();
  }, [data]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRow]);

  const typeMapping = {
    Dr: 'Debit',
    Cr: 'Credit',
  };

  const extractKey = (mappings: {
    [x: number]: string;
    Dr?: string;
    Cr?: string;
  }) => {
    return Object.keys(mappings);
  };

  const extractKeys = (mappings: {
    [x: number]: string;
    Dr?: string;
    Cr?: string;
  }) => {
    return Object.keys(mappings).map((key) => Number(key));
  };

  const types = extractKey(typeMapping);
  const companyStations = extractKeys(ledgerStationsMap);

  const lookupValue = (
    mappings: {
      [x: string]: any;
      [x: number]: string;
      Dr?: string;
      Cr?: string;
    },
    key: string | number
  ) => {
    return mappings[key];
  };

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleConfirmPopup = async () => {
    setPopupState({ ...popupState, isModalOpen: false });
    await sendAPIRequest(`/${organizationId}/company/${companyId.current}`, {
      method: 'DELETE',
    });
    console.log("tableData------->",tableData)
    dispatch(setCompany(tableData?.filter((x:CompanyFormData)=> x.company_id !== companyId.current)))
    await queryClient.invalidateQueries({ queryKey: ['get-companies'] });
  };

  const decimalFormatter = (params: ValueFormatterParams): any => {
    if (!params.value) return;
    return parseFloat(params.value).toFixed(2);
  };

  const handleDelete = (oldData: any) => {
    setPopupState({
      ...popupState,
      isModalOpen: true,
      message: 'Are you sure you want to delete the selected record ?',
    });
    companyId.current = oldData.company_id;
  };

  const handleCellEditingStopped = async (e: any) => {
    currTable = [];
    editing.current = false;
    const { column, oldValue, valueChanged, node, data } = e;
    let { newValue } = e;
    if (!valueChanged) return;
    const field = column.colId;

    try {
      await getCompanyFormSchema.validateAt(field, { [field]: newValue });

      if (field === 'companyName') {
        newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
        tableData.forEach((data: any) => {
          if (data.company_id !== e.data.company_id) {
            currTable.push(data);
          }
        });

        const existingCompany = currTable.find(
          (company: CompanyFormData) =>
            company.companyName.toLowerCase() === newValue.toLowerCase()
        );

        if (existingCompany) {
          setPopupState({
            ...popupState,
            isAlertOpen: true,
            message: 'Company with this name already exists!',
          });
          node.setDataValue(field, oldValue);
          return;
        }
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
    await sendAPIRequest(`/${organizationId}/company/${data.company_id}`, {
      method: 'PUT',
      body: { [field]: newValue },
    });
    queryClient.invalidateQueries({ queryKey: ['get-companies'] });
  };

  const onCellClicked = (params: { data: any }) => {
    setSelectedRow(selectedRow !== null ? null : params.data);
  };

  const cellEditingStarted = () => {
    editing.current = true;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    handleKeyDownCommon(
      event,
      handleDelete,
      undefined,
      undefined,
      selectedRow,
      setView
    );
  };

  const colDefs: any[] = [
    {
      headerName: 'Company Name',
      field: 'companyName',
      flex: 2,
      menuTabs: ['filterMenuTab'],
      filter: true,
      suppressMovable: true,
      headerClass: 'custom-header',
    },
    {
      headerName: 'Station',
      field: 'stationId',
      flex: 1,
      filter: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: companyStations,
        valueListMaxHeight: 120,
        valueListMaxWidth: 192,
        valueListGap: 8,
      },
      valueFormatter: (params: { value: string | number }) => {
        return lookupValue(ledgerStationsMap, params.value);
      },
      valueGetter: (params: { data: any }) => {
        return lookupValue(ledgerStationsMap, params.data.stationId);
      },
      headerClass: 'custom-header',
      suppressMovable: true,
    },
    {
      headerName: 'Balance( ₹ )',
      field: 'openingBal',
      flex: 1,
      filter: true,
      type: 'rightAligned',
      valueFormatter: decimalFormatter,
      headerClass: 'custom-header custom_header_class ag-right-aligned-header',
      suppressMovable: true,
    },
    {
      headerName: 'Debit/Credit',
      field: 'openingBalType',
      filter: true,
      cellEditor: 'agSelectCellEditor',
      flex: 1,
      cellEditorParams: {
        values: types,
      },
      valueFormatter: (params: ValueFormatterParams) =>
        lookupValue(typeMapping, params.value),
      headerClass: 'custom-header',
      suppressMovable: true,
    },
    {
      headerName: 'Actions',
      headerClass: 'custom-header-class custom-header',
      sortable: false,
      suppressMovable: true,
      flex: 1,
      editable :false,
      cellStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      cellRenderer: (params: { data: any }) => (
        <div className='table_edit_buttons'>
         {updateAccess && <FaEdit
            style={{ cursor: 'pointer', fontSize: '1.1rem' }}
            onClick={() => {
              setView({ type: 'add', data: params.data });
            }}
          />}
         {deleteAccess &&  <MdDeleteForever
            style={{ cursor: 'pointer', fontSize: '1.2rem' }}
            onClick={() => handleDelete(params.data)}
          />}
        </div>
      ),
    },
  ];
  const company = () => {
    return (
      <>
        <div className='flex w-full items-center justify-between px-8 py-1'>
          <h1 className='font-bold'>Company Master</h1>
         {createAccess && <Button
            type='highlight'
            handleOnClick={() => {
              setView({ type: 'add', data: {} });
            }}
          >
            Add Company
          </Button>}
        </div>
        <div id='account_table' className='ag-theme-quartz'>
          {
            <AgGridReact
              rowData={tableData}
              columnDefs={colDefs}
              defaultColDef={{
                floatingFilter: true,
                editable:updateAccess
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
              popupState.isAlertOpen
                ? handleAlertCloseModal
                : handleConfirmPopup
            }
            message={popupState.message}
            isAlert={popupState.isAlertOpen}
          />
        )}
      </>
    );
  };

  const renderView = () => {
    switch (view.type) {
      case 'add':
        return <CreateCompany setView={setView} data={view.data} />;
      default:
        return company();
    }
  };

  return <div className='w-full'>{renderView()}</div>;
};

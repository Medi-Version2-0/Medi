import { useEffect, useState, useRef, useMemo, useContext } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { CompanyFormData, View, } from '../../interface/global';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { ValueFormatterParams } from 'ag-grid-community';
import Button from '../../components/common/button/Button';
import { CreateCompany } from './CreateCompany';
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import { getCompanyFormSchema } from './validation_schema';
import { useSelector } from 'react-redux';
import { getAndSetCompany } from '../../store/action/globalAction';
import usePermission from '../../hooks/useRole';
import useHandleKeydown from '../../hooks/useHandleKeydown';
import { createMap, extractKeys, lookupValue, decimalFormatter } from '../../helper/helper';
import { useGetSetData } from '../../hooks/useGetSetData';
import useApi from '../../hooks/useApi';

export const Company = ({type = ''}) => {
  const [view, setView] = useState<View>({ type: '', data: {} });
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const { sendAPIRequest } = useApi();
  const [tableData, setTableData] = useState<CompanyFormData | any>(null);
  const [stationData, setStationData] = useState<any[]>([]);
  const decimalPlaces = useSelector((state: any) => state.global.controlRoomSettings.decimalValueCount || 2);
  const editing = useRef(false);
  const companyId = useRef<string>('');
  let currTable: any[] = [];
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });
  const { createAccess, updateAccess, deleteAccess } = usePermission('company')
  const settingPopupState = (isModal: boolean, message: string) => {
    setPopupState({
      ...popupState,
      [isModal ? 'isModalOpen' : 'isAlertOpen']: true,
      message: message,
    });
  };


  const companyStationsMap = createMap( stationData, (item) => item.station_id, (item) => item.station_name);
  const companyStations = extractKeys(companyStationsMap);
  const lookupStation = (key: number) =>lookupValue(companyStationsMap, key);


  async function getAndSetTableData() {
    try {
      const allCompanies = await sendAPIRequest('/company');
      setTableData(allCompanies);
    } catch (err) {
      console.error('Company data in company index not being fetched');
    }
  }

  async function getAndSetStations() {
    try {
      const allStation = await sendAPIRequest('/station');
      setStationData(allStation);
    } catch (err) {
      console.log('Stations not fetched in ledger index')
    }
  }

  useEffect(() => {
    getAndSetTableData();
    getAndSetStations();
  }, []);

  const typeMapping = useMemo(() => ({ Dr: 'Dr', Cr: 'Cr',}), []);

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleConfirmPopup = async () => {
    setPopupState({ ...popupState, isModalOpen: false });
    try {
      await sendAPIRequest(`/company/${companyId.current}`, {
        method: 'DELETE',
      });
      getAndSetTableData();
    } catch (error: any) {
      if (!error?.isErrorHandled) {
        console.log('Company not deleted');
      }
    }
  };

  const handleDelete = (oldData: any) => {
    settingPopupState(true, 'Are you sure you want to delete the selected record ?');
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
          (company: CompanyFormData) => company.companyName.toLowerCase() ==  newValue.toLowerCase()
        );

        if (existingCompany) {
          settingPopupState(false, 'Company with this name already exists!');
          node.setDataValue(field, oldValue);
          return;
        }
      }
    } catch (error: any) {
      settingPopupState(false, `${error.message}`);
      node.setDataValue(field, oldValue);
      return;
    }

    node.setDataValue(field, newValue);
    try {
      await sendAPIRequest(`/company/${data.company_id}`, {
        method: 'PUT',
        body: { [field]: newValue },
      });
      getAndSetTableData();
    } catch (error: any) {
      if (!error?.isErrorHandled) {
        console.log('Company not updated');
      }
    }
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

  useHandleKeydown(handleKeyDown, [selectedRow, popupState])

  const defaultCols ={
    flex: 1,
    filter: true,
    suppressMovable: true,
    headerClass: 'custom-header',
    floatingFilter: true,
    editable: updateAccess,
  }

  const colDefs: any[] = [
    {
      headerName: 'Company Name',
      field: 'companyName',
      flex: 2,
      menuTabs: ['filterMenuTab'],
    },
    {
      headerName: 'Station',
      field: 'stationId',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: (params: any) => {
        if(companyStations.length === 0){
          settingPopupState(false, 'No stations found. Please add stations first.');
          return {
            values: [],
            value: null
          }
        }
        return {
          values: companyStations,
          value: params.data.stationId
        }
      },
      valueFormatter: (params: { value: string | number }) => lookupStation(Number(params.value)),
      valueGetter: (params: { data: any }) => lookupStation(params.data.stationId)
    },
    {
      headerName: 'Balance( ₹ )',
      field: 'openingBal',
      type: 'rightAligned',
      cellEditor: 'numericEditor',
      cellEditorParams: {
        decimalPlaces: decimalPlaces,
      },
      headerClass: 'custom-header custom_header_class ag-right-aligned-header',
    },
    {
      headerName: 'Debit/Credit',
      field: 'openingBalType',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: Object.values(typeMapping),
      },
      valueFormatter: (params: ValueFormatterParams) =>
        lookupValue(typeMapping, params.value),
    },
    {
      headerName: 'Actions',
      headerClass: 'custom-header-class custom-header',
      sortable: false,
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
          {deleteAccess && <MdDeleteForever
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
            id='add'
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
              defaultColDef={defaultCols}
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
            id='viewCompanyAlert'
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
        return <CreateCompany setView={setView} data={view.data} stations={stationData} getAndSetTableData= {getAndSetTableData} />;
      default:
        return company();
    }
  };

  return <div className='w-full'>{renderView()}</div>;
};

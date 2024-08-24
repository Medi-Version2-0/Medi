import { useEffect, useState, useRef, useMemo } from 'react';
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
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import { getCompanyFormSchema } from './validation_schema';
import { useSelector } from 'react-redux';
import { getAndSetCompany } from '../../store/action/globalAction';
import usePermission from '../../hooks/useRole';
import useHandleKeydown from '../../hooks/useHandleKeydown';
import { createMap, extractKeys, lookupValue, decimalFormatter } from '../../helper/helper';
import { useGetSetData } from '../../hooks/useGetSetData';

export const Company = () => {
  const [view, setView] = useState<View>({ type: '', data: {} });
  const { organizationId } = useParams();
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<CompanyFormData | any>(null);
  const { stations: stationData, company: companiesData } = useSelector((state: any) => state.global)

  const editing = useRef(false);
  const companyId = useRef<string>('');
  const getAndSetCompanyHandler = useGetSetData(getAndSetCompany);
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

  useEffect(() => {
    setTableData(companiesData);
  }, [companiesData]);

  const typeMapping = useMemo(() => ({ Dr: 'Dr', Cr: 'Cr',}), []);

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
    getAndSetCompanyHandler();
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
    await sendAPIRequest(`/${organizationId}/company/${data.company_id}`, {
      method: 'PUT',
      body: { [field]: newValue },
    });
    getAndSetCompanyHandler();
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
    editable:updateAccess
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
      cellEditorParams: { values: companyStations },
      valueFormatter: (params: { value: string | number }) => lookupStation(Number(params.value)),
      valueGetter: (params: { data: any }) => lookupStation(params.data.stationId)
    },
    {
      headerName: 'Balance( ₹ )',
      field: 'openingBal',
      type: 'rightAligned',
      valueFormatter: decimalFormatter,
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

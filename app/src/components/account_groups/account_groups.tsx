import React, { useEffect, useState, useRef } from 'react';
// import { Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
// import { CreateStation } from './createStation';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import '../stations/stations.css';
import { AccountGroupFormData } from '../../interface/global';
import Confirm_Alert_Popup from '../helpers/Confirm_Alert_Popup';
import { CreateGroup } from './create_accountGroup';
import { ColDef, ColGroupDef } from 'ag-grid-community';
// import { FaSpinner } from 'react-icons/fa';

const initialValue = {
  head_code: '',
  head_name: '',

  parent_code: '',
  group_details: '',
  // station_pinCode: undefined
};

export const Account_group = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<AccountGroupFormData>(initialValue);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<AccountGroupFormData | any>(null);
  const editing = useRef(false);
  //   const navigate = useNavigate();
  //   const [loading, setLoading] = useState<boolean>(true);
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleConfirmPopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
    if (formData.head_name) {
      formData.head_name =
        formData.head_name.charAt(0).toUpperCase() +
        formData.head_name.slice(1);
    }
    if (formData !== initialValue) {
      if (formData.head_code) {
        electronAPI.updateAccountGroup(formData.head_code, formData);
      } else {
        electronAPI.addAccountGroup(formData);
      }
      togglePopup(false);
      getGroups();
    }
  };

  // const typeMapping = {
  //   yes: 'Yes',
  //   no: 'No',
  // };

  // const extractKeys = (mappings: any) => {
  //   return Object.keys(mappings);
  // };

  // const types = extractKeys(typeMapping);
  // const lookupValue = (mappings: any, key: any) => {
  //   return mappings[key];
  // };

  const electronAPI = (window as any).electronAPI;
  const isDelete = useRef(false);

  const togglePopup = (isOpen: boolean) => {
    if (!isOpen) {
      setFormData(initialValue);
      isDelete.current = false;
    }
    setOpen(isOpen);
  };

  const getGroups = async () => {
    setTableData(
      await electronAPI.getAllAccountGroups('', 'head_name', '', '', '')
    );
    //   setLoading(false);
  };

  const deleteAcc = (head_code: string) => {
    electronAPI.deleteAccountGroup(head_code);
    isDelete.current = false;
    togglePopup(false);
    getGroups();
  };

  const handleDelete = (oldData: AccountGroupFormData) => {
    isDelete.current = true;
    setFormData(oldData);
    togglePopup(true);
    setSelectedRow(null);
  };

  const handleUpdate = (oldData: AccountGroupFormData) => {
    setFormData(oldData);
    isDelete.current = false;
    editing.current = true;
    togglePopup(true);
    setSelectedRow(null);
  };

  const handelFormSubmit = (values: AccountGroupFormData) => {
    const mode = values.head_code ? 'update' : 'create';

    if (values.head_name) {
      values.head_name =
        values.head_name.charAt(0).toUpperCase() + values.head_name.slice(1);
    }
    if (values !== initialValue) {
      setPopupState({
        ...popupState,
        isModalOpen: true,
        message: `Are you sure you want to ${mode} this group?`,
      });
      setFormData(values);
    }
  };

  const handleCellEditingStopped = (e: {
    data?: any;
    column?: any;
    oldValue?: any;
    valueChanged?: any;
    node?: any;
    newValue?: any;
  }) => {
    editing.current = false;
    const { data, column, oldValue, valueChanged, node } = e;
    let { newValue } = e;
    if (!valueChanged) return;
    const field = column.colId;
    switch (field) {
      case 'head_name':
        {
          if (!newValue || /^\d+$/.test(newValue) || newValue.length > 100) {
            setPopupState({
              ...popupState,
              isAlertOpen: true,
              message: !newValue
                ? 'Head Name is required'
                : /^\d+$/.test(newValue)
                  ? 'Only Numbers not allowed'
                  : 'Head name cannot exceed 100 characters',
            });
            node.setDataValue(field, oldValue);
            return;
          }
          newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
        }
        break;
      case 'cst_sale':
        {
          if (newValue) newValue = newValue.toLowerCase();
          if (!['yes', 'no'].includes(newValue)) {
            return node.setDataValue(field, oldValue);
          }
        }
        break;
      default:
        break;
    }
    electronAPI.updateAccountGroup(data.head_code, { [field]: newValue });
    getGroups();
  };

  const onCellClicked = (params: { data: any }) => {
    setSelectedRow(selectedRow !== null ? null : params.data);
  };

  const cellEditingStarted = () => {
    editing.current = true;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        togglePopup(false);
        break;
      case 'n':
      case 'N':
        if (event.ctrlKey) {
          togglePopup(true);
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
      //   case ' ':
      //     if (!editing.current && selectedRow) {
      //       return navigate(`/transactions/${selectedRow.ac_code}`);
      //     }
      //     break;
      default:
        break;
    }
  };

  //   const decimalFormatter = (params: any) => {
  //     if (!params.value) return;
  //     return parseFloat(params.value).toFixed(2);
  //   };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRow]);

  useEffect(() => {
    getGroups();
  }, []);

  const colDefs: (ColDef<any, any> | ColGroupDef<any>)[] | null | undefined[] =
    [
      {
        headerName: 'Head Code',
        field: 'head_code',
        //   flex: 2,
        flex: 1,
        //   cellRenderer: (params: any) => (
        //     <Link to={`/transactions/${params.data.ac_code}`}> {params.value}</Link>
        //   ),
        menuTabs: ['filterMenuTab'],
        filter: true,
        editable: true,
        suppressMovable: true,
        headerClass: 'custom-header',
      },
      {
        headerName: 'Head Name',
        field: 'head_name',
        flex: 1,
        filter: true,
        editable: true,
        headerClass: 'custom-header',
        suppressMovable: true,
      },
      {
        headerName: 'Parent Code',
        field: 'parent_code',
        flex: 1,
        filter: true,
        type: 'rightAligned',
        editable: true,
        headerClass:
          'custom-header custom_header_class ag-right-aligned-header',
        suppressMovable: true,
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
        cellRenderer: (params: { data: AccountGroupFormData }) => (
          <div className='table_edit_buttons'>
            <FaEdit
              style={{ cursor: 'pointer', fontSize: '1.1rem' }}
              onClick={() => handleUpdate(params.data)}
            />

            <MdDeleteForever
              style={{ cursor: 'pointer', fontSize: '1.2rem' }}
              onClick={() => {
                handleDelete(params.data);
              }}
            />
          </div>
        ),
      },
    ];
  return (
    <div className='container'>
      <div id='account_main'>
        <h1 id='account_header'>Account Group</h1>
        <button
          id='account_button'
          className='account_button'
          onClick={() => togglePopup(true)}
        >
          Add Group
        </button>
      </div>
      <div id='account_table' className='ag-theme-quartz'>
        {/* {!loading && ( */}
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
            // localeText={{ dateFormatOoo: 'DD_MM_YYYY' }}
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
      {open && (
        <CreateGroup
          togglePopup={togglePopup}
          data={formData}
          handelFormSubmit={handelFormSubmit}
          isDelete={isDelete.current}
          deleteAcc={deleteAcc}
        />
      )}
    </div>
  );
};

import React, { useEffect, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import '../../components/stations/stations.css';
import { GroupFormData } from '../../interface/global';
import Confirm_Alert_Popup from '../../components/helpers/Confirm_Alert_Popup';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import { CreateGroup } from './CreateGroup';
import Button from '../../components/common/button/Button';

const initialValue = {
  group_code: '',
  group_name: '',
  type: '',
  parent_code: '',
  isPredefinedGroup: true,
};

export const Groups = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<GroupFormData>(initialValue);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<GroupFormData | any>(null);
  const editing = useRef(false);
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  const typeMapping = {
    p_and_l: 'P&L',
    balance_sheet: 'Balance Sheet',
  };

  const extractKeys = (mappings: any) => {
    const value = Object.keys(mappings);
    value[0] = 'P&L';
    value[1] = 'Balance Sheet';
    return value;
  };

  const types = extractKeys(typeMapping);

  const lookupValue = (mappings: any, key: string | number) => {
    return mappings[key];
  };

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleConfirmPopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
    if (formData.group_name) {
      formData.group_name =
        formData.group_name.charAt(0).toUpperCase() +
        formData.group_name.slice(1);
    }
    if (formData !== initialValue) {
      if (formData.group_code) {
        electronAPI.updateGroup(formData.group_code, formData);
      } else {
        electronAPI.addGroup(formData);
      }
      togglePopup(false);
      getGroups();
    }
  };
  const electronAPI = (window as any).electronAPI;
  const isDelete = useRef(false);

  const togglePopup = (isOpen: boolean) => {
    if (!isOpen) {
      setFormData(initialValue);
      isDelete.current = false;
    }
    setOpen(isOpen);
  };

  const getGroups = () => {
    setTableData(electronAPI.getAllGroups('', '', '', '', ''));
  };

  const deleteAcc = (group_code: string) => {
    electronAPI.deleteGroup(group_code);
    isDelete.current = false;
    togglePopup(false);
    getGroups();
  };

  const handleDelete = (oldData: GroupFormData) => {
    isDelete.current = true;
    setFormData(oldData);
    togglePopup(true);
    setSelectedRow(null);
  };

  const handleUpdate = (oldData: GroupFormData) => {
    setFormData(oldData);
    isDelete.current = false;
    editing.current = true;
    togglePopup(true);
    setSelectedRow(null);
  };

  const handelFormSubmit = (values: GroupFormData) => {
    const mode = values.group_code ? 'update' : 'create';
    if (values.group_name) {
      values.group_name =
        values.group_name.charAt(0).toUpperCase() + values.group_name.slice(1);
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
    if (e?.data?.isPredefinedGroup === false) {
      editing.current = false;
      const { data, column, oldValue, valueChanged, node } = e;
      let { newValue } = e;
      if (!valueChanged) return;
      const field = column.colId;
      switch (field) {
        case 'group_name':
          {
            if (!newValue || /^\d+$/.test(newValue) || newValue.length > 100) {
              setPopupState({
                ...popupState,
                isAlertOpen: true,
                message: !newValue
                  ? 'Group Name is required'
                  : /^\d+$/.test(newValue)
                    ? 'Only Numbers not allowed'
                    : 'Group name cannot exceed 100 characters',
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
      electronAPI.updateGroup(data.group_code, { [field]: newValue });
      getGroups();
    } else {
      const { column, oldValue, node } = e;
      const field = column.colId;
      setPopupState({
        ...popupState,
        isAlertOpen: true,
        message: 'Predefined Groups are not editable',
      });
      node.setDataValue(field, oldValue);
      return;
    }
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
        if (
          event.ctrlKey &&
          selectedRow &&
          selectedRow.isPredefinedGroup === false
        ) {
          handleDelete(selectedRow);
        } else if (
          event.ctrlKey &&
          selectedRow &&
          selectedRow.isPredefinedGroup === true
        ) {
          setPopupState({
            ...popupState,
            isAlertOpen: true,
            message: 'Predefined Groups should not be deleted',
          });
        }
        break;
      case 'e':
      case 'E':
        if (
          event.ctrlKey &&
          selectedRow &&
          selectedRow.isPredefinedGroup === false
        ) {
          handleUpdate(selectedRow);
        } else if (
          event.ctrlKey &&
          selectedRow &&
          selectedRow.isPredefinedGroup === true
        ) {
          setPopupState({
            ...popupState,
            isAlertOpen: true,
            message: 'Predefined Groups are not editable',
          });
        }
        break;
      default:
        break;
    }
  };

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
        headerName: 'Group Name',
        field: 'group_name',
        flex: 1,
        filter: true,
        editable: (params) => !params.data.isPredefinedGroup,
        headerClass: 'custom-header',
        suppressMovable: true,
      },
      {
        headerName: 'P&L / BL. Sheet',
        field: 'type',
        filter: true,
        editable: (params) => !params.data.isPredefinedGroup,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: types,
        },
        valueFormatter: (params: { value: string | number }) =>
          lookupValue(typeMapping, params.value),
        flex: 1,
        headerClass: 'custom-header',
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
        cellRenderer: (params: { data: GroupFormData }) => (
          <div className='table_edit_buttons'>
            <FaEdit
              style={{ cursor: 'pointer', fontSize: '1.1rem' }}
              onClick={() => {
                if (params.data.isPredefinedGroup === false) {
                  handleUpdate(params.data);
                } else if (params.data.isPredefinedGroup === true) {
                  setPopupState({
                    ...popupState,
                    isAlertOpen: true,
                    message: 'Predefined Groups are not editable',
                  });
                }
              }}
            />

            <MdDeleteForever
              style={{ cursor: 'pointer', fontSize: '1.2rem' }}
              onClick={() => {
                if (params.data.isPredefinedGroup === false) {
                  handleDelete(params.data);
                } else if (params.data.isPredefinedGroup === true) {
                  setPopupState({
                    ...popupState,
                    isAlertOpen: true,
                    message: 'Predefined Groups should not be deleted',
                  });
                }
              }}
            />
          </div>
        ),
      },
    ];
  return (
    <>
      <div className='w-full'>
        <div className="flex justify-between mx-[1.6rem] my-8 bg-[#f3f3f3] ">
          <h1 className="font-bold text-[#171A1FFF] m-0 ">Groups</h1>
          <Button type='highlight' className='' handleOnClick={() => togglePopup(true)}>Add Group</Button>
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
              popupState.isAlertOpen
                ? handleAlertCloseModal
                : handleConfirmPopup
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
    </>
  );
};

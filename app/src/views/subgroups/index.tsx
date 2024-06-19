import React, { useEffect, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { SubGroupFormData } from '../../interface/global';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import { CreateSubGroup } from './CreateSubGroup';
import Button from '../../components/common/button/Button';

const initialValue = {
  group_code: '',
  group_name: '',
  type: '',
  parent_group: '',
  isPredefinedGroup: true,
};

export const SubGroups = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<SubGroupFormData>(initialValue);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<SubGroupFormData | any>(null);
  const [currTableData, setCurrTableData] = useState<SubGroupFormData | any>(null);
  const [groupData, setGroupData] = useState([]);
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

  const getGroups = () => {
    setGroupData(electronAPI.getAllGroups('', '', '', '', ''));
  };

  useEffect(() => {
    getGroups();
  }, []);

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
        electronAPI.updateSubGroup(formData.group_code, formData);
      } else {
        electronAPI.addSubGroup(formData);
      }
      togglePopup(false);
      getSubGroups();
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

  const getSubGroups = () => {
    setTableData(electronAPI.getAllSubGroups('', '', ''));
    setCurrTableData(electronAPI.getAllSubGroups('', '', ''));
  };

  const deleteAcc = (group_code: string) => {
    electronAPI.deleteSubGroup(group_code);
    isDelete.current = false;
    togglePopup(false);
    getSubGroups();
  };

  const handleDelete = (oldData: SubGroupFormData) => {
    isDelete.current = true;
    setFormData(oldData);
    togglePopup(true);
    setSelectedRow(null);
  };

  const handleUpdate = (oldData: SubGroupFormData) => {
    setFormData(oldData);
    isDelete.current = false;
    editing.current = true;
    togglePopup(true);
    setSelectedRow(null);
  };

  const handelFormSubmit = (values: SubGroupFormData) => {
    const mode = values.group_code ? 'update' : 'create';
    const existingGroup = tableData.find(
      (group: SubGroupFormData) => {
        if (mode === 'create')
          return (group.group_name.toLowerCase() === values.group_name.toLowerCase())
        return ((group.group_name.toLowerCase() === values.group_name.toLowerCase()) && (group.group_code !== values.group_code))
      }
    );
    if (existingGroup) {
      setPopupState({
        ...popupState,
        isAlertOpen: true,
        message: 'Sub Group with this name already exists!',
      });
      return;
    }
    if (values.group_name) {
      values.group_name =
        values.group_name.charAt(0).toUpperCase() + values.group_name.slice(1);
    }
    if (values.parent_group) {
      groupData.map((group: any) => {
        if (values.parent_group?.toLowerCase() === group.group_name?.toLowerCase()) {
          values.parent_code = Number(`${group.group_code}`);
          delete values.parent_group;
        }
      });
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
            const existingGroups = currTableData.find(
              (group: SubGroupFormData) =>
                group.group_name?.toLowerCase() === newValue?.toLowerCase()
            );
            if (existingGroups) {
              setPopupState({
                ...popupState,
                isAlertOpen: true,
                message: 'Sub Group with this name already exists!',
              });
              node.setDataValue(field, oldValue);
              return;
            }
            else if (!newValue || /^\d+$/.test(newValue) || newValue.length > 100) {
              setPopupState({
                ...popupState,
                isAlertOpen: true,
                message: !newValue
                  ? 'Sub Group name is required'
                  : /^\d+$/.test(newValue)
                    ? 'Only Numbers not allowed'
                    : 'Sub Group name cannot exceed 100 characters',
              });
              node.setDataValue(field, oldValue);
              return;
            }
            newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
          }
          break;
        case 'igst_sale':
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
      electronAPI.updateSubGroup(data.group_code, { [field]: newValue });
      getSubGroups();
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
    getSubGroups();
  }, []);

  const colDefs: (ColDef<any, any> | ColGroupDef<any>)[] | null | undefined[] =
    [
      {
        headerName: 'Sub Group Name',
        field: 'group_name',
        flex: 1,
        filter: true,
        editable: true,
        headerClass: 'custom-header',
        suppressMovable: true,
      },
      {
        headerName: 'P&L / BL. Sheet',
        field: 'type',
        filter: true,
        editable: true,
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
        cellRenderer: (params: { data: SubGroupFormData }) => (
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
        <div className="flex w-full items-center justify-between px-8 py-1">
          <h1 className="font-bold">Sub Groups</h1>
          <Button id='account_button' handleOnClick={() => togglePopup(true)} type='highlight'>Add Subgroup</Button>
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
          <CreateSubGroup
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

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
import { sendAPIRequest } from '../../helper/api';
import { useParams } from 'react-router-dom';

const initialValue = {
  group_code: '',
  group_name: '',
  parent_code: '',
  isPredefinedGroup: true,
};

export const SubGroups = () => {
  const { organizationId } = useParams();
  const [open, setOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<SubGroupFormData>(initialValue);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<SubGroupFormData | any>(null);
  const editing = useRef(false);
  let currTable: any[] = [];
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

  const handleConfirmPopup = async () => {
    setPopupState({ ...popupState, isModalOpen: false });
    if (formData.group_name) {
      formData.group_name =
        formData.group_name.charAt(0).toUpperCase() +
        formData.group_name.slice(1);
    }
    if (formData !== initialValue) {
      if (formData.group_code) {
        await sendAPIRequest(`/${organizationId}/group/sub/${formData.group_code}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        await sendAPIRequest(`/${organizationId}/group/sub`, {
          method: 'POST',
          body: formData,
        });
      }
      togglePopup(false);
      getSubGroups();
    }
  };
  const isDelete = useRef(false);

  const togglePopup = (isOpen: boolean) => {
    if (!isOpen) {
      setFormData(initialValue);
      isDelete.current = false;
    }
    setOpen(isOpen);
  };

  const getSubGroups = async () => {
    const subGroups = await sendAPIRequest<any[]>(`/${organizationId}/group/sub`);
    setTableData(subGroups);
  };

  const deleteAcc = async (group_code: string) => {
    isDelete.current = false;
    togglePopup(false);
    await sendAPIRequest(`/${organizationId}/group/sub/${group_code}`, {
      method: 'DELETE',
    });
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
    const existingGroup = tableData.find((group: SubGroupFormData) => {
      if (mode === 'create')
        return (
          group.group_name.toLowerCase() === values.group_name.toLowerCase()
        );
      return (
        group.group_name.toLowerCase() === values.group_name.toLowerCase() &&
        group.group_code !== values.group_code
      );
    });
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
    if (values !== initialValue) {
      setPopupState({
        ...popupState,
        isModalOpen: true,
        message: `Are you sure you want to ${mode} this group?`,
      });
      setFormData(values);
    }
  };

  const handleCellEditingStopped = async (e: {
    data?: any;
    column?: any;
    oldValue?: any;
    valueChanged?: any;
    node?: any;
    newValue?: any;
  }) => {
    if (e?.data?.isPredefinedGroup === false) {
      currTable = [];
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
                  ? 'Sub Group name is required'
                  : /^\d+$/.test(newValue)
                    ? 'Only Numbers not allowed'
                    : 'Sub Group name cannot exceed 100 characters',
              });
              node.setDataValue(field, oldValue);
              return;
            }
            newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
            tableData.forEach((data: any) => {
              if (data.group_code !== e.data.group_code) {
                currTable.push(data);
              }
            });

            const existingGroup = currTable.find(
              (group: SubGroupFormData) =>
                group.group_name.toLowerCase() === newValue.toLowerCase()
            );

            if (existingGroup) {
              setPopupState({
                ...popupState,
                isAlertOpen: true,
                message: 'Sub Group with this name already exists!',
              });
              node.setDataValue(field, oldValue);
              return;
            }
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
      await sendAPIRequest(`/${organizationId}/group/sub/${data.group_code}`, {
        method: 'PUT',
        body: { [field]: newValue },
      });
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
      <div className='w-full relative'>
        <div className='flex w-full items-center justify-between px-8 py-1'>
          <h1 className='font-bold'>Sub Groups</h1>
          <Button
            id='account_button'
            handleOnClick={() => togglePopup(true)}
            type='highlight'
          >
            Add Subgroup
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
              popupState.isAlertOpen
                ? handleAlertCloseModal
                : handleConfirmPopup
            }
            message={popupState.message}
            isAlert={popupState.isAlertOpen}
            className='absolute'
          />
        )}
        {open && (
          <CreateSubGroup
            togglePopup={togglePopup}
            data={formData}
            handelFormSubmit={handelFormSubmit}
            isDelete={isDelete.current}
            deleteAcc={deleteAcc}
            className='absolute'
          />
        )}
      </div>
    </>
  );
};

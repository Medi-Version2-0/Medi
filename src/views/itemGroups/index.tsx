import { useEffect, useState, useRef, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { ItemGroupFormData } from '../../interface/global';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { ColDef, ColGroupDef, ValueFormatterParams } from 'ag-grid-community';
import { CreateItemGroup } from './createItemGroup';
import Button from '../../components/common/button/Button';
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import { itemGroupValidationSchema } from './validation_schema';
import PlaceholderCellRenderer from '../../components/ag_grid/PlaceHolderCell';
import usePermission from '../../hooks/useRole';
import useHandleKeydown from '../../hooks/useHandleKeydown';
import { lookupValue } from '../../helper/helper';
import useApi from '../../hooks/useApi';

export const ItemGroups = () => {
  const initialData = { group_code: '', group_name: '', type: '' };
  const [open, setOpen] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<ItemGroupFormData | any>(null);
  const [formData, setFormData] = useState<ItemGroupFormData>(initialData);
  const [popupState, setPopupState] = useState({ isModalOpen: false, isAlertOpen: false, message: '' });
  const { createAccess, updateAccess, deleteAccess } = usePermission('itemgroup')
  const editing = useRef(false);
  const gridRef = useRef<any>(null);
  const isDelete = useRef(false);
  const { sendAPIRequest } = useApi();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const itemGroups = await sendAPIRequest<ItemGroupFormData[]>('/itemGroup');
    setTableData([...(createAccess ? [initialData] : []), ...itemGroups])
  }

  const settingPopupState = (isModal: boolean, message: string) => {
    setPopupState({ ...popupState, [isModal ? 'isModalOpen' : 'isAlertOpen']: true, message: message });
  };

  const togglePopup = (isOpen: boolean) => {
    if (!isOpen) {
      setFormData(initialData);
      isDelete.current = false;
    }
    setOpen(isOpen);
  };

  const typeMapping = useMemo(() => ({ p_and_l: 'P&L', balance_sheet: 'Balance Sheet' }), []);

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleConfirmPopup = async (data?: any) => {
    const respData = data ? data : formData;
    setPopupState({ ...popupState, isModalOpen: false });
    if (formData.group_name) formData.group_name = formData.group_name.charAt(0).toUpperCase() + formData.group_name.slice(1);

    const payload = {
      group_name: respData.group_name ? respData.group_name : formData.group_name,
      type: respData.group_name ? respData.type : formData.type,
    };

    try {
      if (payload !== initialData) {
        if (formData.group_code) {
          await sendAPIRequest(`/itemGroup/${formData.group_code}`, { method: 'PUT', body: formData });
        } else {
          const response: any = await sendAPIRequest(`/itemGroup`, { method: 'POST', body: payload });
          if (respData.group_name && !response.error) {
            settingPopupState(false, 'Item Group saved successfully');
          }
        }
        togglePopup(false);
      }
    } catch (error: any) {
      if (!error?.isErrorHandled) {
        const errorMessage = error?.response?.data?.error?.message || 'Error in creating item groups. Please try again'
        settingPopupState(false, `${errorMessage}`);
        console.log('Item Group not created or updated', error)
      }
    }
    fetchData();
  };

  const handelFormSubmit = (values: ItemGroupFormData) => {
    const mode = values.group_code ? 'update' : 'create';
    const existingGroup = (tableData || []).find((group: ItemGroupFormData) => {
      if (mode === 'create')
        return (group.group_name.toLowerCase() === values.group_name.toLowerCase());
      return (group.group_name.toLowerCase() === values.group_name.toLowerCase() && group.group_code !== values.group_code);
    });

    if (existingGroup) settingPopupState(false, 'Item Group with this name already exists!');

    if (values !== initialData) {
      settingPopupState(true, `Are you sure you want to ${mode} this group?`);
      setFormData(values);
    }
  };



  const deleteAcc = async (group_code: string) => {
    togglePopup(false);
    isDelete.current = false;
    try {
      await sendAPIRequest(`/itemGroup/${group_code}`, { method: 'DELETE' });
      fetchData();
    } catch (error: any) {
      if (!error?.isErrorHandled) settingPopupState(false, 'This Item Group is associated');
    }
  };

  const handleDelete = (oldData: ItemGroupFormData) => {
    isDelete.current = true;
    setFormData(oldData);
    togglePopup(true);
    setSelectedRow(null);
  };

  const handleUpdate = (oldData: ItemGroupFormData) => {
    setFormData(oldData);
    isDelete.current = false;
    editing.current = true;
    togglePopup(true);
    setSelectedRow(null);
  };



  const handleCellEditingStopped = async (e: any) => {
    editing.current = false;
    const { data, column, oldValue, valueChanged, node } = e;
    let { newValue } = e;
    if (!valueChanged && node.rowIndex !== 0) return;
    const field = column.colId;
    if (field === 'group_name' && !!newValue) {
      newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
      const dataToCompare = tableData.filter((d: any) => data.group_code !== d.group_code);
      const existingItemGroup = dataToCompare?.find((group: ItemGroupFormData) => group.group_name.toLowerCase() === newValue.toLowerCase());
      if (existingItemGroup) {
        settingPopupState(false, 'Item Group with this name already exists!');
        node.setDataValue(field, oldValue);
        return;
      }
    }
    if (node.rowIndex === 0 && createAccess) {
      if (data.group_name && data.type) {
        try {
          await itemGroupValidationSchema.validate(data);

          if (field === 'group_name') {
            newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
          }
          handleConfirmPopup(data);
          return;
        } catch (error: any) {
          settingPopupState(false, error.message);
          node.setDataValue(field, oldValue);
          return;
        }
      }
    } else {
      try {
        if (!data.group_name || !data.type) {
          data[field] = oldValue;
          settingPopupState(false, 'Group name, P&L/Bl Sheet cannot be left empty.');
          return;
        }
        const isValid = await itemGroupValidationSchema.validateAt(field, { [field]: newValue });
        if (isValid) {
          await sendAPIRequest(`/itemGroup/${data.group_code}`, { method: 'PUT', body: { [field]: newValue } });
        }
        fetchData();
      } catch (error: any) {
        if (!error?.isErrorHandled) {
          data[field] = oldValue;
          settingPopupState(false, error.message);
          return;
        }
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
    handleKeyDownCommon(event, handleDelete, handleUpdate, togglePopup, selectedRow, undefined);
  };

  useHandleKeydown(handleKeyDown, [selectedRow, popupState])

  const defaultCols = {
    flex: 1,
    filter: true,
    headerClass: 'custom-header',
    suppressMovable: true,
    floatingFilter: true,
    editable: (params: any) => params.node.rowIndex === 0 ? createAccess : updateAccess,
    cellRenderer: (params: any) => (
      <PlaceholderCellRenderer
        value={params.value}
        rowIndex={params.node.rowIndex}
        column={params.colDef}
        startEditingCell={(editParams: any) => {
          gridRef.current?.api?.startEditingCell(editParams);
        }}
        placeholderText={params.colDef.headerName}
      />
    )
  }

  const colDefs: (ColDef<any, any> | ColGroupDef<any>)[] | null | undefined[] =
    [
      { headerName: 'Group Name', field: 'group_name' },
      {
        headerName: 'P&L / BL. Sheet',
        field: 'type',
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: { values: Object.values(typeMapping) },
        valueFormatter: (params: ValueFormatterParams) => lookupValue(typeMapping, params.value),
      },
      {
        headerName: 'Actions',
        headerClass: 'custom-header-class custom-header',
        sortable: false,
        editable: false,
        suppressMovable: true,
        flex: 1,
        cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
        cellRenderer: (params: { data: ItemGroupFormData, node: any }) => (
          <div className='table_edit_buttons'>
            {params.node.rowIndex !== 0 && (
              <>
                <FaEdit style={{ cursor: 'pointer', fontSize: '1.1rem' }} onClick={() => handleUpdate(params.data)} />
                <MdDeleteForever style={{ cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => handleDelete(params.data)} />
              </>
            )}
          </div>
        ),
      },
    ];

  return (
    <>
      <div className='w-full relative'>
        <div className='flex w-full items-center justify-between px-8 py-1'>
          <h1 className='font-bold'>Item Groups</h1>
          {createAccess && <Button type='highlight' handleOnClick={() => togglePopup(true)} > Add Group </Button>}
        </div>
        <div id='account_table' className='ag-theme-quartz'>
          <AgGridReact rowData={tableData} columnDefs={colDefs} defaultColDef={defaultCols} onCellClicked={onCellClicked} onCellEditingStarted={cellEditingStarted} onCellEditingStopped={handleCellEditingStopped} />
        </div>
        {(popupState.isModalOpen || popupState.isAlertOpen) && (<Confirm_Alert_Popup onClose={handleClosePopup} onConfirm={popupState.isAlertOpen ? handleAlertCloseModal : handleConfirmPopup} message={popupState.message} isAlert={popupState.isAlertOpen} className='absolute' />)}
        {open && (<CreateItemGroup togglePopup={togglePopup} data={formData} handelFormSubmit={handelFormSubmit} isDelete={isDelete.current} deleteAcc={deleteAcc} className='absolute' />)}
      </div>
    </>
  );
};

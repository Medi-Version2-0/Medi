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
import { sendAPIRequest } from '../../helper/api';
import { useParams } from 'react-router-dom';
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import { itemGroupValidationSchema } from './validation_schema';
import PlaceholderCellRenderer from '../../components/ag_grid/PlaceHolderCell';
import { getAndSetItemGroups } from '../../store/action/globalAction';
import { useSelector } from 'react-redux'
import usePermission from '../../hooks/useRole';
import useHandleKeydown from '../../hooks/useHandleKeydown';
import { lookupValue } from '../../helper/helper';
import { useGetSetData } from '../../hooks/useGetSetData';

export const ItemGroups = () => {
  const initialData = {
    group_code: '',
    group_name: '',
    type: '',
  };
  const { organizationId } = useParams();
  const [open, setOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<ItemGroupFormData>({
    group_name: '',
    group_code: '',
    type: '',
  });
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const editing = useRef(false);
  const getAndSetItemGroupHandler = useGetSetData(getAndSetItemGroups);
  const {createAccess , updateAccess , deleteAccess} = usePermission('item_groups')
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });
  const gridRef = useRef<any>(null);
  const { itemGroups: itemGroups } = useSelector((state: any) => state.global);
  const [tableData, setTableData] = useState([...(createAccess ? [initialData] :[]), ...itemGroups]);
  const isDelete = useRef(false);

  const settingPopupState = (isModal: boolean, message: string) => {
    setPopupState({
      ...popupState,
      [isModal ? 'isModalOpen' : 'isAlertOpen']: true,
      message: message,
    });
  };

  const typeMapping = useMemo(() => ({p_and_l: 'P&L', balance_sheet: 'Balance Sheet'}), []);

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleConfirmPopup = async (data?: any) => {
    const respData = data ? data : formData;
    setPopupState({ ...popupState, isModalOpen: false });
    if (formData.group_name) {
      formData.group_name =
        formData.group_name.charAt(0).toUpperCase() +
        formData.group_name.slice(1);
    }
    const payload = {
      group_name: respData.group_name ? respData.group_name : formData.group_name,
      type: respData.group_name ? respData.type : formData.type,
    };

    if (payload !== initialData) {
      if (formData.group_code) {
        await sendAPIRequest(
          `/${organizationId}/itemGroup/${formData.group_code}`,
          {
            method: 'PUT',
            body: formData,
          }
        );
      } else {
        const response: any = await sendAPIRequest(`/${organizationId}/itemGroup`, {
          method: 'POST',
          body: payload,
        });
        if (respData.group_name && !response.error) {
          settingPopupState(false, 'Item Group saved successfully');
        }
      }
      getAndSetItemGroupHandler();
      togglePopup(false);
    }
  };

  const togglePopup = (isOpen: boolean) => {
    if (!isOpen) {
      setFormData(initialData);
      isDelete.current = false;
    }
    setOpen(isOpen);
  };

  const getGroups = async () => {
    if (Array.isArray(itemGroups)) {
      setTableData([initialData, ...itemGroups]);
    }
    return itemGroups;
  };

  const deleteAcc = async (group_code: string) => {
    togglePopup(false);
    isDelete.current = false;

    await sendAPIRequest(`/${organizationId}/itemGroup/${group_code}`, {
      method: 'DELETE',
    });
    getAndSetItemGroupHandler();
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

  const handelFormSubmit = (values: ItemGroupFormData) => {
    const mode = values.group_code ? 'update' : 'create';
    const existingGroup = (tableData || []).find((group: ItemGroupFormData) => {
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
      settingPopupState(false, 'Item Group with this name already exists!')
      return;
    }
    if (values.group_name) {
      values.group_name =
        values.group_name.charAt(0).toUpperCase() + values.group_name.slice(1);
    }
    if (values !== initialData) {
      settingPopupState(true, `Are you sure you want to ${mode} this group?`);
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
    editing.current = false;
    const { data, column, oldValue, valueChanged, node } = e;
    let { newValue } = e;
    if (!valueChanged) return;
    const field = column.colId;
    if (node.rowIndex === 0 && createAccess) {
      if (data.group_name && data.type) {
        try {
          await itemGroupValidationSchema.validate(data);

          if (field === 'group_name') {
            newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
          } else if (field === 'igst_sale' && newValue) {
            newValue = newValue.toLowerCase();
          }
          handleConfirmPopup(data);
        } catch (error: any) {
          settingPopupState(false, `${error.message}`);
        }
      }

      node.setDataValue(field, newValue);
    } else {
      try {
        await itemGroupValidationSchema.validateAt(field, { [field]: newValue, });
        await sendAPIRequest(
          `/${organizationId}/itemGroup/${data.group_code}`,
          {
            method: 'PUT',
            body: { [field]: newValue },
          }
        );
        getAndSetItemGroupHandler();
      } catch (error: any) {
        settingPopupState(false, `${error.message}`);
        node.setDataValue(field, oldValue);
      }
    }
  };


  const onCellClicked = (params: { data: any }) => {
    setSelectedRow(params.data);
  };

  const cellEditingStarted = () => {
    editing.current = true;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    handleKeyDownCommon(
      event,
      handleDelete,
      handleUpdate,
      togglePopup,
      selectedRow,
      undefined
    );
  };

  useHandleKeydown(handleKeyDown, [selectedRow, popupState])

  useEffect(() => {
    getGroups();
  }, [itemGroups]);

  const defaultCols = {
      flex: 1,
      filter: true,
      headerClass: 'custom-header',
      suppressMovable: true,
      floatingFilter: true,
      editable : updateAccess,
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
      {
        headerName: 'Group Name',
        field: 'group_name',
      },
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
        editable :false,
        suppressMovable: true,
        flex: 1,
        cellStyle: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        },
        cellRenderer: (params: { data: ItemGroupFormData }) => (
          <div className='table_edit_buttons'>
           {updateAccess &&  <FaEdit
              style={{ cursor: 'pointer', fontSize: '1.1rem' }}
              onClick={() => {
                handleUpdate(params.data);
              }}
            />}

           {deleteAccess && <MdDeleteForever
              style={{ cursor: 'pointer', fontSize: '1.2rem' }}
              onClick={() => {
                handleDelete(params.data);
              }}
            />}
          </div>
        ),
      },
    ];
  return (
    <>
      <div className='w-full relative'>
        <div className='flex w-full items-center justify-between px-8 py-1'>
          <h1 className='font-bold'>Item Groups</h1>
          {createAccess && <Button
            type='highlight'
            className=''
            handleOnClick={() => togglePopup(true)}
          >
            Add Group
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
            className='absolute'
          />
        )}
        {open && (
          <CreateItemGroup
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

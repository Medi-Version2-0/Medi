import React, { useEffect, useState, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { BatchForm } from '../../interface/global';
import { numberedStringLowerCase } from '../../utilities/numberedStringLowercase';
import Button from '../../components/common/button/Button';
import { ColDef } from 'ag-grid-community';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { sendAPIRequest } from '../../helper/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useControls } from '../../ControlRoomContext';
import { batchSchema, validatePrices } from './validation_schema';

export const Batch = ({
  params,
}: {
  params: {
    showBatch: any;
    setShowBatch: React.Dispatch<React.SetStateAction<any>>;
  };
}) => {
  const { id } = params.showBatch;
  const { controlRoomSettings } = useControls();
  const [item, setItem] = useState<any>();
  const pinnedRow: BatchForm = {
    itemId: id ? +id : 0,
    batchNo: '',
    mfgCode: 'ksdfkaskdf' || item?.shortName,
    expiryDate: '',
    opBalance: null,
    opFree: null,
    purPrice: null,
    salePrice: null,
    mrp: null,
    locked: '',
    ...(controlRoomSettings.dualPriceList ? { salePrice2: null } : {}),
    ...(controlRoomSettings.batchWiseManufacturingCode ? { mfgCode: '' } : {}),
  };
  const queryClient = useQueryClient();
  const { organizationId } = useParams();
  const [selectedRow, setSelectedRow] = useState<BatchForm | any>(null);
  const [inputRow, setInputRow] = useState<BatchForm | any>(pinnedRow);
  const [tableData, setTableData] = useState<BatchForm | any>(null);
  const editing = useRef(false);
  const gridRef = useRef<any>(null);
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const { data } = useQuery<{ data: BatchForm }>({
    queryKey: ['get-itemBatches'],
    queryFn: () =>
      sendAPIRequest<{ data: BatchForm }>(
        `/${organizationId}/item/${id}/batch`
      ),
  });

  useEffect(() => {
    const getItem = async () => {
      const itemData = await sendAPIRequest<any>(`/${organizationId}/item/${id}`);
      setItem(itemData);
      setInputRow({ ...inputRow, mfgCode: itemData?.shortName });
    }
    getItem();
  }, []);

  const getBatch = async () => {
    setTableData(data);
  };

  useEffect(() => {
    getBatch();
  }, [data]);

  const handleBatchAdd = async () => {
    try {
      await batchSchema.validate(inputRow);
      const existingBatch = tableData?.find(
        (tableBatch: BatchForm) =>
          numberedStringLowerCase(tableBatch?.batchNo) === numberedStringLowerCase(inputRow.batchNo)
      );
      if (existingBatch) {
        setPopupState({
          ...popupState,
          isAlertOpen: true,
          message: 'Batch with this id already exists!',
        });
        return;
      }
      const formattedInputRow = {
        ...inputRow,
        batchNo: inputRow.batchNo.toUpperCase(),
        locked: inputRow.locked.toUpperCase(),
      };

      await sendAPIRequest(`/${organizationId}/item/${id}/batch`, {
        method: 'POST',
        body: formattedInputRow,
      });
      setInputRow(pinnedRow);
      getBatch();
      queryClient.invalidateQueries({ queryKey: ['get-itemBatches'] });
    } catch (err: any) {
      if (err.message) {
        setPopupState({
          ...popupState,
          isAlertOpen: true,
          message: err.message,
        });
      } else {
        console.error('Error occured while adding batch:-', err);
      }
    }
  };

  const handleConfirmPopup = () => {
    getBatch();
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleRowSelected = useCallback((event: any) => {
    if (event.node.isSelected()) {
      setSelectedRow(event.data);
    }
  }, []);

  const handleCellEditingStopped = useCallback(
    async (e: {
      data?: any;
      column?: any;
      oldValue?: any;
      valueChanged?: any;
      node?: any;
      newValue?: any;
    }) => {
      editing.current = false;
      const { data, column, oldValue, newValue, valueChanged, node } = e;
      const batchId = data.id;
      const field = column.colId;
      if (!valueChanged) return;
      try {
        if (node.rowPinned === 'top') {
          try {
            await batchSchema.validateAt(field, { [field]: newValue });
            const newBatch = { ...inputRow, [field]: newValue };
            validatePrices(newBatch);
            setInputRow(newBatch);
          } catch (err: any) {
            if (err.message) {
              setPopupState({
                ...popupState,
                isAlertOpen: true,
                message: err.message,
              });
              node.setDataValue(field, oldValue);
            }
          }
        } else {
          await batchSchema.validate({ ...data, [field]: newValue });
          await sendAPIRequest(`/${organizationId}/item/${id}/batch/${batchId}`, {
            method: 'PUT',
            body: { ...data, [field]: newValue },
          });
          queryClient.invalidateQueries({ queryKey: ['get-itemBatches', id] });
        }
      } catch (err: any) {
        if (err.message) {
          setPopupState({
            ...popupState,
            isAlertOpen: true,
            message: err.message,
          });
        } else {
          console.error('Error:-', err);
        }
        node.setDataValue(field, oldValue);
      }
    },
    [[tableData, inputRow]]
  );


  const onCellClicked = (params: { data: any }) => {
    setSelectedRow(selectedRow !== null ? null : params.data);
  };

  const cellEditingStarted = () => {
    editing.current = true;
  };

  const isPinnedRowDataCompleted = async () => {
    try {
      await batchSchema.validate(inputRow);
      return true;
    } catch (err: any) {
      console.error(err?.message || err);
      return false;
    }
  };

  const handleKeyDown = async (event: KeyboardEvent) => {
    if (event.code === 'Enter' && await isPinnedRowDataCompleted()) {
      handleBatchAdd();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRow, inputRow]);

  const getRowStyle = useCallback<any>(
    ({ node }: any) =>
      node.rowPinned
        ? { fontWeight: 'light', fontStyle: 'italic', color: 'gray' }
        : {},
    []
  );

  const isEmptyPinnedCell = (params: any) => {
    return (
      (params.node.rowPinned === 'top' && params.value == null) ||
      (params.node.rowPinned === 'top' && params.value === '')
    );
  };

  const createPinnedCellPlaceholder = ({ colDef }: any) => {
    return colDef.headerName || '';
  };

  const createValueFormatter = (colDef: any) => (params: any) => {
    const { value, node } = params;
    const isPinnedRow = node.rowPinned === 'top';
    const isEditing = params.api
      .getEditingCells()
      ?.some(
        (cell: any) =>
          cell.rowIndex === params.node.rowIndex &&
          cell.column.colId === params.column.colId
      );

    if (isPinnedRow && !isEditing && (value === null || value === '')) {
      return colDef.headerName;
    } else {
      return value;
    }
  };

  const defaultColDef = {
    flex: 1,
    editable: true,
    valueFormatter: (params: any) => {
      if (isEmptyPinnedCell(params)) {
        return createPinnedCellPlaceholder(params);
      } else {
        return params.value;
      }
    },
  };

  const colDefs: ColDef[] = [
    {
      headerName: 'Batch No',
      field: 'batchNo',
      filter: true,
      editable: true,
      sortable: true,
      flex: 1,
      headerClass: 'custom-header',
      suppressMovable: true,
      valueFormatter: createValueFormatter({ headerName: 'Batch No' }),
    },
    {
      headerName: 'Expiry Date',
      field: 'expiryDate',
      filter: true,
      editable: true,
      flex: 1,
      headerClass: 'custom-header',
      sortable: true,
      suppressMovable: true,
      valueFormatter: createValueFormatter({ headerName: 'MM/YYYY' }),
    },
    {
      headerName: 'Opening Stock',
      field: 'opBalance',
      filter: true,
      editable: true,
      sortable: true,
      flex: 1,
      headerClass: 'custom-header',
      suppressMovable: true,
      valueFormatter: createValueFormatter({ headerName: 'Opening Stock' }),
    },
    {
      headerName: 'Scheme Stock',
      field: 'opFree',
      filter: true,
      editable: true,
      sortable: true,
      flex: 1,
      headerClass: 'custom-header',
      suppressMovable: true,
      valueFormatter: createValueFormatter({ headerName: 'Scheme Stock' }),
    },
    {
      headerName: 'Purchase Price',
      field: 'purPrice',
      filter: true,
      headerClass: 'custom-header-class custom-header',
      editable: true,
      sortable: true,
      suppressMovable: true,
      flex: 1,
      cellStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      valueFormatter: createValueFormatter({ headerName: 'Purchase Price' }),
    },
    {
      headerName: 'Sale Price',
      field: 'salePrice',
      filter: true,
      headerClass: 'custom-header-class custom-header',
      editable: true,
      sortable: true,
      suppressMovable: true,
      flex: 1,
      cellStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      valueFormatter: createValueFormatter({ headerName: 'Sale Price' }),
    },
    ...(controlRoomSettings.dualPriceList
      ? [
        {
          headerName: 'Sale Price 2',
          field: 'salePrice2',
          filter: true,
          editable: true,
          flex: 1,
          headerClass: 'custom-header',
          sortable: true,
          suppressMovable: true,
          valueFormatter: createValueFormatter({
            headerName: 'Sale Price 2',
          }),
        },
      ]
      : []),
    {
      headerName: 'MRP',
      field: 'mrp',
      filter: true,
      editable: true,
      sortable: true,
      flex: 1,
      headerClass: 'custom-header',
      suppressMovable: true,
      valueFormatter: createValueFormatter({ headerName: 'MRP' }),
    },
    {
      headerName: 'Lock Batch',
      field: 'locked',
      filter: true,
      editable: true,
      flex: 1,
      headerClass: 'custom-header',
      suppressMovable: true,
      valueFormatter: createValueFormatter({ headerName: 'Y/N' }),
    },
    ...(controlRoomSettings.batchWiseManufacturingCode
      ? [
        {
          headerName: 'MFG Code',
          field: 'mfgCode',
          filter: true,
          editable: true,
          flex: 1,
          headerClass: 'custom-header',
          sortable: true,
          suppressMovable: true,
          valueFormatter: createValueFormatter({
            headerName: 'MFG Code',
          }),
        },
      ]
      : []),
  ];

  return (
    <div ref={containerRef}>
      <div className="w-full">
        <div className="flex w-full items-center justify-between px-8 py-1">
          <h1 className="font-bold">Batches</h1>
          <Button type="highlight" handleOnClick={() => params.setShowBatch(null)}>
            Back
          </Button>
        </div>
        <div id="account_table" className="ag-theme-quartz">
          {tableData &&
            <AgGridReact
              ref={gridRef}
              rowData={tableData}
              columnDefs={colDefs}
              defaultColDef={defaultColDef}
              rowSelection="single"
              onSelectionChanged={(event) => {
                setSelectedRow(event.api.getSelectedNodes()[0]);
              }}
              pinnedTopRowData={[inputRow]}
              getRowStyle={getRowStyle}
              onCellClicked={onCellClicked}
              onGridReady={getBatch}
              onCellEditingStarted={cellEditingStarted}
              onCellEditingStopped={handleCellEditingStopped}
              onRowSelected={handleRowSelected}
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
            autoFocus={false}
          />
        )}
      </div>
    </div>
  );
};

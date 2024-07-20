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
import PlaceholderCellRenderer from '../../components/ag_grid/PlaceHolderCell';
import { debounce } from '@mui/material';

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
    batchNo: null,
    expiryDate: '',
    opBalance: null,
    opFree: null,
    purPrice: null,
    salePrice: null,
    mrp: null,
    locked: '',
    ...(controlRoomSettings.dualPriceList ? { salePrice2: null } : {}),
    ...(controlRoomSettings.batchWiseManufacturingCode ? { mfgCode: item?.shortName || '', } : {}),
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
  const { data } = useQuery<BatchForm[]>({
    queryKey: ['get-itemBatches'],
    queryFn: () =>
      sendAPIRequest<BatchForm[]>(
        `/${organizationId}/item/${id}/batch`
      ),
  });

  useEffect(() => {
    const getItem = async () => {
      const itemData = await sendAPIRequest<any>(`/${organizationId}/item/${id}`);
      setItem(itemData);

      if (controlRoomSettings.batchWiseManufacturingCode) {
        setInputRow({ ...inputRow, mfgCode: itemData?.shortName || '' });
      }
    };
    getItem();
  }, []);

  const getBatch = async () => {
    const newRow = { ...inputRow, itemId: 0 };
    const combinedData = data && [newRow, ...data];
    setTableData(combinedData);
  };

  useEffect(() => {
    getBatch();
  }, [data, inputRow]);

  const handleBatchAdd = async () => {
    try {
      await batchSchema.validate(inputRow);
      const existingBatch = data?.find(
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
      const { data, column, oldValue, newValue, node } = e;
      const batchId = data.id;
      const field = column.colId;
      if (newValue === inputRow[field]) return;
      try {
        if (node.rowIndex === 0) {
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
              gridRef.current?.api?.startEditingCell({
                rowIndex: node.rowIndex,
                colKey: field,
              });
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
        gridRef.current?.api?.startEditingCell({
          rowIndex: node.rowIndex,
          colKey: field,
        });
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

  const debouncedHandleKeyDown = useCallback(
    debounce(async (event: KeyboardEvent) => {
      if (event.code === 'Enter' && (await isPinnedRowDataCompleted())) {
        handleBatchAdd();
      }
    }, 300), // Adjust the debounce delay (in milliseconds) as needed
    [inputRow]
  );

  useEffect(() => {
    document.addEventListener('keydown', debouncedHandleKeyDown);
    return () => {
      document.removeEventListener('keydown', debouncedHandleKeyDown);
    };
  }, [selectedRow, inputRow]);

  const getRowStyle = useCallback<any>(
    ({ node }: any) =>
      node.rowPinned
        ? { fontWeight: 'light', fontStyle: 'italic', color: 'gray' }
        : {},
    []
  );

  // const isEmptyPinnedCell = (params: any) => {
  //   return (
  //     (params.node.rowIndex === 0 && params.value == null) ||
  //     (params.node.rowIndex === 0 && params.value === '')
  //   );
  // };

  const defaultColDef = {
    filter: true,
    editable: true,
    sortable: true,
    flex: 1,
    headerClass: 'custom-header',
    suppressMovable: true,
    cellStyle: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    cellEditor: 'agTextCellEditor',
    cellRenderer: (params: any) => (
      <PlaceholderCellRenderer
        value={params.value}
        rowIndex={params.node.rowIndex}
        column={params.colDef}
        startEditingCell={(editParams) => {
          gridRef.current?.api?.startEditingCell(editParams);
        }}
        placeholderText={params.colDef.headerName}
      />
    ),
  };


  const colDefs: ColDef[] = [
    {
      headerName: 'Batch No',
      field: 'batchNo',
      // valueFormatter: createValueFormatter({ headerName: 'Batch No' }),
    },
    {
      headerName: 'Expiry Date',
      field: 'expiryDate',
      // valueFormatter: createValueFormatter({ headerName: 'MM/YYYY' }),
    },
    {
      headerName: 'Opening Stock',
      field: 'opBalance',
      cellDataType: 'number',
      cellEditor: 'agTextCellEditor',
    },
    {
      headerName: 'Scheme Stock',
      field: 'opFree',
      cellDataType: 'number',
      // valueFormatter: createValueFormatter({ headerName: 'Scheme Stock' }),
    },
    {
      headerName: 'Purchase Price',
      field: 'purPrice',
      cellDataType: 'number',
      headerClass: 'custom-header-class custom-header',
      cellStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      // valueFormatter: createValueFormatter({ headerName: 'Purchase Price' }),
    },
    {
      headerName: 'Sale Price',
      field: 'salePrice',
      cellDataType: 'number',
      headerClass: 'custom-header-class custom-header',
      // valueFormatter: createValueFormatter({ headerName: 'Sale Price' }),
    },
    ...(controlRoomSettings.dualPriceList
      ? [
        {
          headerName: 'Sale Price 2',
          field: 'salePrice2',
          // valueFormatter: createValueFormatter({
          //   headerName: 'Sale Price 2',
          // }),
        },
      ]
      : []),
    {
      headerName: 'MRP',
      field: 'mrp',
      cellDataType: 'number',
      // valueFormatter: createValueFormatter({ headerName: 'MRP' }),
    },
    {
      headerName: 'Lock Batch',
      field: 'locked',
      // valueFormatter: createValueFormatter({ headerName: 'Y/N' }),
    },
    ...(controlRoomSettings.batchWiseManufacturingCode
      ? [
        {
          headerName: 'MFG Code',
          field: 'mfgCode',
          // valueFormatter: createValueFormatter({
          //   headerName: 'MFG Code',
          // }),
        },
      ]
      : []),
  ];

  return (
    <div ref={containerRef}>
      <div className="w-full">
        <div className="flex w-full items-center justify-between px-8 py-1">
          <h1 className="font-bold">Batches</h1>
          <Button
            type="highlight"
            // handleOnClick={() => getBatch()}
            handleOnClick={() => params.setShowBatch(null)}
          >
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

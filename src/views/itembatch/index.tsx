import React, { useEffect, useState, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { BatchForm } from '../../interface/global';
import { numberedStringLowerCase } from '../../utilities/numberedStringLowercase';
import Button from '../../components/common/button/Button';
import { ColDef } from 'ag-grid-community';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { useControls } from '../../ControlRoomContext';
import { batchSchema, validatePrices } from './validation_schema';
import PlaceholderCellRenderer from '../../components/ag_grid/PlaceHolderCell';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/types/globalTypes';
import { getAndSetItem } from '../../store/action/globalAction';
import { useSelector } from 'react-redux';
import useApi from '../../hooks/useApi';
import { SelectListTableWithInput } from '../../components/common/customSelectListWithInput/customSelectListWithInput';

export const Batch = ({
  params,
}: {
  params: {
    showBatch: any;
    setShowBatch: React.Dispatch<React.SetStateAction<any>>;
  };
}) => {
  const { id } = params.showBatch;
  const { sendAPIRequest } = useApi();

  const { controlRoomSettings } = useControls();
  const pinnedRow: BatchForm = {
    itemId: id ? +id : 0,
    batchNo: '',
    expiryDate: '',
    opBalance: null,
    currentStock: null,
    opFree: null,
    purPrice: null,
    salePrice: null,
    ...(controlRoomSettings.multiPriceList ? { salePrice2: null } : {}),
    mrp: null,
    locked: 'N',
    ...(controlRoomSettings.batchWiseManufacturingCode ? { mfgCode: '' } : {}),
  };
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [inputRow, setInputRow] = useState<BatchForm | any>(pinnedRow);
  const [tableData, setTableData] = useState<BatchForm | any>(null);
  const [item, setItems] = useState<any>(null);
  const editing = useRef(false);
  const gridRef = useRef<any>(null);
  const [godownData, setGodownData] = useState<any | []>(null);
  const [isUpdateMode, setIsUpdateMode] = useState<boolean>(false);
  const selectedBatchId = useRef<any>(null);
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });
  const dispatch = useDispatch<AppDispatch>();
  const { item: itemsData } = useSelector((state: any) => state.global);
  const itemData = itemsData.find((item: any) => item.id === id);
  const settingPopupState = (isModal: boolean, message: string) => {
    setPopupState({
      ...popupState,
      [isModal ? 'isModalOpen' : 'isAlertOpen']: true,
      message: message,
    });
  };
  const [savedData, setSavedData] = useState<any[]>([]);
  const [saveUpdatedData, setSaveUpdatedData] = useState<any[]>([]);
  const [popupList, setPopupList] = useState<{ isOpen: boolean; data: any }>({
    isOpen: false,
    data: {},
  });
  const GodownHeaders = [
    { label: 'Godown Name', key: 'godownName' },
    { label: 'Stocks', key: 'stocks', isInput: true },
  ];

  const containerRef = useRef<HTMLDivElement>(null);

  const getBatch = async () => {
    setInputRow(pinnedRow);
    setItems(itemData);
    let newRow = { ...pinnedRow, itemId: 0 };
    if (controlRoomSettings.batchWiseManufacturingCode) {
      newRow = { ...newRow, mfgCode: itemData?.shortName || '' };
    }
    setTableData([newRow, ...itemData.ItemBatches]);
  };

  const onGridReady = () => {
    if (gridRef.current) {
      gridRef.current.api?.getDisplayedRowAtIndex(0)?.setSelected(true);
      gridRef.current.api?.startEditingCell({
        rowIndex: 0,
        colKey: colDefs[0].field,
      });
    }
  };

  useEffect(() => {
    getBatch();
  }, [itemsData]);

  useEffect(() => {
    onGridReady();
  }, [tableData]);

  useEffect(() => {
    onGridReady();
    getGodownData();
  }, []);

  const handleBatchAdd = async () => {
    try {
      await batchSchema.validate(inputRow);
      const existingBatch = item.ItemBatches.find(
        (tableBatch: BatchForm) =>
          numberedStringLowerCase(tableBatch?.batchNo) ===
          numberedStringLowerCase(inputRow.batchNo)
      );
      if (existingBatch) {
        settingPopupState(false, 'Batch with this id already exists!');
        return;
      }
      const formattedInputRow = {
        ...inputRow,
        currentStock: inputRow.opBalance,
        batchNo: inputRow.batchNo.toUpperCase(),
        locked: inputRow.locked.toUpperCase(),
        mfgCode: itemData?.shortName,
      };

      const length = savedData?.length;
      for (let i = 0; i < length; i++) {
        formattedInputRow[`opGodown${i}`] = savedData[i]?.stocks;
        formattedInputRow[`clGodown${i}`] = savedData[i]?.stocks;
      }

      console.log('formatted data ===> ', formattedInputRow);
      await sendAPIRequest(`/item/${id}/batch`, {
        method: 'POST',
        body: formattedInputRow,
      });
      setInputRow(pinnedRow);
      dispatch(getAndSetItem());
    } catch (err: any) {
      if (err.message) {
        settingPopupState(false, `${err.message}`);
      } else {
        settingPopupState(false, 'Error occured while adding batch');
      }
    }
  };

  const handleConfirmPopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleAlertCloseModal = async () => {
    setPopupState({ ...popupState, isAlertOpen: false });

    const api = gridRef?.current?.api;
    const focusedCell = api.getFocusedCell();

    if (focusedCell) {
      const lastEditedRowIndex = focusedCell.rowIndex;
      const lastEditedColKey = focusedCell.column.colId;
      setTimeout(async () => {
        api.setFocusedCell(lastEditedRowIndex, lastEditedColKey);
        await api.startEditingCell({
          rowIndex: lastEditedRowIndex,
          colKey: lastEditedColKey,
        });
      }, 100);
    }
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
    // setPopupIsOpen(false);
  };

  const handleRowSelected = useCallback((event: any) => {
    if (event.node.isSelected()) {
      setSelectedRow(event.data);
    }
  }, []);

  const onCellKeyDown = () => {
    const api = gridRef?.current?.api;
    const focusedCell = api.getFocusedCell();

    if (focusedCell) {
      const lastEditedRowIndex = focusedCell.rowIndex;
      const lastEditedColKey = focusedCell.column.colId;
      setTimeout(async () => {
        api.setFocusedCell(lastEditedRowIndex, lastEditedColKey);
        await api.startEditingCell({
          rowIndex: lastEditedRowIndex,
          colKey: lastEditedColKey,
        });
      }, 30);
    }
  };

  const getGodownData = async () => {
    try {
      const godownData: any = await sendAPIRequest(`/godown/`, {
        method: 'GET',
      });
      setGodownData(godownData);
    } catch (error: any) {
      setPopupState({
        ...popupState,
        isAlertOpen: true,
        message: `${error.message}`,
      });
    }
  };

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
      selectedBatchId.current = batchId; 
      
      if (field === 'godownStocks') {
        node.setDataValue(field, oldValue);
        return;
      }
      // if (field === 'godownStocks') {
        //   console.log("🚀 ~ godownData: during updation ", godownData, savedData)
        //   setPopupList({
          //     isOpen: true,
          //     data: {
            //       heading: 'Godowns',
            //       headers: [...GodownHeaders],
            //       tableData: savedData.length ? savedData: godownData,
            //       handleSelect: (rowData: any) => {},
            //     },       
            //   });
            // }
            console.log("2-----------------",field,"2--", newValue,"3---", oldValue,"4---",field !== 'godownStocks' && newValue === oldValue )
      if (field !== 'godownStocks' && newValue === oldValue) return;
      // if (newValue === oldValue) return;
      try {
        console.log("3-----------------")
        const finalValue = field === 'locked' ? newValue.toUpperCase() : newValue;
        if (node.rowIndex === 0 && !isAnyFilterActive()) {
          setIsUpdateMode(false);
          try {
            await batchSchema.validateAt(field, { [field]: finalValue });
            const newBatch = { ...inputRow, [field]: finalValue };
            if (field === 'godownStocks') {
              setPopupList({
                isOpen: true,
                data: {
                  heading: 'Godowns',
                  headers: [...GodownHeaders],
                  tableData: godownData,
                  handleSelect: (rowData: any) => {},
                },
              });
            }
            // setSavedData([])
            validatePrices(newBatch);
            setInputRow(newBatch);
          } catch (err: any) {
            if (err.message) {
              await gridRef.current?.api?.startEditingCell({
                rowIndex: node.rowIndex,
                colKey: field,
              });
              node.setDataValue(field, oldValue);
              settingPopupState(false, `${err.message}`);
            }
          }
        } else {
          try {
            console.log("1-----------------")
            setIsUpdateMode(true);
            let i = 0; 
            const dataTosend = godownData.map((row:any) => {
              const emptyRow: any = {};
              GodownHeaders.forEach(header => {
                emptyRow[header.key] = header.isInput ? data[`opGodown${i}`] : row[header.key];
              });
              i++;
              return emptyRow;
            });
            console.log("🚀 ~ dataTosend ~ dataTosend:", dataTosend)
            // setSavedData([]);
            await batchSchema.validate({ ...data, [field]: finalValue });
            // if (field === 'opBalance') {
            //   setPopupList({
            //     isOpen: true,
            //     data: {
            //       heading: 'Godowns',
            //       headers: [...GodownHeaders],
            //       tableData: dataTosend,
            //       handleSelect: (rowData: any) => {},
            //     },
            //   });              
            // }
            if (field === 'godownStocks') {
              setPopupList({
                isOpen: true,
                data: {
                  heading: 'Godowns',
                  headers: [...GodownHeaders],
                  tableData: dataTosend,
                  batchData: data,
                  handleSelect: (rowData: any) => {},
                },
              });           
            }
            validatePrices({ ...data, [field]: finalValue });
            
            const length = savedData?.length;

            for (let i = 0; i < length; i++) {
              data[`opGodown${i}`] = savedData[i]?.stocks;
              data[`clGodown${i}`] = savedData[i]?.stocks;
            }

            console.log("final daata for update ====> ", data, {...data, [field]: finalValue});
            
            if(field !== 'godownStocks'){
              await sendAPIRequest(`/item/${id}/batch/${batchId}`, {
                method: 'PUT',
                body: { ...data, [field]: finalValue },
              });
            }
            if (field === 'godownStocks') {
              setTimeout(()=>{
                console.log("1------------------")
                saveUpdatedGodown({ ...data, [field]: finalValue }, dataTosend);
              },1000)
            }
            dispatch(getAndSetItem());
          } catch (err: any) {
            if (err.message) {
              await gridRef.current?.api?.startEditingCell({
                rowIndex: node.rowIndex,
                colKey: field,
              });
              node.setDataValue(field, oldValue);
              settingPopupState(false, `${err.message}`);
            }
          }
        }
      } catch (err: any) {
        if (err.response?.data.message || err.message) {
          settingPopupState(false, `${err.response?.data.message || err.message}`);
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

  const onCellClicked = (params: { data: any; column: any }) => {
    setSelectedRow(selectedRow !== null ? null : params.data);
  };

  const handleGodownSave = async (updatedData: any[]) => {
    console.log('updated data of godown in batch file =======> ', updatedData);
    setSavedData(updatedData);
    // if(selectedBatchId.current){
    //   await sendAPIRequest(`/item/${id}/batch/${selectedBatchId.current}`, {
    //     method: 'PUT',
    //     // body: { ...data, [field]: finalValue },
    //   });
    // }
  };

  const saveUpdatedGodown = async(data: any, dataToSend: any ) => {
    console.log("🚀 ~ saveUpdatedGodown ~ data:", data, savedData)
    dataToSend.forEach((godown: any, index: any) => {
      // Create the dynamic key for opGodown fields (e.g., opGodown0, opGodown1, ...)
      const opGodownKey = `opGodown${index}`;
  
      // Check if the opGodown key exists in the data object and update it
      if (opGodownKey in data) {
        data[opGodownKey] = godown.stocks || 0; // Use 0 as default if stocks is undefined
      }
    });
    console.log("DATAAAAAAAAAAAAA",data)
    await sendAPIRequest(`/item/${id}/batch/${selectedBatchId.current}`, {
      method: 'PUT',
      body: data
    });
  }

  const cellEditingStarted = () => {
    editing.current = true;
  };

  const isPinnedRowDataCompleted = async () => {
    try {
      await batchSchema.validate(inputRow);
      return { completed: true };
    } catch (err: any) {
      return { completed: false, error: err.message };
    }
  };

  const handleKeyDown = async (event: KeyboardEvent) => {
    if (event.code === 'Enter') {
      const focusedCell = gridRef?.current?.api.getFocusedCell();
      const lastEditedRowIndex = focusedCell?.rowIndex;
      if (focusedCell && lastEditedRowIndex === 0 && !isAnyFilterActive()) {
        const validationStatus = await isPinnedRowDataCompleted();
        if (validationStatus.completed) {
          if (!editing.current) {
            handleBatchAdd();
          }
        } else {
          !editing.current &&
            settingPopupState(false, `${validationStatus.error}`);
        }
      }
    } else if (event.code === 'Tab') {
      onCellKeyDown();
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

  const isAnyFilterActive = () => {
    const filterModel = gridRef?.current?.api.getFilterModel();
    if (filterModel) {
      return Object.keys(filterModel).length > 0;
    } else {
      return false;
    }
  };

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

  const salePriceColumns: ColDef[] = [];

  if (controlRoomSettings.multiPriceList && controlRoomSettings.salesPriceLimit > 1) {
    salePriceColumns.push({
      headerName: 'Sale Price 1',
      field: 'salePrice',
      cellDataType: 'number',
      headerClass: 'custom-header-class custom-header',
    });
    for (let i = 2; i <= controlRoomSettings.salesPriceLimit; i++) {
      salePriceColumns.push({
        headerName: `Sale Price ${i}`,
        field: `salePrice${i}`,
        cellDataType: 'number',
        headerClass: 'custom-header-class custom-header',
      });
    }
  } else {
    salePriceColumns.push({
      headerName: 'Sale Price',
      field: 'salePrice',
      cellDataType: 'number',
      headerClass: 'custom-header-class custom-header',
    });
  }

    const colDefs: ColDef[] = [
      {
        headerName: 'Batch No',
        field: 'batchNo',
        cellDataType: 'text',
      },
      {
        headerName: 'Expiry Date',
        field: 'expiryDate',
      },
      {
        headerName: 'Opening Stock',
        field: 'opBalance',
        cellDataType: 'number',
      },
      {
        headerName: 'Scheme Stock',
        field: 'opFree',
        cellDataType: 'number',
      },
      {
        headerName: 'Godown Stocks',
        field: 'godownStocks',
        cellDataType: 'number',
        valueGetter: () => godownData?.length,
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
      },
      ...salePriceColumns,
      {
        headerName: 'MRP',
        field: 'mrp',
        cellDataType: 'number',
      },
      {
        headerName: 'Current Stock',
        field: 'currentStock',
        editable: false
      },
      {
        headerName: 'Lock Batch',
        field: 'locked',
      },
      ...(controlRoomSettings.batchWiseManufacturingCode
        ? [
          {
            headerName: 'MFG Code',
            field: 'mfgCode',
          },
        ]
        : []),
    ];

  return (
    <div ref={containerRef}>
      <div className='w-full'>
        <div className='flex w-full items-center justify-between px-8 py-1'>
          <h1 className='font-bold'>{item && item.name}</h1>
          <Button type='highlight' handleOnClick={() => params.setShowBatch(null)}>
            Back
          </Button>
        </div>
        <div id='account_table' className='ag-theme-quartz'>
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
              onGridReady={onGridReady}
              onCellEditingStarted={cellEditingStarted}
              onCellEditingStopped={handleCellEditingStopped}
              onRowSelected={handleRowSelected}
              onFirstDataRendered={onGridReady}
            />
          }
        </div>

        {popupList.isOpen && (
          <SelectListTableWithInput
            heading={popupList.data.heading}
            headers={popupList.data.headers}
            tableData={popupList.data.tableData}
            // onValueChange={handleValueChange}
            focusedColumn={1}
            closeList={() => setPopupList({ isOpen: false, data: {} })}
            onSave={handleGodownSave}
            isUpdateMode={isUpdateMode}
            setIsUpdateMode={setIsUpdateMode}
            setSavedData={setSavedData}
            setSaveUpdatedData={setSaveUpdatedData}
            batchData={{id: id, batchId: selectedBatchId.current}}
          />
        )}

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
      </div>
    </div>
  );
};

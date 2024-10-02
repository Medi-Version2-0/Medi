import React, { useEffect, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { partyLockedSetup } from '../../interface/global';
import PlaceholderCellRenderer from '../../components/ag_grid/PlaceHolderCell';
import usePermission from '../../hooks/useRole';
import { MdDeleteForever } from 'react-icons/md';
import { sendAPIRequest } from '../../helper/api';
import { SelectList } from '../../components/common/customSelectList/customSelectList';
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import { Ledger } from '../ledger';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';

export const PartyLockedSetup = () => {

  const initialValue = {
    partyName: '',
    locked: 'Y',
    closingBalance: '',
    closingBalanceType: '',
  };

  const partyId = useRef('');
  const { createAccess, updateAccess } = usePermission('ledger')
  const [tableData, setTableData] = useState<partyLockedSetup | any>([initialValue]);
  const gridRef = useRef<any>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [selectedParty, setSelectedParty] = useState<any>(null)
  const editing = useRef(false);
  const [popupList, setPopupList] = useState<{ isOpen: boolean, data: any }>({
    isOpen: false,
    data: {}
  });
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });
  const focusedCells = useRef('partyName')

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };
  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
  };
  const settingPopupState = (isModal: boolean, message: string) => {
    setPopupState({
      ...popupState,
      [isModal ? 'isModalOpen' : 'isAlertOpen']: true,
      message: message,
    });
  };

  const partyHeaders = [
    { label: 'Name', key: 'partyName' },
    { label: 'Station', key: 'station_name' },
    { label: 'Closing Balance', key: 'closingBalance' },
    { label: 'Closing Balance Type', key: 'closingBalanceType' },
  ];


  useEffect(() => {
    getPartyData();
    document.getElementById(focusedCells.current)?.focus();
  }, [])

  const getPartyData = async () => {
    try {
      const partiesData: any = await sendAPIRequest(`/ledger/`, {
        method: 'GET'
      })
      const filteredParties = partiesData.filter((item: any) => item.locked === "Y");
      setTableData([...(createAccess ? [initialValue] : []), ...filteredParties]);

    } catch (error: any) {
      setPopupState({
        ...popupState,
        isAlertOpen: true,
        message: `${error.message}`,
      });
    }
  }

  const handleConfirmPopup = async () => {
    setPopupState({ ...popupState, isModalOpen: false });
    setLockedParty(partyId.current);
  };

  const setLockedParty = async (data: any) => {
    if (data) {
      const response : any = await sendAPIRequest(`/ledger/${data}`, {
        method: 'PUT',
        body: { 'locked': "N" },
      });
      getPartyData();
    }
  }

  const openSelectPartyList = async(params: any)=>{
    if(params.node.rowIndex === 0){
      if (params.column.colId === "partyName") {
        setPopupList({
          isOpen: true,
          data: {
            heading: 'Select Party',
            headers: [...partyHeaders],
            footers: partyFooterData,
            autoClose: true,
            apiRoute: '/ledger',
            extraQueryParams: { locked: "!Y" },
            searchFrom: 'partyName',
            handleSelect: (rowData: any) => {
              setSelectedParty(rowData);
              updateTableData(rowData);
              const api = gridRef?.current?.api;
              const focusedCell = api.getFocusedCell();
  
              if (focusedCell) {
                const lastEditedRowIndex = focusedCell.rowIndex;
                const lastEditedColKey = 'locked';
                setTimeout(async () => {
                  api.setFocusedCell(lastEditedRowIndex, lastEditedColKey);
                  await api.startEditingCell({
                    rowIndex: lastEditedRowIndex,
                    colKey: lastEditedColKey,
                  });
                }, 100);
              }
              document.getElementById('locked')?.focus()
  
            }
          }
        });

      }
    }
  }

  const onCellClicked = (params: any) => {
    setSelectedRow(selectedRow !== null ? null : params.data);
  };

  const updateTableData = (Party: any) => {
    setTableData((prevData: any[]) => {

      return prevData.map((row, index) => {
        if (index === 0) {
          const updatedRow: any = { ...row };
          colDefs.forEach((colDef: any) => {
            const field = colDef.field;
            if (Party[field] !== undefined) {
              updatedRow[field] = Party[field];
            }
          });
          updatedRow['locked'] = 'Y';
          return updatedRow;
        }
        return row;
      });
    });
  };


  const handleKeyDown = (event: KeyboardEvent) => {
    handleKeyDownCommon(
      event,
      () => handleDelete(selectedRow,),
      selectedRow,
      undefined
    );
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRow]);


  const cellEditingStarted = (params: any) => {
    editing.current = true;
    openSelectPartyList(params)
  };

  const handleCellEditingStopped = async (e: any) => {

    editing.current = false;
    const { data, column, oldValue, valueChanged, node } = e;
    let { newValue } = e;
    const field = column.colId;
    if (field === 'locked') {
      if (newValue?.toLowerCase() === 'y' || newValue?.toLowerCase() === 'n') {
        newValue = newValue?.toUpperCase();
      }
    }

    if (node.rowIndex === 0 && createAccess) {
      try {
        if (data.partyName && data.locked ) {

          const response: any = await sendAPIRequest(`/ledger/${selectedParty.party_id}`, {
            method: 'PUT',
            body: { [field]: newValue },
          });
          if (data.partyName && !response.error) {
            settingPopupState(false, 'Party Locked successfully');
          }
          getPartyData();
        }
      } catch (error: any) {
        settingPopupState(false, error.message)
      }
    }
  };

  const handleDelete = async (rowData: any, rowIndex?: number) => {
    if (rowIndex === 0) {
      Object.keys(rowData).forEach(key => {
        rowData[key] = null;
      });
    }
    settingPopupState(true,"Are you sure you want to Unlocked the Party")
    partyId.current = rowData.party_id;

  };

  const defaultCol = {
    flex: 1,
    filter: true, 
    floatingFilter: true,
    headerClass: 'custom-header',
    suppressMovable: true,
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
    ),
  }

  const partyFooterData: any[] = [
    {
      label: 'Address',
      data: [
        {
          label: 'Address 1',
          key: 'address1'
        },
        {
          label: 'GST IN',
          key: 'gstIn'
        },
        {
          label: 'PAN No',
          key: 'panCard'
        },
      ]
    },
    {
      label: 'License Info',
      data: [
        {
          label: 'License No 1',
          key: 'drugLicenceNo1'
        },
        {
          label: 'License No 2',
          key: 'drugLicenceNo2'
        },
        {
          label: 'Expiry',
          key: 'licenceExpiry'
        },
      ]
    },
    {
      label: 'Current Status',
      data: [
        {
          label: 'Opening',
          key: 'openingBal'
        },
        {
          label: 'Credit',
          key: 'credit'
        },
        {
          label: 'Debit',
          key: 'debit'
        },
        {
          label: 'Closing Balance',
          key: 'closingBalance',
        },
        {
          label: 'C.B.Type',
          key: 'closingBalanceType',
        }
      ]
    },
  ];

  const colDefs = [
    {
      headerName: 'Party Name',
      field: 'partyName',
      editable: (params: any) => params.node.rowIndex === 0,
    },
    {
      headerName: 'Locked',
      field: 'locked',
      valueGetter: () => 'Y',
      editable: (params: any) => params.node.rowIndex === 0,
    },
    {
      headerName: 'Closing Balance',
      field: 'closingBalance',
      editable: false
    },
    {
      headerName: 'Closing balance Type',
      field: 'closingBalanceType',
      editable: false
    },
    {
      headerName: 'Actions',
      headerClass: 'custom-header-class custom-header',
      sortable: false,
      editable: false,
      floatingFilter: false,
      filter: false,
      cellStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      cellRenderer: (params: any) => (
        <div className='table_edit_buttons'>
          {updateAccess && params.node.rowIndex !== 0 && <MdDeleteForever
            style={{ cursor: 'pointer', fontSize: '1.2rem' }}
            onClick={() => {
              setSelectedRow(selectedRow !== null ? null : params.data);
              handleDelete(params.data, params.node.rowIndex);
            }}
          />}
        </div>
      ),
    },
  ]

  return (
    <>
      <div id='account_table' className='ag-theme-quartz'>
        {
          <AgGridReact
          ref={gridRef}
            rowData={tableData}
            columnDefs={colDefs}
            defaultColDef={defaultCol}
            onCellClicked={onCellClicked}
            onCellEditingStarted={cellEditingStarted}
            onCellEditingStopped={handleCellEditingStopped}
          />
        }
      </div>

      {(popupState.isModalOpen || popupState.isAlertOpen) && (
          <Confirm_Alert_Popup
            id='plAlert'
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

      {popupList.isOpen && <SelectList
        tableData={[]}
        heading={popupList.data.heading}
        closeList={() => setPopupList({ isOpen: false, data: {} })}
        headers={popupList.data.headers}
        footers={popupList.data.footers}
        apiRoute={popupList.data.apiRoute}
        handleSelect={(rowData) => { popupList.data.handleSelect(rowData) }}
        handleNewItem={popupList.data?.newItem}
        searchFrom={popupList.data.searchFrom}
        autoClose={popupList.data.autoClose}
        onEsc={popupList.data.onEsc}
        extraQueryParams={popupList.data.extraQueryParams || {}}
      />}
    </>
  )
}
import { useEffect, useState, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { partyHeaders, partyFooterData} from './partywiseHeader';
import Button from '../../components/common/button/Button';
import { printData } from '../../components/common/ExportData';
import { SelectList } from '../../components/common/customSelectList/customSelectList';
import useApi from '../../hooks/useApi';
import usePermission from '../../hooks/useRole';
import useHandleKeydown from '../../hooks/useHandleKeydown';
import { TabManager } from '../../components/class/tabManager';
import { partywisePriceListViewChain } from '../../constants/focusChain/partywisePriceList';
import { useSelector } from 'react-redux';
import { GridOptions } from 'ag-grid-community';

const PriceList = () => {

    const { createAccess, deleteAccess } = usePermission('ledger')
    const [selectedPartyStation, setSelectedPartyStation] = useState<string>('');
    const [tableData, setTableData] = useState<any[]>([]);
    const [currentSavedData, setCurrentSavedData] = useState<any>();
    const [itemData, setItemData] = useState<any>()
    const checkItemData = useRef(false);

    const { sendAPIRequest } = useApi();
    const [popupState, setPopupState] = useState({
        isModalOpen: false,
        isAlertOpen: false,
        message: '',
    });

    const [popupList, setPopupList] = useState<{ isOpen: boolean, data: any }>({
        isOpen: false,
        data: {}
    })
    const settingPopupState = (isModal: boolean, message: string) => {
        setPopupState({
        ...popupState,
        [isModal ? 'isModalOpen' : 'isAlertOpen']: true,
        message: message,
        });
    };
    const tabManager = TabManager.getInstance()
    const decimalPlaces = useSelector((state: any) => state.global.controlRoomSettings.decimalValueCount || 2);


    useEffect(()=>{
      setItemData([])
       if(!!currentSavedData){ 
        getItem();
        setSelectedPartyStation(currentSavedData?.station_name || '');}
    },[currentSavedData?.party_id])

    useEffect(()=>{
      if(currentSavedData?.party_id){
        getPartywiseItem(currentSavedData?.party_id);
      }
      tabManager.updateFocusChainAndSetFocus([...partywisePriceListViewChain ] , 'partySelect')    
    },[])


    const getItem = async()=>{
        try {
          const itemsData: any = await sendAPIRequest(`/item/`, { method: 'GET' })
          getPartywiseItem(currentSavedData?.party_id, itemsData);
        } catch (error: any) {
          if (!error?.isErrorHandled) {
            console.log('Partywise price list not read');
          }
        }
      }

    const handleItemData = async (itemData: any) => {
      const filteredItemData = itemData?.filter((item: any) => {
        let batches = item.ItemBatches;
        if (batches && batches.length > 0) {
          batches = batches.sort((a: any, b: any) => a.id - b.id);
        }
  
        const unlockedBatches = batches.filter((batch: any) => batch.locked !== "Y");
        if (unlockedBatches.length > 0) {
          const batch = unlockedBatches[unlockedBatches.length - 1];
          const party = currentSavedData?.salesPriceList;
          item.salePrice = (Number(party) === 1 || !party) ? batch[`salePrice`] ?? 0 : batch[`salePrice${party}`] ?? 0;
        }
        else {
          item.salePrice = 0;
        }
        return item;
      });
      // if (filteredItemData && filteredItemData?.length > 0) setTableData( [...tableData, filteredItemData]);
      await handleAdd(filteredItemData);
    };


    const handleAdd = async (itemData: any) => {
      const finalData: any = [];
      const itemDetails: any[] = [];
      if(itemData && itemData.length){
        itemData.map((data: any) => {
          const value = {
            partyId: currentSavedData?.party_id,
            itemId: data.id,
            salePrice: data.salePrice
          }  
          finalData.push(value);

          const detail = {
            name: data.name,
            salePrice: data.salePrice,
        };
        itemDetails.push(detail); 
        })
      }
      try {
        await sendAPIRequest(`/partyWisePriceList`, {
          method: 'POST',
          body: finalData,
        });
        await getPartywiseItem(currentSavedData?.party_id);   
      } catch (error: any) {
        if (!error?.isErrorHandled) {
          console.log('Partywise price list not created');
        }
      }
    }

    const getPartywiseItem = async (partyId?: any, itemsData?: any) => {
      try {
        partyId = partyId ? partyId : currentSavedData?.party_id;
        
        const itemDataToUse = itemsData
        
        const getItemData = await sendAPIRequest<any[]>(`/partyWisePriceList/${partyId}`, { method: 'GET' });
        
        // const hasMatchingId = getItemData.some((item: any) => item.partyId === partyId);
        
        setTableData(getItemData);
        // if (hasMatchingId && (itemDataToUse.length === getItemData.length)) {
        //   checkItemData.current = true;
        // } else
         if (getItemData.length && (itemDataToUse.length > getItemData.length)) {
          addNewItems(itemDataToUse,getItemData);
        } 
        // else if (itemDataToUse.length < getItemData.length) {
        //   removeDeletedItem();
        // }
         else {
          checkItemData.current = false;
          handleItemData(itemDataToUse);
        }
        
      } catch (error: any) {
        if (!error?.isErrorHandled) {
          console.log('Partywise price list not read',error);
        }
      }
    };
    

  const addNewItems = async(itemDataToUse?: any, getItemData?: any) => {
        
    const unmatchedItems = itemDataToUse.filter((itemData: any) =>
      !getItemData.some((getItem: any) => getItem.itemId === itemData.id)
    );
    handleItemData(unmatchedItems)
  }

  const handleDelete = async (id: any) => {
    try {
      await sendAPIRequest(`/partyWisePriceList/${id}`, { method: 'DELETE' });
      setSelectedPartyStation('');
      setCurrentSavedData({});
    } catch (error: any) {
      if (!error?.isErrorHandled) {
        console.log('Partywise price list not deleted');
      }
    }
  };

  const handleCellEditingStopped = async (e: any) => {
    const { data, column, oldValue, valueChanged, node } = e;
    const { newValue } = e;
    if (!valueChanged) return;
    const field = column.colId;

    if (field === 'salePrice') {
      const decimalPart = newValue.toString().split('.');
      if (decimalPart && decimalPart.length > decimalPlaces) {
        node.setDataValue(field, oldValue);
        settingPopupState(false, '')
        return;
      }
      if (newValue < 0) {
        node.setDataValue(field, oldValue);
        return;
      }
    }

    if (newValue < 0) {
      node.setDataValue(field, oldValue);
      return;
    }
    data.combinedId = data.combinedId || `${currentSavedData?.party_id}${data.id}`;
    try {
      await sendAPIRequest(`/partyWisePriceList/${data.combinedId}`, {
        method: 'PUT',
        body: { [field]: newValue },
      });
      getPartywiseItem(currentSavedData?.party_id);
    } catch (error: any) {
      if (!error?.isErrorHandled) {
        console.log('Partywise price list not updated');
      }
    }
  };
    

    const openPopup = () => {
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
                setCurrentSavedData(rowData);
              },
            },
          });
      };

      const defaultCols={
        filter: true,
        flex: 1,
        editable: false,
        suppressMovable: true,
        headerClass: 'custom-header',
    }
    
    const colDefs = [
      {
        headerName: 'S.No.',
        field: 'Sno',
        flex:0.5,
        valueGetter: (params: any) => params.node ? params.node.rowIndex + 1 : null,
        editable: false
      },
      {
        headerName: 'Item Name',
        field: 'name',
      },
      {
        headerName: 'Sale Price',
        field: 'salePrice',
        editable: true,
        cellEditor: 'agNumberCellEditor',
        cellEditorParams: {
          precision: decimalPlaces,
        },
        valueParser: (params: any) => {
          const value = params.newValue;
          if (value === null || value === undefined || value === '') return null;
          const parsed = parseFloat(value);
          return isNaN(parsed) ? null : parsed;
        },
      },
    ];

    const gridOptions: GridOptions<any> = {
      pagination: true,
      paginationPageSize: 20,
      paginationPageSizeSelector: [20, 30, 40],
      defaultColDef: defaultCols
    };

    return (
        <>
          <div className='w-full relative mb-4'>
            <h1 className='font-bold'>Party-Wise PriceList</h1>
            <div className='mb-4 flex flex-row justify-between items-end'>
              <div className='flex flex-row gap-10 items-center'>
                <div className='flex flex-col'>
                  <label htmlFor='partySelect' className='block mb-2'>
                    Select Party:
                  </label>
                  <div className='flex items-center'>
                    {createAccess && (<input
                      id='partySelect'
                      placeholder='Select Party...'
                      onClick={() => openPopup()} 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          openPopup();
                        }
                      }}
                      value={currentSavedData?.partyName || ''}
                      className='p-2 border border-gray-300 rounded min-w-52'
                    />)}
                  </div>
                </div>
                {selectedPartyStation && (
                  <div className='flex flex-col'>
                    <label htmlFor='station' className='block mb-2'>
                      Station:
                    </label>
                    <div className='p-1.5 border-2 border-black rounded bg-gray-100 shadow-lg'>
                      <div>{selectedPartyStation}</div>
                    </div>
                  </div>
                )}
              </div>
              <div className='flex space-x-6'>
                {deleteAccess && ( <Button
                  id='del_button'
                  type='highlight'
                  padding='px-6 py-4'
                  handleOnClick={() => {
                    handleDelete(currentSavedData?.party_id)
                    setTableData([]);
                  }}
                >
                  Delete
                </Button> )}
                <Button
                  id='print_button'
                  type='highlight'
                  padding='px-6 py-4'
                  handleOnClick={() => {
                    printData(tableData, colDefs);
                  }}
                >
                  Print
                </Button>
              </div>
            </div>
          </div>
          {currentSavedData?.party_id && (
            <div
              id='priceListTable'
              className='ag-theme-quartz w-full my-4'
              style={{ height: '800px' }}
            >
              <AgGridReact
                rowData={tableData}
                columnDefs={colDefs}
                defaultColDef={defaultCols}
                onCellEditingStopped={handleCellEditingStopped}
                gridOptions={gridOptions}
              />
            </div>
          )}
          {popupList.isOpen && (
            <SelectList
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
          />)}
        </>
      );
}

export default PriceList;
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

const PriceList = () => {
  const { createAccess, deleteAccess } = usePermission('ledger')
  const [selectedPartyStation, setSelectedPartyStation] = useState<string>('');
  const [currentSavedData, setCurrentSavedData] = useState<{[key: string] : string}>({});
  const [tableData, setTableData] = useState<any[]>([]);
  const [partyData, setPartyData] = useState<any>()
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

  const focusedEle =  useRef<HTMLElement | null>(null);
  useEffect(()=> {
    setTimeout(()=>{
      focusedEle.current = document.getElementById('partySelect')
      focusedEle.current?.focus();
    },100)
    getPartyData();
    getItem();
  },[])

  const getPartyData = async () => {
    try {
      const partiesData: any = await sendAPIRequest(`/ledger/`, {
        method: 'GET'
      })
      const filteredParties = partiesData.filter((item: any) => item.locked === "Y");
      setPartyData(filteredParties)

    } catch (error: any) {
      setPopupState({
        ...popupState,
        isAlertOpen: true,
        message: `${error.message}`,
      });
    }
  }

  const getItemData = async (partyId?: any) => {
    try {
      const getItemData = await sendAPIRequest<any[]>(`/partyWisePriceList/${partyId}`, {method: 'GET'});
      const hasMatchingId = getItemData.some((item:any) => item.partyId === partyId);
      if (hasMatchingId && (itemData.length === getItemData.length)) {
        checkItemData.current = true;
        setTableData(getItemData)
      } else {
        checkItemData.current = false;
      }
    } catch (error: any) {
      if (!error?.isErrorHandled) {
        console.log('Partywise price list not read');
      }
    }
  }

  const getItem = async()=>{
    try {
      const itemsData: any = await sendAPIRequest(`/item/`, {
        method: 'GET'
      })
      setItemData(itemsData)
    } catch (error: any) {
      if (!error?.isErrorHandled) {
        console.log('Partywise price list not read');
      }
    }
  }
  const defaultCols={
      filter: true,
      flex: 1,
      editable: false,
      suppressMovable: true,
      headerClass: 'custom-header',
  }

  const colDefs = useMemo(
    () => [
      {
        headerName: 'Item Name',
        field: 'name',
      },
      {
        headerName: 'Sale Price',
        field: 'salePrice',
        editable: true,
      },
    ],
    []
  );

  const handleCellEditingStopped = async (e: any) => {
    const { data, column, oldValue, valueChanged, node } = e;
    const { newValue } = e;
    if (!valueChanged) return;
    const field = column.colId;

    if (newValue < 0) {
      node.setDataValue(field, oldValue);
      return;
    }
    try {
      await sendAPIRequest(`/partyWisePriceList/${data.combinedId}`, {
        method: 'PUT',
        body: { [field]: newValue },
      });
      getItemData(currentSavedData?.party_id);
    } catch (error: any) {
      if (!error?.isErrorHandled) {
        console.log('Partywise price list not updated');
      }
    }
  };

  const handleAdd = async (itemData: any) => {
    const finalData: any = [];
    itemData.map((data: any) => {
      const value = {
        partyId: currentSavedData?.party_id,
        itemId: data.id,
        salePrice: data.salePrice
      }
 
      finalData.push(value);
    })
    try {
      await sendAPIRequest(`/partyWisePriceList`, {
        method: 'POST',
        body: finalData,
      });
      getItemData(currentSavedData?.party_id);   
    } catch (error: any) {
      if (!error?.isErrorHandled) {
        console.log('Partywise price list not created');
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (Object.keys(currentSavedData)?.length !== 0) {
        await getItemData(currentSavedData?.party_id);
        if (!checkItemData.current) {
          handleItemData(itemData);
        }
        setSelectedPartyStation(currentSavedData?.station_name || '');
      }
    };
  
    fetchData();
  }, [currentSavedData.party_id, itemData]);


  const handleItemData = async (itemData: any) => {
    const filteredItemData = itemData?.filter((item: any) => {
      let batches = item.ItemBatches;
      batches = batches?.sort((a: any, b: any) => a.id - b.id);

      const unlockedBatches = batches.filter((batch: any) => batch.locked !== "Y");
      if (unlockedBatches.length > 0) {
        const batch = unlockedBatches[unlockedBatches.length - 1];
        const party = currentSavedData?.salesPriceList;
        item.salePrice = (party === '1' || !party) ? batch[`salePrice`] ?? 0 : batch[`salePrice${party}`] ?? 0;
        return true;
      }
      return false;
    });
    if (filteredItemData.length > 0) setTableData(filteredItemData);
    await handleAdd(filteredItemData);
  };

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

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey && (event.key === 'd' || event.key === 'D')) {
      event.preventDefault();
      if (currentSavedData?.party_id) {
        handleDelete(currentSavedData.party_id);
      }
    }
  }
  useHandleKeydown(handleKeyDown, [currentSavedData]);

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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && partyData.length) {
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
                            setCurrentSavedData(rowData)
                            document.getElementById('partySelect')?.focus()
                            console                     }
                        }
                      })
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
      {currentSavedData.party_id && (
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
};

export default PriceList;

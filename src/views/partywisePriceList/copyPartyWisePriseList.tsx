import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';
import Button from '../../components/common/button/Button';
import { partyHeaders, partyFooterData } from './partywiseHeader';
import { SelectList } from '../../components/common/customSelectList/customSelectList';
import useApi from '../../hooks/useApi';
import usePermission from '../../hooks/useRole';

const CopyPratywisePriceList: React.FC = () => {
  const { createAccess } = usePermission('ledger')
  const [copyFrom, setCopyFrom] = useState<{ [key: string]: string }>({});
  const [copyTo, setCopyTo] = useState<any>(null);
  const { sendAPIRequest } = useApi();
  const [partyData, setPartyData] = useState<any>()
  const [tableData, setTableData] = useState<any[]>([]);
  const [popupList, setPopupList] = useState<{ isOpen: boolean, data: any }>({
    isOpen: false,
    data: {}
  })
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });
  
  useEffect(()=> {
    getPartyData();
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
      const itemData = await sendAPIRequest<any[]>(
        `/partyWisePriceList/${partyId}`,
        {
          method: 'GET',
        }
      );
      setTableData(itemData);
    } catch (error: any) {
      if (!error?.isErrorHandled) {
        console.log('Partywise price list not read');
      }
    }
  };

  const handleCopy = async () => {
    const finalData = {
      copyFrom: copyFrom.party_id,
      copyTo: copyTo.party_id,
    };

    try {
      await sendAPIRequest(
        `/partyWisePriceList/copyPartyWisePriceList`,
        {
          method: 'POST',
          body: JSON.stringify(finalData),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      getItemData(copyTo.party_id);
    } catch (error: any) {
      if (!error?.isErrorHandled) {
        console.log('Partywise price list not created');
      }
    }
  };
  
  const colDefs = useMemo(
    () => [
      {
        headerName: 'Item Name',
        field: 'name',
        filter: true,
        flex: 1,
        editable: false,
        suppressMovable: true,
        headerClass: 'custom-header',
      },
      {
        headerName: 'Sale Price',
        field: 'salePrice',
        filter: true,
        flex: 1,
        editable: true,
        suppressMovable: true,
        headerClass: 'custom-header',
      },
    ],
    []
  );
  

  return (
    <div className='flex flex-col'>
      {createAccess && (<div className='flex items-end space-x-4 p-4'>
        <div className='flex-1'>
          <label
            htmlFor='copyFrom'
            className='block text-sm font-medium text-gray-700'
          >
            Party
          </label>
          <input
            id='copyFrom'
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
                      setCopyFrom(rowData)
                    }
                  }
                })
              }
            }}
            value={copyFrom?.partyName || ''}
            className='w-full mt-1 p-2 border border-gray-300 rounded min-w-52'
          />
        </div>
        <div className='flex-1'>
          <label
            htmlFor='copyTo'
            className='block text-sm font-medium text-gray-700'
          >
            Copy To
          </label>
          <input
            id='copyTo'
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
                      setCopyTo(rowData)
                    }
                  }
                });
              }
            }}
            value={copyTo?.partyName || ''}
            className='w-full mt-1 p-2 border border-gray-300 rounded min-w-52'
          />
        </div>
        <Button
          id='copyButton'
          type='highlight'
          padding='px-6 py-5'
          handleOnClick={() => handleCopy()}
        >
          Copy
        </Button>
      </div>)}
      <div className='flex w-full'>
        {createAccess && (<Button id='AddBtn' type='highlight' btnType='button' handleOnClick={() => {
          setCopyFrom({});
          setCopyTo(null);
          setTableData([]);
        }} >
          Add More
        </Button>)}
      </div>

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

      {!!tableData.length && (
        <div
          id='priceListTable'
          className='ag-theme-quartz w-full my-4'
          style={{ height: '800px' }}
        >
          <AgGridReact rowData={tableData} columnDefs={colDefs} />
        </div>
      )}
    </div>
  );
};

export default CopyPratywisePriceList;

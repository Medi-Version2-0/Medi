import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { sendAPIRequest } from '../../helper/api';
import { useParams } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import Button from '../../components/common/button/Button';
import { partyHeaders } from './partywiseHeader';
import { SelectList } from '../../components/common/selectList';

const CopyPratywisePriceList: React.FC = () => {
  const [copyFrom, setCopyFrom] = useState<{ [key: string]: string }>({});
  const [copyTo, setCopyTo] = useState<any>(null);
  const { party: partyData } = useSelector((state: any) => state.global);
  const { organizationId } = useParams<{ organizationId: string }>();
  const [tableData, setTableData] = useState<any[]>([]);
  const [popupList, setPopupList] = useState<{ isOpen: boolean, data: any }>({
    isOpen: false,
    data: {}
  })

  const getItemData = async (partyId?: any) => {
    const itemData = await sendAPIRequest<any[]>(
      `/${organizationId}/partyWisePriceList/${partyId}`,
      {
        method: 'GET',
      }
    );
    setTableData(itemData);
  };

  const handleCopy = async () => {
    const finalData = {
      copyFrom: copyFrom.party_id,
      copyTo: copyTo.party_id,
    };

    await sendAPIRequest(
      `/${organizationId}/partyWisePriceList/copyPartyWisePriceList`,
      {
        method: 'POST',
        body: JSON.stringify(finalData),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    getItemData(copyTo.party_id);
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
      <div className='flex items-end space-x-4 p-4'>
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
            onFocus={() => {
              if (partyData.length) {
                setPopupList({
                  isOpen: true,
                  data: {
                    heading: 'Select Party',
                    headers: [...partyHeaders],
                    tableData: partyData,
                    handleSelect: (rowData: any) => setCopyFrom(rowData)
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
            onFocus={() => {
              if (partyData.length) {
                setPopupList({
                  isOpen: true,
                  data: {
                    heading: 'Select Party',
                    headers: [...partyHeaders],
                    tableData: partyData,
                    handleSelect: (rowData: any) => setCopyTo(rowData)
                  }
                })
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
      </div>
      <div className='flex w-full'>
        <Button type='highlight' btnType='button' handleOnClick={() => {
          setCopyFrom({});
          setCopyTo(null);
          setTableData([]);
        }} >
          Add More
        </Button>
      </div>

      {popupList.isOpen && (
        <SelectList
          heading={popupList.data.heading}
          closeList={() => setPopupList({ isOpen: false, data: {} })}
          headers={popupList.data.headers}
          tableData={popupList.data.tableData}
          handleSelect={(rowData) => { popupList.data.handleSelect(rowData) }}
        />
      )}

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

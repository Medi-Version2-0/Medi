import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import { sendAPIRequest } from '../../helper/api';
import { useParams } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import Button from '../../components/common/button/Button';

const CopyPratywisePriceList: React.FC = () => {
  const [copyFrom, setCopyFrom] = useState<any>(null);
  const [copyTo, setCopyTo] = useState<any>(null);
  const { party: partyData } = useSelector((state: any) => state.global);
  const { organizationId } = useParams<{ organizationId: string }>();
  const [tableData, setTableData] = useState<any[]>([]);

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

    console.log(`Copying from ${copyFrom.partyName} to ${copyTo.partyName}`);
    getItemData(copyTo.party_id);
  };
  
  const options = partyData?.map((party: any) => ({
    value: party.party_id,
    label: party.partyName,
    party_id: party.party_id,
    partyName: party.partyName,
  }));

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
          <Select
            id='copyFrom'
            options={options}
            value={
              copyFrom
                ? { value: copyFrom.party_id, label: copyFrom.partyName }
                : null
            }
            onChange={(selectedOption: any) => setCopyFrom(selectedOption)}
            className='mt-1 w-full'
            placeholder='Select an option'
          />
        </div>
        <div className='flex-1'>
          <label
            htmlFor='copyTo'
            className='block text-sm font-medium text-gray-700'
          >
            Copy To
          </label>
          <Select
            id='copyTo'
            options={options}
            value={
              copyTo
                ? { value: copyTo.party_id, label: copyTo.partyName }
                : null
            }
            onChange={(selectedOption: any) => setCopyTo(selectedOption)}
            className='mt-1 w-full'
            placeholder='Select an option'
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
          setCopyFrom(null);
          setCopyTo(null);
          setTableData([]);
        }} >
          Add More
        </Button>
      </div>

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

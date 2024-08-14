import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { useSelector } from 'react-redux';
import { DropDownPopup } from '../../components/common/dropDownPopup';
import { itemHeaders, partyHeaders } from './partywiseHeader';
import { sendAPIRequest } from '../../helper/api';
import Button from '../../components/common/button/Button';
import { printData } from '../../components/common/ExportData';

const PriceList = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const { party: partyData, company: companyData, sales: salesData, purchase: purchaseData, item: itemData } = useSelector((state: any) => state.global);
  const [selectedPartyStation, setSelectedPartyStation] = useState<string>('');
  const [openDataPopup, setOpenDataPopup] = useState<boolean>(false);
  const [headerData, setHeaderData] = useState<{ isParty: boolean; isItem: boolean; }>({ isParty: false, isItem: false });
  const [currentSavedData, setCurrentSavedData] = useState<{ party: any; item: any; }>({ party: {}, item: {} });
  const [tableData, setTableData] = useState<any[]>([]);
  const [options, setOptions] = useState<{value: string|number , label: string , [key:string]:any}[]>([]);
  const checkItemData = useRef(false);

  const getItemData = async (partyId?: any) => {
    const getItemData = await sendAPIRequest<any[]>(`/${organizationId}/partyWisePriceList/${partyId}`, {
      method: 'GET',
    });
    const hasMatchingId = getItemData.some(item => item.partyId === partyId);
    if (hasMatchingId && (itemData.length === getItemData.length)) {
      checkItemData.current = true;
      setTableData(getItemData)
    } else {
      checkItemData.current = false;
    }
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
    await sendAPIRequest(`/${organizationId}/partyWisePriceList/${data.combinedId}`, {
      method: 'PUT',
      body: { [field]: newValue },
    });
    getItemData(currentSavedData.party?.party_id);

  };

  useEffect(() => {
    partyData.forEach((party: any) => {
      party.station = party.Station?.station_name;
    });
  }, [partyData]);

  const handleAdd = async (itemData: any) => {
    const finalData: any = [];
    itemData.map((data: any) => {
      const value = {
        partyId: currentSavedData.party.party_id,
        itemId: data.id,
        salePrice: data.salePrice
      }
 
      finalData.push(value);
    })
    await sendAPIRequest(`/${organizationId}/partyWisePriceList`, {
      method: 'POST',
      body: finalData,
    });
    getItemData(currentSavedData.party.party_id);
  }


  useEffect(() => {
    const fetchData = async () => {
      if (Object.keys(currentSavedData.party).length !== 0) {
        await getItemData(currentSavedData.party.party_id);
        if (!checkItemData.current) {
          handleItemData(itemData);
        }
        setSelectedPartyStation(
          currentSavedData.party.Station?.station_name || ''
        );
      }
    };
  
    fetchData();
  }, [currentSavedData.party?.party_id,itemData]);
  


  const handleItemData = async (itemData: any) => {
    const filteredItemData = itemData?.filter((item: any) => {
      let batches = item.ItemBatches;
      batches = batches?.sort((a: any, b: any) => a.id - b.id);

      const unlockedBatches = batches.filter((batch: any) => batch.locked !== "Y");
      if (unlockedBatches.length > 0) {
        const batch = unlockedBatches[unlockedBatches.length - 1];
        const party = currentSavedData.party?.salesPriceList;
        item.salePrice = (party === '1' || !party) ? batch[`salePrice`] ?? 0 : batch[`salePrice${party}`] ?? 0;
        return true;
      }
      return false;
    });
    if (filteredItemData.length > 0) {
      setTableData(filteredItemData);
    }
    await handleAdd(filteredItemData);
  };

  const handleDelete = async (id: any) => {
      await sendAPIRequest(`/${organizationId}/partyWisePriceList/${id}`, { method: 'DELETE' });
      setOptions([]);
      setSelectedPartyStation('');
      setCurrentSavedData(prevState => ({
        ...prevState,
        party: {}
      }));
      setOpenDataPopup(false);
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
                <input
                  id='partySelect'
                  placeholder='Select Party...'
                  onFocus={() => {
                    setHeaderData({ isParty: true, isItem: false });
                    setOptions(partyData);
                    setOpenDataPopup(true);
                  }}
                  value={currentSavedData.party.partyName || ''}
                  className='p-2 border border-gray-300 rounded min-w-52'
                />
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
            <Button
              id='del_button'
              type='highlight'
              padding='px-6 py-4'
              handleOnClick={() => {
                handleDelete(currentSavedData.party.party_id)
                setTableData([]);
              }}
            >
              Delete
            </Button>
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
      {headerData && (
        <div
          id='priceListTable'
          className='ag-theme-quartz w-full my-4'
          style={{ height: '800px' }}
        >
          <AgGridReact
            rowData={tableData}
            columnDefs={colDefs}
            defaultColDef={{
              filter: true,
              flex: 1,
              suppressMovable: true,
              headerClass: 'custom-header',
            }
            }
            onCellEditingStopped={handleCellEditingStopped}
          />
        </div>
      )}
      {openDataPopup && (
        <DropDownPopup
          heading={
            headerData.isParty
              ? 'Select Party'
              : headerData.isItem
                ? 'Select Item'
                : ''
          }
          setOpenDataPopup={setOpenDataPopup}
          headers={
            headerData.isParty
              ? partyHeaders
              : headerData.isItem
                ? itemHeaders
                : []
          }
          tableData={options}
          setCurrentSavedData={setCurrentSavedData}
          dataKeys={{ 'Select Party': 'party', 'Select Item': 'item' }}
        />  
      )}
    </>
  );
};

export default PriceList;

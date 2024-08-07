import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { useSelector } from 'react-redux';
import { DropDownPopup } from '../../components/common/dropDownPopup';
import { itemHeaders, partyHeaders } from './partywiseHeader';
import { sendAPIRequest } from '../../helper/api';
import Button from '../../components/common/button/Button';
import { getAndSetItem } from '../../store/action/globalAction';
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../store/types/globalTypes';

const PriceList = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const {party: partyData, company: companyData, sales: salesData, purchase: purchaseData, item: itemData} = useSelector((state: any) => state.global);
  const [selectedPartyStation, setSelectedPartyStation] = useState<string>('');
  const [openDataPopup, setOpenDataPopup] = useState<boolean>(false);
  const [headerData, setHeaderData] = useState<{isParty: boolean; isItem: boolean;}>({ isParty: false, isItem: false });
  const [currentSavedData, setCurrentSavedData] = useState<{party: any; item: any;}>({ party: {}, item: {} });
  const [tableData, setTableData] = useState<any[]>([]);
  let checkItemData = false;
  const dispatch = useDispatch<AppDispatch>()

  const getItemData = async(partyId:any) =>{
    const itemData = await sendAPIRequest<any[]>(`/${organizationId}/partyWisePriceList/${partyId}`, {
      method: 'GET',
    });
    if (itemData.length ){
      checkItemData = true
      setTableData(itemData)
    } 
  }

  console.log("tableData-------2------>",tableData)
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

  const handleCellEditingStopped = async (e: any) => {
    const { data, column, oldValue, valueChanged, node } = e;
    const { newValue } = e;
    if (!valueChanged) return;
    const field = column.colId;

    if(newValue < 0){
      node.setDataValue(field, oldValue);
      return;
    }
    await sendAPIRequest(`/${organizationId}/partyWisePriceList/${data.id}`, {
      method: 'PUT',
      body: { [field]: newValue },
    });
    dispatch(getAndSetItem(organizationId))

  };

  useEffect(() => {
    partyData.forEach((party: any) => {
      party.station = party.Station?.station_name;
      party.openingBal = party.openingBal ?? 0;
    });
    itemData.forEach((item: any) => {
      item.company = companyData.find(
        (company: any) => company.company_id === item.compId
      )?.companyName;
      item.sales = salesData.find(
        (sale: any) => sale.sp_id === item.saleAccId
      )?.sptype;
      item.purchase = purchaseData.find(
        (purchase: any) => purchase.sp_id === item.purAccId
      )?.sptype;
    });
  }, [partyData, itemData, companyData, salesData, purchaseData]);

  const handleAdd = async  (itemData: any) => {
    const finalData:any = [];
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
  }

  useEffect(() => {
    if (Object.keys(currentSavedData.party).length !== 0) {
      getItemData(currentSavedData.party.party_id);
      if (!checkItemData) handleItemData(itemData);
      console.log("currentSavedData----------->",currentSavedData)
      setSelectedPartyStation(
        currentSavedData.party.Station?.station_name || ''
      );

    }
  }, [currentSavedData.party?.party_id]);

  useEffect(() => {
    console.log('Updated tableData:', tableData);
  }, [tableData]);

  const handleItemData = async (itemData : any) => {
   itemData?.forEach((item : any) => {
      let batches = item.ItemBatches;
      batches = batches?.sort((a: any, b: any) => a.id - b.id);
      const batch = batches[batches.length-1];
      const party = currentSavedData.party?.salesPriceList;
      if(batch) item.salePrice = party === '1' ? batch[`salePrice`] : batch[`salePrice${party}`] ?? 0;
    })
    setTableData(itemData); 
    await handleAdd(itemData);
  }


  return (
    <>
      <div className='w-full relative mb-4'>
        <h1 className='font-bold'>Party-Wise PriceList</h1>
        <div className='mb-4 flex flex-row justify-between items-center'>
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
                    setTableData(partyData);
                    setOpenDataPopup(true);
                  }}
                  value={currentSavedData.party.partyName}
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
              type='fill'
              padding='px-8 py-6'
              handleOnClick={() => {
                setTableData([]);
                sendAPIRequest(`/${organizationId}/partyWisePriceList/${currentSavedData.party.party_id}`, { method: 'Delete' });
              }}
            >
              Delete
            </Button>
            <Button
              id='print_button'
              type='fill'
              padding='px-8 py-6'
              handleOnClick={() => {
                // Print functino
                console.log('Print button clicked');
              }}
            >
              Print
            </Button>
          </div>
        </div>
      </div>
      {selectedPartyStation && (
        <div
          id='priceListTable'
          className='ag-theme-quartz w-full my-4'
          style={{ height: '800px'  }}
        >
          <AgGridReact
            rowData={tableData}
            columnDefs={colDefs}
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
          tableData={tableData}
          setCurrentSavedData={setCurrentSavedData}
          dataKeys={{ 'Select Party': 'party', 'Select Item': 'item'}}
        />  
      )}
    </>
  );
  
};

export default PriceList;

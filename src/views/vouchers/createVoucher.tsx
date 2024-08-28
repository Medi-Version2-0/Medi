import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import CustomSelect from '../../components/custom_select/CustomSelect';
import { Option } from '../../interface/global';
import Button from '../../components/common/button/Button';
import { SelectList } from '../../components/common/selectList';
import { ChallanTable } from '../../components/common/challanTable';
import { useSelector } from 'react-redux';
import { sendAPIRequest } from '../../helper/api';
import { useQueryClient } from '@tanstack/react-query';

interface RowData {
  id: number;
  columns: {
    [key: string]: string | number | any;
  };
}

const CreateVouchers = ({ setView, data }: any) => {
  const { organizationId } = useParams();
  const [focused, setFocused] = useState('');
  const [voucherType, setVoucherType] = useState<Option | null | any>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [gridData, setGridData] = useState<RowData[]>([]);
  const [popupState, setPopupState] = useState<{ isAlertOpen: boolean; message: string }>({ isAlertOpen: false, message: '' });
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);
  const focusColIndex = useRef(0);
  const [popupList, setPopupList] = useState<{ isOpen: boolean, data: any }>({
    isOpen: false,
    data: {}
  });
  const queryClient = useQueryClient();
  const { party: partiesData } = useSelector((state: any) => state.global);
  const [partyValue, setPartyValue] = useState<any[]>([]);
  const [currentSavedData, setCurrentSavedData] = useState<{[key: string] : string}>({});

  const voucherTypes: Option[] = [
    { value: 'cashReceipt', label: 'Cash Receipt' },
    { value: 'cashPayment', label: 'Cash Payment' },
    { value: 'journal', label: 'Journal' },
    { value: 'bankDeposit', label: 'Bank Deposit' },
    { value: 'bankWithdraw', label: 'Bank Withdraw' },
  ];

  const headers = [
    { name: 'Party', key: 'partyName', width: '15%', type: 'input', props: { inputType: 'text', label: true, handleFocus: (rowIndex: number, colIndex: number) => handleFocus(rowIndex, colIndex) } },
    { name: 'Narration', key: 'narration', width: '15%', type: 'input', props: { inputType: 'text', handleChange: (args: any) => { handleInputChange(args); } } },
    { name: 'Amount (₹)', key: 'amount', width: '15%', type: 'input', props: { inputType: 'number', handleChange: (args: any) => { handleInputChange(args); } } },
    { name: 'Dr/Cr', key: 'debitOrCredit', width: '5%', type: 'input', props: { inputType: 'text', handleChange: (args: any) => { handleInputChange(args); }, readOnly: false } },
    { name: 'Discount', key: 'discount', width: '15%', type: 'input', props: { inputType: 'number', handleChange: (args: any) => { handleInputChange(args); } } },
    { name: 'Discount Narration', key: 'disNarration', width: '15%', type: 'input', props: { inputType: 'text', handleChange: (args: any) => { handleInputChange(args); } } },
  ];

  const partyHeader = [
    { label: 'Party Name', key: 'partyName' },
    { label: 'Station', key: 'station_name' },
  ];

  const initializeGridData = async () => {
    const { value: drCrValue } = await getDrCrColumnProps();
    setGridData(Array.from({ length: 1 }, (_, rowIndex) => ({
      id: rowIndex + 1,
      columns: headers.reduce(
        (acc, header) => ({ ...acc, [header.key]: header.key === 'debitOrCredit' ? drCrValue : '' }),
        {}
      ),
    })));
  };

  const getDrCrColumnProps = () => {
    if (voucherType?.value) {
        switch (voucherType?.value) {
          case 'cashReceipt':
          case 'bankDeposit':
              return { value: 'Cr', readOnly: true };
          case 'cashPayment':
          case 'bankWithdraw':
              return { value: 'Dr', readOnly: true };
          default:
              return { value: '', readOnly: false };
      }
    }
    return { value: '', readOnly: false };
};
  const handleVoucherTypeChange = async (option: Option | null) => {
    setVoucherType(option);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    await initializeGridData();
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };


  const handleSave = async () => {
    console.log("1------------>")
    const dataToSend = {
      rows: gridData.map((row) => ({
        id: row.id,
        ...row.columns,
        amount: Number(row.columns.amount),
        discount: Number(row.columns.discount),
        voucherType: voucherType?.value,
        voucherDate: selectedDate,
      })),
    };

    // const dataToSend = {
    //   rows: gridData.map((row) => {
    //     const matchingParty = partiesData.find((party: any) => party.partyName === row.columns.partyName);
  
    //     return {
    //       id: row.id,
    //       ...row.columns,
    //       amount: Number(row.columns.amount),
    //       discount: Number(row.columns.discount),
    //       voucherType: voucherType?.value,
    //       voucherDate: selectedDate,
    //       partyId: matchingParty ? matchingParty.party_id : null,
    //     };
    //   }),
    // };

    try {
      console.log("2------------>",dataToSend)
      if (currentSavedData.voucherNumber) {
        console.log("inside POST------>",dataToSend)
        await sendAPIRequest(`/${organizationId}/voucher/${currentSavedData.voucherNumber}`, {
          method: 'PUT',
          body: dataToSend,
        });
      } else {
        await sendAPIRequest(`/${organizationId}/voucher/`, {
          method: 'POST',
          body: dataToSend,
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['get-vouchers'] });
      setPopupState({
        ...popupState,
        isAlertOpen: true,
        message: 'Voucher saved successfully.',
      });
    } catch (error) {
      console.error('Error saving voucher:', error);
    }
  };

  const fetchParty = async () => {
    setPartyValue(partiesData);
  };

  useEffect(() => {
    fetchParty();
  }, []);

  useEffect(() => {
    initializeGridData();
  }, [voucherType]);

  useEffect(() => {
    if (gridData?.length > 0) {
      const updatedRows: RowData[] = gridData.map((rowData: any) => {
        const updatedColumns = headers.reduce((acc, header) => {
          let data = rowData.columns[header.key];
  
          if (header.key === 'partyName') {
            const matchingParty = partiesData.find((party:any) => party.partyName === rowData.columns[header.key]);
            data = {
              label: matchingParty?.partyName,
              value: matchingParty?.party_id,
            };
          }
  
          return {
            ...acc,
            [header.key]: data,
          };
        }, {});
  
        return {
          ...rowData,
          columns: updatedColumns,
        };
      });
  
      setGridData(updatedRows);
    }
    console.log("insied usaeEffect ------->",gridData)
  }, [ partyValue]);
  

  const handleFocus = (rowIndex: number, colIndex: number) => {
    focusColIndex.current = colIndex;
    setFocusedRowIndex(rowIndex);
    if (colIndex === 0) {
      setPopupList({
        isOpen: true,
        data: {
          heading: 'Select Party',
          headers: [...partyHeader],
          tableData: partyValue,
          handleSelect: (rowData: any) => {
            setCurrentSavedData(rowData)
            handleInputChange({rowIndex,header:'partyName',value: rowData.partyName});
          }
        } 
      });
    }
  };

  const handleInputChange = async ({ rowIndex, header, value }: any) => {
    const newGridData = [...gridData];
    console.log("gridData---1-->",gridData)
    const { readOnly: drCrReadOnly } = await getDrCrColumnProps();
    if (header === 'debitOrCredit' && drCrReadOnly) {
      return;
    }
    newGridData[rowIndex].columns[header] = value;
    setGridData(newGridData);
  };

  return (
    <div className="p-4">
      {voucherType && (
        <div className="text-center mt-4">
          <h2 className="text-xl font-semibold">
            {voucherType.label} Voucher
          </h2>
        </div>
      )}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Select Voucher Type</h2>
        <Button
          type="highlight"
          id="voucher_back_button"
          handleOnClick={() => {
            setView({ type: '', data: {} });
          }}
        >
          Back
        </Button>
      </div>

      <CustomSelect
        isPopupOpen={false}
        label={``}
        value={voucherType}
        id="voucherType"
        onChange={handleVoucherTypeChange}
        options={voucherTypes}
        isSearchable={true}
        isFocused={focused === 'voucherType'}
        placeholder="Select Voucher Type"
        disableArrow={false}
        hidePlaceholder={false}
        containerClass="gap-[3.28rem] !w-60% !justify-between"
        className="!rounded-none !h-8 w-full text-wrap: nowrap"
      />

      {voucherType && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate || ''}
            onChange={handleDateChange}
            className="border border-gray-300 rounded p-2 mt-1"
          />
        </div>
      )}

      {voucherType && selectedDate && (
        <div className="mt-4">
          <ChallanTable
            headers={headers}
            gridData={gridData}
            setGridData={setGridData}
            handleSave={handleSave}
            withAddRow={() => setCurrentSavedData({})}
            newRowTrigger={{ columnIndex: 6, rowIndex: gridData.length - 1 }}
          />
        </div>
      )}

      {voucherType && selectedDate && (
        // <div className="flex justify-start mt-4">
        //   <Button
        //     type="highlight"
        //     id="voucher_submit_button"
        //     handleOnClick={handleSave}
        //   >
        //     Submit
        //   </Button>
        // </div>
        <div className="mt-4 text-center">
        <Button type="highlight" id="save_voucher_button" handleOnClick={handleSave}>
          {currentSavedData.voucherNumber ? 'Update' : 'Submit'}
        </Button>
      </div>
      )}

      {popupList.isOpen && <SelectList
        heading={popupList.data.heading}
        closeList={() => setPopupList({ isOpen: false, data: {} })}
        headers={popupList.data.headers}
        tableData={popupList.data.tableData}
        handleSelect={(rowData) => { popupList.data.handleSelect(rowData) }}
      />}
    </div>
  );
};

export default CreateVouchers;

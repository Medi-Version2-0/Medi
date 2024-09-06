import React, { useEffect, useState, useRef, useMemo, useLayoutEffect } from 'react';
import CustomSelect from '../../components/custom_select/CustomSelect';
import { Option } from '../../interface/global';
import Button from '../../components/common/button/Button';
import { SelectList } from '../../components/common/selectList';
import { ChallanTable } from '../../components/common/challanTable';
import { sendAPIRequest } from '../../helper/api';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { useParams } from 'react-router-dom';

interface RowData {
  columns: {
    [key: string]: string | number | any;
  };
}

interface handleChangeInHeaders{
  header: string;
  value: any;
  rowIndex: number;
}

const CreateVouchers = ({ setView, data }: any) => {
  const [voucherType, setVoucherType] = useState<Option | null>(data?.rowData?.voucherType || null);
  const [selectedDate, setSelectedDate] = useState<string | null>(data?.rowData?.voucherDate || null);
  const [gridData, setGridData] = useState<RowData[]>(data?.gridData || []);
  const [voucherNumber, setVoucherNumber] = useState<number | null>(data?.rowData?.voucherNumber || null);
  const [popupState, setPopupState] = useState<{ isAlertOpen: boolean; isModalOpen: boolean; message: string }>({ isAlertOpen: false, isModalOpen: false, message: '' });
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);
  const focusColIndex = useRef(0);
  const [popupList, setPopupList] = useState<{ isOpen: boolean, data: any }>({
    isOpen: false,
    data: {}
  });
  const headers = useRef<any[]>([]);
  const [currentSavedData, setCurrentSavedData] = useState<{ party: any; }>({ party: {} });
  const [totalValue, setTotalValue] = useState({ totalDebit: 0, totalCredit: 0 });
  const [allParties, setAllParties] = useState<any[]>([]);
  const [hasBankAccount, setHasBankAccount] = useState(false);
  const [gstNature, setGstNature] = useState<Option | null>(data?.rowData?.gstNatuer || null);
  

  const bankName = useRef<{partyName:string,partyId:number}>({
    partyName:'',
    partyId:0
  });

  const voucherTypes: Option[] | any = [
    { value: 'CR', label: 'Cash Receipt', isDisabled: false },
    { value: 'CP', label: 'Cash Payment', isDisabled: false },
    { value: 'JOUR', label: 'Journal', isDisabled: !hasBankAccount },
    { value: 'BD', label: 'Bank Deposit', isDisabled: !hasBankAccount },
    { value: 'BW', label: 'Bank Withdraw', isDisabled: !hasBankAccount }
  ];

  const commonHeaders1 = [
    { name: 'Party', key: 'partyName', width: '16%', type: 'input', props: { inputType: 'text', label: true, handleFocus: (rowIndex: number, colIndex: number) => { handleFocus(rowIndex, colIndex) } } },
    { name: 'Narration', key: 'narration', width: '20%', type: 'input', props: { inputType: 'text', handleChange: (args: handleChangeInHeaders) => { handleInputChange(args); } } },
    { name: 'Amount (₹)', key: 'amount', width: '15%', type: 'input', props: { inputType: 'number', handleChange: (args: handleChangeInHeaders) => { handleInputChange(args); } } },
    {
      name: 'Dr/Cr', key: 'debitOrCredit', width: '15%', type: 'input', props: {
        inputType: 'text', handleChange: (args: handleChangeInHeaders) => {  
      if(args.header === 'debitOrCredit' && args.value){
        args.value = args.value[0].toUpperCase() + args.value.slice(1);
      }
      handleInputChange(args); 
    }, readOnly: false} },
  ];
  const checkNoCheckDateHeaders = [
    { name: 'Cheque No.', key: 'chequeNumber', width: '12%', type: 'input', props: { inputType: 'number', handleChange: (args: handleChangeInHeaders) => { handleInputChange(args); } } },
    { name: 'Cheque Date', key: 'chequeDate', width: '15%', type: 'input', props: { inputType: 'number', handleChange: (args: handleChangeInHeaders) => { handleInputChange(args); } } },
  ];
  const discountHeader = [
    { name: 'Discount (₹)', key: 'discount', width: '14%', type: 'input', props: { inputType: 'number', handleChange: (args: handleChangeInHeaders) => { handleInputChange(args); } } },
  ];
  const commonHeaders2 = [
    // { name: 'Party Balance', key: 'partyBalance', width: '20%', type: 'input', props: { inputType: 'text', handleChange: (args: handleChangeInHeaders) => { handleInputChange(args); } } },
    { name: 'Discount Narration', key: 'disNarration', width: '17%', type: 'input', props: { inputType: 'text', handleChange: (args: handleChangeInHeaders) => { handleInputChange(args); } } }
  ];
  const gstNatureConditionHeaders = [
    { name: 'Instrument Type', key: 'instrumentType', width: '18%', type: 'input', props: { inputType: 'text', handleChange: (args: handleChangeInHeaders) => { handleInputChange(args); } } },
    { name: 'Invocie No.', key: 'invoiceNumber', width: '10%', type: 'input', props: { inputType: 'number', handleChange: (args: handleChangeInHeaders) => { handleInputChange(args); } } },
    { name: 'Invocie Date', key: 'invoiceDate', width: '15%', type: 'input', props: { inputType: 'number', handleChange: (args: handleChangeInHeaders) => { handleInputChange(args); } } },
    { name: 'HSN Code', key: 'hsnCode', width: '12%', type: 'input', props: { inputType: 'number', handleChange: (args: handleChangeInHeaders) => { handleInputChange(args); } } },
    { name: 'GST Rate', key: 'gstRate', width: '15%', type: 'input', props: { inputType: 'number', handleChange: (args: handleChangeInHeaders) => { handleInputChange(args); } } },
    { name: 'SGST', key: 'sgstValue', width: '8%', type: 'input', props: { inputType: 'number', handleChange: (args: handleChangeInHeaders) => { handleInputChange(args); } } },
    { name: 'CGST', key: 'cgstValue', width: '8%', type: 'input', props: { inputType: 'number', handleChange: (args: handleChangeInHeaders) => { handleInputChange(args); } } },
    { name: 'IGST', key: 'igstValue', width: '8%', type: 'input', props: { inputType: 'number', handleChange: (args: handleChangeInHeaders) => { handleInputChange(args); } } },
  ];

  const partyHeaders = [
    { label: 'Name', key: 'partyName' },
    { label: 'Station', key: 'station_name' },
    { label: 'Closing Balance', key: 'currentOpeningBal' },
    { label: 'Closing Balance Type', key: 'currentOpeningBalType' },
  ];

  const gstNatureTypes =[
    { value: '1', label: 'GST Not Applicable' },
    { value: '2', label: 'Registered Expense' },
    { value: '3', label: 'Unregisterd/ RCM Expense' },
  ]

  useEffect(() => {
    setVoucherType(data?.rowData?.voucherType ? { value: data.rowData?.voucherType, label: getVoucherTypeLabel(data?.rowData?.voucherType) } : null);
    setSelectedDate(data?.rowData?.voucherDate ? formatVoucherDate(data.rowData?.voucherDate) : null);
    setGstNature(data?.rowData?.gstNature ? { value: data.rowData?.gstNature, label: getNatureTypeValue(data?.rowData?.gstNature) } : null);
    totalDebitAndCredit();
  }, [data]);

  useEffect(()=>{
    getPartyData();
  },[])
  
  const getVoucherTypeLabel = (value: string) => {
    const voucherType = voucherTypes.find((type: any) => type.value === value);
    return voucherType ? voucherType.label : '';
  };

  const getNatureTypeValue = (value: string) =>{
    const gstNatureType = gstNatureTypes.find((type: any) => type.value === value);
    return gstNatureType ? gstNatureType.label : '';
  }

  const formatVoucherDate = (date: string) => {
    const parsedDate = new Date(date);
    return parsedDate.toISOString().split('T')[0];
  };

  const initializeGridDataFromData = () => {
    if (data?.voucherGridData) {

      const initialRows = data.voucherGridData.map((row: any, rowIndex: number) => {
        const updatedColumns = headers.current.reduce((acc, header) => {
          let value = row[header.key];

          if (header.key === 'partyName') {
            value = {
              label: row.partyName || '',
              value: row.partyId || '',
            };
          }

          if (header.key === 'debitOrCredit' && data.rowData.voucherType !== 'JOUR') {
            value = data.rowData.debitOrCredit || value;
          }

          const valueToReturn = {
            ...acc,
            [header.key]: value,
            rowId: row.id,
          };
          return valueToReturn;
        }, {});
        const receivedValue = JSON.parse(JSON.stringify(updatedColumns));
        return {
          id: rowIndex + 1,
          columns: receivedValue
        }

      });
      setGridData(JSON.parse(JSON.stringify(initialRows)));
    }
  };

  const initializeGridData = () => {
    const { value: drCrValue } = getDrCrColumnProps();
    setGridData(Array.from({ length: 1 }, (_, rowIndex) => ({
      id: rowIndex + 1,
      columns: headers.current.reduce(
        (acc, header) => ({ ...acc, [header.key]: header.key === 'debitOrCredit' ? drCrValue : '' }),
        {}
      ),
    })));
  };

  const getPartyBalance = async(rowIndex: any, partyId: number)=>{
      const response: any = await sendAPIRequest(`/voucher/totalBalance?partyId=${partyId}`,{
        method: 'GET',
      })
      const newGridData = [...gridData];

      newGridData[rowIndex].columns.partyBalance = response;
      setGridData(newGridData)  
  }


  const getVoucherData = async (voucherDate: string, voucherType: string) => {
    const url = `/voucher/?voucherDate=${voucherDate}&voucherType=${voucherType}`;

    try {
      const response: any = await sendAPIRequest(url, {
        method: 'GET',
      });
      setVoucherNumber(response?.voucherNumber);
      return response;
    } catch (error) {
      console.error('Error fetching voucher data:', error);
      throw error;
    }
  }

  const getPartyData = async()=>{
    try {
      const response: any = await sendAPIRequest(`/ledger/`,{
        method: 'GET'
      })
      setAllParties(response)

      const hasBankAccount = response.some((party: any) => party.accountCode === -106);
      setHasBankAccount(hasBankAccount);

    } catch (error: any) {
      setPopupState({
        ...popupState,
        isAlertOpen: true,
        message: `${error.message}`,
      });
    }
  }


  const getDrCrColumnProps = () => {
    if (voucherType?.value) {
      switch (voucherType?.value) {
        case 'CR':
        case 'BD':
          return { value: 'Cr', readOnly: true };
        case 'CP':
        case 'BW':
          return { value: 'Dr', readOnly: true };
        default:
          return { value: gridData[Number(focusedRowIndex)]?.columns.debitOrCredit, readOnly: false };
      }
    }
    return { value: '', readOnly: false };
  };

  const handleVoucherTypeChange = (option: Option | null) => {
    setVoucherType(option);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    initializeGridData();
  };

  const handleGstNatureChange = (option: Option | null) => {
    setGstNature(option);
    initializeGridData();
  }

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  const handleSubmit = async () => {
    const dataToSend: any = {
      rows: gridData.map((row) => {
        const { label, value } = row.columns.partyName || {};

        return {
          ...row.columns,
          amount: Number(row.columns.amount),
          discount: Number(row.columns.discount),
          voucherType: voucherType?.value,
          voucherDate: selectedDate,
          partyName: label,
          ...(voucherNumber && { voucherNumber: voucherNumber }),
          partyId: value,
          ...( (voucherType?.value === 'CP' || voucherType?.value === 'BW') && { gstNature: gstNature?.value }),
          ...( (gstNature && {gstNature: gstNature.value})),
          ...((bankName.current.partyName || data?.rowData?.bankPartyName ) && {
            bankPartyId: bankName.current.partyId || data?.rowData?.bankPartyId,
            bankPartyName: bankName.current.partyName || data?.rowData?.bankPartyName
          })
        };
      }),
    };
    try {

      if (data.rowData?.voucherNumber) {
        dataToSend.voucherNumber = data.rowData.voucherNumber;
        const response: any = await sendAPIRequest(`/voucher/${data.rowData.voucherNumber}`, {
          method: 'PUT',
          body: dataToSend,
        });

        const firstRow: any = dataToSend.rows[0];
        if (firstRow.voucherDate !== null) await getVoucherData(firstRow.voucherDate, firstRow.voucherType);

        setVoucherNumber(response?.voucherNumber);
        setPopupState({
          isModalOpen: false,
          isAlertOpen: true,
          message: `Voucher ${data.rowData.voucherNumber ? 'updated' : 'created'} successfully`,
        });

      } else {

        const response: any = await sendAPIRequest(`/voucher/`, {
          method: 'POST',
          body: dataToSend,
        })
        setVoucherNumber(response?.voucherNumber);
        if (response?.voucherNumber) {
          setPopupState({
            ...popupState,
            isAlertOpen: true,
            message: 'Voucher saved successfully.',
          });
        }
      }

    } catch (error:any) {
      console.error('Error saving voucher:', error);
      setPopupState({
        ...popupState,
        isAlertOpen: true,
        message: `${error.message}`,
      });
    }
  };

  const setDebitOrCredit = async () => {
    let { value } = getDrCrColumnProps();
    if (voucherType?.value === 'JOUR'){
      value = '';
    }
    const updatedData = [...gridData]
    if(voucherType?.value !== 'JOUR'){
      const newGridData = updatedData.map(row => ({
        ...row,
        columns: {
          ...row.columns,
          debitOrCredit: value,
        },
      }));
      setGridData(newGridData);
    }else{
      setGridData(updatedData);
    }
  };

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
    setView({ type: '', data: {} });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleInputChange = async ({ rowIndex, header, value }: handleChangeInHeaders) => {
    const newGridData = [...gridData];
    const { readOnly: drCrReadOnly } = getDrCrColumnProps();
    if (header === 'debitOrCredit' && drCrReadOnly) {
      return;
    }
    if(header === 'debitOrCredit') {
      const firstCharPossibleOutcomes = ['d','c','D','C',undefined];
      const secondCharPossibleOutcomes = ['r','R',undefined];
      if (value.length > 2 || !firstCharPossibleOutcomes.includes(value[0]) || !secondCharPossibleOutcomes.includes(value[1])) return
    }

    if (gridData[rowIndex]?.columns.amount && (voucherType?.value === 'JOUR' || voucherType?.value === 'CP' || voucherType?.value === 'BW') && (gstNature?.value == 2 || gstNature?.value == 3 ) && (header === 'gstRate' || header === 'amount' || header === 'partyName')) {
      let gstRate;
      let amount;
      if (header === 'gstRate') {
        gstRate = value;
        amount = +gridData[rowIndex].columns.amount;
      }
      if (header === 'amount') {
        gstRate = +gridData[rowIndex].columns.gstRate;
        amount = value;
      }
      if(header === 'partyName'){
        gstRate = +gridData[rowIndex].columns.gstRate;
        amount = +gridData[rowIndex].columns.amount;
        newGridData[rowIndex].columns.partyName = {...value};
      }
      if (gridData[rowIndex].columns.partyName.stateInout === "Out Of State"){
        newGridData[rowIndex].columns.igstValue = ((gstRate / 100) * amount).toFixed(2);
        newGridData[rowIndex].columns.sgstValue = 0.00;
        newGridData[rowIndex].columns.cgstValue = 0.00;
      }else{
        newGridData[rowIndex].columns.igstValue = 0.00;
        newGridData[rowIndex].columns.sgstValue = ((gstRate / 200) * amount).toFixed(2);
        newGridData[rowIndex].columns.cgstValue = ((gstRate / 200) * amount).toFixed(2);
      }
    }
    newGridData[rowIndex].columns[header] = value;

    let totalDebit = 0;
    let totalCredit = 0;
    newGridData.forEach((data) => {
      const amount = Number(data.columns.amount) || 0;
      const debitOrCredit = data.columns.debitOrCredit;
      if (debitOrCredit?.toLowerCase() === 'dr') {
        totalDebit += amount;
      } else if (debitOrCredit?.toLowerCase() === 'cr') {
        totalCredit += amount;
      }
    });
    setTotalValue({
      ...totalValue,
      totalDebit: totalDebit,
      totalCredit: totalCredit,
    });

    setGridData(newGridData);
  };

  useEffect(() => {
    initializeGridDataFromData();
  },[headers])
  
  if (!voucherType?.value) {
    headers.current = [...commonHeaders1, ...checkNoCheckDateHeaders, ...discountHeader, ...commonHeaders2, ...gstNatureConditionHeaders];
  }
  if (voucherType?.value === 'CR') {
    headers.current = [...commonHeaders1, ...discountHeader, ...commonHeaders2];
  }
  if (voucherType?.value === 'CP' && (gstNature?.value == 2 || gstNature?.value == 3)) {
    headers.current = [...commonHeaders1, ...discountHeader, ...commonHeaders2, ...gstNatureConditionHeaders];
  }
  if (voucherType?.value === 'CP' && (gstNature?.value == 1 || !gstNature?.value)) {
    headers.current = [...commonHeaders1, ...discountHeader, ...commonHeaders2];
  }
  if (voucherType?.value === 'JOUR' && (gstNature?.value == 2 || gstNature?.value == 3)) {
    headers.current = [...commonHeaders1, ...commonHeaders2, ...gstNatureConditionHeaders];
  }
  if (voucherType?.value === 'JOUR' && (gstNature?.value == 1 || !gstNature?.value)) {
    headers.current = [...commonHeaders1, ...commonHeaders2];
  }
  if (voucherType?.value === 'BD') {
    headers.current = [...commonHeaders1, ...checkNoCheckDateHeaders, ...discountHeader, ...commonHeaders2];
  }
  if (voucherType?.value === 'BW' && (gstNature?.value == 2 || gstNature?.value == 3)) {
    headers.current = [...commonHeaders1, ...checkNoCheckDateHeaders, ...discountHeader, ...commonHeaders2, ...gstNatureConditionHeaders];
  }
  if (voucherType?.value === 'BW' && (gstNature?.value == 1 || !gstNature?.value)) {
    headers.current = [...commonHeaders1, ...checkNoCheckDateHeaders, ...discountHeader, ...commonHeaders2];
  }

  useEffect(() => {
    if (!data.rowData?.voucherNumber){
      setDebitOrCredit();
    }
    if (voucherType?.value === 'JOUR'){
      const newGridData = [...gridData];
      newGridData[gridData.length-1].columns.debitOrCredit = '';
      setGridData(newGridData);
    }
    if (!data.rowData?.voucherNumber && (voucherType?.value === 'BD' || voucherType?.value === 'BW')){
      const data = allParties.filter(p=> p.accountCode === -106);
      setPopupList({
        isOpen: true,
        data: {
          heading: 'Select Party',
          headers: [...partyHeaders],
          tableData: data,
          handleSelect: (rowData: any) => {
            bankName.current = {
              partyName: rowData.partyName,
              partyId: rowData.party_id
            }
          }
        }
      });
    }
  }, [gridData.length, voucherType?.value]);


  useEffect(() => {
    updateGridData();
  }, [currentSavedData])

  const updateGridData = () => {
    if (focusedRowIndex === null) return;
    const newGridData = [...gridData];
    if (Object.keys(currentSavedData).length) {
      newGridData[focusedRowIndex].columns['partyName'] = {
        label: currentSavedData.party.partyName,
        value: currentSavedData.party.party_id,
        stateInout: currentSavedData.party.stateInout
      };

      getPartyBalance(focusedRowIndex,currentSavedData.party.party_id);

      const { value } = getDrCrColumnProps();
      newGridData[focusedRowIndex].columns['debitOrCredit'] = value;

      handleInputChange({ rowIndex:focusedRowIndex, header:'partyName',value: newGridData[focusedRowIndex].columns.partyName })
    }

    if (focusColIndex.current === 0) {
      handleFocus(focusedRowIndex, 1)
    }

    if (focusColIndex.current === 1) {
      document.getElementById(`cell-${focusedRowIndex}-1`)?.focus();
    }
  };

  const handleFocus = (rowIndex: number, colIndex: number) => {
    focusColIndex.current = colIndex;
    setFocusedRowIndex(rowIndex);
    if (focusColIndex.current === 0) {
      setPopupList({
        isOpen: true,
        data: {
          heading: 'Select Party',
          headers: [...partyHeaders],
          tableData: [...allParties],
          handleSelect: (rowData: any) => {

            setCurrentSavedData({ ...currentSavedData, party: rowData })
          }
        }
      });
    }
  };

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
          key: 'openingBalType'
        },
        {
          label: 'Debit',
          key: 'openingBalType'
        },
        {
          label: 'Balance',
          key: 'openingBalType'
        },
      ]
    },
  ];

  const totalDebitAndCredit = async() => {
    const newGridData = [...gridData]
    console.log("inside total----------->",newGridData)
    let totalDebit = 0;
    let totalCredit = 0;

    if(data?.voucherGridData){
      data?.voucherGridData?.forEach((item: any) => {
        const amount = Number(item.amount) || 0;
        const debitOrCredit = item.debitOrCredit;

      if (debitOrCredit === 'Dr') {
        totalDebit += amount;
      } else if (debitOrCredit === 'Cr') {
        totalCredit += amount;
      }
    });
    }
    // const dataToLoopThrough = newGridData.length > 0 ? newGridData : data?.voucherGridData || [];
    // console.log("dataToLoopThrough-->",dataToLoopThrough)

    // dataToLoopThrough.forEach((item: any) => {
    //   const amount = Number(item.amount) || 0;
    //   const debitOrCredit = item.debitOrCredit;

    //   if (debitOrCredit === 'Dr') {
    //     totalDebit += amount;
    //   } else if (debitOrCredit === 'Cr') {
    //     totalCredit += amount;
    //   }
    // })
    console.log("totalDebit------->",totalDebit,"totalCredit----->",totalCredit)

    setTotalValue({
      ...totalValue,
      totalDebit: totalDebit,
      totalCredit: totalCredit,
    });
  }
  const isInputsDisabled = Boolean(data?.rowData?.voucherType && data?.rowData?.voucherDate);

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

      <div className="flex justify-between">
        <div className={`flex ${voucherType ? 'w-[500px]' : 'w-[200px]'} items-center gap-3`}>
          <CustomSelect
            isPopupOpen={false}
            label={``}
            value={voucherType}
            id="voucherType"
            onChange={handleVoucherTypeChange}
            options={voucherTypes}
            isSearchable={true}
            placeholder="Select Voucher Type"
            disableArrow={false}
            hidePlaceholder={false}
            containerClass="gap-[3.28rem] !w-60% !justify-between"
            className="!rounded-none !h-8 text-wrap: nowrap"
            isDisabled={isInputsDisabled}
          />

          {voucherType && (
            <div className="flex gap-2 items-center w-[-webkit-fill-available]">
              <label className="block align-self-center text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                value={selectedDate || ''}
                onChange={handleDateChange}
                className="border border-gray-300 rounded p-1"
                disabled={isInputsDisabled}
              />
            </div>
          )}
        </div>

        {voucherNumber && (
          <div className="flex flex-col justify-end max-w-[14rem]">
            <span className="text-sm font-medium text-gray-700">Voucher Number: {voucherNumber}</span>
          </div>
        )}
        {(voucherType?.value !== 'CR' && voucherType?.value !== 'BD'&& voucherType?.value !== undefined) && (
          <div className="flex items-center gap-2 w-[30%]">
            <p>
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">GST Nature</span>
              <span className='text-red-600 font-medium text-sm'>*</span>
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">: </span>
            </p>
            <CustomSelect
              isPopupOpen={false}
              label={``}
              value={gstNature}
              id="gstNature"
              onChange={handleGstNatureChange}
              options={gstNatureTypes}
              isSearchable={true}
              placeholder="Select GST Nature"
              disableArrow={false}
              hidePlaceholder={false}
              containerClass="!w-[80%] !justify-between"
              className="!rounded-none !h-8 whitespace-nowrap"
              isDisabled={isInputsDisabled}
            />
          </div>
        )}

      </div>

      {(voucherType?.value === 'BD' || voucherType?.value === 'BW') && (
        <span className="text-sm font-medium mt-1 text-gray-700">Bank: {bankName?.current?.partyName || data?.rowData?.bankPartyName}</span>
      )}
      
      
        <div className="mt-4">
          <ChallanTable
            headers={headers.current}
            gridData={gridData}
            setGridData={setGridData}
            skipIndexes={voucherType?.value!=='JOUR' ? [3]:[]}
            newRowTrigger={headers.current.length-1}
            stikyColumn={[0]}
          />
        </div>
      

      {voucherType && selectedDate && (
        <div className="mt-4 text-center">
          <Button type="highlight"
                  id="save_voucher_button"
                  handleOnClick={handleSubmit}
            disable={(voucherType.value === 'JOUR' && totalValue.totalCredit !== totalValue.totalDebit) || ((voucherType.value === 'BW' || voucherType.value === 'JOUR' || voucherType.value === 'CP') && gstNature === null) }
          >
            {data.rowData?.voucherNumber ? 'Update' : 'Submit'}
          </Button>
        </div>
      )}

      {popupList.isOpen && (
        <SelectList
          heading={popupList.data.heading}
          closeList={() => setPopupList({ isOpen: false, data: {} })}
          headers={popupList.data.headers}
          footers={partyFooterData}
          tableData={popupList.data.tableData}
          handleSelect={(rowData) => { popupList.data.handleSelect(rowData) }}
        />
      )}

      {(popupState.isModalOpen || popupState.isAlertOpen) && (
        <Confirm_Alert_Popup
          onClose={handleClosePopup}
          onConfirm={handleAlertCloseModal}
          message={popupState.message}
          isAlert={popupState.isAlertOpen}
        />
      )}

      {voucherType && (
        <div className="flex justify-between mt-4">
          <div className="text-sm font-medium text-gray-700">
            Total Debit: ₹{totalValue.totalDebit.toFixed(2)}
          </div>
          <div className="text-sm font-medium text-gray-700">
            Total Credit: ₹{totalValue.totalCredit.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );


};

export { CreateVouchers };

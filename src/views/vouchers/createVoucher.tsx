import React, { useEffect, useState, useRef, useMemo, useLayoutEffect } from 'react';
import CustomSelect from '../../components/custom_select/CustomSelect';
import { Option } from '../../interface/global';
import Button from '../../components/common/button/Button';
import { SelectList } from '../../components/common/customSelectList/customSelectList';
import { ChallanTable } from '../../components/common/challanTable';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import {validateValue} from './validation'
import useApi from '../../hooks/useApi';
import { useSelector } from 'react-redux';
import usePartyFooterData from '../../hooks/usePartyFooterData';
import { createVoucherChainForDebit, createVoucherChainForCredit, voucherViewChain } from '../../constants/focusChain/voucherFocusChain';
import { TabManager } from '../../components/class/tabManager';

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
  const { sendAPIRequest } = useApi();
  const [voucherType, setVoucherType] = useState<Option | null>(data?.rowData?.voucherType || null);
  const [selectedDate, setSelectedDate] = useState<string | null>(data?.rowData?.voucherDate || null);
  const [gridData, setGridData] = useState<RowData[] | any>(data?.gridData || []);
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
  const settingPopupState = (isModal: boolean, message: string) => {
    setPopupState({
      ...popupState,
      [isModal ? 'isModalOpen' : 'isAlertOpen']: true,
      message: message,
    });
  };
  // const [focused, setFocused] = useState('');
  const decimalPlaces = useSelector((state: any) => state.global.controlRoomSettings.decimalValueCount || 2);
  const partyFooterData = usePartyFooterData();
  const tabManager = TabManager.getInstance();

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
    { name: 'Party', key: 'partyName', width: '17vw', type: 'input', props: { inputType: 'text', label: true, required: true, handleFocus: (rowIndex: number, colIndex: number) => {}, handleClick : ({rowIndex , colIndex}:any)=>{ handleFocus(rowIndex, colIndex)}}},
    { name: 'Narration', key: 'narration', width: '31vw', type: 'input', props: { inputType: 'text', handleChange: (args: handleChangeInHeaders) => { handleInputChange(args); } } },
    { name: 'Amount (₹)', key: 'amount', width: '15vw', type: 'input', props: { inputType: 'number', required: true, handleChange: (args: handleChangeInHeaders) => { handleInputChange(args); }, } },
    {
      name: 'Dr/Cr', key: 'debitOrCredit', width: '15vw', type: 'input', props: {
        inputType: 'text',required: true, handleChange: (args: handleChangeInHeaders) => {  
      if(args.header === 'debitOrCredit' && args.value){
        args.value = args.value[0].toUpperCase() + args.value.slice(1);
      }
      handleInputChange(args); 
    }, readOnly: false} },
  ];
  const checkNoCheckDateHeaders = [
    { name: 'Cheque No.', key: 'chequeNumber', width: '12vw', type: 'input', props: { inputType: 'number', handleChange: (args: handleChangeInHeaders) => { handleInputChange(args); },  parseFloat: true } },
    { name: 'Cheque Date', key: 'chequeDate', width: '15vw', type: 'input', props: { inputType: 'date', handleChange: (args: handleChangeInHeaders) => { handleInputChange(args); } } },
  ];
  const discountHeader = [
    { name: 'Discount (₹)', key: 'discount', width: '14vw', type: 'input', props: { inputType: 'number', handleChange: (args: handleChangeInHeaders) => { handleInputChange(args); },  parseFloat: true } },
  ];
  const commonHeaders2 = [
    { name: 'Discount Narration', key: 'discNarration', width: '27vw', type: 'input', props: { inputType: 'text', handleChange: (args: handleChangeInHeaders) => { handleInputChange(args); } } }
  ];
  const gstNatureConditionHeaders = [
    { name: 'Instrument Type', key: 'instrumentType', width: '18vw', type: 'input', props: { inputType: 'text', handleChange: (args: handleChangeInHeaders) => { handleInputChange(args); } } },
    { name: 'Invoice No.', key: 'invoiceNumber', width: '10vw', type: 'input', props: { inputType: 'number', handleChange: (args: handleChangeInHeaders) => { handleInputChange(args); },  parseFloat: true } },
    { name: 'Invoice Date', key: 'invoiceDate', width: '15vw', type: 'input', props: { inputType: 'date', handleChange: (args: handleChangeInHeaders) => { handleInputChange(args); } } },
    { name: 'HSN Code', key: 'hsnCode', width: '12vw', type: 'input', props: { inputType: 'number', handleChange: (args: handleChangeInHeaders) => { handleInputChange(args); },  parseFloat: true } },
    { name: 'GST Rate', key: 'gstRate', width: '15vw', type: 'input', props: { inputType: 'number', handleChange: (args: handleChangeInHeaders) => { handleInputChange(args); },  parseFloat: true } },
    { name: 'SGST', key: 'sgstValue', width: '8vw', type: 'input', props: { inputType: 'number', readOnly : true, handleChange: (args: handleChangeInHeaders) => { handleInputChange(args); },  parseFloat: true } },
    { name: 'CGST', key: 'cgstValue', width: '8vw', type: 'input', props: { inputType: 'number', readOnly : true, handleChange: (args: handleChangeInHeaders) => { handleInputChange(args); },  parseFloat: true } },
    { name: 'IGST', key: 'igstValue', width: '8vw', type: 'input', props: { inputType: 'number', readOnly : true, handleChange: (args: handleChangeInHeaders) => { handleInputChange(args); },  parseFloat: true } },
  ];

  const partyHeaders = [
    { label: 'Name', key: 'partyName' },
    { label: 'Station', key: 'station_name' },
    { label: 'Closing Balance', key: 'closingBalance' },
    { label: 'Closing Balance Type', key: 'closingBalanceType' },
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
    // setFocused('voucherType');
  },[])
  
  useEffect(() => {
    if( !gridData.length ){
      return initializeGridData();
    }
    if (!data.rowData?.voucherNumber){
      setDebitOrCredit();
    }
    setChequeDate();
    if (voucherType?.value === 'JOUR' && !data){
      const newGridData = [...gridData];
      newGridData[gridData.length-1].columns.debitOrCredit = '';
      setGridData(newGridData);
    }

    totalDebitAndCredit();

  //   if (gridData.length > 0 && !!gridData[0]?.columns?.partyName?.value) {
  //     const lastRowIndex = gridData.length - 1;
  //     const lastColumn = headers.current.length - 1
  //     const lastCellId = `cell-${lastRowIndex}-${lastColumn}`;
  //     const lastCellElement = document.getElementById(lastCellId);
  //     if (lastCellElement) {
  //         console.log("🚀 ~ useEffect ~ lastCellElement:", lastCellElement)
  //         lastCellElement.focus();
  //     }
  // }
  

    
  const ele = document.getElementById(`tableContainer`)
  ele?.scrollTo({top: 100, left: 0,behavior: 'smooth'});
    
  }, [gridData.length, voucherType?.value]);

useEffect(() => {
  if(voucherType?.value === 'CR' || voucherType?.value === 'BD'){
    tabManager.updateFocusChainAndSetFocus(createVoucherChainForCredit, 'custom_select_voucherType')
  }
  else {
    tabManager.updateFocusChainAndSetFocus(createVoucherChainForDebit, 'custom_select_voucherType')
  }
}, [voucherType?.value])

  useEffect(()=>{
    if ((!data.rowData?.voucherNumber) && (voucherType?.value === 'BD' || voucherType?.value === 'BW') ) {
      const datas = allParties.filter(p => p.accountCode === -106);
      setPopupList({
        isOpen: true,
        data: {
          heading: 'Select Party',
          headers: [...partyHeaders],
          footers: partyFooterData,
          autoClose: true,
          apiRoute: '/ledger',
          extraQueryParams: { accountCode : -106, locked: "!Y" },
          searchFrom: 'partyName',
          handleSelect: (rowData: any) => {
            bankName.current = {
              partyName: rowData.partyName,
              partyId: rowData.party_id
            };
            tabManager.setTabLastFocusedElementId('dateInput')
            // document.getElementById("dateInput")?.focus();
          }
        }
      });
    } else {
      bankName.current = {
        partyName: '',
        partyId: 0
      };
    }
    if(!data.rowData?.voucherNumber) setGstNature( null);
  },[voucherType?.value])


  useEffect(() => {
    updateGridData();
  }, [currentSavedData])

  useEffect(() => {
    initializeGridDataFromData();
  },[headers])

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
    const newObj = Array.from({ length: 1 }, (_, rowIndex) => ({
      id: rowIndex + 1,
      columns: headers.current.reduce(
        (acc, header) => ({ ...acc, [header.key]: header.key === 'debitOrCredit' ? drCrValue : ''}),
        {}
      ),
    }))
    setGridData(newObj);
  };

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
      if (!error?.isErrorHandled) {
        console.log('Party not fetched in Voucher');
        setPopupState({
          ...popupState,
          isAlertOpen: true,
          message: `${error.message}`,
        });
      }
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
        case 'JOUR':
          return { value: 'Dr'};
        default:
          return { value: gridData[Number(focusedRowIndex)]?.columns.debitOrCredit, readOnly: false };
      }
    }
    return { value: '', readOnly: false };
  };

  const handleVoucherTypeChange = (option: Option | null) => {
    setVoucherType(option);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    if(option?.value != voucherType?.value){
      initializeGridData();
    }
    setTotalValue({ totalDebit: 0,totalCredit: 0});
  };

  const handleGstNatureChange = (option: Option | null) => {
    setGstNature(option);
  }

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  
  // Create a mapping of the keys to their expected types
  const fieldTypeMapping: Record<string, string> = {};
  headers.current.forEach((header: any) => {
    fieldTypeMapping[header.key] = header.props.inputType;
  });


  const convertRowDataTypes = (row: any) => {
    const convertedRow = { ...row };
  
    Object.keys(convertedRow).forEach((key) => {
      if (fieldTypeMapping[key]) {
        const type = fieldTypeMapping[key];
  
        switch (type) {
          case 'number':
            convertedRow[key] = Number(convertedRow[key]) || 0;
            break;
          case 'date':
            convertedRow[key] = convertedRow[key] ? new Date(convertedRow[key]).toISOString() : null;
            break;
          case 'text':
          default:
            convertedRow[key] = String(convertedRow[key] || '');
            break;
        }
      }
    });
  
    return convertedRow;
  };

  const handleSubmit = async () => {
    const dataToSend: any = {
      rows: gridData.filter((row: any) => {
        const { value } = row.columns.partyName || {};
        const amount = Number(row.columns.amount);
        return value && !isNaN(amount) && amount !== 0;
      })
      .map((row : any) => {
        const { label, value } = row.columns.partyName || {};

        const convertedColumns = convertRowDataTypes(row.columns);

        return {
          // ...row.columns,
          ...convertedColumns,
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
      for (const row of dataToSend.rows) {
        const { partyId, amount, voucherType, debitOrCredit } = row;
      
        if ( !partyId && amount > 1) {
          settingPopupState(false, "Error: Party ID is empty.");
          return;
        }
      
        if ( !amount && !!partyId) {
          settingPopupState(false, "Error: Amount is empty.");
          return;
        }
        
        if( voucherType === "JOUR" && !debitOrCredit){
          settingPopupState(false, "Error: Debit or Credit must be filled");
          return;
        }
      }

      
      if(voucherType?.value === 'JOUR' && totalValue.totalCredit !== totalValue.totalDebit){
        settingPopupState(false, "Error: Total Debit and Total Credit are not equal");
        return
      }
      const voucherTypeValue: any = voucherType?.value ?? '';
      
      if (['CP', 'JOUR', 'BW'].includes(voucherTypeValue) && !gstNature?.value) {
        settingPopupState(false, 'Error: GstNature cannot be null for the selected voucher type.');
        return;
      }
      
      if (data.rowData?.voucherNumber) {
        dataToSend.voucherNumber = data.rowData.voucherNumber;
        try {
          const response: any = await sendAPIRequest(`/voucher/${data.rowData.voucherNumber}`, {
            method: 'PUT',
            body: dataToSend,
          });

          const firstRow: any = dataToSend.rows[0];
          if (firstRow.voucherDate !== null) await getVoucherData(firstRow.voucherDate, firstRow.voucherType);

          setVoucherNumber(response?.voucherNumber);
          settingPopupState(false, `Voucher ${data.rowData.voucherNumber ? 'updated' : 'created'} successfully`);
        } catch (error: any) {
          if (!error?.isErrorHandled) {
            console.log("Voucher can't be updated");
          }
        }
      } else {
        try {
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
        } catch (error: any) {
          if (!error?.isErrorHandled) {
            console.log('Voucher not created');
          }
        }
      }

    } catch (error:any) {
      console.error('Error saving voucher:', error);
      if (error.name === 'ValidationError') {
        const errorMessages = error.inner.map((err: any) => `${err.path} is empty`);
        console.log('Error:', errorMessages);
        settingPopupState(false, `Error: ${errorMessages.join(', ')}`);
      } else {
        console.error('Error saving voucher:', error);
        settingPopupState(false, `${error.message}`);
      }
    }
  };

  const setDebitOrCredit = async () => {
    const { value } = getDrCrColumnProps();
  
    setGridData((prevGridData: any[]) => {
      const updatedData = prevGridData.map((row: { columns: any; }) => ({
        ...row,
        columns: {
          ...row.columns,
          // debitOrCredit: voucherType?.value === 'JOUR' ? 'Dr' : value,
        },
      }));
  
      return updatedData;
    });
  };
  

  const setChequeDate = async () => {
    setGridData((prevGridData: any[]) => {
      const newGridData = prevGridData.map((row: { columns: any; }) => ({
        ...row,
        columns: {
          ...row.columns,
          chequeDate: selectedDate,
          invoiceDate: selectedDate,
        },
      }));
  
      return newGridData;
    });
  };
  

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
    if (!popupState.message.includes("Error" )  && !popupState.message.includes("500")) {
      setView({ type: '', data: {} });
    }
  };

  const handleConfirmPopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
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
      if (value.length === 1) {
        if (value.toLowerCase() === 'd') {
          value = 'Dr';
        } else if (value.toLowerCase() === 'c') {
          value = 'Cr';
        }
      }
    }
    if (['sgstValue', 'cgstValue', 'igstValue'].includes(header)) {
      return;
    }

    if (header === 'partyName' && !value) {
      alert("Party Name cannot be empty");
      return;
    }
    
    if (['amount', 'discount', 'gstRate' ].includes(header)) {
      const isValid = validateValue(value, decimalPlaces, settingPopupState);
      if (!isValid) {
        return;
      }
      
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
        const halfGstRate = gstRate / 2;
        newGridData[rowIndex].columns.sgstValue = ((halfGstRate / 100) * amount).toFixed(2);
        newGridData[rowIndex].columns.cgstValue = ((halfGstRate / 100) * amount).toFixed(2);
      }
    }

    if (header === 'discount') {
      const amount = parseFloat(newGridData[rowIndex].columns.amount);
      const discount = parseFloat(value);
      if (discount > amount) {
        settingPopupState(false, "Error: Discount cannot be greater than the amount");
        return;
      }
    }

    newGridData[rowIndex].columns[header] = value;

    let totalDebit = 0;
    let totalCredit = 0;
    newGridData.forEach((data) => {
      const amount = Number(data.columns.amount) || 0;
      const sgstValue = Number(data.columns.sgstValue) || 0;
      const cgstValue = Number(data.columns.cgstValue) || 0;
      const igstValue = Number(data.columns.igstValue) || 0;
      const debitOrCredit = data.columns.debitOrCredit;

      if (voucherType?.value === 'JOUR' && gstNature?.value == 3) {
        // Only add the amount if the condition is met
        if (debitOrCredit?.toLowerCase() === 'dr') {
          totalDebit += amount;
        } else if (debitOrCredit?.toLowerCase() === 'cr') {
          totalCredit += amount;
        }
      } else {
        // Original calculation including GST values
        if (debitOrCredit?.toLowerCase() === 'dr') {
          totalDebit += amount + sgstValue + cgstValue + igstValue;
        } else if (debitOrCredit?.toLowerCase() === 'cr') {
          totalCredit += amount + sgstValue + cgstValue + igstValue;
        }
      }
    });
    setTotalValue({
      ...totalValue,
      totalDebit: totalDebit,
      totalCredit: totalCredit,
    });

    setGridData(newGridData);
  };

  
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
    headers.current = [...commonHeaders1, ...gstNatureConditionHeaders];
  }
  if (voucherType?.value === 'JOUR' && (gstNature?.value == 1 || !gstNature?.value)) {
    headers.current = [...commonHeaders1];
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


  const updateGridData = () => {
    if (focusedRowIndex === null) return;
    const newGridData = [...gridData];
    if (Object.keys(currentSavedData).length) {
      newGridData[focusedRowIndex].columns['partyName'] = {
        label: currentSavedData.party.partyName,
        value: currentSavedData.party.party_id,
        stateInout: currentSavedData.party.stateInout
      };

      const { value } = getDrCrColumnProps();
      newGridData[focusedRowIndex].columns['debitOrCredit'] = value;

      handleInputChange({ rowIndex:focusedRowIndex, header:'partyName',value: newGridData[focusedRowIndex].columns.partyName })
    }

    // if (focusColIndex.current === 0) {
    //   handleFocus(focusedRowIndex, 1)
    // }

    // if (focusColIndex.current === 1) {
    //   document.getElementById(`cell-${focusedRowIndex}-1`)?.focus();
    // }
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
          footers: partyFooterData,
          autoClose: true,
          apiRoute: '/ledger',
          extraQueryParams: { locked: "!Y" },
          searchFrom: 'partyName',
          handleSelect: (rowData: any) => {
            setCurrentSavedData({ ...currentSavedData, party: rowData })
            setTimeout(() => {
              tabManager.setTabLastFocusedElementId(`cell-${focusedRowIndex}-1`)
            }, 0);
          }
        }
      });
      const ele = document.getElementById(`tableContainer`)
      ele?.scrollTo({top: 100,left: 0,behavior: 'smooth'});
    }
  };  


  const totalDebitAndCredit = async() => {
    const newGridData = [...gridData]
    let totalDebit = 0;
    let totalCredit = 0;
      newGridData.forEach((data: any) => {
      const amount = Number(data.columns.amount) || 0;
      const sgstValue = Number(data.columns.sgstValue) || 0;
      const cgstValue = Number(data.columns.cgstValue) || 0;
      const igstValue = Number(data.columns.igstValue) || 0;
      const debitOrCredit = data.columns.debitOrCredit;
      
      if (voucherType?.value === 'JOUR' && gstNature?.value == 3) {
        // Only add the amount if the condition is met
        if (debitOrCredit?.toLowerCase() === 'dr') {
          totalDebit += amount;
        } else if (debitOrCredit?.toLowerCase() === 'cr') {
          totalCredit += amount;
        }
      } else {
        // Original calculation including GST values
        if (debitOrCredit?.toLowerCase() === 'dr') {
          totalDebit += amount + sgstValue + cgstValue + igstValue;
        } else if (debitOrCredit?.toLowerCase() === 'cr') {
          totalCredit += amount + sgstValue + cgstValue + igstValue;
        }
      }
    });

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
            tabManager.updateFocusChainAndSetFocus(voucherViewChain , 'add')
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
            // isFocused={focused === 'voucherType'}
            isSearchable={true}
            placeholder="Select Voucher Type"
            disableArrow={false}
            hidePlaceholder={false}
            containerClass="gap-[3.28rem] !w-60% !justify-between"
            className="!rounded-none !h-8 text-wrap: nowrap"
            isDisabled={isInputsDisabled}
            onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
              const dropdown = document.querySelector(
                '.custom-select__menu'
              );
              if (e.key === 'Enter') {
                !dropdown && e.preventDefault();
                // const nextFieldId='dateInput';
                // document.getElementById(nextFieldId)?.focus();                    
                // setFocused(nextFieldId);
                e.stopPropagation();
                tabManager.focusManager();
                }
            }}
          />

          {voucherType && (
            <div className="flex gap-2 items-center w-[-webkit-fill-available]">
              <label className="block align-self-center text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                id = "dateInput"
                value={selectedDate || ''}
                onChange={handleDateChange}
                className="border border-gray-300 rounded p-1"
                disabled={isInputsDisabled}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const nextFieldId = (voucherType?.value === 'CR' || voucherType?.value === 'BD') ? 'cell-0-0': 'gstNature' ;
                    // document.getElementById(nextFieldId)?.focus();                    
                    // setFocused(nextFieldId);
                    tabManager.focusManager();
                  }
                }}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col w-[30%] gap-2">
          {(voucherType?.value !== 'CR' && voucherType?.value !== 'BD' && voucherType?.value !== undefined) && (
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-700 whitespace-nowrap">
                <span>GST Nature</span>
                <span className="text-red-600 font-medium text-sm"> *</span>
                <span>: </span>
              </p>
              <CustomSelect
                isPopupOpen={false}
                label={``}
                value={gstNature}
                id="gstNature"
                onChange={handleGstNatureChange}
                options={gstNatureTypes}
                isSearchable={true}
                // isFocused={focused === 'gstNature'}
                placeholder="Select GST Nature"
                disableArrow={false}
                hidePlaceholder={false}
                containerClass="!w-[80%] !justify-between"
                className="!rounded-none !h-8 whitespace-nowrap"
                isDisabled={isInputsDisabled}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  const dropdown = document.querySelector(
                    '.custom-select__menu'
                  );
                  if (e.key === 'Enter') {
                    !dropdown && e.preventDefault();
                    // if(gstNature?.value) document.getElementById('cell-0-0')?.focus();
                    // else setFocused('gstNature')
                    e.stopPropagation();
                    tabManager.focusManager();
                  }
                }}
              />
            </div>
          )}

          {voucherNumber && (
            <div className="flex flex-colabsolute top-0 right-0 justify-end">
              <span className="text-sm font-medium text-gray-700">Voucher Number: {voucherNumber}</span>
            </div>
          )}
        </div>


      </div>

      {(voucherType?.value === 'BD' || voucherType?.value === 'BW') && (
        <span className="text-sm font-medium mt-1 text-gray-700">Bank: {bankName?.current?.partyName || data?.rowData?.bankPartyName}</span>
      )}
      
      
        <div className="mt-4">
          {<ChallanTable
            headers={headers.current}
            gridData={gridData}
            setGridData={setGridData}
            skipIndexes={voucherType?.value!=='JOUR' ? [3]:[]}
            newRowTrigger={headers.current.length-1}
            stikyColumn={[0]}
            required={[1, 3, 4]} 
            widthRequired={voucherType?.value === 'JOUR' && gstNature?.value === '1' ? '76vw' : '100vw'}
          />}
        </div>
      

      {voucherType && selectedDate && (
        <div className="mt-4 text-center">
          <Button type="highlight"
                  id="save"
                  handleOnClick={handleSubmit}
          >
            {data.rowData?.voucherNumber ? 'Update' : 'Submit'}
          </Button>
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
      />
      )}

      {(popupState.isModalOpen || popupState.isAlertOpen) && (
        <Confirm_Alert_Popup
          id='createVouchAlert'
          onClose={handleClosePopup}
          onConfirm={popupState.isAlertOpen
            ? handleAlertCloseModal
            : handleConfirmPopup}
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
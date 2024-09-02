import React, { useEffect, useState, useRef } from 'react';
import CustomSelect from '../../components/custom_select/CustomSelect';
import { Option } from '../../interface/global';
import Button from '../../components/common/button/Button';
import { SelectList } from '../../components/common/selectList';
import { ChallanTable } from '../../components/common/challanTable';
import { useSelector } from 'react-redux';
import { sendAPIRequest } from '../../helper/api';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { useParams } from 'react-router-dom';

interface RowData {
  columns: {
    [key: string]: string | number | any;
  };
}


const CreateVouchers = ({ setView, data }: any) => {
  const { organizationId } = useParams();   // It has to be removed
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
  const { party: partiesData } = useSelector((state: any) => state.global);
  const [partyValue, setPartyValue] = useState<any[]>([]);
  const [currentSavedData, setCurrentSavedData] = useState<{ party: any; }>({ party: {} });
  const [totalValue, setTotalValue] = useState({ totalAmount: 0, totalDiscount: 0 });
  const [allParties, setAllParties] = useState<any[]>([]);
  const [hasAccountGroup, setHasAccountGroup] = useState(false);

  const bankName = useRef(null);

  const voucherTypes: Option[] | any = [
    { value: 'CR', label: 'Cash Receipt', isDisabled: false },
    { value: 'CP', label: 'Cash Payment', isDisabled: false },
    { value: 'JOUR', label: 'Journal', isDisabled: !hasAccountGroup },
    { value: 'BD', label: 'Bank Deposit', isDisabled: !hasAccountGroup },
    { value: 'BW', label: 'Bank Withdraw', isDisabled: !hasAccountGroup }
  ];

  const headers = [
    { name: 'Party', key: 'partyName', width: '16%', type: 'input', props: { inputType: 'text', label: true, handleFocus: (rowIndex: number, colIndex: number) => handleFocus(rowIndex, colIndex) } },
    { name: 'Narration', key: 'narration', width: '17%', type: 'input', props: { inputType: 'text', handleChange: (args: any) => { handleInputChange(args); } } },
    { name: 'Amount (₹)', key: 'amount', width: '10%', type: 'input', props: { inputType: 'number', handleChange: (args: any) => { handleInputChange(args); } } },
    { name: 'Dr/Cr', key: 'debitOrCredit', width: '5%', type: 'input', props: { inputType: 'text', handleChange: (args: any) => { handleInputChange(args); }, readOnly: false } },
    { name: 'Discount (₹)', key: 'discount', width: '8%', type: 'input', props: { inputType: 'number', handleChange: (args: any) => { handleInputChange(args); } } },
    { name: 'Party Balance', key: 'partyBalance', width: '8%', type: 'input', props: { inputType: 'number', handleChange: (args: any) => { handleInputChange(args); } } },
    { name: 'Discount Narration', key: 'disNarration', width: '17%', type: 'input', props: { inputType: 'text', handleChange: (args: any) => { handleInputChange(args); } } },
    { name: 'Check No.', key: 'checkNumber', width: '5%', type: 'input', props: { inputType: 'number', handleChange: (args: any) => { handleInputChange(args); } } },
    { name: 'Check Date', key: 'checkDate', width: '10%', type: 'input', props: { inputType: 'number', handleChange: (args: any) => { handleInputChange(args); } } },
    { name: 'Instrument Type', key: 'instrumentType', width: '12%', type: 'input', props: { inputType: 'text', handleChange: (args: any) => { handleInputChange(args); } } },
    { name: 'Invocie No.', key: 'invoiceNumber', width: '10%', type: 'input', props: { inputType: 'number', handleChange: (args: any) => { handleInputChange(args); } } },
    { name: 'Invocie Date', key: 'invoiceDate', width: '10%', type: 'input', props: { inputType: 'number', handleChange: (args: any) => { handleInputChange(args); } } },
    { name: 'HSN Code', key: 'hsnCode', width: '10%', type: 'input', props: { inputType: 'number', handleChange: (args: any) => { handleInputChange(args); } } },
    { name: 'GST Rate', key: 'gstRate', width: '5%', type: 'input', props: { inputType: 'number', handleChange: (args: any) => { handleInputChange(args); } } },
    { name: 'SGST', key: 'sgstValue', width: '5%', type: 'input', props: { inputType: 'number', handleChange: (args: any) => { handleInputChange(args); } } },
    { name: 'CGST', key: 'cgstValue', width: '5%', type: 'input', props: { inputType: 'number', handleChange: (args: any) => { handleInputChange(args); } } },
    { name: 'IGST', key: 'igstValue', width: '5F%', type: 'input', props: { inputType: 'number', handleChange: (args: any) => { handleInputChange(args); } } },
  ];

  const partyHeaders = [
    { label: 'Name', key: 'partyName' },
    { label: 'Station', key: 'station_name' },
    { label: 'Closing Balance', key: 'currentOpeningBal' },
    { label: 'Closing Balance Type', key: 'currentOpeningBalType' },
  ];

  useEffect(() => {
    setVoucherType(data?.rowData?.voucherType ? { value: data.rowData?.voucherType, label: getVoucherTypeLabel(data?.rowData?.voucherType) } : null);
    setSelectedDate(data?.rowData?.voucherDate ? formatVoucherDate(data.rowData?.voucherDate) : null);
    initializeGridDataFromData();
  }, [data]);

  useEffect(()=>{
    getPartyData();
  },[])

  const getVoucherTypeLabel = (value: string) => {
    const voucherType = voucherTypes.find((type: any) => type.value === value);
    return voucherType ? voucherType.label : '';
  };

  const formatVoucherDate = (date: string) => {
    const parsedDate = new Date(date);
    return parsedDate.toISOString().split('T')[0];
  };

  const initializeGridDataFromData = () => {

    if (data?.voucherGridData) {
      const initialRows = data.voucherGridData.map((row: any, rowIndex: number) => {

        const updatedColumns = headers.reduce((acc, header) => {
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


          return {
            ...acc,
            [header.key]: value,
            rowId: row.id,
          };
        }, {});
        return {
          id: rowIndex + 1,
          columns: updatedColumns
        }

      });

      setGridData(initialRows);
    }
  };



  const initializeGridData = () => {
    const { value: drCrValue } = getDrCrColumnProps();
    setGridData(Array.from({ length: 1 }, (_, rowIndex) => ({
      id: rowIndex + 1,
      columns: headers.reduce(
        (acc, header) => ({ ...acc, [header.key]: header.key === 'debitOrCredit' ? drCrValue : '' }),
        {}
      ),
    })));
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
      throw error;
    }
  }

  const getPartyData = async()=>{
    try {
      const response: any = await sendAPIRequest(`/${organizationId}/ledger/`,{
        method: 'GET'
      })
      setAllParties(response)
      const hasAccountGroup = response.some((party: any) => party.accountCode === -106);
      setHasAccountGroup(hasAccountGroup);

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

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  // Confirm button function 
  const handleSave = () => {
    const dataToSend = gridData.map((row) => ({
      ...row.columns,
    }));

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
          ...(voucherNumber && { voucherNumber: voucherNumber, }),
          partyId: value
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

  const fetchParty = async () => {
    setPartyValue(partiesData);
  };

  const setDebitOrCredit = async () => {
    const { value } = getDrCrColumnProps();
    const updatedData = [...gridData]
    const newGridData = updatedData.map(row => ({
      ...row,
      columns: {
        ...row.columns,
        debitOrCredit: value,
      },
    }));
    setGridData(newGridData);
  };

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
    setView({ type: '', data: {} });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  useEffect(() => {
    fetchParty();
  }, []);


  useEffect(() => {
    if (voucherType?.value !== 'JOUR' && !data.rowData?.voucherNumber) setDebitOrCredit();
    if (voucherType?.value === 'BD' || voucherType?.value === 'BW'){
      const data = partyValue.filter(p=> p.accountCode === -106);
      setPopupList({
        isOpen: true,
        data: {
          heading: 'Select Party',
          headers: [...partyHeaders],
          tableData: data,
          handleSelect: (rowData: any) => {
            bankName.current = rowData.partyName
          }
        }
      });
    }
  }, [gridData.length, voucherType?.value]);


  useEffect(() => {
    updateGridData();
  }, [currentSavedData.party])

  const updateGridData = () => {
    if (focusedRowIndex === null) return;
    const newGridData = [...gridData];
    if (Object.keys(currentSavedData.party).length) {
      newGridData[focusedRowIndex].columns['partyName'] = {
        label: currentSavedData.party.partyName,
        value: currentSavedData.party.party_id,
      };

      const { value } = getDrCrColumnProps();
      newGridData[focusedRowIndex].columns['debitOrCredit'] = value;
      setGridData(newGridData);
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
    if (colIndex === 0) {
      setPopupList({
        isOpen: true,
        data: {
          heading: 'Select Party',
          headers: [...partyHeaders],
          tableData: partyValue,
          handleSelect: (rowData: any) => {
            setCurrentSavedData({ ...currentSavedData, party: rowData })
          }
        }
      });
    }
  };

  const handleInputChange = async ({ rowIndex, header, value }: any) => {
    const newGridData = [...gridData];
    const { readOnly: drCrReadOnly } = getDrCrColumnProps();

    if (header === 'debitOrCredit' && drCrReadOnly) {
      return;
    }

    newGridData[rowIndex].columns[header] = value;

    const totalAmount = newGridData.reduce((acc, data) => acc + (Number(data.columns.amount) || 0), 0);
    const totalDiscount = newGridData.reduce((acc, data) => acc + (Number(data.columns.discount) || 0), 0);

    setGridData(newGridData);

    setTotalValue({
      ...totalValue,
      totalAmount: totalAmount,
      totalDiscount: totalAmount,
    });
  };

  const partyFooterData: any[] = [
    {
      label: 'Address',
      data: [
        {
          label: 'Party Name',
          key: 'partyName'
        },
        {
          label: 'Address 1',
          key: 'address1'
        },
        {
          label: 'Address 2',
          key: 'address2'
        },
        {
          label: 'Address 3',
          key: 'address3'
        },
      ]
    },
    {
      label: 'License Info',
      data: [
        {
          label: 'Party Name',
          key: 'partyName'
        },
      ]
    },
    {
      label: 'OtherInfo',
      data: [
        {
          label: 'Party Name',
          key: 'partyName'
        },
        {
          label: 'Country',
          key: 'country'
        },
        {
          label: 'PinCode',
          key: 'pinCode'
        },
        {
          label: 'Station Name',
          key: 'station_name'
        },
      ]
    },
    {
      label: 'Current Status',
      data: [
        {
          label: 'Opening',
          key: 'openingBalType'
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
            <span className="text-sm font-medium text-gray-700">Balance: </span>
          </div>
        )}
      </div>

      {(voucherType?.value === 'BD' || voucherType?.value === 'BW' && bankName.current) && (
        <span className="text-sm font-medium mt-1 text-gray-700">Bank: {bankName.current}</span>
      )}
      
      
        <div className="mt-4">
          <ChallanTable
            headers={headers}
            gridData={gridData}
            setGridData={setGridData}
            handleSave={handleSave}
            newRowTrigger={{ columnIndex: 6, rowIndex: gridData.length - 1 }}
          />
        </div>
      

      {voucherType && selectedDate && (
        <div className="mt-4 text-center">
          <Button type="highlight" id="save_voucher_button" handleOnClick={handleSubmit}>
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
            Total Debit: ₹{totalValue.totalDiscount.toFixed(2)}
          </div>
          <div className="text-sm font-medium text-gray-700">
            Total Credit: ₹{totalValue.totalAmount.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );


};

export default CreateVouchers;

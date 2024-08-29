import React, { useEffect, useState, useRef } from 'react';
import CustomSelect from '../../components/custom_select/CustomSelect';
import { Option } from '../../interface/global';
import Button from '../../components/common/button/Button';
import { SelectList } from '../../components/common/selectList';
import { ChallanTable } from '../../components/common/challanTable';
import { useSelector } from 'react-redux';
import { sendAPIRequest } from '../../helper/api';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';

interface RowData {
  // id: number;
  columns: {
    [key: string]: string | number | any;
  };
}


const CreateVouchers = ({ setView, data }: any) => {
  const [focused, setFocused] = useState('');
  const [voucherType, setVoucherType] = useState<Option | null>(data?.rowData?.voucherType || null);
  const [selectedDate, setSelectedDate] = useState<string | null>(data?.rowData?.voucherDate || null);
  const [gridData, setGridData] = useState<RowData[]>(data?.gridData || []);
  const [voucherNumber, setVoucherNumber] = useState<number | null>(data?.rowData?.voucherNumber || null);
  const [popupState, setPopupState] = useState<{ isAlertOpen: boolean; isModalOpen: boolean; message: string }>({ isAlertOpen: false,isModalOpen: false, message: '' });
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);
  const focusColIndex = useRef(0);
  const [popupList, setPopupList] = useState<{ isOpen: boolean, data: any }>({
    isOpen: false,
    data: {}
  });
  const { party: partiesData } = useSelector((state: any) => state.global);
  const [partyValue, setPartyValue] = useState<any[]>([]);
  const [currentSavedData, setCurrentSavedData] = useState<{[key: string] : string}>({});
  // const [voucherNumber, setVoucherNumber] = useState<number | null>(null);

  const voucherTypes: Option[] = [
    { value: 'CR', label: 'Cash Receipt' },
    { value: 'CP', label: 'Cash Payment' },
    { value: 'JOUR', label: 'Journal' },
    { value: 'BD', label: 'Bank Deopsit' },
    { value: 'BW', label: 'Bank Withdraw' },
  ];

  const headers = [
    { name: 'Party', key: 'partyName', width: '16%', type: 'input', props: { inputType: 'text', label: true, handleFocus: (rowIndex: number, colIndex: number) => handleFocus(rowIndex, colIndex) } },
    { name: 'Narration', key: 'narration', width: '17%', type: 'input', props: { inputType: 'text', handleChange: (args: any) => { handleInputChange(args); } } },
    { name: 'Amount (₹)', key: 'amount', width: '17%', type: 'input', props: { inputType: 'number', handleChange: (args: any) => { handleInputChange(args); } } },
    { name: 'Dr/Cr', key: 'debitOrCredit', width: '16%', type: 'input', props: { inputType: 'text', handleChange: (args: any) => { handleInputChange(args); }, readOnly: false } },
    { name: 'Discount', key: 'discount', width: '17%', type: 'input', props: { inputType: 'number', handleChange: (args: any) => { handleInputChange(args); } } },
    { name: 'Discount Narration', key: 'disNarration', width: '17%', type: 'input', props: { inputType: 'text', handleChange: (args: any) => { handleInputChange(args); } } },
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

  const getVoucherTypeLabel = (value: string) => {
    const voucherType = voucherTypes.find(type => type.value === value);
    return voucherType ? voucherType.label : '';
  };
  
  const formatVoucherDate = (date: string) => {
    const parsedDate = new Date(date);
    return parsedDate.toISOString().split('T')[0];
  };

//   const initializeGridDataFromData = () => {
//     if (data?.voucherGridData) {
      
//       const updatedGridData = data.voucherGridData.map((row: any) => {
//         const updatedColumns = headers.reduce((acc, header) => {
//           let data = row[header.key];

//           // Handle 'partyName' and 'debitOrCredit' specially
//           if (header.key === 'partyName') {
//             const matchingParty = partiesData.find((party: any) => party.party_id === row.partyId);
//             data = matchingParty?.partyName || '';
//           }

//           if (header.key === 'debitOrCredit' && data === 'Cr') {
//             data = 'Cr';
//           } else if (header.key === 'debitOrCredit' && data === 'Dr') {
//             data = 'Dr';
//           }

//           return {
//             ...acc,
//             [header.key]: data,
//           };
//         }, {});
//         return {
//           // id: row.id || Math.random(),
//           columns: updatedColumns,
//         };
//       });

//       setGridData(updatedGridData);
//     }
//   };


const initializeGridDataFromData = () => {

  if (data?.voucherGridData) {

    const initialRows = data.voucherGridData.map((row: any, rowIndex: number) => {
      // Construct each row's data based on the headers
      const updatedColumns = headers.reduce((acc, header) => {
        let value = row[header.key];

        // Special handling for 'partyName' based on partyId
        if (header.key === 'partyName') {
          const matchingParty = partiesData.find(
            (party: any) => party.party_id === row.partyId
          );
          value = matchingParty?.partyName || '';
        }

        // Special handling for 'debitOrCredit' field
        // if (header.key === 'debitOrCredit') {
        //   if (value === 'Cr') {
        //     value = 'Cr';
        //   } else if (value === 'Dr') {
        //     value = 'Dr';
        //   }
        // }

        return {
          ...acc,
          [header.key]: value,
          rowId: row.id,
        };
      }, {});

      return {
        columns: updatedColumns,
      };
    });
    // Set the grid data with the updated structure
    setGridData(initialRows);
  }
};



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

  const getVoucherData = async (voucherDate: string,  voucherType: string) => {
    const url = `/voucher/?voucherDate=${voucherDate}&voucherType=${voucherType}`;

    try {
        const response: any = await sendAPIRequest(url, {
            method: 'GET',
        });
        setVoucherNumber(response.voucherNumber);
        setGridData(response);
        return response;
    } catch (error) {
        console.error('Error fetching voucher data:', error);
        throw error;
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

  const handleSave = () => {
    const dataToSend = gridData.map((row) => ({
      ...row.columns,
    }));
   
    // setGridData(dataToSend);
    setPopupState({
      ...popupState,
      isAlertOpen: true,
      message: 'Table Data saved successfully.',
    });
  };

  const handleSubmit = async () => {
    // const dataToSend = {
    //   rows: gridData.map((row) => ({
    //     id: row.id,
    //     ...row.columns,
    //     amount: Number(row.columns.amount),
    //     discount: Number(row.columns.discount),
    //     voucherType: voucherType?.value,
    //     voucherDate: selectedDate,
    //   })),
    // };

    const dataToSend = {
      rows: gridData.map((row) => {
        const matchingParty = partiesData.find((party: any) => party.partyName === row.columns.partyName && party.stationId === row.columns.stationId);
  
        return {
          ...row.columns,
          amount: Number(row.columns.amount),
          discount: Number(row.columns.discount),
          voucherType: voucherType?.value,
          voucherDate: selectedDate,
          partyId: matchingParty ? matchingParty.party_id : null,
        };
      }),
    };

    try {
      if (currentSavedData.voucherNumber || data.voucherNumber) {
        const response: any = await sendAPIRequest(`/voucher/${currentSavedData.voucherNumber}`, {
          method: 'PUT',
          body: dataToSend,
        });

        const firstRow: any = dataToSend.rows[0];
        if (firstRow.voucherDate !== null) await getVoucherData(firstRow.voucherDate, firstRow.voucherType);

        setVoucherNumber(response.voucherNumber);
        setPopupState({
          isModalOpen: false,
          isAlertOpen: true,
          message: `Voucher ${data.id ? 'updated' : 'created'} successfully`,
        });

      } else {
        const response: any = await sendAPIRequest(`/voucher/`, {
          method: 'POST',
          body: dataToSend,
        })
        setVoucherNumber(response.voucherNumber);
        if(response.voucherNumber){
          setPopupState({
            ...popupState,
            isAlertOpen: true,
            message: 'Voucher saved successfully.',
          });
        }
      }
      
    } catch (error) {
      console.error('Error saving voucher:', error);
    }
  };

  const fetchParty = async () => {
    setPartyValue(partiesData);
  };

  // const setDebitOrCredit = async () => {
  //   const { value } = await getDrCrColumnProps();
  //   const newGridData = [...gridData];
  
  //   const lastRowIndex = newGridData.length - 1;
  
  //   if (lastRowIndex >= 0) {
  //     newGridData[lastRowIndex].columns['debitOrCredit'] = value;
  //     setGridData(newGridData);
  //   }
  // };

  const setDebitOrCredit = async () => {
    const { value } = await getDrCrColumnProps();
    const newGridData = gridData.map(row => ({
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
    setView({type : '' , data : {}});
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  useEffect(() => {
    fetchParty();
  }, []);

  useEffect(() => {
    initializeGridData();
  }, [voucherType]);

  useEffect(()=>{
    setDebitOrCredit();
  },[gridData.length]);
  

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
  }, [ partyValue]);
  

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
            setCurrentSavedData(rowData)
            handleInputChange({ rowIndex, header: 'partyName', value: rowData.partyName });
          }
        } 
      });
    }
  };

  const handleInputChange = async ({ rowIndex, header, value }: any) => {
    const newGridData = [...gridData];
    const { readOnly: drCrReadOnly } = await getDrCrColumnProps();
    if (header === 'debitOrCredit' && drCrReadOnly) {
      return;
    }
    newGridData[rowIndex].columns[header] = value;
    setGridData(newGridData);
  };
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

      <div className='flex justify-between'>
        <div className={`flex ${voucherType ? 'w-[500px]' : 'w-[200px]'} items-center gap-3`}>
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
            className="!rounded-none !h-8 text-wrap: nowrap"
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
        <div className="mt-4 text-center">
          <Button type="highlight" id="save_voucher_button" handleOnClick={handleSubmit}>
            {data.voucherNumber ? 'Update' : 'Submit'}
          </Button>
        </div>
      )}
  
      {popupList.isOpen && (
        <SelectList
          heading={popupList.data.heading}
          closeList={() => setPopupList({ isOpen: false, data: {} })}
          headers={popupList.data.headers}
          tableData={popupList.data.tableData}
          handleSelect={(rowData) => { popupList.data.handleSelect(rowData) }}
        />
      )}
      {/* {popupState.isAlertOpen && <Confirm_Alert_Popup onClose={function (): void {
        throw new Error('Function not implemented.');
      } } onConfirm={() => setPopupState({...popupState,isAlertOpen:false,message:''})} message={popupState.message}></Confirm_Alert_Popup>} */}

      {(popupState.isModalOpen || popupState.isAlertOpen) && (
        <Confirm_Alert_Popup
          onClose={handleClosePopup}
          onConfirm={handleAlertCloseModal}
          message={popupState.message}
          isAlert={popupState.isAlertOpen}
        />
      )}
    </div>
  );
  
};

export default CreateVouchers;

import { useEffect, useRef, useState } from 'react';
import Button from '../../components/common/button/Button';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { useFormik } from 'formik';
import { Container } from '../../components/common/commonFormFields';
import { sendAPIRequest } from '../../helper/api';
import { useDispatch } from 'react-redux'
import { getAndSetParty } from '../../store/action/globalAction';
import { AppDispatch } from '../../store/types/globalTypes';
import { CreateSaleBillTable } from './createSaleBillTable';
import { saleBillFormValidations } from './vaildation_schema';
import { PendingChallanPopup } from './pendingChallanPopup';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { SelectList } from '../../components/common/customSelectList/customSelectList';
import { BillBookFormData, LedgerFormData, Option, SaleBillFormInfoType, StationFormData } from '../../interface/global';
import { DrugLicenceSection } from './drugLicenceSection';
import { partyHeaders } from '../partywisePriceList/partywiseHeader';
import { partyFooterData } from '../../constants/saleBill';
import { useTabs } from '../../TabsContext';
import { Ledger } from '../ledger';
import { getTodayDate } from '../../helper/helper';

const CreateSaleBill = ({ setView, data }: any) => {
  const [options, setOptions] = useState<{ seriesOption: Option[]; stationOption: Option[]; partyOption: Option[]; }>({ seriesOption: [], stationOption: [], partyOption: [] });
  const [fetchedData, setFetchedData] = useState<{ billBookSeriesData: BillBookFormData[]; stationsData: any[]; ledgerPartyData: any[]; }>({ billBookSeriesData: [], stationsData: [], ledgerPartyData: [] });
  const [challanItemsByPartyId, setAllChallanItemsByPartyId] = useState<any[]>([]);
  const [focused, setFocused] = useState('');
  const [open, setOpen] = useState(false);
  const [dLNo, setDLNo] = useState('');
  const [dataFromTable, setDataFromTable] = useState<any[]>([]);
  const [billTableData, setBillTableData] = useState<any[]>([]);
  const [isNetRateSymbol, setIsNetRateSymbol] = useState<string>('');
  const [isDiscountWindowOpen, setIsDiscountWindowOpen] = useState<boolean>(false);
  const [isDiscount, setIsDiscount] = useState<boolean>(false);
  const [pendingChallansPopup, setPendingChallansPopup] = useState<boolean>(false);
  const isEditing = useRef<boolean>(false);
  const invoiceNo = useRef<string>('');
  const { openTab } = useTabs();

  const [popupState, setPopupState] = useState<any>({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
    shouldBack: true, 
    onClose: null
  });

  const [popupList, setPopupList] = useState<{ isOpen: boolean, data: any }>({ isOpen: false, data: {} })

  const [totalValue, setTotalValue] = useState({
    totalAmt: 0.0,
    totalQty: 0.0,
    isDefault: true
  });
  const dispatch = useDispatch<AppDispatch>();

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const settingPopupState = (isModal: boolean, message: string, id: string) => {
    setPopupState({
      ...popupState,
      [isModal ? 'isModalOpen' : 'isAlertOpen']: true,
      message: message,
      onClose : () => {
        if(!isModal){
          document.getElementById(id)?.focus();
          setFocused(id);
        }        
      },
    });
  };

  const SaleBillFormInfo: SaleBillFormInfoType = useFormik({
    initialValues: {
      billBookSeriesId: data?.billBookSeriesId || '',
      oneStation: data?.oneStation || 'One Station',
      stationId: data?.stationId || '',
      partyId: data?.partyId || '',
      balance: data?.balance || 0.0,
      terms: data?.terms || '',
      invoiceNumber: data?.invoiceNumber || '',
      drugLicenceNo1: data?.drugLicenceNo1 || '',
      date: data?.date || getTodayDate(new Date()), // dd//mm//yyyy
      gstNo: data?.gstNo || '',
      grNo: data?.grNo || '',
      despDate: data?.despDate || getTodayDate(new Date()), // dd//mm//yyyy
      packingSlipNo: data?.packingSlipNo || '',
      transport: data?.transport || '',
      narration: data?.narration || '',
      tempName: data?.tempName || '',
      eWay: data?.eWay || '',
      cases: data?.cases || null,
      oldPartyId: data?.partyId || '',
      oldTotal: data?.total || '',
    },
    validationSchema: saleBillFormValidations,
    onSubmit: async (values: any) => {
      values.stationId = values.oneStation === 'All Stations' ? null : values.stationId;
      values.balance = Number((values.balance)?.split(' ')[0]);
      values.netRateSymbol = isNetRateSymbol || 'No';
      values.billBookPrefix = (fetchedData.billBookSeriesData?.find((data: any) => data.id == values.billBookSeriesId))?.billBookPrefix;
      values.total = Number((+totalValue.totalAmt)?.toFixed(2));
      values.qtyTotal = Number((+totalValue.totalQty)?.toFixed(2));
      values.isDiscountGiven = isDiscount;

      const tableData = dataFromTable.map((data: any) => ({
        ...data,
        itemId: data.itemId.value,
        batchNo: data.batchNo.value,
        schemeType: data.schemeType.value,
      }))
      const finalData = { ...values, bills: tableData };

      if (!!data.id) {
        const discountSectionKeys = Object.keys(data).filter(key => !(key in finalData));
        discountSectionKeys.forEach(key => {
          finalData[key] = data[key];
        });
      }
      setView({ type: 'discountType', data: finalData });
    },
  });

  useEffect(() => {
    if (!popupState.isAlertOpen && popupState.onClose) {
          popupState.onClose();
          setPopupState({ ...popupState, isAlertOpen: false , onClose:null});
        }
  }, [popupState])

  useEffect(() => {
    setFocused('billBookSeriesId');
    fetchedInitialData();
  }, []);

  useEffect(() => {
    if (data) {
      isEditing.current = true;
      setBillTableData(data.bills);
    }
  }, [data]);

  useEffect(() => {
    if (fetchedData.billBookSeriesData.length > 0) setBillBookInputOptions();
  }, [fetchedData.billBookSeriesData]);

  useEffect(() => {
    if (fetchedData.stationsData.length > 0) setStationsOptions();
  }, [fetchedData.stationsData]);

  useEffect(() => {
    if (!!SaleBillFormInfo.values.billBookSeriesId) getInvoiceNumber();
  }, [SaleBillFormInfo.values.billBookSeriesId]);


  useEffect(() => {
    setPartyOptions();
  }, [fetchedData.ledgerPartyData, SaleBillFormInfo.values.oneStation, SaleBillFormInfo.values.stationId]);

  useEffect(() => {
    setInputValues();
  }, [SaleBillFormInfo.values.partyId]);

  useEffect(() => {
    if (!!dLNo) {
      SaleBillFormInfo.setFieldValue('drugLicenceNo1', dLNo);
      updateDLNo();
    }
  }, [dLNo]);

  useEffect(() => {
    if (!isDiscount && dataFromTable.length > 0 && dataFromTable[0].itemId !== '') {
      setIsDiscount(dataFromTable.some((data: any) => !!data.disPer));
    }
  }, [dataFromTable]);

  const fetchedInitialData = async() => {
    try{
      const billBookSeriesData = await sendAPIRequest<BillBookFormData[]>(`/billBook`);
      const stationData = await sendAPIRequest<any[]>(`/station`);
      const ledgerPartyData = await sendAPIRequest<any[]>(`/ledger`);

      setFetchedData({
        billBookSeriesData,
        stationsData: stationData,
        ledgerPartyData,
      });
    } catch(error: any){
      if(!error?.isErrorHandled){
        console.log("Error in fetching data for sale bill")
      }
    }    
  }

  const setBillBookInputOptions = async() => {
    const requiredBillBookSeries = fetchedData.billBookSeriesData?.filter((series: any) => series.seriesId == 2 && series.locked === false);
    setOptions((prevOption) => ({
      ...prevOption,
      seriesOption: requiredBillBookSeries?.map((series: BillBookFormData) => ({
        value: series.id,
        label: series.billName,
      })),
    }));
  }

  const setStationsOptions = async() => {
    setOptions((prevOption) => ({
      ...prevOption,
      stationOption: fetchedData.stationsData?.map((station: StationFormData) => ({
        value: station.station_id,
        label: station.station_name,
      })),
    }));
  }

  const setPartyOptions = async() => {
    const isOneStation = SaleBillFormInfo.values.oneStation === 'One Station';
    const filteredParties = isOneStation ? fetchedData.ledgerPartyData?.filter((party: any) => party.station_id === SaleBillFormInfo.values.stationId) : fetchedData.ledgerPartyData;
    setOptions((prevOptions) => ({
      ...prevOptions,
      partyOption: filteredParties.map((party: LedgerFormData) => ({
        value: party.party_id,
        label: party.partyName,
      })),
    }));
  };

  const getInvoiceNumber = async () => {
    try {
        const billBookSeriesData = await sendAPIRequest<BillBookFormData[]>(`/billBook`);
        const billBookPrefix = (billBookSeriesData?.find((data: any) => data.id == SaleBillFormInfo.values.billBookSeriesId))?.billBookPrefix;
        const invoiceNumber = await sendAPIRequest<string>(`/invoiceBill/invoiceNumber?billBookPrefix=${billBookPrefix}`);
        SaleBillFormInfo.setFieldValue('invoiceNumber', invoiceNumber);
        invoiceNo.current = invoiceNumber;
    } catch (error) {
      settingPopupState(false, 'Add a sale Bill series first', '');
      return;
    }
  }

  const setInputValues = async() => {
    if (!!SaleBillFormInfo.values.partyId) {
      setAllChallanItemsByPartyId([]);
      const ledgerPartyData = await sendAPIRequest<any[]>(`/ledger`);
      const selectedParty = (ledgerPartyData?.find((party: any) => party.party_id === SaleBillFormInfo.values.partyId));
      const drugLicenceNo = selectedParty?.drugLicenceNo1;
      SaleBillFormInfo.setFieldValue('balance', `${selectedParty?.closingBalance} ${selectedParty?.closingBalanceType}`);
      SaleBillFormInfo.setFieldValue('gstNo', selectedParty?.gstIn || '');
      SaleBillFormInfo.setFieldValue('transport', selectedParty?.transport || '');
      if (!!drugLicenceNo) {
        SaleBillFormInfo.setFieldValue('drugLicenceNo1', selectedParty?.drugLicenceNo1);
      }
      else if ((drugLicenceNo === '' || drugLicenceNo === null) && !data?.isDLSet) {
        togglePopup(true);
      }
      getChallanItemsByPartyId();
      checkCreditLimit(); 
    }
  }

  const checkCreditLimit = async () => {
    const partyId = SaleBillFormInfo.values.partyId;
    const getTotalCreditAndDebit = await sendAPIRequest<any>(`/invoiceBill/getTotalDebitCredit/${partyId}`);
    const parties = await sendAPIRequest<any[]>(`/ledger`);
    const party = parties?.find((party: any) => party.party_id === partyId);
    const {totalCredit, totalDebit} = getTotalCreditAndDebit;

    if(!!party.creditLimit && party.closingBalanceType === 'Dr' && party.closingBalance > party.crediLimit){
      settingPopupState(false,'Credit limit exceeds for this party. Please choose another party', 'billBookSeriesId');
    }
    if(totalDebit > totalCredit){
      settingPopupState(false,'Credit days limit exceeds', 'billBookSeriesId');
    }
  }

  const getChallanItemsByPartyId = async () => {
    const partyId = SaleBillFormInfo.values.partyId;
    const challanData = await sendAPIRequest<any[]>(`/invoiceBill/lineItems/${partyId}`);

    if (challanData.length > 0) {
      const finalChallanData = challanData.filter((data: any) => !data.isSaleBillCreated);
      setAllChallanItemsByPartyId(finalChallanData);
    }
  }

  const updateDLNo = async () => {
    const partyId = SaleBillFormInfo.values.partyId;
    await sendAPIRequest(`/ledger/${partyId}`, { method: 'PUT', body: { ['drugLicenceNo1']: dLNo } });
    dispatch(getAndSetParty());
  }

  const togglePopup = (isOpen: boolean) => {
    setOpen(isOpen);
  }

  const handleFieldChange = (option: Option | null, id: string) => {
    SaleBillFormInfo.setFieldValue(id, option?.value);
  };

  const handlePartyList = () => {
      setPopupList({
        isOpen: true,
        data: {
          heading: 'Select Party',
          headers: [...partyHeaders],
          footers: partyFooterData,
          newItem: () => openTab('Ledger', <Ledger type='add' />),
          autoClose: true,
          apiRoute: '/ledger',
          ...(SaleBillFormInfo.values.oneStation === 'One Station' && { extraQueryParams: { stationId: SaleBillFormInfo.values.stationId } }),
          searchFrom: 'partyName',
          handleSelect: (rowData: any) => { handleFieldChange({ label: rowData.partyName, value: rowData.party_id }, 'partyId'), document.getElementById('invoiceNumber')?.focus() },
          onEsc: () => {
            setPopupList({isOpen: false, data: {}});
            document.getElementById('invoiceNumber')?.focus();
          },
        }
      })
  }

  const totalChallanAmt = challanItemsByPartyId.reduce((acc: number, curr: { amt: number }) => acc + curr.amt, 0);

  const handleBlur = (id: string) => {
    if (id === 'invoiceNumber') {
      const expectedValue = parseInt(invoiceNo.current?.replace(/\D/g, ''), 10);
      const actualValue = parseInt(SaleBillFormInfo.values.invoiceNumber?.replace(/\D/g, ''), 10);
      if (actualValue != expectedValue && actualValue > expectedValue) {
        settingPopupState(false, `Pending Invoices : ${Number(actualValue) - Number(expectedValue)}`, 'terms');
      } else if (actualValue != expectedValue && actualValue < expectedValue) {
        SaleBillFormInfo.setFieldValue('invoiceNumber', invoiceNo.current);
        settingPopupState(false, `Invoice No is already in use`, 'terms');
      }
    }
  }

  const basicInfoFields = [
    {
      label: 'Series Name',
      id: 'billBookSeriesId',
      name: 'billBookSeriesId',
      isRequired: true,
      type: 'select',
      options: options.seriesOption,
      nextField: SaleBillFormInfo.values.billBookSeriesId !== '' ? 'oneStation' : 'billBookSeriesId',
    },
    {
      label: 'One Station',
      id: 'oneStation',
      name: 'oneStation',
      isRequired: true,
      type: 'select',
      options: [
        { label: 'One Station', value: 'One Station' },
        { label: 'All Stations', value: 'All Stations' },
      ],
      nextField: SaleBillFormInfo.values.oneStation === 'One Station' ? 'stationId' : SaleBillFormInfo.values.oneStation === 'All Stations' ? 'partyId' : 'stationId',
      prevField: 'billBookSeriesId',
    },
    ...(SaleBillFormInfo.values.oneStation === 'One Station' ? [
      {
        label: 'Station',
        id: 'stationId',
        name: 'stationId',
        isRequired: SaleBillFormInfo.values.oneStation === 'One Station',
        type: 'select',
        options: options.stationOption,
        nextField: SaleBillFormInfo.values.stationId !== '' ? 'partyId' : 'stationId',
        prevField: 'oneStation'
      },
    ]
      : []),
    {
      label: 'Party',
      id: 'partyId',
      name: 'partyId',
      isRequired: true,
      type: 'select',
      onFocus: handlePartyList,
      options: options.partyOption,
      nextField: SaleBillFormInfo.values.partyId !== '' ? 'invoiceNumber' : 'partyId',
      prevField: SaleBillFormInfo.values.oneStation === 'One Station' ? 'stationId' : 'oneStation',
    },
    {
      label: 'Invoice No',
      id: 'invoiceNumber',
      name: 'invoiceNumber',
      onBlur: () => handleBlur('invoiceNumber'),
      isTitleCase: false,
      isRequired: true,
      type: 'text',
      nextField: 'terms',
      prevField: 'partyId',
    },
    {
      label: 'Payment Mode',
      id: 'terms',
      isRequired: true,
      name: 'terms',
      type: 'select',
      options: [
        { label: 'CASH', value: 'Cash' },
        { label: 'CREDIT', value: 'Credit' },
        { label: 'UPI', value: 'UPI' },
        { label: 'PART', value: 'Part' },
      ],
      nextField: SaleBillFormInfo.values.terms !== '' ? 'drugLicenceNo1' : 'terms',
      prevField: 'invoiceNumber',
    },
    {
      label: 'Balance',
      id: 'balance',
      disabled: true,
      name: 'balance',
      type: 'text',
    },
    {
      label: 'DL No.',
      id: 'drugLicenceNo1',
      isTitleCase: false,
      name: 'drugLicenceNo1',
      type: 'text',
      nextField: 'date',
      prevField: 'terms',
    },
    {
      label: 'Date',
      id: 'date',
      name: 'date',
      type: 'date',
      nextField: 'grNo',
      prevField: 'drugLicenceNo1',
    },
    {
      label: 'GST',
      id: 'gstNo',
      name: 'gstNo',
      type: 'text',
      disabled: true,
    },
    {
      label: 'Gr. No', // good reciept no
      id: 'grNo',
      name: 'grNo',
      isTitleCase: false,
      type: 'text',
      nextField: 'despDate',
      prevField: 'date',
    },
    {
      label: 'Desp. Date', // dispatch date
      id: 'despDate',
      name: 'despDate',
      type: 'date',
      nextField: 'packingSlipNo',
      prevField: 'grNo',
    },
    {
      label: 'Ps No.',
      id: 'packingSlipNo',
      name: 'packingSlipNo',
      isTitleCase: false,
      type: 'text',
      nextField: 'transport',
      prevField: 'despDate',
    },
    {
      label: 'Transport',
      id: 'transport',
      name: 'transport',
      isTitleCase: false,
      type: 'text',
      nextField: 'tempName',
      prevField: 'packingSlipNo',
    },
    {
      label: 'Temp. Name',
      id: 'tempName',
      name: 'tempName',
      isTitleCase: false,
      type: 'text',
      nextField: 'narration',
      prevField: 'transport',
    },
    {
      label: 'Message',
      id: 'narration',
      name: 'narration',
      type: 'textarea',
      labelClassName: 'flex w-[96%] gap-[4rem] items-start',
      textFieldClassName: 'border border-solid border-[#9ca3af] ',
      nextField: 'eWay',
      prevField: 'tempName',
    },
    {
      label: 'E-Way',
      id: 'eWay',
      name: 'eWay',
      isTitleCase: false,

      type: 'text',
      nextField: 'cases',
      prevField: 'narration',
    },
    {
      label: 'Cases',
      id: 'cases',
      name: 'cases',
      type: 'text',
      nextField: !!data?.bills?.length ? `cell-${data?.bills.length}-0` : challanItemsByPartyId.length > 0 ? 'pendingChallan' : 'cell-0-0',
      prevField: 'eWay',
    },

  ];

  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between px-8 py-1'>
        <h1 className='font-bold'> {data.id ? 'Update Sale Bill' : 'Create Sale Bill'} </h1>
        <Button
          type='highlight'
          id='saleBill_button'
          handleOnClick={() => setView({ type: '', data: {} })}
        >
          Back
        </Button>
      </div>
      {!isDiscountWindowOpen && <form onSubmit={SaleBillFormInfo.handleSubmit} className='flex flex-col w-full'>
        <div className='flex flex-col px-4 mx-4 py-2 gap-2'>
          <div className='flex flex-col w-[100%] gap-10 mb-4'>
            <Container
              fields={basicInfoFields}
              formik={SaleBillFormInfo}
              focused={focused}
              setFocused={setFocused}
            />
          </div>
          {SaleBillFormInfo.values.partyId && challanItemsByPartyId.length > 0 && (
            <div className="w-full h-fit border-[1px] border-solid border-gray-400 p-2 mb-4">
              <div className="flex items-center justify-between text-base text-gray-700">
                <span>Pending Items in Challans : {challanItemsByPartyId.length}</span>
                <span>Total Challan Amount : {totalChallanAmt}</span>
                <Button
                  type='fill'
                  padding='px-4 py-2'
                  id='pendingChallan'
                  btnType='button'
                  handleOnClick={() => setPendingChallansPopup(true)}
                  handleOnKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setPendingChallansPopup(true);
                    } else if (e.shiftKey && e.key === 'Tab') {
                      e.preventDefault();
                      document.getElementById('cases')?.focus();
                    } else if (e.key === 'Tab') {
                      e.preventDefault();
                      document.getElementById(`cell-0-0`)?.focus();
                    }
                  }}
                >
                  Select
                </Button>
              </div>
            </div>
          )}
          {pendingChallansPopup && <PendingChallanPopup
            challanItemsByPartyId={challanItemsByPartyId}
            setBillTableData={setBillTableData}
            isEditing={isEditing}
            setPendingChallansPopup={setPendingChallansPopup}
            partyId={SaleBillFormInfo.values.partyId}
          />}
          <div className='mb-4'>
            <CreateSaleBillTable
              setDataFromTable={setDataFromTable}
              setTotalValue={setTotalValue}
              totalValue={totalValue}
              billTableData={billTableData}
              setIsNetRateSymbol={setIsNetRateSymbol}
              setIsDiscountWindowOpen={setIsDiscountWindowOpen}
              isEditing={isEditing}
              selectedParty={SaleBillFormInfo.values.partyId}
              invoiceDate={SaleBillFormInfo.values.date}
            />
          </div>
          <div className='flex gap-12 justify-between'>
            <div className="border-[1px] border-solid w-[25%] border-gray-400 relative">
              <span className='absolute top-[-8px] left-2  px-2 w-fit bg-[#fff] text-xs'>Quantity Info</span>
              <span className='flex gap-2 text-base text-gray-900 m-2'>
                Total Quantity :{' '}
                <span className='min-w-[50px] text-gray-700'>
                  {totalValue.totalQty >= 0 && !totalValue.isDefault ? parseFloat(Number(totalValue.totalQty)?.toFixed(2)) : (data?.qtyTotal || 0)}
                </span>
              </span>
            </div>
            <div className="border-[1px] border-solid w-[25%] border-gray-400 relative">
              <span className='absolute top-[-8px] left-2  px-2 w-fit bg-[#fff] text-xs'>Total Info</span>
              <span className='flex gap-2 text-base text-gray-900 m-2'>
                Total :{' '}
                <span className='min-w-[50px] text-gray-700'>
                  {totalValue.totalAmt >= 0 && !totalValue.isDefault ? parseFloat(Number(totalValue.totalAmt)?.toFixed(2)) : (data?.total || 0)}
                </span>
              </span>
            </div>
          </div>
          <div id="saleBillFormBtn" className='mb-4'></div>
          <div className="flex justify-end sticky left-0">
            <button
              id='nextButton'
              type="button"
              className="px-4 py-2 bg-[#009196FF] hover:bg-[#009196e3] font-medium text-white rounded-md border-none focus:border-yellow-500 focus-visible:border-yellow-500"
              onClick={() => SaleBillFormInfo.handleSubmit()}
            >
              Next
            </button>
          </div>
        </div>
        {open && <DrugLicenceSection togglePopup={togglePopup} setDLNo={setDLNo} />}
      </form>}
      {(popupState.isModalOpen || popupState.isAlertOpen) && (
        <Confirm_Alert_Popup
          onClose={handleClosePopup}
          onConfirm={handleAlertCloseModal}
          message={popupState.message}
          isAlert={popupState.isAlertOpen}
        />
      )}
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
    </div>
  );
};

export default CreateSaleBill;

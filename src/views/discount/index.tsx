import React, { useEffect, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import {
  CompanyFormData,
  PartyWiseDiscountFormData,
  View,
} from '../../interface/global';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { ValueFormatterParams } from 'ag-grid-community';
import Button from '../../components/common/button/Button';
import { sendAPIRequest } from '../../helper/api';
import { CreateDiscount } from './CreateDiscount';
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import usePermission from '../../hooks/useRole';
import { useSelector } from 'react-redux';
import useHandleKeydown from '../../hooks/useHandleKeydown';
import { decimalFormatter, extractKeys, lookupValue } from '../../helper/helper';
import { discountValidationSchema } from './validation_schema';
import { useGetSetData } from '../../hooks/useGetSetData';
import { getAndSetPartywiseDiscount } from '../../store/action/globalAction';
import { useControls } from '../../ControlRoomContext';

export const PartyWiseDiscount = () => {
  const [view, setView] = useState<View>({ type: '', data: {} });
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<CompanyFormData | any>(null);
  const [partyData, setPartyData] = useState<any[]>([]);
  const [companyData, setCompanyData] = useState<any[]>([]);
  const editing = useRef(false);
  const discountId = useRef('');
  const { createAccess, updateAccess, deleteAccess } = usePermission('partywisediscount')
  const getAndSetPartywiseDiscountHandler = useGetSetData(getAndSetPartywiseDiscount);
  
  const { controlRoomSettings } = useControls();
  const { party: allParties, company: allCompanies, partywiseDiscount: partywiseDiscounts } = useSelector((state: any) => state.global);
  // let currTable: any[] = [];
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });
  const settingPopupState = (isModal: boolean, message: string) => {
    setPopupState({
      ...popupState,
      [isModal ? 'isModalOpen' : 'isAlertOpen']: true,
      message: message,
    });
  };

  const discountTypeOptions = [
    { value: 'allCompanies', label: 'All companies same discount' },
    { value: 'companyWise', label: 'Companywise discount' },
    { value: 'dpcoact', label: 'DPCO act settings' },
  ];


  const partyMap: { [key: number]: string } = {};
  const companyMap: { [key: number]: string } = {};

  partyData?.forEach((party: any) => {
    partyMap[party.party_id] = party.partyName;
  });

  companyData?.forEach((company: any) => {
    companyMap[company.company_id] = company.companyName;
  });

  useEffect(() => {
    setPartyData(allParties);
    setCompanyData(allCompanies);
    setTableData(partywiseDiscounts);
  }, [partywiseDiscounts,allParties,allCompanies]);

  const discountTypeMap: { [key: string]: string } = discountTypeOptions.reduce(
    (map: any, option) => {
      map[option.value] = option.label;
      return map;
    },
    {}
  );

  const parties = extractKeys(partyMap);
  const companies = extractKeys(companyMap);


  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleConfirmPopup = async () => {
    setPopupState({ ...popupState, isModalOpen: false });
    await sendAPIRequest(
      `/partyWiseDiscount/${discountId.current}`,
      {
        method: 'DELETE',
      }
    );
    getAndSetPartywiseDiscountHandler();
  };

  const handleDelete = (oldData: any) => {
    settingPopupState(true, 'Are you sure you want to delete the selected record ?')
    discountId.current = oldData.discount_id;
  };

  const handleCellEditingStopped = async (e: any) => {
    editing.current = false;
    const { column, oldValue, valueChanged, node, data } = e;
    const { newValue } = e;
    if (!valueChanged) return;
    const field = column.colId;
    try{
      if (!newValue) {
        const capitalizedFieldName = field.charAt(0).toUpperCase() + field.slice(1);
        throw new Error(`${capitalizedFieldName} is required`);
      }
      if (field === 'discount') {
        await discountValidationSchema.validateAt(field, { [field]: newValue });
      }
      if (field === 'discountType' && data.discountType === 'dpcoact' && controlRoomSettings.dpcoAct) {
        data.discount = controlRoomSettings.dpcoDiscount;
      }
      if (data.discountType === 'allCompanies') {
        data.companyId = null;
      } else {
        if (!data.companyId) {
          settingPopupState(false, 'Company name is required for this discount type');
          return;
        }
      }
      const payload: {
        [x: string]: any;
        companyId?: number|null;
        discountType?: string;
        discount?:number;
      } = {
        [field]: newValue,
        partyId:data.partyId,
        companyId: data.companyId,
        discountType: data.discountType !== 'allCompanies' ? data.discountType : 'allCompanies',
        discount: data.discount
      }
      await sendAPIRequest(
        `/partyWiseDiscount/${data.discount_id}`,
        {
          method: 'PUT',
          body: payload,
        }
      );
      getAndSetPartywiseDiscountHandler();
    }catch(err:any){
      if (err?.response?.status === 409) {
        settingPopupState(false, err.response.data)
      }else if(err.message){
        settingPopupState(false, err.message)
      }else{
        console.log('Error while updateing the Party-wise discount ---> ',err)
      }
      getAndSetPartywiseDiscountHandler();
    }
  };

  const onCellClicked = (params: { data: any }) => {
    setSelectedRow(selectedRow !== null ? null : params.data);
  };

  const cellEditingStarted = () => {
    editing.current = true;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    handleKeyDownCommon(
      event,
      handleDelete,
      undefined,
      undefined,
      selectedRow,
      setView
    );
  };
  useHandleKeydown(handleKeyDown, [selectedRow]);
  const defaultCol = {
    floatingFilter: true,
    editable: updateAccess,
    flex:1,
    suppressMovable: true,
    filter: true,
    headerClass: 'custom-header',
  }

  function cellEditorParams(params:any,values:any){
    return {
      values,
      valueListMaxHeight: 120,
      valueListMaxWidth: 192,
      valueListGap: 8,
      value: params.data[params.colDef.field],
    }
  }

  const colDefs: any[] = [
    {
      headerName: 'Party Name',
      field: 'partyId',
      flex: 2,
      suppressMovable: false,
      headerClass: 'custom-header',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: (params: any) => {
        return cellEditorParams(params,parties)
      },
      valueFormatter: (params: { value: string | number }) => {
        return lookupValue(partyMap, params.value);
      },
      valueGetter: (params: { data: any }) => {
        return lookupValue(partyMap, params.data.partyId);
      },
      filterValueGetter: (params: { data: any }) => {
        return lookupValue(partyMap, params.data.partyId);
      },
    },
    {
      headerName: 'Discount Type',
      field: 'discountType',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: (params: any) => {
        return cellEditorParams(params, discountTypeOptions.map((option) => option.value));
      },
      valueFormatter: (params: { value: string | number }) => {
        return lookupValue(discountTypeMap, params.value);
      }, 
      valueGetter: (params: { data: any }) => {
        return lookupValue(discountTypeMap, params.data.discountType);
      },
      filterValueGetter: (params: { data: any }) => {
        return lookupValue(discountTypeMap, params.data.discountType);
      },
    },
    {
      headerName: 'Company Name',
      field: 'companyId',
      type: 'rightAligned',
      editable: (params:any) => params.data.discountType !== 'allCompanies',
      headerClass: 'custom-header custom_header_class ag-right-aligned-header',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: (params: any) => {
        return cellEditorParams(params, companies);
      },
      valueFormatter: (params: { value: string | number, data: any }) => {
        if (!params.value && params.data.discountType==='allCompanies') return 'All';
        return lookupValue(companyMap, params.value);
      },
      valueGetter: (params: { data: any }) => {
        return lookupValue(companyMap, params.data.companyId);
      },
      filterValueGetter: (params: { data: any }) => {
        return lookupValue(companyMap, params.data.companyId);
      },
    },
    {
      headerName: 'Discount',
      field: 'discount',
      valueFormatter: decimalFormatter,
    },
    {
      headerName: 'Actions',
      headerClass: 'custom-header-class custom-header',
      sortable: false,
      floatingFilter : false,
      filter: false,
      editable : false,
      cellStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      cellRenderer: (params: { data: any }) => (
        <div className='table_edit_buttons'>
          {updateAccess && <FaEdit
            style={{ cursor: 'pointer', fontSize: '1.1rem' }}
            onClick={() => {
              setView({ type: 'add', data: params.data });
            }}
          />}
          {deleteAccess && <MdDeleteForever
            style={{ cursor: 'pointer', fontSize: '1.2rem' }}
            onClick={() => handleDelete(params.data)}
          />}
        </div>
      ),
    },
  ];
  const discount = () => {
    return (
      <>
        <div className='flex w-full items-center justify-between px-8 py-1'>
          <h1 className='font-bold'>Partywise discount</h1>
          {createAccess &&<Button
            type='highlight'
            handleOnClick={() => {
              setView({ type: 'add', data: {} });
            }}
          >
            Add PartyWise discount
          </Button>}
        </div>
        <div id='account_table' className='ag-theme-quartz'>
          {
            <AgGridReact
              rowData={tableData}
              columnDefs={colDefs}
              defaultColDef={defaultCol}
              onCellClicked={onCellClicked}
              onCellEditingStarted={cellEditingStarted}
              onCellEditingStopped={handleCellEditingStopped}
            />
          }
        </div>
        {(popupState.isModalOpen || popupState.isAlertOpen) && (
          <Confirm_Alert_Popup
            onClose={handleClosePopup}
            onConfirm={
              popupState.isAlertOpen
                ? handleAlertCloseModal
                : handleConfirmPopup
            }
            message={popupState.message}
            isAlert={popupState.isAlertOpen}
          />
        )}
      </>
    );
  };

  const renderView = () => {
    switch (view.type) {
      case 'add':
        return (
          <CreateDiscount
            setView={setView}
            data={view.data}
            discountTypeOptions={discountTypeOptions}
          />
        );
      default:
        return discount();
    }
  };

  return <div className='w-full'>{renderView()}</div>;
};

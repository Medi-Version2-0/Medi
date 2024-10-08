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
import Button from '../../components/common/button/Button';
import { CreateDiscount } from './CreateDiscount';
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import usePermission from '../../hooks/useRole';
import useHandleKeydown from '../../hooks/useHandleKeydown';
import { decimalFormatter, extractKeys, lookupValue } from '../../helper/helper';
import { discountValidationSchema } from './validation_schema';
import { useControls } from '../../ControlRoomContext';
import useApi from '../../hooks/useApi';
import { getDiscountFormSchema } from './validation_schema'
import { ValueParserParams } from 'ag-grid-community';

export const PartyWiseDiscount = () => {
  const [view, setView] = useState<View>({ type: '', data: {} });
  const { sendAPIRequest } = useApi();
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<CompanyFormData | any>(null);
  const [partyData, setPartyData] = useState<any[]>([]);
  const [companyData, setCompanyData] = useState<any[]>([]);
  const editing = useRef(false);
  const discountId = useRef('');
  const { createAccess, updateAccess, deleteAccess } = usePermission('partywisediscount')
  
  const { controlRoomSettings } = useControls();
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
    // { value: 'dpcoact', label: 'DPCO act settings' },
  ];


  const partyMap: { [key: number]: string } = {};
  const companyMap: { [key: number]: string } = {};

  partyData?.forEach((party: any) => {
    partyMap[party.party_id] = party.partyName;
  });

  companyData?.forEach((company: any) => {
    companyMap[company.company_id] = company.companyName;
  });

  async function getAndSetTableData() {
    try {
      const allPartywiseDiscounts = await sendAPIRequest('/partyWiseDiscount');
      setTableData(allPartywiseDiscounts);
    } catch (err) {
      console.error(`PartyWise Discount data in partywiseDiscount (index) not being fetched`);
    }
  }

  async function initData(){
    try {
      const allCompaniesData = await sendAPIRequest('/company');
      const allPartiesData = await sendAPIRequest('/ledger');
      setCompanyData(allCompaniesData);
      setPartyData(allPartiesData);
    } catch (err) {
      console.error(`Companies or Parties data in partywiseDiscount (index) not initialized`);
    }
  }

  useEffect(() => {
    initData();
    getAndSetTableData();
  }, []);

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
    try {
      await sendAPIRequest(
        `/partyWiseDiscount/${discountId.current}`,
        {
          method: 'DELETE',
        }
      );
    } catch (error: any) {
      if (!error?.isErrorHandled) {
        console.log('Partywise discount not deleted');
      }
    }finally{
      await getAndSetTableData();
    }
  };

  const handleDelete = (oldData: any) => {
    settingPopupState(true, 'Are you sure you want to delete the selected record ?')
    discountId.current = oldData.discount_id;
  };

  const handleCellEditingStopped = async (e: any) => {
    editing.current = false;
    const { column, valueChanged, node, data } = e;
    const { newValue } = e;
    if (!valueChanged) return;
    const field = column.colId;
    try{
      if (data.discountType === 'allCompanies') {
        data.companyId = null;
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
        discount: data.discount,
      }
      if (e.data.discountType === 'dpcoact') {
        payload.dpcoDiscount = newValue;
        delete payload.discount;
      }
      await sendAPIRequest(
        `/partyWiseDiscount/${data.discount_id}`,
        {
          method: 'PUT',
          body: payload,
        }
      );
    }catch(error:any){
      if (!error?.isErrorHandled) {
        if (error.response?.data.error.message){
          settingPopupState(false, error.response.data.error.message);
          return;
        }
        if (error.response?.data.error.messages) {
          settingPopupState(false, error.response?.data.messages.map((e: any) => e.message).join('\n'))
          return
        }
        if (error.response?.data) {
          settingPopupState(false, error.response.data.message);
          return
        }
      }
    }finally{
      await getAndSetTableData();
    }
  };

  const onCellClicked = (params: { data: any }) => {
    setSelectedRow(params.data);
  };

  const cellEditingStarted = () => {
    editing.current = true;
  };

  const valueParser = (params: ValueParserParams): number | null => {
    const { newValue, colDef } = params;
    if (parseFloat(newValue) < 0) {  // value must be positive
      // settingPopupState(false, `${colDef?.field} can't be negative`);
      return 0;
    }
    const parsedValue = parseFloat(newValue);
    return isNaN(parsedValue) ? null : parsedValue;
  }

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
      editable:false,
      valueFormatter: (params: { value: string | number }) => {
        return lookupValue(discountTypeMap, params.value);
      }, 
    },
    {
      headerName: 'Company Name',
      field: 'companyId',
      // type: 'rightAligned',
      editable: (params: any) => params.data.discountType === 'companyWise',
      headerClass: 'custom-header custom_header_class',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: (params: any) => {
        return cellEditorParams(params, companies);
      },
      valueFormatter: (params: { value: string | number, data: any }) => {
        if (!params.value) return 'All';
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
      type: 'numberColumn',  
      cellEditor: 'agNumberCellEditor', 
      valueParser,
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
            id = 'add'
            type='highlight'
            handleOnClick={() => {
              setView({ type: 'add', data: {} });
            }}
          >
            Add Party-Wise discount
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
          id='viewDiscountAlert'
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
            getAndSetTableData={getAndSetTableData}
            discountTypeOptions={discountTypeOptions}
          />
        );
      default:
        return discount();
    }
  };

  return <div className='w-full'>{renderView()}</div>;
};

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
import { useParams } from 'react-router-dom';
import { ValueFormatterParams } from 'ag-grid-community';
import Button from '../../components/common/button/Button';
import { sendAPIRequest } from '../../helper/api';
import { CreateDiscount } from './CreateDiscount';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import usePermission from '../../hooks/useRole';

export const PartyWiseDiscount = () => {
  const [view, setView] = useState<View>({ type: '', data: {} });
  const { organizationId } = useParams();
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<CompanyFormData | any>(null);
  const [partyData, setPartyData] = useState<any[]>([]);
  const [companyData, setCompanyData] = useState<any[]>([]);
  const editing = useRef(false);
  const discountId = useRef('');
  const queryClient = useQueryClient();
  const { createAccess, updateAccess, deleteAccess } = usePermission('party_wise_discount')

  let currTable: any[] = [];
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  const discountTypeOptions = [
    { value: 'allCompanies', label: 'All companies same discount' },
    { value: 'companyWise', label: 'Companywise discount' },
    { value: 'dpcoact', label: 'DPCO act settings' },
  ];

  const { data } = useQuery<PartyWiseDiscountFormData[]>({
    queryKey: ['get-discounts'],
    queryFn: () =>
      sendAPIRequest<any[]>(`/${organizationId}/partyWiseDiscount`),
  });

  const fetchData = async () => {
    const parties = await sendAPIRequest<any[]>(`/${organizationId}/ledger`);
    const companies = await sendAPIRequest<any[]>(`/${organizationId}/company`);
    setPartyData(parties);
    setCompanyData(companies);
  };

  const partyMap: { [key: number]: string } = {};
  const companyMap: { [key: number]: string } = {};

  partyData?.forEach((party: any) => {
    partyMap[party.party_id] = party.partyName;
  });

  companyData?.forEach((company: any) => {
    companyMap[company.company_id] = company.companyName;
  });

  const getPartyWiseDiscountData = async () => {
    setTableData(data);
  };

  useEffect(() => {
    fetchData();
    getPartyWiseDiscountData();
  }, [data]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRow]);

  const extractKeys = (mappings: { [x: number]: string }) => {
    return Object.keys(mappings).map((key) => Number(key));
  };

  const discountTypeMap: { [key: string]: string } = discountTypeOptions.reduce(
    (map: any, option) => {
      map[option.value] = option.label;
      return map;
    },
    {}
  );

  const parties = extractKeys(partyMap);
  const companies = extractKeys(companyMap);

  const lookupValue = (
    mappings: {
      [x: string]: any;
      [x: number]: string;
    },
    key: string | number
  ) => {
    return mappings[key];
  };

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleConfirmPopup = async () => {
    setPopupState({ ...popupState, isModalOpen: false });
    await sendAPIRequest(
      `/${organizationId}/partyWiseDiscount/${discountId.current}`,
      {
        method: 'DELETE',
      }
    );
    await queryClient.invalidateQueries({ queryKey: ['get-discounts'] });
  };

  const decimalFormatter = (params: ValueFormatterParams): any => {
    if (!params.value) return;
    return parseFloat(params.value).toFixed(2);
  };

  const handleDelete = (oldData: any) => {
    setPopupState({
      ...popupState,
      isModalOpen: true,
      message: 'Are you sure you want to delete the selected record ?',
    });
    discountId.current = oldData.discount_id;
  };

  const handleCellEditingStopped = async (e: any) => {
    currTable = [];
    editing.current = false;
    const { column, oldValue, valueChanged, node, data } = e;
    const { newValue } = e;
    if (!valueChanged) return;
    const field = column.colId;

    if (!newValue) {
      setPopupState({
        ...popupState,
        isAlertOpen: true,
        message: `${field} is required`,
      });
      node.setDataValue(field, oldValue);
      return;
    }

    switch (field) {
      case 'partyId':
        {
          if (!newValue) {
            setPopupState({
              ...popupState,
              isAlertOpen: true,
              message: 'Party Name is required',
            });
            node.setDataValue(field, oldValue);
            return;
          }
        }
        break;
      case 'discountType':
        {
          if (!newValue) {
            setPopupState({
              ...popupState,
              isAlertOpen: true,
              message: 'Discount Type is required',
            });
            node.setDataValue(field, oldValue);
            return;
          }
        }
        break;
      case 'companyId':
        {
          if (!newValue) {
            setPopupState({
              ...popupState,
              isAlertOpen: true,
              message: 'Company Name is required',
            });
            node.setDataValue(field, oldValue);
            return;
          }
        }
        break;
      case 'discount':
        {
          if (!newValue) {
            setPopupState({
              ...popupState,
              isAlertOpen: true,
              message: 'Discount is required',
            });
            node.setDataValue(field, oldValue);
            return;
          }
        }
        break;
      default:
        break;
    }

    tableData.forEach((data: any) => {
      if (
        data.partyId !== e.data.partyId &&
        data.companyId !== e.data.companyId &&
        data.discountType !== e.data.discountType
      ) {
        currTable.push(data);
      }
    });

    const existingDiscount = currTable.find(
      (discount: PartyWiseDiscountFormData) =>
        discount.partyId === data.partyId &&
        discount.companyId === data.companyId &&
        discount.discountType === data.discountType
    );

    if (existingDiscount) {
      setPopupState({
        ...popupState,
        isAlertOpen: true,
        message:
          'Discount with this Party, Company, and Discount Type already exists!',
      });
      node.setDataValue(field, oldValue);
      return;
    }

    await sendAPIRequest(
      `/${organizationId}/partyWiseDiscount/${data.discount_id}`,
      {
        method: 'PUT',
        body: { [field]: newValue },
      }
    );
    queryClient.invalidateQueries({ queryKey: ['get-discounts'] });
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

  const colDefs: any[] = [
    {
      headerName: 'Party Name',
      field: 'partyId',
      flex: 2,
      filter: true,
      headerClass: 'custom-header',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: parties,
        valueListMaxHeight: 120,
        valueListMaxWidth: 192,
        valueListGap: 8,
      },
      valueFormatter: (params: { value: string | number }) => {
        return lookupValue(partyMap, params.value);
      },
    },
    {
      headerName: 'Discount Type',
      field: 'discountType',
      flex: 1,
      filter: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: discountTypeOptions.map((option) => option.value),
        valueListMaxHeight: 120,
        valueListMaxWidth: 192,
        valueListGap: 8,
      },
      valueFormatter: (params: { value: string | number }) => {
        return lookupValue(discountTypeMap, params.value);
      },
      headerClass: 'custom-header',
      suppressMovable: true,
    },
    {
      headerName: 'Company Name',
      field: 'companyId',
      flex: 1,
      filter: true,
      type: 'rightAligned',
      headerClass: 'custom-header custom_header_class ag-right-aligned-header',

      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: companies,
        valueListMaxHeight: 120,
        valueListMaxWidth: 192,
        valueListGap: 8,
      },
      valueFormatter: (params: { value: string | number }) => {
        return lookupValue(companyMap, params.value);
      },
    },
    {
      headerName: 'Discount',
      field: 'discount',
      filter: true,
      flex: 1,
      valueFormatter: decimalFormatter,
      headerClass: 'custom-header',
      suppressMovable: true,
    },
    {
      headerName: 'Actions',
      headerClass: 'custom-header-class custom-header',
      sortable: false,
      suppressMovable: true,
      editable : false,
      flex: 1,
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
              defaultColDef={{
                floatingFilter: true,
                editable : updateAccess
              }}
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
            discounts={tableData}
          />
        );
      default:
        return discount();
    }
  };

  return <div className='w-full'>{renderView()}</div>;
};

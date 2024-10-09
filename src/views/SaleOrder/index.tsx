import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import Button from "../../components/common/button/Button";
import { ColDef, GridOptions } from "ag-grid-community";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { handleKeyDownCommon } from "../../utilities/handleKeyDown";
import useHandleKeydown from "../../hooks/useHandleKeydown";
import { popupOptions, View } from "../../interface/global";
import { CreateSaleOrder } from "./CreateSaleOrder";
import usePermission from "../../hooks/useRole";
import { sendAPIRequest } from "../../helper/api";
import Confirm_Alert_Popup from "../../components/popup/Confirm_Alert_Popup";

interface saleOrder {

}

export const SaleOrder = () => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [view, setView] = useState<View>({ type: '', data: {} });
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const { createAccess, updateAccess, deleteAccess } = usePermission('saleorder');
  const [popupState, setPopupState] = useState<popupOptions>({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  async function getAndSetTableData() {
    try {
      const allOrders = await sendAPIRequest('/saleOrder');
      setTableData([...allOrders]);
    } catch (err) {
      console.error('Orders data in sale Order index not being fetched');
    }
  }

  useEffect(() => {
    getAndSetTableData();
  }, []);



  const onCellClicked = (params: { data: any }) => {
    setSelectedRow(params.data);
  };

  const cellEditingStarted = () => {
    console.log('cell start editing')
  };

  const handleCellEditingStopped = async (e: any) => {
    console.log('cell Editing stopped')
  };

  const handleDelete = () => {
    setPopupState({
      ...popupState,
      isModalOpen: true,
      message: 'Are you sure you want to delete the selected record?',
    });
  };

  async function deleteAndUpdateTableData(){
    try {
      await sendAPIRequest(`/saleOrder/${selectedRow.id}`, { method: 'DELETE' });
      await getAndSetTableData();
    } catch (error: any) {
      if (error?.response?.status !== 401 && error?.response?.status !== 403) {
        if (error?.response?.status === 400) {
          setPopupState({
            ...popupState,
            isAlertOpen: true,
            message: error?.response.data.error.message,
          });
        }
      }
    }
  }

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false, isModalOpen: false });
  };
  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };
  const handleConfirmPopup = async () => {
    setPopupState({ ...popupState, isModalOpen: false });
    await deleteAndUpdateTableData();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    handleKeyDownCommon(
      event,
      handleDelete,
      undefined,
      undefined,
      selectedRow,
      setView,
    );
  };
  useHandleKeydown(handleKeyDown, [selectedRow]);

  const colDefs: any[] = [
    {
      headerName: 'Order No',
      field: 'orderNo',
      type: 'numberColumn',
      editable: false
    },
    {
        headerName: 'Date',
        field: 'date',
        editable: false,
        filter: 'agDateColumnFilter',
        valueFormatter: (params:any) => {
          const dateParts = params.value.split('/');
          const formattedDate = new Date(
            `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
          );
          return formattedDate.toLocaleDateString('en-GB'); // Ensure the displayed format is DD/MM/YYYY
        },
        filterParams: {
          // Custom comparator for handling DD/MM/YYYY format in filtering
          comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
            const dateParts = cellValue.split('/');
            const cellDate = new Date(
              `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
            );
            if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
              return 0;
            }
            return cellDate < filterLocalDateAtMidnight ? -1 : 1;
          },
          browserDatePicker: true, // Use the browser's default date picker
        },
    },
    {
      headerName: 'Party Name',
      field: 'party.partyName',
      flex: 2,
      headerClass: 'custom-header',
      editable: false
    },
    {
      headerName: 'Item Name',
      field: 'item.name',
      flex: 2,
      editable: false,
      headerClass: 'custom-header',
    },
    {
      headerName: 'Qty',
      field: 'Qty',
      flex: 1,
      headerClass: 'custom-header',
    },
    {
      headerName: 'Estimate Value',
      field: 'estimateValue',
      flex: 1,
      headerClass: 'custom-header',
      editable: false,
    },
    {
      headerName: 'Actions',
      headerClass: 'custom-header-class custom-header',
      sortable: false,
      editable:false,
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
              console.log('params data --> ',params.data)
              setView({ type: 'add', data: params.data });
            }}
          />}
          {deleteAccess && <MdDeleteForever
            style={{ cursor: 'pointer', fontSize: '1.2rem' }}
            onClick={() => {
              handleDelete();
            }}
          />}
        </div>
      )
    },
  ];

  const defaultColDef: ColDef = {
    floatingFilter: true,
    editable: updateAccess,
    flex: 1,
    suppressMovable: true,
    filter: true,
    headerClass: 'custom-header',
  }

  const gridOptions: GridOptions<any> = {
    pagination: true,
    paginationPageSize: 20,
    paginationPageSizeSelector: [20, 30, 40],
    defaultColDef,
  };

  const HomeView = () => (
    <div className='w-full relative'>
      <div className='flex w-full items-center justify-between px-8 py-1'>
        <h1 className='font-bold'>Sale Order</h1>
        {createAccess && <Button type='highlight' id='add' handleOnClick={() => {
          setView({ type: 'add', data: {} });
        }}>
          Add Sale Order
        </Button>}
      </div>

      {/* ag grid home */}
      <div id='account_table' className='ag-theme-quartz'>
        {
          <AgGridReact
            rowData={tableData}
            columnDefs={colDefs}
            gridOptions={gridOptions}
            onCellClicked={onCellClicked}
            onCellEditingStarted={cellEditingStarted}
            onCellEditingStopped={handleCellEditingStopped}
          />
        }
      </div>

      {/* show popup or confirmation dialog box  */}
      {(popupState.isModalOpen || popupState.isAlertOpen) && (
        <Confirm_Alert_Popup
          id='viewSaleOrderAlert'
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
    </div>
  );

  const renderView = () => {
    switch (view.type) {
      case 'add':
        return <CreateSaleOrder setView={setView} viewData={view.data} getAndSetTableData={getAndSetTableData}/>;
      default:
        return HomeView();
    }
  };

  return <div className='w-full'>{renderView()}</div>;
};

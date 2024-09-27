import { useEffect, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { MdDeleteForever } from 'react-icons/md';
import { FaEdit } from 'react-icons/fa';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import usePermission from '../../hooks/useRole';
import { godownSetup } from'../../interface/global';
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import { sendAPIRequest } from '../../helper/api';
import PlaceholderCellRenderer from '../../components/ag_grid/PlaceHolderCell';

export const Godown = () =>{
    const initialValue = {
        godownName: '',
      };

      const { createAccess, updateAccess, deleteAccess } = usePermission('godown')
      const [popupState, setPopupState] = useState({ isModalOpen: false, isAlertOpen: false, message: '',});
      const editing = useRef(false);
      const settingPopupState = (isModal: boolean, message: string) => {
        setPopupState({
          ...popupState,
          [isModal ? 'isModalOpen' : 'isAlertOpen']: true,
          message: message,
        });
      };
      const gridRef = useRef<any>(null);
      const [tableData, setTableData] = useState< godownSetup | any>([initialValue]);
      const [selectedRow, setSelectedRow] = useState<any>(null);
      const focusedCell = useRef<{ rowIndex: number; colId: string } | null>(null);

      useEffect(() => {
        getGodownData();
      }, [])

      const getGodownData = async () => {
        try {
          const godownData: any = await sendAPIRequest(`/godown/`, {
            method: 'GET'
          })
          setTableData([...(createAccess ? [initialValue] : []), ...godownData]);
        } catch (error: any) {
          setPopupState({
            ...popupState,
            isAlertOpen: true,
            message: `${error.message}`,
          });
        }
      }

      const handleClosePopup = () => {
        setPopupState({ ...popupState, isModalOpen: false });
      };
      const handleAlertCloseModal = () => {
        setPopupState({ ...popupState, isAlertOpen: false });
      };

      const handleConfirmPopup = async () => {
        setPopupState({ ...popupState, isModalOpen: false });
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Enter' && focusedCell.current) {
          if (focusedCell.current.colId === 'action') {
            handleDelete(tableData[focusedCell.current.rowIndex]);
          }
        }
        handleKeyDownCommon(event,() => handleDelete(selectedRow,),selectedRow,undefined);
      };
    
      useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
          document.removeEventListener('keydown', handleKeyDown);
        };
      }, [selectedRow]);

      const handleDelete = async (rowData: any, rowIndex?: number) => {
        try {
          if (rowIndex === 0) {
            Object.keys(rowData).forEach(key => {
              rowData[key] = null;
            });
          }
          await sendAPIRequest(`/godown/${rowData.godownCode}`, {
            method: 'DELETE',
          });
          
          getGodownData();
          settingPopupState(false,"Godown Deleted Successfully")
          focusedCell.current = null;
          
        } catch (error: any) {
          if (error?.response?.status!== 401 && error.response?.status!== 403) {
            console.error('Godown cannot be deleted');
            if (error?.response?.status=== 409) {
              settingPopupState(false,`${error.response.data.error.message}`)
              focusedCell.current = null;
            } 
          }
        }
    
      };

      const onCellFocused = (params: any) => {
        focusedCell.current = { rowIndex: params.rowIndex, colId: params.column?.colId };
      };

      const onCellClicked = (params: any ) => {
        // setSelectedRow(selectedRow !== null ? null : params.data);
        setSelectedRow(params.data);
      };

      const cellEditingStarted = (params: any) => {
        editing.current = true;
      };

      const handleCellEditingStopped = async (e: any) => {

        editing.current = false;
        const { data, column, oldValue, valueChanged, node } = e;
        const { newValue } = e;
        const field = column.colId;

        const toTitleCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        
        if (field === 'godownName') {
          const titleCasedNewValue = toTitleCase(newValue);
          const isDuplicate = tableData.some((item: any) =>
            item.godownName.toLowerCase() === titleCasedNewValue.toLowerCase() && item.godownCode !== data.godownCode
          );    
          if (isDuplicate) {
            settingPopupState(false, 'Godown with this name already exist');
            node.setDataValue(field, oldValue);
            return;
          }
        }

        
        if (node.rowIndex === 0 && createAccess) {
          try {
            if (data.godownName) {
              if(tableData.length >= 10 ) return settingPopupState(false, 'Godown creation Limit Reached');

              data.godownName = toTitleCase(data.godownName);
              const response: any = await sendAPIRequest(`/godown/`, {
                method: 'POST',
                body: { [field]: data.godownName },
              });
              if (data.godownName && !response.error) {
                settingPopupState(false, 'Godown created successfully');
              }
              getGodownData();
            }
          } catch (error: any) {
            settingPopupState(false, error.message)
          }
        } else if(updateAccess) {
            try {
              node.setDataValue(field, e.newValue);
              const titleCasedValue = toTitleCase(newValue);
              await sendAPIRequest(`/godown/${data.godownCode}`, {
                method: 'PUT',
                body: { [field]: titleCasedValue },
              });
              getGodownData();
            } catch (error: any) {
              if (!error?.isErrorHandled) {
                settingPopupState(false, `${error.message}`);
                node.setDataValue(field, oldValue);
                return;
              }
            }
          }
      };
    
      const defaultCol = {
        filter: true, 
        floatingFilter: true,
        headerClass: 'custom-header',
        suppressMovable: true,
        cellRenderer: (params: any) => (
          <PlaceholderCellRenderer
            value={params.value}
            rowIndex={params.node.rowIndex}
            column={params.colDef}
            startEditingCell={(editParams: any) => {
              gridRef.current?.api?.startEditingCell(editParams);
            }}
            placeholderText={params.colDef.headerName}
          />
        ),
      }

      const colDefs =[
        {
          headerName: 'S.No.',
          field: 'sno',
          valueGetter: (params: any) => params.node.rowIndex + 1,
          editable: false,
          flex: 1,
          headerClass: 'custom-header-class custom-header',
        },
        {
            headerName: 'Godown Name',
            field: 'godownName',
            editable: true,
            flex: 3,
            headerClass: 'custom-header-class custom-header',
        },
        {
            headerName: 'Actions',
            field: 'action',
            headerClass: 'custom-header-class custom-header',
            flex: 1,
            sortable: false,
            editable: false,
            floatingFilter: false,
            filter: false,
            cellStyle: {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            },
            cellRenderer: (params: any) => (
              <div className='table_edit_buttons'>
                {deleteAccess && <MdDeleteForever
                  style={{ cursor: 'pointer', fontSize: '1.2rem' }}
                  onClick={() => {
                    setSelectedRow(selectedRow !== null ? null : params.data);
                    handleDelete(params.data, params.node.rowIndex);
                  }}
                />}
              </div>
            ),
        },

      ]


      return (
        <>
          <div id='account_table' className='ag-theme-quartz'>
            {
              <AgGridReact
                rowData={tableData}
                columnDefs={colDefs}
                defaultColDef={defaultCol}
                onCellClicked={onCellClicked}
                onCellEditingStarted={cellEditingStarted}
                onCellEditingStopped={handleCellEditingStopped}
                onCellFocused={onCellFocused}
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
      )
    
}
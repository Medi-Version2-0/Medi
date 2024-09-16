import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { useSelector } from 'react-redux';
import Button from '../../components/common/button/Button';
import { companyHeaders, userHeaders } from '../../constants/organisation';
import ActionCell from '../../components/ag_grid/ActionCell';
import ResourcePermissionsGrid from './ResourcePermissionsGrid';
import OrganizationForm from './OrganizationForm';
import { Popup } from '../../components/popup/Popup';
import { ColTypeDef } from 'ag-grid-community';
import { useUser } from '../../UserContext';
import { UserFormI } from '../../interface/global';
import useApi from '../../hooks/useApi';

export const Organization = () => {
    const { organizations } = useSelector((state: any) => state.global);
    const { selectedCompany: organizationId } = useUser();
    const [dataType, setDataType] = useState<string>('companies');
    const [data, setData] = useState<any[]>([]);
    const [columnDefs, setColumnDefs] = useState<ColTypeDef | any>([]);
    const [editing, setEditing] = useState<any>(null);
    const { sendAPIRequest } = useApi();

    const fetchData = async (type: string) => {
        try {
            let result: any[] = [];
            let headerConfig: any = {};

            if (type === 'companies') {
                result = organizations;
                headerConfig = companyHeaders;
            } else if (type === 'users') {
                result = await sendAPIRequest<UserFormI[]>(`/user/organization`);
                headerConfig = userHeaders;
            }

            const headerKeys = Object.keys(headerConfig);
            const visibleHeaders = headerKeys.filter(key => headerConfig[key].show);
            setColumnDefs([
                ...visibleHeaders.map(key => ({
                    headerName: headerConfig[key].label,
                    field: key,
                    cellDataType: 'text',
                    flex: headerConfig[key].flex,
                    valueFormatter: key === 'status' ? (params: any) => params.value ? 'Active' : 'Pending' : undefined,
                })),
                {
                    headerName: 'Action',
                    field: 'action',
                    flex: 1.5,

                    cellRenderer: (params: any) => (
                        <ActionCell
                            data={params.data}
                            onEdit={(data) => handleEdit(data)}
                        />
                    ),
                }
            ]);
            setData(result);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        const syncData = async () => {
            await fetchData(dataType);
        }
        syncData();
    }, [editing])

    const handleEdit = async (item: any) => {
        if (dataType === 'users') {
            setEditing({ type: dataType, data: item });
        } else {
            setEditing({ type: dataType, data: item });
        }
    };

    const handleCancelEdit = () => {
        setEditing(null);
    };

    useEffect(() => {
        fetchData(dataType);
    }, [dataType, organizationId, organizations]);

    const handleButtonClick = (type: string, edit: boolean = false) => {
        setDataType(type);
        edit ? setEditing({ type, data: null }) : setEditing(null);
    };

    return (
        <div className='bg-gray-200 pb-10 p-2'>
            <div className='flex justify-between w-full mb-4 px-8'>
                <div className='flex flex-row gap-2'>
                    <Button type={`${dataType === 'companies' ? 'fill' : 'highlight'}`} handleOnClick={() => handleButtonClick('companies')}>Company</Button>
                    <Button type={`${dataType === 'users' ? 'fill' : 'highlight'}`} handleOnClick={() => handleButtonClick('users')}>Users</Button>
                </div>
                <Button type='fill' handleOnClick={() => handleButtonClick(dataType, true)}>Add {dataType[0].toUpperCase() + dataType.slice(1)}</Button>
            </div>
            <div className='flex flex-col gap-8'>
                {editing?.type === 'companies' &&
                    <Popup heading='' childClass='!max-w-[100%] max-h-[98vh] overflow-auto' onClose={() => setEditing(null)}>
                        <OrganizationForm data={editing.data} setEditing={setEditing} />
                    </Popup>
                }
            </div>
            {editing?.type === 'users' ? (
                <ResourcePermissionsGrid
                    user={editing.data}
                    onCancel={handleCancelEdit}
                />
            ) : (
                <div id="account_table" className="ag-theme-quartz rounded-lg">
                    <AgGridReact
                        columnDefs={columnDefs}
                        rowData={data}
                        defaultColDef={{ flex: 1, resizable: true, sortable: true, filter: false, suppressMovable: true, headerClass: 'custom-header', }}
                    />
                </div>
            )}
        </div>
    );
};

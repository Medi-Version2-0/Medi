import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { UserFormI } from '../../interface/global';
import Button from '../../components/common/button/Button';
import { ResourceI, ResourcePermissionsGridProps } from './types';
import HeaderCheckbox from '../../components/ag_grid/HeaderCheckBox';
import FormikInputField from '../../components/common/FormikInputField';
import CheckboxCellRenderer from '../../components/ag_grid/CheckBoxCellRenderer';
import { userValidationSchema } from './validation_schema';
import { getUserPermissions, updateUserPermissions } from '../../api/permissionsApi';
import { insertOrganizationUser, updateOrganizationUser } from '../../api/organizationUserApi';
import useToastManager from '../../helper/toastManager';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/types/globalTypes';
import { getAndSetPermssions } from '../../store/action/globalAction';

const ResourcePermissionsGrid: React.FC<ResourcePermissionsGridProps> = ({ user, onCancel }) => {
    const { organizationId } = useParams();
    const gridRef = useRef<any>(null);
    const { successToast, errorToast } = useToastManager();
    const dispatch = useDispatch<AppDispatch>()
    const [rowData, setRowData] = useState<ResourceI[]>([{
        id: 0,
        name: '',
        value : '',
        description: '',
        RolePermission: {
            createAccess: false,
            readAccess: false,
            updateAccess: false,
            deleteAccess: false,
        },
    }]);
    const [selectAllCreate, setSelectAllCreate] = useState(false);
    const [selectAllRead, setSelectAllRead] = useState(false);
    const [selectAllUpdate, setSelectAllUpdate] = useState(false);
    const [selectAllDelete, setSelectAllDelete] = useState(false);
    const [role, setRole] = useState<any>();
    const gridApi = useRef<any>(null);
    const initialValues: UserFormI = {
        name: user?.name || '',
        email: user?.email || ''
    }
    const formik = useFormik({
        initialValues,
        validationSchema: userValidationSchema,
        onSubmit: async (values) => {
            try {
                if (user && user.id) {
                    await updateOrganizationUser(Number(organizationId), user.id, values);
                    handleSave(user.id);
                } else {
                    const newUser: any = await insertOrganizationUser(Number(organizationId), values);
                    handleSave(newUser.userId);
                }
                successToast(`User has been successfully ${user?.id ? 'updated' : 'created'}`);
                onCancel && onCancel();
            } catch (error: any) {
                console.log("Error:-", error);
                if (error.message) {
                    errorToast(error.response.data.message || error.message);
                }
            }
        },
    });

    const getRoles = async (userId?: number) => {
        const roles: any = await getUserPermissions(Number(organizationId), userId);
        setRowData(roles.role.Resources);
        setRole(roles.role);
        return roles;
    }

    useEffect(() => {
        getRoles(user?.id);
    }, [user?.id]);

    const onGridReady = (params: any) => {
        gridApi.current = params.api;
    };

    const handleCheckboxChange = (resourceId: number, accessType: string, checked: boolean) => {
        gridApi.current.forEachNode((node: any) => {
            if (node.data.id === resourceId) {
                node.setDataValue(`RolePermission.${accessType}`, checked);
                if (accessType !== 'readAccess' && checked) {
                    node.setDataValue('RolePermission.readAccess', true);
                } else if (accessType === 'readAccess' && !checked) {
                    node.setDataValue('RolePermission.createAccess', false);
                    node.setDataValue('RolePermission.updateAccess', false);
                    node.setDataValue('RolePermission.deleteAccess', false);
                }
            }
        });
    };

    const handleSelectAllChange = (accessType: string, checked: boolean) => {
        if (accessType === 'readAccess') {
            setRowData(prevData =>
                prevData.map(resource => {
                    const updatedPermissions = { ...resource.RolePermission, [accessType]: checked };
                    if (!checked) {
                        updatedPermissions.createAccess = false;
                        updatedPermissions.updateAccess = false;
                        updatedPermissions.deleteAccess = false;
                    }
                    return { ...resource, RolePermission: updatedPermissions };
                })
            );
        } else {
            setRowData(prevData =>
                prevData.map(resource => {
                    const updatedPermissions = { ...resource.RolePermission, [accessType]: checked };
                    if (checked) {
                        updatedPermissions.readAccess = true;
                    }
                    return { ...resource, RolePermission: updatedPermissions };
                })
            );
        }
    };

    useEffect(() => {
        setSelectAllCreate(rowData.every(resource => resource.RolePermission.createAccess));
        setSelectAllRead(rowData.every(resource => resource.RolePermission.readAccess));
        setSelectAllUpdate(rowData.every(resource => resource.RolePermission.updateAccess));
        setSelectAllDelete(rowData.every(resource => resource.RolePermission.deleteAccess));
    }, [rowData]);

    const handleSave = async (userId: number) => {
        try {
            const permissionsData: any = [];
            gridRef.current?.api.forEachNode((node: any) => {
                if (node.data.id) {
                    permissionsData.push(node.data)
                }
            });
            const data = {
                id: role.id,
                Resources: permissionsData
            }
            await updateUserPermissions(Number(organizationId), userId, data);
            dispatch(getAndSetPermssions(organizationId))
        } catch (error) {
            console.error("Error saving permissions:-", error);
        }
    };

    const handleKeyDown = async (event: KeyboardEvent) => {
        if (event.code === 'Space') {
            event.preventDefault();
            const api = gridRef?.current?.api;
            const focusedCell = api.getFocusedCell();
            const { rowIndex, column } = focusedCell;
            const colId = column.colId;
            if (colId.includes('RolePermission')) {
                const cellData = api.getDisplayedRowAtIndex(rowIndex)?.data;
                const accessType = colId.split('.').pop();
                if (cellData && accessType) {
                    const newValue = !cellData.RolePermission[accessType];
                    handleCheckboxChange(cellData.id, accessType, newValue);
                    api.refreshCells({ rowNodes: [api.getDisplayedRowAtIndex(rowIndex)], force: true });
                }
            }
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const columnDefs: ColDef<ResourceI>[] = [
        { headerName: 'ID', field: 'id', editable: false },
        { headerName: 'Name', field: 'name', editable: false },
        {
            headerName: 'Read Access',
            field: 'RolePermission.readAccess',
            cellRenderer: (params: any) => (
                <CheckboxCellRenderer
                    id={`${params.data.id}readAccess`}
                    value={params.value}
                    onChange={checked => handleCheckboxChange(params.data.id, 'readAccess', checked)}
                />
            ),
            headerComponent: () => (
                <HeaderCheckbox
                    headerName='Read Access'
                    isChecked={selectAllRead}
                    onChange={checked => handleSelectAllChange('readAccess', checked)}
                />
            )
        },
        {
            headerName: 'Create Access',
            field: 'RolePermission.createAccess',
            cellRenderer: (params: any) => (
                <CheckboxCellRenderer
                    value={params.value}
                    onChange={checked => handleCheckboxChange(params.data.id, 'createAccess', checked)}
                />
            ),
            headerComponent: () => (
                <HeaderCheckbox
                    headerName={'Create Access'}
                    isChecked={selectAllCreate}
                    onChange={checked => handleSelectAllChange('createAccess', checked)}
                />
            )
        },
        {
            headerName: 'Update Access',
            field: 'RolePermission.updateAccess',
            cellRenderer: (params: any) => (
                <CheckboxCellRenderer
                    value={params.value}
                    onChange={checked => handleCheckboxChange(params.data.id, 'updateAccess', checked)}
                />
            ),
            headerComponent: () => (
                <HeaderCheckbox
                    headerName='Update Access'
                    isChecked={selectAllUpdate}
                    onChange={checked => handleSelectAllChange('updateAccess', checked)}
                />
            )
        },
        {
            headerName: 'Delete Access',
            field: 'RolePermission.deleteAccess',
            cellRenderer: (params: any) => (
                <CheckboxCellRenderer
                    value={params.value}
                    onChange={checked => handleCheckboxChange(params.data.id, 'deleteAccess', checked)}
                />
            ),
            headerComponent: () => (
                <HeaderCheckbox
                    headerName='Delete Access'
                    isChecked={selectAllDelete}
                    onChange={checked => handleSelectAllChange('deleteAccess', checked)}
                />
            )
        }
    ];
    return (
        <div>
            <div className='px-6'>
                <form onSubmit={formik.handleSubmit} className='flex flex-row gap-4 p-4 items-center bg-white rounded-md'>
                    <div className='flex gap-4 w-full h-full items-center'>
                        <FormikInputField
                            label='Name'
                            id='name'
                            name='name'
                            type='text'
                            className='!mb-0'
                            labelClassName='text-gray-600 min-w-[4vw] m-0'
                            formik={formik}
                            isPopupOpen={false}
                            nextField='email'
                            autoFocus={true}
                        />
                        <FormikInputField
                            label='Email'
                            id='email'
                            name='email'
                            type='email'
                            className='!mb-0'
                            labelClassName='text-gray-600 min-w-[4vw] m-0'
                            formik={formik}
                            isPopupOpen={false}
                            isTitleCase={false}
                            nextField='submit_all'
                            prevField='name'
                        />
                    </div>
                    <Button id='submit_all' btnType='submit' type='fill'>
                        Save
                    </Button>
                    <Button type='fog' handleOnClick={onCancel}>Cancel</Button>
                </form>
            </div>
            <div id="account_table" className="ag-theme-quartz max-h-[66vh]">
                <AgGridReact
                    ref={gridRef}
                    columnDefs={columnDefs}
                    rowData={rowData}
                    defaultColDef={{ flex: 1, resizable: true, sortable: true, editable: false, headerClass: 'custom-header' }}
                    onGridReady={onGridReady}
                />
            </div>
        </div>
    );
};

export default ResourcePermissionsGrid;

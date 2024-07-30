import { sendAPIRequest } from "../helper/api";


export const getUserPermissions = async (organizationId: number, userId: number = 0): Promise<any[]> => {
    const response = await sendAPIRequest<any[]>(`/${organizationId}/permissions/${userId}`);
    return response;
};

export const updateUserPermissions = async (organizationId: number, roleId: number, roleData: Partial<any> & { permissions?: any[] }): Promise<any> => {
    const response = await sendAPIRequest<any>(`/${organizationId}/permissions/${roleId}`, {
        method: 'POST',
        body: roleData,
    });
    return response;
};

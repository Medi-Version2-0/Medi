import { sendAPIRequest } from "../helper/api";


export const getUserPermissions = async ( userId: number = 0): Promise<any[]> => {
    const response = await sendAPIRequest<any[]>(`/permissions/${userId}`);
    return response;
};

export const updateUserPermissions = async ( roleId: number, roleData: Partial<any> & { permissions?: any[] }): Promise<any> => {
    const response = await sendAPIRequest<any>(`/permissions/${roleId}`, {
        method: 'POST',
        body: roleData,
    });
    return response;
};

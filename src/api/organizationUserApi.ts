import { sendAPIRequest } from "../helper/api";
import { UserFormI } from "../interface/global";

export const getOrganizationUsers = async (): Promise<UserFormI[]> => {
    const response = await sendAPIRequest<UserFormI[]>(`/user/organization`);
    return response;
};

export const insertOrganizationUser = async (user: UserFormI): Promise<UserFormI[]> => {
    const response = await sendAPIRequest<UserFormI[]>(`/user/organization`, {
        method: 'POST',
        body: JSON.stringify(user),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response;
}

export const updateOrganizationUser = async (userId: number, user: UserFormI): Promise<UserFormI[]> => {
    const response = await sendAPIRequest<UserFormI[]>(`/user/organization/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(user),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response;
}
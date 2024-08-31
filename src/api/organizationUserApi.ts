import { sendAPIRequest } from "../helper/api";
import { UserFormI } from "../interface/global";

export const getOrganizationUsers = async (): Promise<UserFormI[]> => {
    const response = await sendAPIRequest<UserFormI[]>(`/organization/users`);
    return response;
};

export const insertOrganizationUser = async (user: UserFormI): Promise<UserFormI[]> => {
    const response = await sendAPIRequest<UserFormI[]>(`/organization/user`, {
        method: 'POST',
        body: JSON.stringify(user),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response;
}

export const updateOrganizationUser = async (userId: number, user: UserFormI): Promise<UserFormI[]> => {
    const response = await sendAPIRequest<UserFormI[]>(`/organization/user/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(user),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response;
}
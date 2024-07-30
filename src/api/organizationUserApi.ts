import { sendAPIRequest } from "../helper/api";
import { UserFormI } from "../interface/global";

export const getOrganizationUsers = async (organizationId: number): Promise<UserFormI[]> => {
    const response = await sendAPIRequest<UserFormI[]>(`/${organizationId}/organization/users`);
    return response;
};

export const insertOrganizationUser = async (organizationId: number, user: UserFormI): Promise<UserFormI[]> => {
    const response = await sendAPIRequest<UserFormI[]>(`/${organizationId}/organization/user`, {
        method: 'POST',
        body: JSON.stringify(user),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response;
}

export const updateOrganizationUser = async (organizationId: number, userId: number, user: UserFormI): Promise<UserFormI[]> => {
    const response = await sendAPIRequest<UserFormI[]>(`/${organizationId}/organization/user/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(user),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response;
}
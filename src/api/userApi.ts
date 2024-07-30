import { sendAPIRequest } from "../helper/api";

export const updateUser = async (user: any) => {
    const response = await sendAPIRequest(`/user`, {
        method: 'PUT',
        body: user,
    });
    return response;
}
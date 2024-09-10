import { sendAPIRequest } from "../helper/api";
import { OrganizationI } from "../views/organization/types";

export const getOrganizations = async (userId: string | number = '') => {
    const response = await sendAPIRequest<OrganizationI[]>(`/organization`);
    return response;
}

export const createOrganization = async (organization: any, userId: number) => {
    const response = await await sendAPIRequest(`/organization`, {
        method: 'POST',
        body: organization,
    });
    return response;
}

export const updateOrganization = async (organizationId: Number | String, organization: any) => {
    const response = await sendAPIRequest(`/organization`, {
        method: 'PUT',
        body: organization,
    });
    return response;
}
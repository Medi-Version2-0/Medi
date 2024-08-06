import { TableConfig } from "../views/organization/types";

export const companyHeaders: TableConfig = {
    id: { label: 'ID', show: true, flex: 1 },
    name: { label: 'Name', show: true, flex: 1 },
    city: { label: 'City', show: true, flex: 1 },
    pinCode: { label: 'Pin Code', show: true, flex: 1 },
    contactEmail: { label: 'Email', show: true, flex: 2 },
};

export const userHeaders: TableConfig = {
    userId: { label: 'User ID', show: true, flex: 1 },
    name: { label: 'Name', show: true, flex: 1 },
    email: { label: 'Email', show: true, flex: 2 },
    status: { label: 'Status', show: true, flex: 1 }
};
export interface TableConfig {
    [key: string]: { label: string; show: boolean, flex: number, valueFormatter?: any };
}

export interface UserFormProps {
    data: {
        id?: number;
        name: string;
        phoneNumber?: string;
        altPhoneNumber?: string;
        address?: string;
        city?: string;
        pinCode?: string;
        aadharNumber?: string;
        email: string;
        status?: boolean;
    } | null;
    setEditing: (value: null) => void;
}

export interface UserFormInitialValues {
    name: string;
    phoneNumber: string;
    altPhoneNumber: string;
    address: string;
    city: string;
    pinCode: string;
    aadharNumber: string;
    email: string;
}

export interface OrganizationFormProps {
    data: {
        id?: Number;
        name: string;
        address: string;
        city: string;
        pinCode: string;
        jurisdiction: string;
        phoneNo1: string;
        phoneNo2: string;
        phoneNo3: string;
        contactEmail: string;
        drugLicenseNo20B: string;
        drugLicenseNo21B: string;
        macCode: string;
        gstNumber: string;
        fssaiNumber: string;
        corporateIdNumber: string;
        panNumber: string;
        tdsTanNumber: string;
    } | null;
    setEditing: (value: null) => void;
}

export interface OrganizationI {
    id?: number;
    name: string;
    address: string;
    city: string;
    pinCode: string;
    jurisdiction: string;
    phoneNo1: string;
    phoneNo2?: string;
    phoneNo3?: string;
    contactEmail: string;
    drugLicenseNo20B?: string;
    drugLicenseNo21B?: string;
    macCode?: string;
    gstNumber?: string;
    fssaiNumber?: string;
    corporateIdNumber?: string;
    panNumber?: string;
    tdsTanNumber?: string;
}

export interface ResourceI {
    id: number;
    value: string;
    name: string;
    description: string;
    RolePermission: {
        createAccess: boolean;
        readAccess: boolean;
        updateAccess: boolean;
        deleteAccess: boolean;
    };
}

export interface ResourcePermissionsGridProps {
    id?: string;
    user?: any;
    onCancel: () => void;
}
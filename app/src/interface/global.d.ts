export interface StationFormData {
    station_id?: string;
    station_name: string;
    cst_sale?: string;
    station_state?: string;
    station_pinCode?: string;
    station_headQuarter: string;
    state_code?: Number;
  }

  export interface LedgerFormData {
    party_id?: string;
    partyName: string;
    station_name: string;
    openingBal: string;
    isPredefinedParty?: boolean, 
  }

  export interface AccountGroupFormData {
    head_code?: string;
    head_name: string;
    parent_code: string;
    group_details: any;
  }


  export interface GroupFormData {
    group_code?: string;
    group_name: string;
    parent_code: string | null;
    type: string;
    isPredefinedGroup?: boolean,    
  }
  export interface SubGroupFormData {
    group_code?: string;
    group_name: string;
    parent_group?: string;
    parent_code?: Number;
    type: string;
    isPredefinedGroup?: boolean,    
  }

  export interface CreateStationProps {
    togglePopup: Function;
    data: StationFormData;
    handelFormSubmit: any;
    isDelete: any;
    deleteAcc: (station_id: string) => void;
  }

  export interface CreateAccountGroupProps {
    togglePopup: Function;
    data: AccountGroupFormData;
    handelFormSubmit: any;
    isDelete: any;
    deleteAcc: (station_id: string) => void;
  }
  export interface FormDataProps {
    station_name: string;
    cst_sale: string;
    station_state: string;
    station_pinCode: string;
    station_headQuarter: string;
  }

  export interface GroupFormDataProps {
    group_name: string;
    type: string;
  }
  export interface SubGroupFormDataProps {
    group_name: string;
    parent_group: string;
    type: string;
  }
  export interface CreateGroupProps {
    togglePopup: Function;
    data: GroupFormData;
    handelFormSubmit: any;
    isDelete: any;
    deleteAcc: (group_code: string) => void;
  }

  export interface CreateSubGroupProps {
    togglePopup: Function;
    data: SubGroupFormData;
    handelFormSubmit: any;
    isDelete: any;
    deleteAcc: (group_code: string) => void;
  }


  export interface PopupProps {
    togglePopup?: Function;
    heading: string;
    children: any;
    className?: string;
  }

  export interface Confirm_Alert_PopupProps {
    isAlert?: boolean;
    onClose?: () => void;
    onConfirm?: () => void;
    message: string;
  }

  export interface State {
    state_code: Number;
    state_name: string;
    union_territory: boolean;
}

interface Option {
  value: string;
  label: string;
}

export interface SalesPurchaseFormData {
  spType?: string;
  salesPurchaseType?: string;
  igst?: Number | null;
  cgst?: Number;
  sgst?: Number,    
  stper?: Number,    
  surCharge?: Number,    
  spNo?: Number,    
  column?: Number,    
  shortName?: string,    
  shortName2?: string,    
}
interface SalesPurchaseProps {
  data?:any;
  type?: any;
  formik?: any;
}
interface SalesPurchaseTableProps {
  type?: any;
}
interface SpSubSectionProps {
  type?: any;
  formik: any;
}
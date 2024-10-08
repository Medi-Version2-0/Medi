export interface StationFormData {
  Sno?: string;
  station_id?: string;
  station_name: string;
  igst_sale?: string;
  station_pinCode?: string;
  station_headQuarter?: string;
  state_code?: string;
}

export interface LedgerFormData {
  party_id?: string;
  partyName: string;
  station_name: string;
  openingBal: string;
  isPredefinedLedger?: boolean;
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
  parent_code?: string | null;
  type: string;
  isPredefinedGroup?: boolean;
}

export interface ItemGroupFormData {
  group_code?: string;
  group_name: string;
  type: string;
}
export interface SubGroupFormData {
  group_code?: string;
  group_name: string;
  parent_code?: string;
}

export interface CreateStationProps {
  togglePopup: Function;
  data: StationFormData;
  handleConfirmPopup?: any;
  isDelete: any;
  handleDeleteFromForm?: () => void;
  className?: string;
  states?: any[];
  focusChain?: string[]
}

export interface CreateHeadQuarterProps extends CreateStationProps {
  stations: any[];
}
export interface CreateBillProps {
  togglePopup: Function;
  data: BillBookFormData;
  handleConfirmPopup: any;
  isDelete: any;
  handleDeleteFromForm: () => void;
  className?: string;
  selectedSeries: string;
  billBookData: any[];
}

export interface CreateSalePurchaseProps {
  type?: string;
  togglePopup: Function;
  data: SalesPurchaseFormData;
  handleConfirmPopup: any;
  isDelete: any;
  handleDeleteFromForm: () => void;
  className?: string;
  formik?: any;
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
  igst_sale?: string;
  state_code: string;
  station_pinCode: string;
  station_headQuarter: string;
}
export interface schemeSectionFormProps {
  scheme1: number | null;
  scheme2?: number | null;
}

export interface GroupFormDataProps {
  group_name: string;
  type: string;
}
export interface ItemGroupFormDataProps {
  group_name: string;
  type: string;
}

export interface BatchForm {
  id?: number;
  itemId: number;
  batchNo: any;
  mfgCode?: string;
  expiryDate: string;
  opBalance: number | null;
  currentStock: number | null;
  opFree: number | null;
  purPrice: number | null;
  salePrice: number | null;
  salePrice2?: number | null;
  mrp: number | null;
  locked: string;
}
export interface BillBookForm {
  id?: number;
  seriesId?: number;
  seriesName?: string;
  billName: string;
  billBookPrefix: string;
  company: string;
  billType: string;
  orderOfBill: number | null;
  locked: string;
}
export interface BillBookFormData {
  id?: number;
  seriesId?: number;
  billName: string;
  billBookPrefix: string;
  company: string;
  billType: string;
  orderOfBill: string;
  locked: string;
}

export interface BillBookFormDataProps {
  billName: string;
  billBookPrefix?: string;
  company: string;
  billType: string;
  orderOfBill: number | null;
  locked: string;
}

export interface CreateItemGroupProps {
  togglePopup: Function;
  data: ItemGroupFormData;
  handleConfirmPopup?: any;
  isDelete: any;
  handleDeleteFromForm?: () => void;
  className?: string;
  focusChain?: string[]
}
export interface SubGroupFormDataProps {
  group_name: string;
  parent_code: string;
}
export interface CreateGroupProps {
  togglePopup: Function;
  data: GroupFormData;
  handleConfirmPopup: any;
  isDelete: any;
  handleDeleteFromForm: () => void;
  className?: string;
}

export interface ItemSettingProps {
  togglePopup: Function;
  heading: string;
  fields: any;
  initialValues: any;
  className?: string;
}

export interface CreateSubGroupProps {
  togglePopup: Function;
  data: SubGroupFormData;
  handleConfirmPopup: any;
  isDelete: any;
  handleDeleteFromForm: () => void;
  className?: string;
  groupList: any[];
}

export interface PopupProps {
  togglePopup?: Function;
  heading?: string;
  children: any;
  className?: string;
  childClass?: string;
  onClose?: () => void;
  isSuggestionPopup?: boolean;
  id?: string;
  focusChain?: string[];
}

export interface Confirm_Alert_PopupProps {
  isAlert?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  className?: string;
  onAdd?: () => void;
  addText?: string;
  id : string;
}

export interface State {
  state_code: number;
  state_name: string;
  union_territory: boolean;
}

interface Option {
  id?: number;
  value: string | undefined | number | boolean;
  label: string | undefined;
}

export interface SalesPurchaseFormData {
  sp_id?: string;
  sptype?: string;
  salesPurchaseType?: string;
  igst?: string | number;
  cgst?: Number;
  sgst?: Number;
  stper?: Number;
  surCharge?: number | string;
  spNo?: Number;
  column?: Number;
  shortName?: string;
  shortName2?: string;
  openingBal?: string | number;
  openingBalType?: string;
}

export interface SalesPurchaseFormProps {
  sptype?: string;
  salesPurchaseType?: string;
  igst?: Number | null | string;
  cgst?: Number;
  sgst?: Number;
  stper?: Number;
  surCharge?: Number | string;
  spNo?: Number;
  column?: Number;
  shortName?: string;
  shortName2?: string;
}

interface SalesPurchaseProps {
  data?: any;
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
export interface StoreFormData {
  store_code?: string;
  store_name: string;
  address1: string;
  address2: string;
  address3: string;
  isPredefinedStore: boolean;
}
export interface StoreFormDataProps {
  store_name: string;
  address1: string;
  address2: string;
  address3: string;
}
export interface CreateStoreProps {
  togglePopup: Function;
  data: StoreFormData;
  handleConfirmPopup: any;
  isDelete: any;
  handleDeleteFromForm: () => void;
  className?: string;
}

export interface CompanyFormData {
  company_id?: string;
  companyName: string;
  stationName: string;
  openingBal: string;
  openingBalType: string;
}
export interface PartyWiseDiscountFormData {
  discount_id?: number;
  companyId: number;
  discountType: string;
  partyId: number;
  discount: number;
}

export interface BatchForm {
  id?: number;
  itemId: number;
  batchNo: string;
  expiryDate: string;
  opBalance: number | null;
  opFree: number | null;
  purPrice: number | null;
  salePrice: number | null;
  mrp: number | null;
  locked: string;
}

export interface ItemFormData {
  id?: string;
  name: string;
  service: string;
  shortName: string;
  packing: Number;
  companyId: string;
  itemGroupCode: string;
  saleAccId?: string;
  purAccId?: string;
}
export interface DeliveryChallanFormData {
  id?: string;
  challanNumber: string;
  partyId: string;
  stationId: string;
  mrp: Number;
}

export interface AccountGroupFormData {
  head_code?: string;
  head_name: string;
  parent_code: string;
  group_details: any;
}

export interface View {
  type: string;
  data: Record<string, string | number>;
}

export interface ledgerSettingProps {
  togglePopup: Function;
  heading: string;
  fields: any;
  initialValues: any;
  className?: string;
}

export interface UserFormI {
  id?: number;
  name: string;
  phoneNumber?: string;
  altPhoneNumber?: string;
  address?: string;
  city?: string;
  pinCode?: string;
  aadharNumber?: string;
  email: string;
  password?: string;
  role?: number;
  status?: boolean;
}
export interface schemeSectionProps {
  togglePopup: Function;
  heading?: string;
  setSchemeValue: any;
  setOpenDataPopup?: any;
  className?: string;
}
export interface dropDownPopupProps {
  heading: string;
  setOpenDataPopup?: any;
  className?: string;
  headers?: any;
  tableData?: any;
  setCurrentSavedData?: any;
  dataKeys?: any;
}

export interface selectListProps {
  heading: string;
  closeList: () => void;
  className?: string;
  headers: any[];
  footers?: any[];
  footerClass?: string;
  tableData: any[];
  handleSelect: (rowData: any) => void;
  dataKeys?: any;
  selectMultiple?: boolean;
  rightAlignCells?: any[];
}
export type Mapping = { [key: number | string]: string };
export interface Voucher {
  voucherDate: Date;
  voucherNumber: number;
  partyId: number;
  amount: number;
  discount: number;
  voucherType: string;
  narration: string;
  discNarration: string;
  debitOrCredit: DebitCreditEnum;
  organizationId: number;
  createdBy: number;
  updatedBy: number;
}

export interface DrugLicenceSectionProps {
  togglePopup: Function;
  className?: string;
  setDLNo?: any;
}
export interface DrugLicenceSectionFormProps {
  drugLicenceNo1: string;
}

export interface saleBillFormValues {
  billBookSeriesId: string;
  oneStation: string;
  stationId: string;
  partyId: string;
  balance: number;
  terms: string; // ki vo cash h ya credit h
  invoiceNumber: string;
  drugLicenceNo1: string;
  date: string;
  gstNo: string;
  grNo: string;
  despDate: string;
  packingSlipNo: string;
  transport: string;
  narration: string;
  tempName: string;
  eWay: string;
  cases: string;
  oldPartyId: string;
}

export type FieldConfig = {
  label: string;
  id: string;
  name: string;
  type?: string;
  isRequired?: boolean;
  disableArrow?: boolean;
  hidePlaceholder?: boolean;
  isSearchable?: boolean;
  options?: Option[];
  nextField?: string;
  prevField?: string;
  sideField?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  labelClassName?: string;
  textFieldClassName?: string;
  minLength?: number; 
  maxLength?: number;
  max?: number
  isTitleCase?: boolean;
  value? : string;
  onFocus?: () => void;
  onChange?: (e:any) => void;
  onBlur?: () => void;
  onClick?: ()=> void;
  readOnly?: boolean;
};

export type SaleBillFormInfoType = FormikProps<saleBillFormValues>;
export type StationFormInfoType = FormikProps<FormDataProps>;
export type ItemGroupFormInfoType = FormikProps<ItemGroupFormDataProps>;
export type ItemFormInfoType = FormikProps<ItemFormValues>;
export interface partyLockedSetup {
  partyName: string,
  partyId?: number,
  locked: string,
  closingBalance: number | string,
  closingBalanceType: string,
}

export interface godownSetup{
  godownName: string,
}

export interface SelectListTableProps {
  heading: string;
  headers: { label: string; key: string; auto?: boolean; isInput?: boolean }[];
  tableData: any[];
  currentStocks: number;
  focusedColumn?: number;
  closeList: () => void;
  rowDataDuringUpdation: any;
  setGodownDataDuringCreate: any;
}

export interface popupOptions {
  isModalOpen: boolean;
  isAlertOpen: boolean;
  message: string;
}
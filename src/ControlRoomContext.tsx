// src/controlRoomContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  Dispatch,
  useEffect,
  SetStateAction,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from './UserContext';
import { useDispatch } from 'react-redux'
import { setControlRoomSettings } from './store/action/globalAction';
import useApi from './hooks/useApi';
export interface ControlFields {
  //LEDGER
  multiplePriceList: boolean;
  printPartyBalance: boolean;
  priceListLock: boolean;
  showTcsColumnOnPurchase: boolean;
  makeEwayBill: boolean;
  enablePriceListMode: boolean;
  fssaiNumber: boolean;
  //ITEMS
  batchWiseManufacturingCode: boolean;
  allowItemAsService: boolean;
  generateBarcodeBatchWise: boolean;
  rxNonrx: boolean;
  dpcoAct: boolean;
  dpcoDiscount: number;
  packaging: boolean;
  multiPriceList: boolean;
  salesPriceLimit: number;
  rackNumber: boolean;
  //GENERAL
  gstRefundBenefit: boolean;
  itemWiseDiscount: boolean;
  showItemSpecialRate: boolean;
  specialSale: boolean;
  displayRackLocation: boolean;
  rxNonrxGeneral: boolean;
  pricewisePartyList: boolean;
  salePriceListOptionsAllowed: boolean;
  printPriceToRetailer: boolean;
  removeStripOption: boolean;
  defaultDownloadPath: boolean;
  decimalValue: boolean;
  decimalValueCount: number;
  // station
  igstSaleFacility: boolean;
  // invoice
  stockNegative: boolean;
  ifItemRepeatedInBill: boolean;
  stopCursorAtInvoice: boolean;
  schemeColPercentRequired: boolean;
  showMFGCompanyWithItem: boolean;
  invoiceWithoutHavingStock: boolean;
  saveEntryTimeOfInvoice: boolean;
  lossWarningOfInvoice: boolean;
  numberOfCopiesInInvoice: number;
  cursorAtSave: boolean;
  smsOfInvoice: boolean;
  shippingAddressRequired: boolean;
}

interface ControlRoomContextType {
  controlRoomSettings: ControlFields;
  updateControlRoomSettings: Dispatch<SetStateAction<ControlFields>>;
  updateControls: (value: object) => Promise<void>;
}

const defaultSettings: ControlFields = {
  multiplePriceList: true,
  printPartyBalance: false,
  priceListLock: false,
  showTcsColumnOnPurchase: false,
  makeEwayBill: false,
  enablePriceListMode: false,
  fssaiNumber: false,
  batchWiseManufacturingCode: false,
  allowItemAsService: false,
  generateBarcodeBatchWise: false,
  rxNonrx: false,
  dpcoAct: false,
  dpcoDiscount: 0,
  packaging: false,
  multiPriceList: false,
  salesPriceLimit: 0,
  rackNumber: false,
  gstRefundBenefit: false,
  itemWiseDiscount: false,
  showItemSpecialRate: false,
  specialSale: false,
  displayRackLocation: false,
  rxNonrxGeneral: false,
  pricewisePartyList: false,
  salePriceListOptionsAllowed: false,
  printPriceToRetailer: false,
  removeStripOption: false,
  defaultDownloadPath: false,
  igstSaleFacility: false,
  stockNegative: false,
  ifItemRepeatedInBill: false,
  stopCursorAtInvoice: false,
  schemeColPercentRequired: true,
  showMFGCompanyWithItem: true,
  invoiceWithoutHavingStock: false,
  saveEntryTimeOfInvoice: true,
  lossWarningOfInvoice: true,
  numberOfCopiesInInvoice: 1,
  cursorAtSave: false,
  smsOfInvoice: false,
  shippingAddressRequired: false,
  decimalValue: false, 
  decimalValueCount: 2
};

const controlRoomContext = createContext<ControlRoomContextType | undefined>(
  undefined
);

export const ControlRoomProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { sendAPIRequest } = useApi();
  const dispatch = useDispatch()
  //TO-DO: Add default settings if custom settings not available
   const [controlRoomSettings, updateControlRoomSettings] =
    useState<ControlFields>(defaultSettings);
  const { data, isPending } = useQuery<any>({
    queryKey: ['get-controlSettings'],
    queryFn: () => sendAPIRequest<any>(`/controlRoom`),
    enabled: !!user?.email, // api call only when user is authenticated
  });

  useEffect(() => {
    !isPending && data && getControls();
  }, [data]);
  const getControls = async () => {
    updateControlRoomSettings(data)
    dispatch(setControlRoomSettings(data))
  };

  const updateControls = async (values: object) => {
    try {
      await sendAPIRequest(`/controlRoom`, {
        method: 'PUT',
        body: values,
      });
      queryClient.invalidateQueries({
        queryKey: ['get-controlSettings'],
      });
    } catch (error) {
      const e = error as Error;
      throw new Error(e.message);
    }
  };

  return (
    <controlRoomContext.Provider
      value={{
        controlRoomSettings,
        updateControlRoomSettings,
        updateControls,
      }}
    >
      {children}
    </controlRoomContext.Provider>
  );
};

export const useControls = (): ControlRoomContextType => {
  const context = useContext(controlRoomContext);
  if (!context) {
    throw new Error('useControls must be used within a ControlRoomProvider');
  }
  return context;
};

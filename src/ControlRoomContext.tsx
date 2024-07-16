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
import { sendAPIRequest } from './helper/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from './UserContext';
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
  dpcoAct: number;
  packaging: boolean;
  dualPriceList: boolean;
  rackNumber:boolean;
  //GENERAL
  gstRefundBenefit: boolean;
  itemWiseDiscount: boolean;
  showItemSpecialRate: boolean;
  specialSale: boolean;
  displayRackLocation: boolean;
  rxNonrxGeneral: boolean;
  salePriceListOptionsAllowed: boolean;
  printPriceToRetailer: boolean;
  removeStripOption: boolean;
  defaultDownloadPath: boolean;
  // station
  igstSaleFacility: boolean;
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
  dpcoAct: 0,
  packaging: false,
  dualPriceList: false,
  rackNumber:false,
  gstRefundBenefit: false,
  itemWiseDiscount: false,
  showItemSpecialRate: false,
  specialSale: false,
  displayRackLocation: false,
  rxNonrxGeneral: false,
  salePriceListOptionsAllowed: false,
  printPriceToRetailer: false,
  removeStripOption: false,
  defaultDownloadPath: false,
  igstSaleFacility: false,
};

const controlRoomContext = createContext<ControlRoomContextType | undefined>(
  undefined
);

export const ControlRoomProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const { selectedCompany } = useUser();
  //TO-DO: Add default settings if custom settings not available
  const [controlRoomSettings, updateControlRoomSettings] =
    useState<ControlFields>(defaultSettings);

  const { data, isPending } = useQuery<any>({
    queryKey: ['get-controlSettings'],
    queryFn: () => sendAPIRequest<any>(`/${selectedCompany}/controlRoom`),
  });

  useEffect(() => {
    !isPending && data && getControls();
  }, [data]);

  const getControls = async () => {
    updateControlRoomSettings(data);
  };

  const updateControls = async (values: object) => {
    try {
      await sendAPIRequest(`/${selectedCompany}/controlRoom`, {
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

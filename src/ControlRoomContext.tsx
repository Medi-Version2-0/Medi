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
  gstRefundBenefit: boolean;
  displayRackLocation: boolean;
  batchWiseManufacturingCode: boolean;
  itemWiseDiscount: boolean;
  noStockWarning: boolean;
  showQuantityDiscount: boolean;
  showeItemSpecialRate: boolean;
  allowItemAsService: boolean;
  generateBarcodeBatchWise: boolean;
}

interface ControlRoomContextType {
  controlRoomSettings: ControlFields;
  updateControlRoomSettings: Dispatch<SetStateAction<ControlFields>>;
  updateControls: (value:object) => Promise<void>;
}

const defaultSettings: ControlFields = {
  multiplePriceList: true,
  printPartyBalance: false,
  priceListLock: false,
  showTcsColumnOnPurchase: false,
  makeEwayBill: false,
  enablePriceListMode: false,
  fssaiNumber: false,
  //ITEMS
  gstRefundBenefit: false,
  displayRackLocation: false,
  batchWiseManufacturingCode: false,
  itemWiseDiscount: false,
  noStockWarning: false,
  showQuantityDiscount: false,
  showeItemSpecialRate: false,
  allowItemAsService: false,
  generateBarcodeBatchWise: false,
};

const controlRoomContext = createContext<ControlRoomContextType | undefined>(undefined);

export const ControlRoomProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const {selectedCompany } = useUser();
  //TO-DO: Add default settings if custom settings not available
  const [controlRoomSettings, updateControlRoomSettings] = useState<ControlFields>(defaultSettings);

  const { data } = useQuery<any>({
    queryKey: ['get-controlSettings'],
    queryFn: () => sendAPIRequest<any>(`/${selectedCompany}/controlRoom`),
  });

  useEffect(() => {
    if(data){
      updateControlRoomSettings(data);
    }
  }, [data]);

  const updateControls = async (values: object) => {
    try {
      await sendAPIRequest(`/${selectedCompany}/controlRoom`, {
        method: 'PUT',
        body: values,
      });
      queryClient.invalidateQueries({queryKey: ['get-controlSettings']});
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

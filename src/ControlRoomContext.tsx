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

export interface ControlFields {
  multiplePriceList: boolean;
  printPartyBalance: boolean;
  priceListLock: boolean;
  purchaseTC: boolean;
  eWayBillNo: boolean;
  priceListM: boolean;
}

interface ControlRoomContextType {
  controlRoomSettings: ControlFields;
  getControls: () => Promise<void>;
  // setControls: () => Promise<void>;
  updateControlRoomSettings: Dispatch<SetStateAction<ControlFields>>;
  updateControls: (
    multiplePriceList: boolean,
    printPartyBalance: boolean,
    priceListLock: boolean,
    purchaseTC: boolean,
    eWayBillNo: boolean,
    priceListM: boolean
  ) => Promise<void>;
}

const defaultSettings: {
  multiplePriceList: boolean;
  printPartyBalance: boolean;
  priceListLock: boolean;
  purchaseTC: boolean;
  eWayBillNo: boolean;
  priceListM: boolean;
} = {
  multiplePriceList: true,
  printPartyBalance: false,
  priceListLock: false,
  purchaseTC: false,
  eWayBillNo: false,
  priceListM: false,
};

// const apiUrl = process.env.REACT_APP_API_URL;

const controlRoomContext = createContext<ControlRoomContextType | undefined>(undefined);

export const ControlRoomProvider = ({ children }: { children: ReactNode }) => {
  //TO-DO: Add default settings if custom settings not available
  const [controlRoomSettings, updateControlRoomSettings] = useState<ControlFields>(defaultSettings);

  // const setControls = async () => {
  //   try{
  //     const 
  //   }
  // }
  useEffect(() => {
    getControls();
  }, [])

  const getControls = async () => {
    try {
      const response = await sendAPIRequest<ControlFields>('/controlRoom');
      console.log("response ---> ", response)
      updateControlRoomSettings(response);
    } catch (error) {
      const e = error as Error;
      throw new Error(e.message);
    }
  };

  const updateControls = async (
    multiplePriceList: boolean,
    printPartyBalance: boolean, 
    priceListLock: boolean,
    purchaseTC: boolean,
    eWayBillNo: boolean,
    priceListM: boolean
  ) => {
    try {
      await sendAPIRequest(`/controlRoom/1`, {
        method: 'PUT',
        body: {
          multiplePriceList,
          printPartyBalance,
          priceListLock,
          purchaseTC,
          eWayBillNo,
          priceListM,
        },
      });
      // updateControlRoomSettings({
      //   multiplePriceList,
      //   printPartyBalance,
      //   priceListLock,
      //   purchaseTC,
      //   eWayBillNo,
      //   priceListM,
      // });
      getControls();
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
        getControls,
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

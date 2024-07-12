
export interface ledgerSettingField {
    label: string;
    id: string;
    name: string;
  }

  export const ledgerSettingFields: ledgerSettingField[] = [
  
    {
      label: 'Two price list required',
      id: 'multiplePriceList',
      name: 'multiplePriceList',
    },
    {
      label: 'Print party balance as message on bill',
      id: 'printPartyBalance',
      name: 'printPartyBalance',
    },
    {
      label: 'Price List Lock',
      id: 'priceListLock',
      name: 'priceListLock',
    },
    {
      label: 'Show TCS Column on Purchase',
      id: 'showTcsColumnOnPurchase',
      name: 'showTcsColumnOnPurchase',
    },
    {
      label: 'Make E-Way Bill',
      id: 'makeEwayBill',
      name: 'makeEwayBill',
    },
    {
      label: 'Enable Price List Mode',
      id: 'enablePriceListMode',
      name: 'enablePriceListMode',
    },
    {
      label: 'FSSAI Number',
      id: 'fssaiNumber',
      name: 'fssaiNumber',
    },
  ];
  
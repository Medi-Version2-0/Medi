export interface SettingField {
  label: string;
  id: string;
  name: string;
}

export const ledgerSettingFields: SettingField[] = [
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

export const itemSettingFields: SettingField[] = [
  {
    label: 'Generate barcode batchwise',
    id: 'generateBarcodeBatchWise',
    name: 'generateBarcodeBatchWise',
  },
  {
    label: 'Allow item as service',
    id: 'allowItemAsService',
    name: 'allowItemAsService',
  },

  {
    label: 'Show quantity discount',
    id: 'showQuantityDiscount',
    name: 'showQuantityDiscount',
  },

  {
    label: 'Batch-wise manufacturing code',
    id: 'batchWiseManufacturingCode',
    name: 'batchWiseManufacturingCode',
  },
  {
    label: 'RX and Non RX item',
    id: 'rxNonrx',
    name: 'rxNonrx',
  },
  {
    label: 'DPCO Act',
    id: 'dpcoAct',
    name: 'dpcoAct',
  },
  {
    label: 'Pakaging',
    id: 'packaging',
    name: 'packaging',
  },
  {
    label: 'Party-wise price list',
    id: 'partyWisePriceList',
    name: 'partyWisePriceList',
  },
];

export const generalSettingFields: SettingField[] = [
  {
    label: 'GST refund benefit',
    id: 'gstRefundBenefit',
    name: 'gstRefundBenefit',
  },
  {
    label: 'Show item special rate',
    id: 'showItemSpecialRate',
    name: 'showItemSpecialRate',
  },
  {
    label: 'Special sale',
    id: 'specialSale',
    name: 'specialSale',
  },
  {
    label: 'Sale price list options allowed',
    id: 'salePriceListOptionsAllowed',
    name: 'salePriceListOptionsAllowed',
  },
  {
    label: 'Print price to retailer',
    id: 'printPriceToRetailer',
    name: 'printPriceToRetailer',
  },
  {
    label: 'Remove strip option',
    id: 'removeStripOption',
    name: 'removeStripOption',
  },
  {
    label: 'Default download path',
    id: 'defaultDownloadPath',
    name: 'defaultDownloadPath',
  },
  {
    label: 'Item-wise discount',
    id: 'itemWiseDiscount',
    name: 'itemWiseDiscount',
  },

  {
    label: 'Display rack location',
    id: 'displayRackLocation',
    name: 'displayRackLocation',
  },
  {
    label: 'RX and Non RX item',
    id: 'rxNonrxGeneral',
    name: 'rxNonrxGeneral',
  },
];

export const stationSettingFields: SettingField[] = [  
  {
    label: 'IGST Sale Facility',
    id: 'igstSaleFacility',
    name: 'igstSaleFacility',
  },
]; 
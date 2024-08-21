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
    label: 'Generate Barcode Batchwise',
    id: 'generateBarcodeBatchWise',
    name: 'generateBarcodeBatchWise',
  },
  {
    label: 'Items As Service',
    id: 'allowItemAsService',
    name: 'allowItemAsService',
  },

  {
    label: 'Batch-wise MFG',
    id: 'batchWiseManufacturingCode',
    name: 'batchWiseManufacturingCode',
  },
  {
    label: 'RX/Non-RX Item',
    id: 'rxNonrx',
    name: 'rxNonrx',
  },
  {
    label: 'DPCO Act',
    id: 'dpcoAct',
    name: 'dpcoAct',
  },
  {
    label: 'Packaging',
    id: 'packaging',
    name: 'packaging',
  },
  {
    label: 'Rack No.',
    id: 'rackNumber',
    name: 'rackNumber',
  },
  {
    label: 'Multi-Price List',
    id: 'multiPriceList',
    name: 'multiPriceList',
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
  {
    label: 'PartyWise Price List',
    id: 'pricewisePartyList',
    name: 'pricewisePartyList',
  },
];

export const stationSettingFields: SettingField[] = [  
  {
    label: 'IGST Sale Facility',
    id: 'igstSaleFacility',
    name: 'igstSaleFacility',
  },
]; 
export const invoiceSettingFields: SettingField[] = [  
  {
    label: 'Stock Negative Allowed',
    id: 'stockNegative',
    name: 'stockNegative',
  },
  {
    label: 'Indicate if Item Repeated in Bill',
    id: 'ifItemRepeatedInBill',
    name: 'ifItemRepeatedInBill',
  },
  {
    label: 'Stop Cursor at Invoice No., Date, GRNO. and etc.',
    id: 'stopCursorAtInvoice',
    name: 'stopCursorAtInvoice',
  },
  {
    label: 'Scheme Col. Percent/Rupees/Rs. Per PC. Required',
    id: 'schemeColPercentRequired',
    name: 'schemeColPercentRequired',
  },
  {
    label: 'Show MFG. Company name with Item name',
    id: 'showMFGCompanyWithItem',
    name: 'showMFGCompanyWithItem',
  },
  {
    label: 'Invoice Without having Stock',
    id: 'invoiceWithoutHavingStock',
    name: 'invoiceWithoutHavingStock',
  },
  {
    label: 'Save Entry Time of Invoice & Challan',
    id: 'saveEntryTimeOfInvoice',
    name: 'saveEntryTimeOfInvoice',
  },
  {
    label: 'Loss Warning in Invoice',
    id: 'lossWarningOfInvoice',
    name: 'lossWarningOfInvoice',
  },
  {
    label: 'Number of Copies by Default in Invoice Print',
    id: 'numberOfCopiesInInvoice',
    name: 'numberOfCopiesInInvoice',
  },
  {
    label: 'Cursor at Save In Place of Pring & Save',
    id: 'cursorAtSave',
    name: 'cursorAtSave',
  },
  {
    label: 'SMS of Invoice',
    id: 'smsOfInvoice',
    name: 'smsOfInvoice',
  },
  {
    label: 'Shipping Address Required',
    id: 'shippingAddressRequired',
    name: 'shippingAddressRequired',
  },
]; 
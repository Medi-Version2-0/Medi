export const headers = [
  { name: 'Item name', key: 'itemId', width: '15%' },
  { name: 'Batch no', key: 'batchNo', width: '15%' },
  { name: 'Qty', key: 'qty', width: '5%' },
  { name: 'Scheme', key: 'scheme', width: '7%' },
  { name: 'Scheme type', key: 'schemeType', width: '10%' },
  { name: 'Rate', key: 'rate', width: '5%' },
  { name: 'Dis.%', key: 'disPer', width: '5%' },
  { name: 'Amt', key: 'amt', width: '5%' },
  { name: 'MRP', key: 'mrp', width: '5%' },
  { name: 'Exp. Date', key: 'expDate', width: '8%' },
  { name: 'Tax type', key: 'taxType', width: '15%' },
  { name: 'GST', key: 'gstAmount', width: '5%' },
];

export const schemeTypeOptions = [
  { label: 'Pieces', value: 'P' },
  { label: 'Percent', value: '%' },
  { label: 'Rupees', value: 'R' },
  { label: 'Rupees / PC', value: '/' },
];

export const itemHeader = [
  { label: 'ID', key: 'id' },
  { label: 'Name', key: 'name' },
  { label: 'Company', key: 'company' },
  { label: 'Sales', key: 'sales' },
  { label: 'Purchase', key: 'purchase' },
];

export const batchHeader = [
  { label: 'ID', key: 'id' },
  { label: 'Batch', key: 'batchNo' },
  { label: 'Current Stock', key: 'currentStock' },
  { label: 'Expiry Date', key: 'expiryDate' },
  { label: 'Locked', key: 'locked' },
  { label: 'Scheme', key: 'opFree' },
];

export const itemFooter = [
  { label: 'Discount Per', key: 'discountPer' },
  { label: 'DPCOACT', key: 'dpcoact' },
  { label: 'Schedule Drug', key: 'scheduleDrug' },
  { label: 'Sales', key: 'sales' },
  { label: 'Purchase', key: 'purchase' },
  { label: 'Scheme', key: 'updatedOpFree' },
];

export const itemFooters = [
  {
    label: 'Item Info',
    data: [
      { label: 'Item name', key: "name" },
      { label: 'Company', key: 'company' },
      { label: 'DPCOAct', key: 'dpcoact' },
      { label: 'HSN/SAC', key: 'hsnCode' },
    ]
  },
  {
    label: 'Tax Info',
    data: [
      { label: 'Sales', key: "sales" },
      { label: 'Purchase', key: 'purchase' },
    ]
  },
  {
    label: 'Other Info',
    data: [
      { label: 'Discount Percent', key: "discountPer" },
      { label: 'Schedule Drug', key: 'scheduleDrug' },
      { label: 'Prescription', key: 'prescriptionType' },
    ]
  }
]

export const batchFooters = [
  {
    label: 'Purchase Info',
    data: [
      { label: 'Purchase Price', key: 'purPrice' },
      { label: 'MRP', key: 'mrp' },
    ]
  },
  {
    label: 'Selling Info',
    data: [
      { label: 'Sale Price 1', key: "salePrice" },
      { label: 'Sale Price 2', key: "salePrice2" },
      { label: 'Sale Price 3', key: "salePrice3" },
      { label: 'Sale Price 4', key: "salePrice4" },
      { label: 'Sale Price 5', key: "salePrice5" },
    ]
  },
  {
    label: 'Other Info',
    data: [
      { label: 'Batch', key: 'batchNo' },
      { label: 'Stocks', key: "currentStock" },
    ]
  },
]
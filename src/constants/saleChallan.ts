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
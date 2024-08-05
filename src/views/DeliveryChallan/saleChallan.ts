export const headers = [
    { name: 'Item name', key: 'itemId', width: 'w-[15%]' },
    { name: 'Batch no', key: 'batchNo', width: 'w-[15%]' },
    { name: 'Qty', key: 'qty', width: 'w-[5%]' },
    { name: 'Scheme', key: 'scheme', width: 'w-[7%]' },
    { name: 'Scheme type', key: 'schemeType', width: 'w-[10%]' },
    { name: 'Rate', key: 'rate', width: 'w-[5%]' },
    { name: 'Dis.%', key: 'disPer', width: 'w-[5%]' },
    { name: 'Amt', key: 'amt', width: 'w-[5%]' },
    { name: 'MRP', key: 'mrp', width: 'w-[5%]' },
    { name: 'Exp. Date', key: 'expDate', width: 'w-[8%]' },
    { name: 'Tax type', key: 'taxType', width: 'w-[15%]' },
    { name: 'GST', key: 'gstAmount', width: 'w-[5%]' },
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
    { label: 'Company', key: 'compId' },
    { label: 'Sales', key: 'saleAccId' },
    { label: 'Purchase', key: 'purAccId' },
  ];
  export const batchHeader = [
    { label: 'ID', key: 'id' },
    { label: 'Batch', key: 'batchNo' },
    { label: 'Current Stock', key: 'currentStock' },
    { label: 'Expiry Date', key: 'expiryDate' },
    { label: 'Locked', key: 'locked' },
    { label: 'Scheme', key: 'opFree' },
  ];
export const partyHeaders = [
    { label: 'Name', key: 'partyName',width: '50%'},
    { label: 'Station', key: 'station_name', width: '30%' },
    { label: 'CB', key: 'closingBalance', width: '14%',fullForm: 'Closing Balance' },
    { label: 'CBT', key: 'closingBalanceType', width: '6%', fullForm: 'Closing Balance Type'},
  ];

export const itemHeaders = [
  { label: 'Item Name', key: 'name' },
  { label: 'Current Price', key: 'salePrice' },
];

export const partyFooterData: any[] = [
  {
    label: 'Address',
    data: [
      {
        label: 'Address 1',
        key: 'address1'
      },
      {
        label: 'GST IN',
        key: 'gstIn'
      },
      {
        label: 'PAN No',
        key: 'panCard'
      },
    ]
  },
  {
    label: 'License Info',
    data: [
      {
        label: 'License No 1',
        key: 'drugLicenceNo1'
      },
      {
        label: 'License No 2',
        key: 'drugLicenceNo2'
      },
      {
        label: 'Expiry',
        key: 'licenceExpiry'
      },
    ]
  },
  {
    label: 'Current Status',
    data: [
      {
        label: 'Opening',
        key: 'openingBal'
      },
      {
        label: 'Credit',
        key: 'credit'
      },
      {
        label: 'Debit',
        key: 'debit'
      },
      {
        label: 'Closing Balance',
        key: 'closingBalance',
      },
      {
        label: 'C.B.Type',
        key: 'closingBalanceType',
      }
    ]
  },
];
export const partyHeaders = [
    { label: 'Name', key: 'partyName',width: '50%'},
    { label: 'Station', key: 'station_name', width: '30%' },
    { label: 'CB', key: 'closingBalance', width: '14%',fullForm: 'Closing Balance' },
    { label: 'CBT', key: 'closingBalanceType', width: '6%', fullForm: 'Closing Balance Type'},
  ];

export const companyHeader = [
    { label: 'Company Name', key: 'companyName',width: '50%'},
    { label: 'Station', key: 'station_id',width: '50%'},
    { label: 'OB', key: 'openingBal', width: '14%',fullForm: 'Opening Balance' },
    { label: 'OBT', key: 'openingBalType', width: '6%', fullForm: 'Opening Balance Type'},
]

export const companyFooterData =[
    {
        label: 'Comapny Info',
        data: [
          {
            label: 'GSTIN',
            key: 'gstIn'
          },
          {
            label: 'Sale Account',
            key: 'salesId'
          },
          {
            label: 'Purchase Account',
            key: 'purchaseId'
          },
          {
            label: 'MFG Code',
            key: 'shortName'
          },
        ]
    }
]
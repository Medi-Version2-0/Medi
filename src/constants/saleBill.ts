import { Option } from '../interface/global';

export const radioValues: Option[] = [
  { id: 1, label: 'select All', value: 'selectAll' },
  { id: 2, label: 'No of Items', value: 'noOfItems' },
  { id: 3, label: 'Select By *', value: 'selectOne' },
  { id: 4, label: 'Select by Challan Number', value: 'choiceByChallanNo' },
  { id: 4, label: 'Start From New', value: 'startFromNew' },
];
export const discoutTypeOptions: Option[] = [
  { id: 1, label: 'Zero Discount', value: 'Zero Discount' },
  { id: 2, label: 'Auto Discount', value: 'Auto Discount' },
  { id: 3, label: 'Percent Discount', value: 'Percent Discount' },
];

export const partyFooterData: any[] = [
  {
    label: 'License Info',
    data: [
      {
        label: 'LicenceNo1',
        key: 'drugLicenceNo1'
      },
      {
        label: 'LicenceNo2',
        key: 'drugLicenceNo2'
      },
      {
        label: 'licenceExpiry',
        key: 'licenceExpiry'
      }
    ]
  },
  {
    label: 'GST Info',
    data: [
      {
        label: 'GSTIN',
        key: 'gstIn'
      },
      {
        label: 'GST Expiry',
        key: 'gstExpiry'
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
        label: 'Closing',
        key: 'closingBalance'
      },
    ]
  },
];
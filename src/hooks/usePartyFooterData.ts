import { useControls } from "../ControlRoomContext";

const usePartyFooterData = () => {
  const { controlRoomSettings } = useControls();


  const partyFooterData: any[] = [
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
        },
        ...(controlRoomSettings.fssaiNumber ? [
          {
            label: 'FSSAI Number',
            key: 'fssaiNumber'
          },
        ] : [])
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
          label: 'Group Name',
          key: 'Group.group_name'
        },
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

  return partyFooterData;
};

export default usePartyFooterData;

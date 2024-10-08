export const useCompanyPopupData = ()=>{

    const companyHeader = [
        { label: 'Company Name', key: 'companyName',width: '50%'},
        { label: 'Station', key: 'station_id',width: '50%'},
        { label: 'OB', key: 'openingBal', width: '14%',fullForm: 'Opening Balance' },
        { label: 'OBT', key: 'openingBalType', width: '6%', fullForm: 'Opening Balance Type'},
    ]
    
    const companyFooterData =[
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

    return { companyHeader, companyFooterData}

}
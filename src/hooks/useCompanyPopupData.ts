export const useCompanyPopupData = ()=>{

    const companyHeader = [
        { label: 'Company Name', key: 'companyName',width: '60%'},
        { label: 'Station', key: 'station_id',width: '22%'},
        { label: 'OB', key: 'openingBal', width: '26%',fullForm: 'Opening Balance' },
        { label: 'OBT', key: 'openingBalType', width: '16%', fullForm: 'Opening Balance Type'},
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
                key: 'sale.sptype'
              },
              {
                label: 'Purchase Account',
                key: 'purchase.sptype'
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
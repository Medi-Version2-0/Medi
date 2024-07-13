import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { sendAPIRequest } from '../../helper/api';
import ExportData from '../../components/common/ExportData';

interface ItemData {
  ItemBatches: any[];
  name: string;
}

interface CompanyData {
  company_id: string;
  companyName: string;
}

const PriceList = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      const response = await sendAPIRequest<any[]>(
        `/${organizationId}/company`
      );
      setCompanies(response);
    };

    fetchCompanies();
  }, [organizationId]);

  useEffect(() => {
    if (selectedCompany) {
      const fetchItems = async () => {
        const response = await sendAPIRequest<ItemData[]>(
          `/${organizationId}/item?companyId=${selectedCompany}`
        );
        setItems(
          response.flatMap((e) =>
            e.ItemBatches.map((e) => ({
              batchNo: e.batchNo,
              mrp: e.mrp,
              purPrice: e.purPrice,
              salePrice: e.salePrice,
            }))
          )
        );
      };

      fetchItems();
    }
  }, [selectedCompany, organizationId]);

  const colDefs: any[] = [
    {
      headerName: 'Item Name',
      field: 'batchNo',
      filter: true,
      editable: false,
      suppressMovable: true,
      headerClass: 'custom-header',
    },
    {
      headerName: 'MRP',
      field: 'mrp',
      filter: true,
      editable: false,
      suppressMovable: true,
      headerClass: 'custom-header',
    },
    {
      headerName: 'Purchase Price',
      field: 'purPrice',
      filter: true,
      editable: false,
      suppressMovable: true,
      headerClass: 'custom-header',
    },
    {
      headerName: 'Sale Price',
      field: 'salePrice',
      filter: true,
      editable: false,
      suppressMovable: true,
      headerClass: 'custom-header',
    },
  ];

  const handleCompanyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCompany(event.target.value);
  };

  return (
    <div className='w-full'>
      <h1 className='font-bold'>Price List</h1>
      <div className='mb-4 flex flex-row justify-between'>
        <div className='flex flex-col'>
          <label htmlFor='company-select' className='block mb-2'>
            Select Company:
          </label>
          <select
            id='company-select'
            value={selectedCompany}
            onChange={handleCompanyChange}
            className='p-2 border border-gray-300 rounded min-w-52'
          >
            <option key={'company.company_id'}>Select a company </option>
            {companies.map((company) => (
              <option key={company.company_id} value={company.company_id}>
                {company.companyName}
              </option>
            ))}
          </select>
        </div>
        <ExportData data={items} fields={colDefs} />
      </div>
      <div
        id='price-list-table'
        className='ag-theme-quartz'
        style={{ height: '400px' }}
      >
        <AgGridReact rowData={items} columnDefs={colDefs} />
      </div>
    </div>
  );
};

export default PriceList;

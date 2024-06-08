import React from 'react';
import { Sales_Purchase_Section } from './sales_puchase_section';
import { useLocation } from 'react-router-dom';


export const Sales_Purchase: React.FC<any> = () => {
  const location = useLocation();
  const data = location.state || {};
  return (
    <div>
      <Sales_Purchase_Section
       data= {data}
       type={typeof data === 'string' ? data : data.salesPurchaseType}
      />
    </div>
    );
  };

import React, { useEffect, useMemo } from 'react';
import * as Yup from 'yup';
import './sales_purchase.css';
import { useNavigate } from 'react-router-dom';
import { TaxTypeSection } from './tax_type_section';
import { ExtraDetailsSection } from './extra_details_section';
import { Sp_Header_Section } from './sp_header_section';
import { SalesPurchaseProps } from '../../interface/global';

export const Sales_Purchase_Section: React.FC<SalesPurchaseProps> = ({
  type,
  formik,
  receiveValidationSchemaSalesPurchase,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    document.getElementById('')?.focus();
  }, []);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        spType: Yup.string()
          .max(100, `${type} Type must be 100 characters or less`)
          .required(`${type} Type is required`),
        igst: Yup.string().required('IGST is required'),
        cgst: Yup.string().required('CGST is required'),
        sgst: Yup.string().required('SGST is required'),
        shortName: Yup.string().required('Shortname is required'),
      }),
    [type]
  );

  useEffect(() => {
    receiveValidationSchemaSalesPurchase(validationSchema);
  }, [validationSchema, receiveValidationSchemaSalesPurchase]);

  return (
    <>
      <div className='sp-container'>
        <div id='sp_main'>
          <h1 id='sp_header'>Create {type} Master</h1>
          <button
            id='sp_button'
            className='sp_button'
            onClick={() => {
              return navigate(`/sales_purchase`);
            }}
          >
            Back
          </button>
        </div>
        <form onSubmit={formik.handleSubmit} className='responsive-form'>
          <Sp_Header_Section type={type} formik={formik} />
          <div className='middle_form'>
            <TaxTypeSection formik={formik} />
            <ExtraDetailsSection formik={formik} />
          </div>
        </form>
      </div>
    </>
  );
};

import { Formik, FormikProps } from "formik";
import { useRef } from "react";
import { DrugLicenceSectionFormProps, DrugLicenceSectionProps } from "../../interface/global";
import { Popup } from "../../components/popup/Popup";
import FormikInputField from "../../components/common/FormikInputField";
import { saleBillFormValidations } from "./vaildation_schema";

export const DrugLicenceSection = ({ togglePopup, className, setDLNo }: DrugLicenceSectionProps) => {
  const formikRef = useRef<FormikProps<DrugLicenceSectionFormProps>>(null);

  const handleSubmit = async (values: any) => {
    setDLNo(values.drugLicenceNo1);
  };

  return (
    <Popup childClass='!max-h-fit flex min-w-fit max-w-fit px-6' className={className}>
      <div className="flex gap-4">Enter DL No : </div>
      <Formik
        innerRef={formikRef}
        initialValues={{ drugLicenceNo1: '' }}
        validationSchema={saleBillFormValidations}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <form className='flex flex-col gap-3 items-center px-2'>
            <div className='flex gap-3 w-full justify-evenly'>
              <FormikInputField
                id='drugLicenceNo1'
                name='drugLicenceNo1'
                formik={formik as FormikProps<DrugLicenceSectionFormProps>}
                className='!gap-0'
                autoFocus={true}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if(formik.isValid){
                      togglePopup(false);
                      formik.handleSubmit();
                      document.getElementById('invoiceNumber')?.focus();
                    }
                  }
                  if (e.key === 'Escape') {
                    togglePopup(false);
                    document.getElementById('invoiceNumber')?.focus();
                  }
                }}
                showErrorTooltip={!!(formik.touched.drugLicenceNo1 && formik.errors.drugLicenceNo1)}
              />
            </div>
          </form>
        )}
      </Formik>
    </Popup>
  );
};
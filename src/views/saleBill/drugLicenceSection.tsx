import { Formik, FormikProps } from "formik";
import { useRef } from "react";
import { DrugLicenceSectionFormProps, DrugLicenceSectionProps } from "../../interface/global";
import { Popup } from "../../components/popup/Popup";
import FormikInputField from "../../components/common/FormikInputField";

export const DrugLicenceSection = ({ togglePopup, className, setDLNo }: DrugLicenceSectionProps) => {
  const formikRef = useRef<FormikProps<DrugLicenceSectionFormProps>>(null);

  const handleSubmit = async (values: any) => {
    setDLNo(values.drugLicenceNo1);
  };

  return (
    <Popup heading={''} childClass='!max-h-fit flex min-w-fit max-w-fit px-6' className={className}>
      <div className="flex gap-4">DL No. is Empty. <span>Enter DL No.</span></div>
      <Formik
        innerRef={formikRef}
        initialValues={{ drugLicenceNo1: '' }}
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
                    togglePopup(false);
                    document.getElementById('invoiceNumber')?.focus();
                    formik.handleSubmit();
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
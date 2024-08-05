import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { organizationValidationSchema } from '../organization/validation_schema';
import Button from '../../components/common/button/Button';
import { createOrganization } from '../../api/organizationApi';
import useToastManager from '../../helper/toastManager';
import ContactSection from '../../components/organization/ContactSection';
import GeneralSection from '../../components/organization/GeneralSection';
import LicencseSection from '../../components/organization/LicenceSection';
import { useUser } from '../../UserContext';
import { useNavigate } from 'react-router-dom';

const Step1 = ({ formik }: any) => (
    <div>
        <h2 className='text-lg font-bold mb-4'>Organization Details</h2>
        <GeneralSection formik={formik} />
    </div>
);

const Step2 = ({ formik }: any) => (
    <div>
        <h2 className='text-lg font-bold mb-4'>Contact Information</h2>
        <ContactSection formik={formik} />
    </div>
);

const Step3 = ({ formik }: any) => (
    <div>
        <h2 className='text-lg font-bold mb-4'>License and Identification Information</h2>
        <LicencseSection formik={formik} />
    </div>
);

const InitialFirmSetup = () => {
    const [step, setStep] = useState(1);
    const { user } = useUser();
    const navigate = useNavigate();
    const { successToast } = useToastManager();

    const formik = useFormik({
        initialValues: {
            name: '',
            address: '',
            city: '',
            pinCode: '',
            jurisdiction: '',
            phoneNo1: '',
            phoneNo2: '',
            phoneNo3: '',
            contactEmail: '',
            drugLicenseNo20B: '',
            drugLicenseNo21B: '',
            macCode: '',
            gstNumber: '',
            fssaiNumber: '',
            corporateIdNumber: '',
            panNumber: '',
            tdsTanNumber: ''
        },
        validationSchema: organizationValidationSchema,
        onSubmit: async (values) => {
            try {
                if (user?.id) {
                    const organization: any = await createOrganization(values, user.id);
                    successToast('Firm setup has been completed.Happy Accounting!');
                    navigate(`/${organization.id}`);
                } else {
                    navigate('/not-authorized');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        },
    });

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else setStep(1)
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else setStep(3)
    };

    const handleSubmit = () => {
        formik.handleSubmit();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowRight') {
            handleNext();
        }
        if (event.key === 'ArrowLeft') {
            handleBack();
        }
    
      };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
          window.removeEventListener('keydown', handleKeyDown);
        };
      }, [step])


    

    return (
        <div className='fixed inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-50'>
            <div className='bg-white rounded-b-lg shadow-lg max-w-5xl h-[500px] flex flex-col py-4 w-full'>
                <div className='flex mb-6 -mt-4 border-b-2 border-gray-300'>
                    <Button handleOnClick={() => setStep(1)}   className={`flex-1 !py-4 text-black transition-colors duration-300 border-b-4 ${step === 1 ? 'border-blue-600 text-blue-600' : 'border-transparent'} border-l-0 border-r-0 border-t-0 !rounded-none  focus:outline-none h-full`} >Organization Details</Button>

                    <Button handleOnClick={() => setStep(2)}   className={`flex-1 !py-4 text-black transition-colors duration-300 border-b-4 ${step === 2 ? 'border-blue-600 text-blue-600' : 'border-transparent'} border-l-0 border-r-0 border-t-0 !rounded-none  focus:outline-none h-full`} >Contact Information</Button>

                    <Button handleOnClick={() => setStep(3)}   className={`flex-1 !py-4 text-black transition-colors duration-300 border-b-4 ${step === 3 ? 'border-blue-600 text-blue-600' : 'border-transparent'} border-l-0 border-r-0 border-t-0 !rounded-none  focus:outline-none h-full`} >License and Identification Information</Button>            
                </div>               

                <form onSubmit={formik.handleSubmit} className='px-16 flex flex-col justify-around flex-1'>
                    {step === 1 && <Step1 formik={formik} />}
                    {step === 2 && <Step2 formik={formik} />}
                    {step === 3 && <Step3 formik={formik} />}

                    <div className={`flex ${step===1 ? 'justify-end' : 'justify-between'} mt-4`}>
                        {step > 1 && (
                            <Button type='highlight' btnType='button' handleOnClick={handleBack} >
                                Back
                            </Button>
                        )}
                        <div>
                            {step < 3 ? (
                                <Button disable={!formik.isValid} type='highlight' btnType='button' id='next' handleOnClick={handleNext}>
                                    Next
                                </Button>
                            ) : (
                                <Button id='submit_all' disable={!formik.isValid} type='fill' btnType='button' handleOnClick={handleSubmit}  >
                                    Submit
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InitialFirmSetup;

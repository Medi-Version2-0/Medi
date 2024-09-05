import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import { getOrganizations } from '../api/organizationApi';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const RedirectToCompany = () => {
  const navigate = useNavigate();
  const { setSelectedOrganization, user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isSetupPrompt, setIsSetupPrompt] = useState(false);

  const fetchOrganizations = async () => {
    try {
      const orgs = await getOrganizations(user?.id);
      setOrganizations(orgs.map((org: any) => ({
        id: org.id,
        name: org.name
      })));

    } catch (error) {
      console.error("Failed to fetch organizations:", error);
      setOrganizations([]);
    }
  }

  useEffect(() => {
    const handleRedirect = async () => {
      await fetchOrganizations();
      if (organizations.length === 0) {
        setIsSetupPrompt(true);
      } else if (organizations.length === 1) {
        const organizationId = organizations[0].id;
        setSelectedOrganization(organizationId);
        navigate(`/${organizationId}`);
      } else {
        setIsModalOpen(true);
      }
    };

    handleRedirect();
  }, [navigate, setSelectedOrganization]);

  const handleOrganizationSelect = (organizationId: number) => {
    setSelectedOrganization(organizationId);
    setIsModalOpen(false);
    navigate(`/${organizationId}`);
  };

  const handleSetupClick = () => {
    navigate('/company/setup');
  };

  function onClose(){
      navigate('/login');
      setIsSetupPrompt(false)
  }

  return (
    <>
      {isSetupPrompt && (
        <Modal isOpen={isSetupPrompt} onClose={onClose}>
          <h2 className='text-lg w-full text-center mb-8 font-bold'>Welcome to Medi!</h2>
          <p className='text-center w-full mb-4'>User Details saved successfully.</p>
          <p className='text-center w-full mb-4'>To get started, you'll need to complete the firm setup. We'll ask for details like your company name, address, and contact information.</p>
          <button
            className='w-full text-center p-2 border border-gray-300 rounded bg-blue-500 text-white hover:bg-blue-600'
            onClick={handleSetupClick}
          >
            Firm setup
          </button>
        </Modal>

      )}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h2 className='text-lg font-bold mb-4'>Select an Organization</h2>
          <ul>
            {organizations.map((org) => (
              <li key={org.id} className='mb-2'>
                <button
                  className='w-full text-left p-2 border border-gray-300 rounded hover:bg-gray-100'
                  onClick={() => handleOrganizationSelect(org.id)}
                >
                  {org.name}
                </button>
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </>
  );
};

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 '>
        <div className='bg-white p-4 rounded shadow-lg relative max-w-md w-full mx-4 py-10'>
          {children}
          <button
            className='absolute top-2 right-2 text-gray-500'
            onClick={onClose}
          >
            &times;
          </button>
        </div>
      </div>
    </>
  );
};

export default RedirectToCompany;

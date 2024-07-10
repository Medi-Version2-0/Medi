import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const RedirectToCompany = () => {
  const navigate = useNavigate();
  const { setSelectedOrganization, user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!user?.UserOrganizations) return;

    if (user.UserOrganizations.length === 0) {
      navigate('/not-authorized');
    } else if (user.UserOrganizations.length === 1) {
      const organizationId = user.UserOrganizations[0].organizationId;
      setSelectedOrganization(organizationId);
      navigate(`/${organizationId}`);
    } else {
      setIsModalOpen(true);
    }
  }, [user, navigate, setSelectedOrganization]);

  const handleOrganizationSelect = (organizationId: number) => {
    setSelectedOrganization(organizationId);
    setIsModalOpen(false);
    navigate(`/${organizationId}`);
  };

  return (
    <>
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h2 className='text-lg font-bold mb-4'>Select an Organization</h2>
          <ul>
            {user?.UserOrganizations.map((org) => (
              <li key={org.organizationId} className='mb-2'>
                <button
                  className='w-full text-left p-2 border border-gray-300 rounded hover:bg-gray-100'
                  onClick={() => handleOrganizationSelect(org.organizationId)}
                >
                  {org.Organization.name}
                </button>
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </>
  );
};

const Modal = ({ isOpen, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className='bg-white p-4 rounded shadow-lg relative max-w-md w-full mx-4'>
          {children}
        </div>
      </div>
    </>
  );
};

export default RedirectToCompany;

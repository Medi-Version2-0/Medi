import React from 'react';
import { toast, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './toast.css';
import Button from '../common/button/Button';

interface CustomToastProps {
    message: string;
    type?: 'error' | 'warning' | 'info';
}

const CustomToast: React.FC<CustomToastProps> = ({ message, type = 'info' }) => {
    const handleClose = () => {
        toast.dismiss();
    };

    return (
        <div className={`flex flex-col gap-2 w-full items-center custom-toast ${type === 'error' && ' !text-red-600'}`} >
            <span> {message}</span>
            <Button type='fill' handleOnClick={handleClose} className='w-fit'> OK </Button>
        </div>

    );
};

export default CustomToast;

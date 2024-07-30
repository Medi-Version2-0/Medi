import { Zoom, toast, ToastOptions } from "react-toastify";
import CustomToast from "../components/custom_toast/CustomToast";
import "../components/custom_toast/toast.css";
interface ToastManager {
  successToast: (message: string) => void;
  errorToast: (message: string) => void;
  warningToast: (message: string) => void;
}

const useToastManager = (): ToastManager => {
  const configuration: ToastOptions = {
    position: "top-center",
    autoClose: false,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
    transition: Zoom,
  };

  const successToast = (message: string): void => {
    toast(<CustomToast message={message} />, {
      ...configuration,
      className: 'custom-toast custom-toast-border',
    });
  };

  const errorToast = (message: string): void => {
    toast(<CustomToast message={message} type={'error'}/>, {
      ...configuration,
      className: 'custom-toast custom-toast-border',
    });
  };

  const warningToast = (message: string): void => {
    toast.warning(message, configuration);
  };

  return {
    successToast,
    errorToast,
    warningToast,
  };
};

export default useToastManager;
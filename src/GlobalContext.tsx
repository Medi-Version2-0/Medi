// src/UserContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useRef,
} from 'react';
import { Popup } from './components/popup/Popup';
import LoginForm from './components/common/LoginForm';
import Confirm_Alert_Popup from './components/popup/Confirm_Alert_Popup';
import { useDispatch } from 'react-redux';
import { AppDispatch } from './store/types/globalTypes';
import { getAndSetPermssions } from './store/action/globalAction';
import { useUser } from './UserContext';

interface GlobalContextType {
  showLoginPopup: () => void;
  hidePopup: () => void;
  showAlert: (msg:string) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [popup, setPopup] = useState<number>(0);  // 0 (zero) means no popup is active i.e., hide popup
  const alertMessage = useRef<string>('');  // used to display alert message in alert popup
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useUser();
  let userId:number = 0;  // if there is no user then if api hit then all permissions will be removed i.e., all permissions set to false or we can say initial permissions are false by default
  if(user){
    userId = user.id;
  }

  const showLoginPopup = async () => {
    setPopup(401);  // popup open with login page i.e., LoginForm.tsx
  }

  const hidePopup = () => {
    if(popup === 401) dispatch(getAndSetPermssions(+userId))   // if user reLogin using popup then all permissions will fetch again and sidebar.tsx updated i.e., sub menus will be shown if user have read access
    setPopup(0);
  }

  const showAlert = (msg:string) => {
    alertMessage.current = msg;   // show message in alert
    setPopup(403);   // show unauthorized message
  }

  return (
    <GlobalContext.Provider
      value={{
        showLoginPopup,
        hidePopup,
        showAlert,
      }}
    >
      {
        (popup === 401) && <Popup
          heading=""
          className="!z-10"
          childClass='!max-w-[1600px] !p-8 border flex items-center'
          isSuggestionPopup={true}
        >
          <LoginForm />
        </Popup>
      }
      {
        (popup === 403) &&
        <Confirm_Alert_Popup
          className='absolute'
          id='403'
          isAlert={true}
          message={alertMessage.current}
          onClose={hidePopup}
          onConfirm={hidePopup}
        />
      }
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = (): GlobalContextType => {
  const globalContext = useContext(GlobalContext);
  if (!globalContext) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return globalContext;
};

import { PopupProps } from '../../interface/global';
import './helpers.css';

export const Popup: React.FC<PopupProps> = ({
  headding,
  children,
}) => {

  return (
    <div className='modal'>
      <div className='modal-content'>
        <h2 id='add_account_header'>{headding}</h2>
        {children}
      </div>
    </div>
  );
};

import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/types/globalTypes';
import { getAndSetItemGroups, getAndSetPermssions, setOrganization, getAndSetCompany, getAndSetPurchase, getAndSetSales, getAndSetGroups, getAndSetParty, getAndSetItem, getAndSetSubGroups, getAndSetStore, getAndSetStations, getAndSetBillBook, getAndSetPartywiseDiscount } from '../store/action/globalAction';
import { OrganizationI } from '../views/organization/types';
import useApi from './useApi';
import { useUser } from '../UserContext';

const useFetchInitialData = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useUser()
  let userId:number = 0;
  if(user){
    userId = user.id;
  } 
  const { sendAPIRequest } = useApi()
  const hanlder = async () => {
    const organizations = await sendAPIRequest<OrganizationI[]>(`/organization`);
      dispatch(getAndSetPermssions(userId))
      dispatch(setOrganization(organizations || []));
      dispatch(getAndSetStations());
      dispatch(getAndSetItemGroups())
      dispatch(getAndSetCompany())
      dispatch(getAndSetPurchase())
      dispatch(getAndSetSales())
      dispatch(getAndSetGroups())
      dispatch(getAndSetParty())
      dispatch(getAndSetItem())
      dispatch(getAndSetSubGroups())
      dispatch(getAndSetBillBook())
      dispatch(getAndSetStore())
      dispatch(getAndSetPartywiseDiscount())
  }
  return {fetchInitialData : hanlder}
};

export default useFetchInitialData;

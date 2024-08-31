import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/types/globalTypes';
import { sendAPIRequest } from '../helper/api';
import { getOrganizations } from '../api/organizationApi';
import { getAndSetItemGroups, getAndSetPermssions, setOrganization, getAndSetCompany, getAndSetPurchase, getAndSetSales, getAndSetGroups, getAndSetParty, getAndSetItem, getAndSetSubGroups, getAndSetStore, getAndSetStations, getAndSetBillBook, getAndSetPartywiseDiscount } from '../store/action/globalAction';
import { useUser } from '../UserContext';

const useFetchInitialData = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useUser()
  const hanlder = async () => {
      const organizations = await getOrganizations(user?.id);
      dispatch(getAndSetPermssions())
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

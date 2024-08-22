import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/types/globalTypes';
import { sendAPIRequest } from '../helper/api';
import { getOrganizations } from '../api/organizationApi';
import { getAndSetItemGroups, getAndSetPermssions, setOrganization, getAndSetCompany, getAndSetPurchase, getAndSetSales, getAndSetGroups, getAndSetParty, getAndSetItem, getAndSetSubGroups, getAndSetStations } from '../store/action/globalAction';
import { useUser } from '../UserContext';

const useFetchInitialData = (organizationId: string|undefined) => {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useUser()
  const hanlder = async () => {
    if(organizationId){
      const organizations = await getOrganizations(user?.id);
      dispatch(getAndSetPermssions(organizationId))
      dispatch(setOrganization(organizations || []));
      dispatch(getAndSetStations(organizationId));
      dispatch(getAndSetItemGroups(organizationId))
      dispatch(getAndSetCompany(organizationId))
      dispatch(getAndSetPurchase(organizationId))
      dispatch(getAndSetSales(organizationId))
      dispatch(getAndSetGroups(organizationId))
      dispatch(getAndSetParty(organizationId))
      dispatch(getAndSetItem(organizationId))
      dispatch(getAndSetSubGroups(organizationId))
    }
  }
  return {fetchInitialData : hanlder}
};

export default useFetchInitialData;

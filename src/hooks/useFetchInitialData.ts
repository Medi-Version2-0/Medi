import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/types/globalTypes';
import { sendAPIRequest } from '../helper/api';
import { getOrganizations } from '../api/organizationApi';
import { getAndSetItemGroups, getAndSetPermssions, setOrganization, setStation, getAndSetCompany, getAndSetPurchase, getAndSetSales, getAndSetGroups, getAndSetParty, getAndSetItem, getAndSetSubGroups,getAndSetStore } from '../store/action/globalAction';
import { useUser } from '../UserContext';

const useFetchInitialData = (organizationId: string|undefined) => {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useUser()
  const hanlder = async () => {
    if(organizationId){
      const stations = await sendAPIRequest<any[]>(`/${organizationId}/station`);
      const organizations = await getOrganizations(user?.id);
      dispatch(getAndSetPermssions(organizationId))
      dispatch(setOrganization(organizations || []));
      dispatch(setStation(stations || []));
      dispatch(getAndSetItemGroups(organizationId))
      dispatch(getAndSetCompany(organizationId))
      dispatch(getAndSetPurchase(organizationId))
      dispatch(getAndSetSales(organizationId))
      dispatch(getAndSetGroups(organizationId))
      dispatch(getAndSetParty(organizationId))
      dispatch(getAndSetItem(organizationId))
      dispatch(getAndSetSubGroups(organizationId))
      dispatch(getAndSetStore(organizationId))
    }
  }
  return {fetchInitialData : hanlder}
};

export default useFetchInitialData;

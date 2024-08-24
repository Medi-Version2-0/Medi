import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/types/globalTypes';
import { useParams } from 'react-router-dom';

export const useGetSetData = (args: any) => {
  const { organizationId } = useParams();
  const dispatch = useDispatch<AppDispatch>();

  const handler = () => {
    if (organizationId) {
      dispatch(args(organizationId));
    }
  };

  return handler;
};

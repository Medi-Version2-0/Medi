import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/types/globalTypes';

export const useGetSetData = (args: any) => {
  const dispatch = useDispatch<AppDispatch>();

  const handler = () => {
    dispatch(args());
  };

  return handler;
};

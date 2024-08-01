import { useSelector } from 'react-redux';

const usePermission = (key?:string) => {
  const { permissions } = useSelector((state:any) => state.global);
  if (key && permissions[key]) {
    return permissions[key];
  } else {
    return permissions;
  }
};

export default usePermission;

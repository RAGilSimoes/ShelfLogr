import { useQuery } from '@tanstack/react-query';
import { fetchUserShelves, fetchUserShelvesNames } from './loginQueries';
import useAuthStore from '../store/useAuthStore';

function getUserShelvesOptions(userID: string) {
  return {
    queryKey: ['userBook', userID],
    queryFn: fetchUserShelves,
    enabled: !!userID,
  };
}

function getUserShelvesNamesOptions(userID: string) {
  return {
    queryKey: ['userShelves', userID],
    queryFn: fetchUserShelvesNames,
    enabled: !!userID,
  };
}

const useUserShelves = () => {
  const userID = useAuthStore((state) => state.userID);

  const userShelvesNamesQuery = useQuery(getUserShelvesNamesOptions(userID));

  return userShelvesNamesQuery;
};

export { getUserShelvesOptions, getUserShelvesNamesOptions, useUserShelves };

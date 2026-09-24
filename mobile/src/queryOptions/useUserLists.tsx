import { useQuery } from '@tanstack/react-query';
import {
  fetchUserLists,
  fetchUserListsNames,
} from '../queryOptions/loginQueries';
import useAuthStore from '../store/useAuthStore';

function getUserListsOptions(userID: string) {
  return {
    queryKey: ['userBook', userID],
    queryFn: fetchUserLists,
    enabled: !!userID,
  };
}

function getUserListsNamesOptions(userID: string) {
  return {
    queryKey: ['userLists', userID],
    queryFn: fetchUserListsNames,
    enabled: !!userID,
  };
}

const useUserLists = () => {
  const userID = useAuthStore((state) => state.userID);

  const userListsNamesQuery = useQuery(getUserListsNamesOptions(userID));

  return userListsNamesQuery;
};

export { getUserListsOptions, getUserListsNamesOptions, useUserLists };

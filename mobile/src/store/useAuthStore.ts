import { create } from 'zustand';

import { setToken, removeToken } from '../services/auth.service';
import { jwtDecode } from 'jwt-decode';

type State = {
  jwt: string,
  username: string,
  userID: string,
  email: string,
}

type Action = {
  updateJWT: (jwt: State['jwt']) => void,
  updateUserName: (username: State['username']) => void,
  updateUserID: (userID: State['userID']) => void,
  updateEmail: (email: State['email']) => void,
  removeInformation: (jwt: '', username: '', userID:'', email:'') => void,
}

const useAuthStore = create<State & Action>()((set) => ({
  jwt: '',
  username: '',
  userID: '',
  email: '',
  updateJWT: function (jwt){
    setToken(jwt);
    const decodedToken: {email: string, name: string, id: string} = jwtDecode(jwt);

    set(() => ({ jwt: jwt, username: decodedToken.name, userID: decodedToken.id, email: decodedToken.email }));
    } ,
  updateUserName: (username) => set(() => ({ username: username })),
  updateUserID: (userID) => set(() => ({ userID: userID })),
  updateEmail: (email) => set(() => ({ email: email })),
  removeInformation: function () {
    removeToken();
    set({ jwt: '', username: '', userID: '', email: '' });
  },
}));

export default useAuthStore;
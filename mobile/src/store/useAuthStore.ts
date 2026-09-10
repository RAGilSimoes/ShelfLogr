import { create } from 'zustand';

import { setToken, removeToken } from '../services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { bookInfo } from '@shelflogr/shared';

type State = {
  jwt: string;
  username: string;
  userID: string;
  email: string;
  activeBook: bookInfo | undefined;
  list: string;
  category: string;
};

type Action = {
  updateActiveBookRecommendation: (
    books: Array<bookInfo>,
    list: string,
    category?: string,
  ) => void;
  updateJWT: (jwt: State['jwt']) => void;
  updateUserName: (username: State['username']) => void;
  updateUserID: (userID: State['userID']) => void;
  updateEmail: (email: State['email']) => void;
  removeInformation: (jwt: '', username: '', userID: '', email: '') => void;
};

const useAuthStore = create<State & Action>()((set) => ({
  jwt: '',
  username: '',
  userID: '',
  email: '',
  activeBook: undefined,
  list: '',
  category: '',

  updateActiveBookRecommendation: function (books, list, category) {
    const index = Math.floor(Math.random() * books.length);
    const chosenInfo = {
      activeBook: books[index],
      list: list,
      category: category,
    };
    set(() => chosenInfo);

    return chosenInfo;
  },

  updateJWT: function (jwt) {
    setToken(jwt);
    const decodedToken: { email: string; name: string; id: string } =
      jwtDecode(jwt);

    set(() => ({
      jwt: jwt,
      username: decodedToken.name,
      userID: decodedToken.id,
      email: decodedToken.email,
    }));
  },
  updateUserName: (username) => set(() => ({ username: username })),
  updateUserID: (userID) => set(() => ({ userID: userID })),
  updateEmail: (email) => set(() => ({ email: email })),

  removeInformation: function () {
    removeToken();
    set({
      jwt: '',
      username: '',
      userID: '',
      email: '',
      activeBook: undefined,
      list: '',
      category: '',
    });
  },
}));

export default useAuthStore;

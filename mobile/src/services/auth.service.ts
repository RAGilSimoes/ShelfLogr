import { Preferences } from '@capacitor/preferences';

const key = 'token';

export const setToken = async (token: string) => {
  await Preferences.set({
    key,
    value: token,
  });
};

export const checkToken = async () => {
  const { value } = await Preferences.get({ key });

  return value;
};

export const removeToken = async () => {
  await Preferences.remove({ key });
};

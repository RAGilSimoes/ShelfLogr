import { create } from 'zustand';

type State = {
  online: boolean;
};

type Action = {
  updateOnline: (online: State['online']) => void;
};

const useNetworkStore = create<State & Action>()((set) => ({
  online: true,

  updateOnline: (online) => set(() => ({ online: online })),
}));

export default useNetworkStore;

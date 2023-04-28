import { create } from "zustand";

type ModalType = "create-post" | "none";
type ModalStore = {
  opening: {
    [key in ModalType]?: boolean;
  };
  setOpening: (type: ModalType, value: boolean) => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  opening: {},
  setOpening(type, value) {
    set((prev) => ({
      opening: {
        ...prev.opening,
        [type]: value,
      },
    }));
  },
}));

export function setModal(type: ModalType, value: boolean) {
  useModalStore.getState().setOpening(type, value);
}

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/** Rutas del stack principal. En el MVP arranca con la feature clothes. */
export type RootStackParamList = {
  ClothesList: undefined;
  ClothingDetail: { id: string };
  AddClothingItem: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

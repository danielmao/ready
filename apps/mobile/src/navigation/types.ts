import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * Tabs inferiores (diseño Ready.dc §tab bar): Armario · Outfits · Perfil. Cada tab aloja
 * la pantalla-lista de su feature; los detalles/altas/ediciones viven en el stack raíz y se
 * apilan por encima de los tabs.
 */
export type MainTabParamList = {
  ArmarioTab: undefined;
  OutfitsTab: undefined;
  PlanearTab: undefined;
  PerfilTab: undefined;
};

/** Rutas del stack principal: login (gate) + los tabs + las pantallas que se apilan sobre ellos. */
export type RootStackParamList = {
  Login: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  ClothingDetail: { id: string };
  AddClothingItem: undefined;
  EditClothingItem: { id: string };
  OutfitDetail: { id: string };
  AddOutfit: undefined;
  EditOutfit: { id: string };
  PlanPicker: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

/**
 * Props de una pantalla-tab: puede navegar tanto entre tabs como al stack raíz
 * (p. ej. `navigation.navigate('ClothingDetail', { id })`).
 */
export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

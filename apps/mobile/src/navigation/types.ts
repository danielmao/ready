import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * Tabs inferiores: Home · Armario · Outfits · Perfil. `HomeTab` va primera porque es la
 * pantalla de entrada (el plan de la semana). Cada tab aloja la pantalla principal de su
 * feature; los detalles/altas/ediciones viven en el stack raíz y se apilan por encima.
 */
export type MainTabParamList = {
  HomeTab: undefined;
  ArmarioTab: undefined;
  OutfitsTab: undefined;
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
  /** Selector de outfit para un día concreto (`YYYY-MM-DD`). */
  PlanPicker: { day: string };
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

import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';

import { colors, fonts } from '../../theme';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** Glifo del círculo superior (diseño 05: ⌦). */
  icon?: string;
  cancelLabel?: string;
  /** Deshabilita y muestra spinner en el botón de confirmar (mutación en curso). */
  confirming?: boolean;
}

/**
 * Diálogo de confirmación centrado (diseño 05 · Archivar prenda): backdrop oscuro,
 * tarjeta blanca con ícono en círculo, título serif, cuerpo y botones apilados
 * (confirmar en `secondary`/borgoña + cancelar). Tocar el backdrop cancela.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  icon = '⌦',
  cancelLabel = 'Cancelar',
  confirming = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Pressable
        testID="confirm-dialog-backdrop"
        onPress={onCancel}
        className="flex-1 items-center justify-center bg-primary-dark/50 px-[34px]"
      >
        {/* Pressable interno traga el tap para que no cierre al tocar la tarjeta. */}
        <Pressable
          testID="confirm-dialog"
          onPress={() => {}}
          className="w-full rounded-[24px] bg-surface px-6 pb-[22px] pt-7"
        >
          <View className="mx-auto h-14 w-14 items-center justify-center rounded-full bg-secondary-soft">
            <Text className="text-2xl text-secondary">{icon}</Text>
          </View>

          <Text
            className="mt-4 text-center text-[26px] leading-tight text-text-primary"
            style={{ fontFamily: fonts.serif }}
          >
            {title}
          </Text>

          <Text className="mt-2.5 text-center text-sm leading-relaxed text-text-secondary">
            {message}
          </Text>

          <View className="mt-6 gap-2.5">
            <Pressable
              testID="confirm-dialog-confirm"
              onPress={onConfirm}
              disabled={confirming}
              className={`h-[52px] flex-row items-center justify-center rounded-2xl bg-secondary ${
                confirming ? 'opacity-60' : ''
              }`}
            >
              {confirming ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <Text className="text-[15px] font-medium text-text-inverse">
                  {confirmLabel}
                </Text>
              )}
            </Pressable>
            <Pressable
              testID="confirm-dialog-cancel"
              onPress={onCancel}
              disabled={confirming}
              className="h-[52px] items-center justify-center rounded-2xl border border-border bg-surface"
            >
              <Text className="text-[15px] font-medium text-text-primary">
                {cancelLabel}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

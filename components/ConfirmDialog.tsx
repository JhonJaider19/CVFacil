import { Modal, Pressable, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className="w-full max-w-sm bg-surface rounded-2xl p-6 shadow-lg">
          <View className="w-12 h-12 rounded-full bg-error-container items-center justify-center mb-4 mx-auto">
            <MaterialIcons name="delete-outline" size={24} color="#ba1a1a" />
          </View>
          <Text className="text-xl font-headline text-on-surface text-center mb-2">
            {title}
          </Text>
          <Text className="text-base font-body text-on-surface-variant text-center mb-6 leading-relaxed">
            {message}
          </Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={onCancel}
              className="flex-1 py-3.5 rounded-xl bg-surface-container-high items-center"
            >
              <Text className="text-sm font-headline-semibold text-on-surface">
                {cancelText}
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              className="flex-1 py-3.5 rounded-xl bg-error items-center"
            >
              <Text className="text-sm font-headline-semibold text-on-error">
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
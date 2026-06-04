import { Platform, StatusBar } from "react-native";

export const STATUS_BAR_HEIGHT = Platform.OS === "android"
  ? (StatusBar.currentHeight ?? 24)
  : 44;
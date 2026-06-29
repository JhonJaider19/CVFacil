import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import { buildPdfHtml } from "./pdf-html";
import type { ResumeData } from "./types";

export async function generateAndSharePdf(
  data: ResumeData,
  templateId: string,
): Promise<void> {
  try {
    const html = buildPdfHtml(data, templateId);
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: "application/pdf" });
    }
  } catch (e: any) {
    Alert.alert("Error", e?.message || "No se pudo generar el PDF");
  }
}
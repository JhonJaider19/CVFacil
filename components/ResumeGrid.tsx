import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import CvCard from "./CvCard";
import ConfirmDialog from "./ConfirmDialog";
import type { Resume } from "@/src/lib/types";

interface ResumeGridProps {
  resumes: Resume[];
  onDelete: (id: string, title: string) => void;
  deleteTarget: { id: string; title: string } | null;
  setDeleteTarget: (target: { id: string; title: string } | null) => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  cardWidth?: number;
  showCreateCard?: boolean;
}

function ResumeCardItem({
  resume,
  cardWidth,
  onDelete,
}: {
  resume: Resume;
  cardWidth?: number;
  onDelete: (resume: Resume) => void;
}) {
  return (
    <View style={cardWidth ? { width: cardWidth } : { width: "100%" }}>
      <View
        className="rounded-xl overflow-hidden mb-4 border border-outline-variant/10 shadow-sm bg-surface-container-high"
        style={{ aspectRatio: 3 / 4 }}
      >
        <Pressable
          className="flex-1"
          onPress={() => router.push(`/editor?id=${resume.id}`)}
        >
          <CvCard
            data={resume.data}
            templateId={resume.template_id || "modern-beige"}
            score={resume.score || 0}
          />
        </Pressable>
        <Pressable
          onPress={() => onDelete(resume)}
          className="absolute top-2 right-2 w-9 h-9 rounded-full bg-surface/80 items-center justify-center"
        >
          <MaterialIcons name="delete-outline" size={20} color="#ba1a1a" />
        </Pressable>
      </View>
      <Pressable onPress={() => router.push(`/editor?id=${resume.id}`)}>
        <Text className="font-headline text-lg text-on-surface">
          {resume.title}
        </Text>
      </Pressable>
      <Text className="text-on-surface-variant font-body text-sm mt-0.5">
        Actualizado: {new Date(resume.updated_at).toLocaleDateString()}
      </Text>
    </View>
  );
}

function CreateCard({ cardWidth }: { cardWidth?: number }) {
  return (
    <Pressable onPress={() => router.push("/editor" as any)}>
      <View
        className="border-2 border-dashed border-outline-variant/30 rounded-xl items-center justify-center hover:bg-surface-container-low transition-all"
        style={cardWidth ? { width: cardWidth, aspectRatio: 3 / 4 } : { aspectRatio: 3 / 4, width: "100%" }}
      >
        <View className="w-16 h-16 rounded-full bg-secondary-container items-center justify-center mb-4">
          <MaterialIcons name="add" size={28} color="#0b55cf" />
        </View>
        <Text className="font-headline text-on-surface-variant">
          Nueva Versión
        </Text>
        <Text className="text-on-surface-variant/60 font-body text-xs text-center mt-2 px-8">
          Crea una variante optimizada para un puesto específico
        </Text>
      </View>
    </Pressable>
  );
}

export default function ResumeGrid({
  resumes,
  onDelete,
  deleteTarget,
  setDeleteTarget,
  onConfirmDelete,
  onCancelDelete,
  cardWidth,
  showCreateCard = false,
}: ResumeGridProps) {
  return (
    <>
      <View className="flex-row flex-wrap" style={{ gap: 24 }}>
        {resumes.map((resume) => (
          <ResumeCardItem
            key={resume.id}
            resume={resume}
            cardWidth={cardWidth}
            onDelete={(r) => onDelete(r.id, r.title)}
          />
        ))}
        {showCreateCard && <CreateCard cardWidth={cardWidth} />}
      </View>
      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Eliminar CV"
        message={deleteTarget ? `¿Quieres borrar "${deleteTarget.title}"?` : ""}
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
      />
    </>
  );
}
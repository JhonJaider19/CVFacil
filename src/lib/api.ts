import { insforge } from "./insforge";
import * as FileSystem from "expo-file-system/legacy";
import type {
  AiSuggestion,
  Interview,
  InterviewMessage,
  Profile,
  Resume,
  ResumeData,
} from "./types";

const AVATAR_BUCKET = "avatars";

async function resolveCurrentUserId(): Promise<string | null> {
  try {
    const { data: authData, error: authError } = await insforge.auth.getCurrentUser();
    if (authError || !authData?.user?.id) return null;
    return authData.user.id;
  } catch {
    return null;
  }
}

function inferPhotoExtension(uri: string): { name: string; mime: string } {
  const lower = uri.toLowerCase().split("?")[0];
  if (lower.endsWith(".png")) return { name: "photo.png", mime: "image/png" };
  if (lower.endsWith(".webp")) return { name: "photo.webp", mime: "image/webp" };
  if (lower.endsWith(".heic")) return { name: "photo.heic", mime: "image/heic" };
  return { name: "photo.jpg", mime: "image/jpeg" };
}

export async function uploadResumePhoto(localUri: string, userId: string): Promise<string> {
  const { name, mime } = inferPhotoExtension(localUri);
  const path = `${userId}/${Date.now()}-${name}`;

  // The InsForge SDK requires `size` on the upload-strategy request.
  // In React Native, FormData objects with {uri,type,name} don't expose size
  // automatically, so we read it from the local file via expo-file-system.
  let size = 0;
  try {
    const resolved = await FileSystem.getInfoAsync(localUri);
    const s = (resolved as any)?.size;
    if (typeof s === "number") size = s;
  } catch {
    // size remains 0; the server may still accept unknown sizes.
  }

  const file = { uri: localUri, type: mime, name, size } as unknown as Blob;
  const { data, error } = await insforge.storage.from(AVATAR_BUCKET).upload(path, file);
  if (error || !data) throw error ?? new Error("Upload failed");
  return insforge.storage.from(AVATAR_BUCKET).getPublicUrl(data.key ?? path);
}

export async function getProfile(userId: string) {
  const { data, error } = await insforge.database
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function getResumes(_userId?: string) {
  const userId = _userId ?? (await resolveCurrentUserId());
  if (!userId) return [] as Resume[];
  const { data, error } = await insforge.database
    .from("resumes")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data as Resume[]) ?? [];
}

export async function getResume(id: string) {
  const { data, error } = await insforge.database
    .from("resumes")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Resume;
}

export interface CreateResumeOptions {
  data?: Partial<ResumeData>;
  templateId?: string;
  score?: number;
}

export async function createResume(
  userId: string,
  title: string,
  options: CreateResumeOptions = {},
) {
  const { data, templateId, score } = options;
  const { data: row, error } = await insforge.database
    .from("resumes")
    .insert([
      {
        user_id: userId,
        title,
        data: data ?? {},
        ...(templateId ? { template_id: templateId } : {}),
        ...(typeof score === "number" ? { score } : {}),
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return row as Resume;
}

export async function updateResume(id: string, updates: Partial<Resume>) {
  const { data, error } = await insforge.database
    .from("resumes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Resume;
}

export async function deleteResume(id: string) {
  const { error } = await insforge.database
    .from("resumes")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function getLatestInterview(_userId?: string) {
  const userId = _userId ?? (await resolveCurrentUserId());
  if (!userId) return null;
  const { data, error } = await insforge.database
    .from("interviews")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) throw error;
  return (data as Interview[])?.[0] ?? null;
}

export interface CreateInterviewInput {
  userId: string;
  resumeId?: string | null;
}

export async function createInterview({ userId, resumeId }: CreateInterviewInput) {
  const { data, error } = await insforge.database
    .from("interviews")
    .insert([
      {
        user_id: userId,
        resume_id: resumeId ?? null,
        status: "in_progress",
        score: 0,
        duration_seconds: 0,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return data as Interview;
}

export async function saveInterviewMessage(
  interviewId: string,
  role: "ai" | "user",
  content: string,
) {
  const { data, error } = await insforge.database
    .from("interview_messages")
    .insert([{ interview_id: interviewId, role, content }])
    .select()
    .single();
  if (error) throw error;
  return data as InterviewMessage;
}

export interface CompleteInterviewInput {
  interviewId: string;
  score: number;
  durationSeconds: number;
}

export async function completeInterview({
  interviewId,
  score,
  durationSeconds,
}: CompleteInterviewInput) {
  const { data, error } = await insforge.database
    .from("interviews")
    .update({
      status: "completed",
      score,
      duration_seconds: durationSeconds,
    })
    .eq("id", interviewId)
    .select()
    .single();
  if (error) throw error;
  return data as Interview;
}

export async function getInterviewMessages(interviewId: string) {
  const { data, error } = await insforge.database
    .from("interview_messages")
    .select("*")
    .eq("interview_id", interviewId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as InterviewMessage[];
}

export async function updateResumeTemplate(resumeId: string, templateId: string) {
  const { error } = await insforge.database
    .from("resumes")
    .update({ template_id: templateId })
    .eq("id", resumeId);
  if (error) throw error;
}

export async function getSuggestions(resumeId: string) {
  const { data, error } = await insforge.database
    .from("ai_suggestions")
    .select("*")
    .eq("resume_id", resumeId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as AiSuggestion[];
}

export async function getAllSuggestionsForUser(_userId?: string) {
  const userId = _userId ?? (await resolveCurrentUserId());
  if (!userId) return [];
  const { data: resumes, error: resumesError } = await insforge.database
    .from("resumes")
    .select("id")
    .eq("user_id", userId);
  if (resumesError) throw resumesError;
  if (!resumes || resumes.length === 0) return [];

  const resumeIds = resumes.map((r: { id: string }) => r.id);
  const { data, error } = await insforge.database
    .from("ai_suggestions")
    .select("*, resume_id")
    .in("resume_id", resumeIds)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data as AiSuggestion[];
}

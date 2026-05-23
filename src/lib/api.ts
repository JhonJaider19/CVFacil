import { insforge } from "./insforge";
import type {
  AiSuggestion,
  Interview,
  InterviewMessage,
  Profile,
  Resume,
  ResumeTemplate,
} from "./types";

export async function getProfile(userId: string) {
  const { data, error } = await insforge.database
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function getResumes(userId: string) {
  const { data, error } = await insforge.database
    .from("resumes")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data as Resume[];
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

export async function createResume(userId: string, title: string) {
  const { data, error } = await insforge.database
    .from("resumes")
    .insert([
      {
        user_id: userId,
        title,
        data: {},
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return data as Resume;
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

export async function getLatestInterview(userId: string) {
  const { data, error } = await insforge.database
    .from("interviews")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) throw error;
  return (data as Interview[])?.[0] ?? null;
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

export async function getTemplates() {
  const { data, error } = await insforge.database
    .from("resume_templates")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });
  if (error) throw error;
  return data as ResumeTemplate[];
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

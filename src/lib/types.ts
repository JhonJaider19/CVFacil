export interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResumeData {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  title?: string;
  summary?: string;
  experience?: Experience[];
  education?: Education[];
  skills?: string[];
}

export interface Experience {
  position: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  template_id: string;
  data: ResumeData;
  score: number;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Interview {
  id: string;
  user_id: string;
  resume_id: string | null;
  score: number;
  status: "in_progress" | "completed";
  duration_seconds: number;
  created_at: string;
}

export interface InterviewMessage {
  id: string;
  interview_id: string;
  role: "ai" | "user";
  content: string;
  created_at: string;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  category: string;
  styles: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface AiSuggestion {
  id: string;
  resume_id: string;
  section: string;
  suggestion: string;
  applied: boolean;
  created_at: string;
}

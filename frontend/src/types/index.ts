// EduNexus Type Definitions

export type UserRole = 'student' | 'teacher';

export interface User {
  id: string;
  firebase_uid: string;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
  avatar?: string;
}

export interface Classroom {
  id: string;
  name: string;
  description?: string;
  code: string;
  created_by: string;
  creator_name?: string;
  created_at: string;
  member_count?: number;
  // UI aliases
  teacherId?: string;
  teacherName?: string;
  studentCount?: number;
  subjects?: Subject[];
}

export interface Subject {
  id: string;
  classroom_id: string;
  name: string;
  description?: string;
  created_at: string;
  // UI aliases
  icon?: string;
  chapters?: Chapter[];
  noteCount?: number;
  order?: number;
  subjectTeacherId?: string;
  subjectTeacherName?: string;
}

export interface AccessedClassroom {
  classroom: Classroom;
  subjectId: string;
  subjectName: string;
}

export interface TeacherAccess {
  id: string;
  subject_id: string;
  teacher_id: string;
  teacher_name: string;
  teacher_email: string;
  created_at: string;
}

export interface Chapter {
  id: string;
  subject_id: string;
  name: string;
  description?: string;
  created_at: string;
  // UI aliases
  subjectId?: string;
  noteCount?: number;
  order?: number;
}

export type NoteVisibility = 'public' | 'private';
export type QuestionVisibility = 'public' | 'private';
export type NoteApprovalStatus = 'approved' | 'pending' | 'rejected';

export interface Note {
  id: string;
  chapter_id: string;
  title: string;
  content: string;
  file_url?: string;
  file_name?: string;
  visibility: NoteVisibility;
  approval_status: NoteApprovalStatus;
  uploaded_by: string;
  uploader_name: string;
  uploader_role?: string;
  approved_by?: string;
  approver_name?: string;
  created_at: string;
  // UI aliases
  chapterId?: string;
  chapterName?: string;
  authorId?: string;
  authorName?: string;
  authorRole?: string;
  status?: NoteApprovalStatus;
}

export interface Question {
  id: string;
  chapter_id: string;
  user_id: string;
  title: string;
  content: string;
  is_private: boolean;
  answer?: string;
  answered_by?: string;
  answered_at?: string;
  created_at: string;
  user_name: string;
  answerer_name?: string;
  // UI aliases
  text?: string;
  chapterId?: string;
  authorId?: string;
  authorName?: string;
  visibility?: NoteVisibility;
  answeredBy?: string;
  answeredAt?: string;
}

export interface Announcement {
  id: string;
  chapter_id: string;
  title: string;
  content: string;
  created_by: string;
  creator_name: string;
  created_at: string;
}

export interface PYQ {
  id: string;
  question: string;
  chapterId: string;
}

export interface NotebookResponse {
  answer: string;
  sources: { title: string; uploaded_by: string }[];
  note_count: number;
  chapter_name: string;
}

// UI specific types (can remain camelCase if they are not direct API responses)
export interface Recommendation {
  id: string;
  title: string;
  type: 'video' | 'article';
  url: string;
  description: string;
  thumbnail?: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  timestamp: string;
}

export type ChapterSection = 'notes' | 'notebook' | 'upload' | 'ask' | 'community';

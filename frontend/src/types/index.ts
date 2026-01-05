// EduNexus Type Definitions

export type UserRole = 'student' | 'teacher';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Classroom {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  teacherName: string;
  studentCount: number;
  subjects: Subject[];
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  classroomId: string;
  chapters: Chapter[];
  icon?: string;
  subjectTeacherId?: string;
  subjectTeacherName?: string;
}

export interface AccessedClassroom {
  classroom: Classroom;
  subjectId: string;
  subjectName: string;
}

export interface Chapter {
  id: string;
  name: string;
  subjectId: string;
  noteCount: number;
  order: number;
}

export type NoteVisibility = 'public' | 'private';
export type NoteStatus = 'pending' | 'approved' | 'rejected';

export interface Note {
  id: string;
  title: string;
  content: string;
  chapterId: string;
  chapterName?: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  visibility: NoteVisibility;
  status: NoteStatus;
  createdAt: string;
  fileUrl?: string;
}

export type QuestionVisibility = 'public' | 'private';

export interface Question {
  id: string;
  text: string;
  chapterId: string;
  authorId: string;
  authorName: string;
  visibility: QuestionVisibility;
  answer?: string;
  answeredBy?: string;
  createdAt: string;
  answeredAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  classroomId: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface PYQ {
  id: string;
  question: string;
  chapterId: string;
}

export interface Recommendation {
  id: string;
  title: string;
  type: 'video' | 'article';
  url: string;
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

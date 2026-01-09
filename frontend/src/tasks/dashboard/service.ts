import api from '@/lib/api';
import { Classroom, Note, Question } from '@/types';

// Types matching backend response
export interface PendingNote extends Note {
    chapter_name: string;
    author_name: string;
    created_at: string;
}

export interface PendingQuestion extends Question {
    chapter_name: string;
    author_name: string;
    is_private: boolean;
    created_at: string;
}

export interface TeacherDashboardData {
    created_classrooms: Classroom[];
    accessed_classrooms: Classroom[];
    pending_notes: PendingNote[];
    pending_questions: PendingQuestion[];
}

export const dashboardService = {
    getTeacherDashboard: async (): Promise<TeacherDashboardData> => {
        const response = await api.get<TeacherDashboardData>('/dashboard/teacher');
        return response.data;
    },

    createClassroom: async (name: string, description?: string): Promise<Classroom> => {
        const response = await api.post<Classroom>('/classrooms', {
            name,
            description
        });
        return response.data;
    },

    createSubject: async (classroomId: string, name: string, description?: string) => {
        const response = await api.post('/subjects', {
            classroom_id: classroomId,
            name,
            description
        });
        return response.data;
    },

    createChapter: async (subjectId: string, name: string, description?: string) => {
        const response = await api.post(`/subjects/${subjectId}/chapters`, {
            subject_id: subjectId,
            name,
            description
        });
        return response.data;
    },

    approveNote: async (noteId: string, status: 'approved' | 'rejected') => {
        const response = await api.patch(`/notes/${noteId}/approval`, { status });
        return response.data;
    },

    answerQuestion: async (questionId: string, content: string): Promise<Question> => {
        const response = await api.post(`/questions/${questionId}/answer`, { content });
        return response.data;
    },

    deleteClassroom: async (classroomId: string) => {
        const response = await api.delete(`/classrooms/${classroomId}`);
        return response.data;
    },

    deleteSubject: async (subjectId: string) => {
        const response = await api.delete(`/subjects/${subjectId}`);
        return response.data;
    },

    deleteChapter: async (chapterId: string) => {
        const response = await api.delete(`/chapters/${chapterId}`);
        return response.data;
    },
};

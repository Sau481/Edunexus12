
import api from '@/lib/api';
import { Note, Announcement, Question, NoteApprovalStatus, Recommendation } from '@/types';

export const chapterService = {
    // Notes
    listNotes: async (chapterId: string): Promise<Note[]> => {
        const response = await api.get(`/notes/chapter/${chapterId}`);
        return response.data;
    },

    approveNote: async (noteId: string, status: NoteApprovalStatus): Promise<Note> => {
        const response = await api.patch(`/notes/${noteId}/approval`, { status });
        return response.data;
    },

    // Announcements
    createAnnouncement: async (chapterId: string, title: string, content: string): Promise<Announcement> => {
        const response = await api.post('/community/announcements', {
            chapter_id: chapterId,
            title,
            content,
        });
        return response.data;
    },

    listAnnouncements: async (chapterId: string): Promise<Announcement[]> => {
        const response = await api.get(`/community/chapter/${chapterId}/announcements`);
        return response.data;
    },



    listAllAnnouncements: async (): Promise<Announcement[]> => {
        const response = await api.get('/community/all');
        return response.data;
    },

    listMyNotes: async (): Promise<Note[]> => {
        const response = await api.get('/notes/my-notes');
        return response.data;
    },

    // Questions
    createQuestion: async (chapterId: string, title: string, content: string, isPrivate: boolean): Promise<Question> => {
        const response = await api.post('/questions/', {
            chapter_id: chapterId,
            title,
            content,
            is_private: isPrivate,
        });
        return response.data;
    },

    listQuestions: async (chapterId: string): Promise<Question[]> => {
        const response = await api.get(`/questions/chapter/${chapterId}`);
        return response.data;
    },

    listCommunityQuestions: async (chapterId: string): Promise<Question[]> => {
        const response = await api.get(`/questions/chapter/${chapterId}/community`);
        return response.data;
    },

    listMyQuestions: async (): Promise<Question[]> => {
        const response = await api.get(`/questions/my-questions`);
        return response.data;
    },

    deleteQuestion: async (questionId: string) => {
        const response = await api.delete(`/questions/${questionId}`);
        return response.data;
    },

    deleteNote: async (noteId: string) => {
        const response = await api.delete(`/notes/${noteId}`);
        return response.data;
    },

    answerQuestion: async (questionId: string, content: string): Promise<Question> => {
        const response = await api.post(`/questions/${questionId}/answer`, { content });
        return response.data;
    },

    // Upload
    uploadNote: async (chapterId: string, title: string, visibility: 'public' | 'private', file: File): Promise<Note> => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('visibility', visibility);
        formData.append('file', file);

        const response = await api.post(`/upload/chapter/${chapterId}/note`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Notebook
    queryNotebook: async (chapterId: string, question: string): Promise<{ answer: string; sources: string[] }> => {
        const response = await api.post(`/notebook/chapter/${chapterId}/query`, { question });
        return {
            answer: response.data.answer,
            sources: response.data.sources.map((s: { title: string }) => s.title)
        };
    },

    getRecommendations: async (chapterId: string, query?: string): Promise<Recommendation[]> => {
        const response = await api.get(`/notebook/chapter/${chapterId}/recommendations`, {
            params: { query }
        });
        return response.data.recommendations;
    },
};



import api from '@/lib/api';
import { Classroom } from '@/types';

export const classroomService = {
    listClassrooms: async (): Promise<Classroom[]> => {
        const response = await api.get('/classrooms/');
        return response.data;
    },

    joinClassroom: async (code: string): Promise<Classroom> => {
        const response = await api.post('/classrooms/join', { code });
        return response.data;
    },
};

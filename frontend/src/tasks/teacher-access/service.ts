import api from '@/lib/api';

export interface TeacherAccess {
    id: string;
    subject_id: string;
    teacher_id: string;
    teacher_name: string;
    teacher_email: string;
    created_at: string;
}

export interface AssignTeacherRequest {
    subject_id: string;
    teacher_email: string;
}

class TeacherAccessService {
    /**
     * Assign a teacher to a subject
     */
    async assignTeacher(data: AssignTeacherRequest): Promise<TeacherAccess> {
        const response = await api.post<TeacherAccess>('/teacher-access/', data);
        return response.data;
    }

    /**
     * List all teachers assigned to a subject
     */
    async listSubjectTeachers(subjectId: string): Promise<TeacherAccess[]> {
        const response = await api.get<TeacherAccess[]>(`/teacher-access/subject/${subjectId}`);
        return response.data;
    }

    /**
     * Remove teacher access from a subject
     */
    async removeTeacher(accessId: string): Promise<void> {
        await api.delete(`/teacher-access/${accessId}`);
    }
}

export const teacherAccessService = new TeacherAccessService();

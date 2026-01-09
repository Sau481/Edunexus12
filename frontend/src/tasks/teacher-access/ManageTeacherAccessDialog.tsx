import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { teacherAccessService, TeacherAccess } from './service';
import { toast } from 'sonner';

interface ManageTeacherAccessDialogProps {
    isOpen: boolean;
    onClose: () => void;
    subjectId: string;
    subjectName: string;
}

export const ManageTeacherAccessDialog = ({
    isOpen,
    onClose,
    subjectId,
    subjectName,
}: ManageTeacherAccessDialogProps) => {
    const [teachers, setTeachers] = useState<TeacherAccess[]>([]);
    const [loading, setLoading] = useState(false);
    const [teacherEmail, setTeacherEmail] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadTeachers();
        }
    }, [isOpen, subjectId]);

    const loadTeachers = async () => {
        try {
            setLoading(true);
            const data = await teacherAccessService.listSubjectTeachers(subjectId);
            setTeachers(data);
        } catch (error) {
            console.error('Failed to load teachers:', error);
            toast.error('Failed to load teachers');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTeacher = async () => {
        if (!teacherEmail.trim()) {
            toast.error('Please enter a teacher email');
            return;
        }

        try {
            setIsAdding(true);
            const newAccess = await teacherAccessService.assignTeacher({
                subject_id: subjectId,
                teacher_email: teacherEmail.trim(),
            });
            setTeachers([...teachers, newAccess]);
            setTeacherEmail('');
            toast.success(`Access granted to ${newAccess.teacher_name}`);
        } catch (error: any) {
            console.error('Failed to add teacher:', error);
            toast.error(error.response?.data?.detail || 'Failed to grant access');
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemoveTeacher = async (accessId: string, teacherName: string) => {
        try {
            await teacherAccessService.removeTeacher(accessId);
            setTeachers(teachers.filter((t) => t.id !== accessId));
            toast.success(`Access removed from ${teacherName}`);
        } catch (error) {
            console.error('Failed to remove teacher:', error);
            toast.error('Failed to remove access');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Manage Teacher Access
                    </DialogTitle>
                    <DialogDescription>
                        Grant or revoke teacher access to <span className="font-semibold">{subjectName}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Add Teacher Section */}
                    <div className="space-y-2">
                        <Label htmlFor="teacher-email">Add Teacher by Email</Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="teacher-email"
                                    type="email"
                                    placeholder="teacher@example.com"
                                    value={teacherEmail}
                                    onChange={(e) => setTeacherEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTeacher()}
                                    className="pl-9"
                                />
                            </div>
                            <Button onClick={handleAddTeacher} disabled={isAdding || !teacherEmail.trim()}>
                                {isAdding ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Teachers List */}
                    <div className="space-y-2">
                        <Label>Teachers with Access</Label>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : teachers.length > 0 ? (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {teachers.map((teacher) => (
                                    <div
                                        key={teacher.id}
                                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{teacher.teacher_name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{teacher.teacher_email}</p>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleRemoveTeacher(teacher.id, teacher.teacher_name)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8 border rounded-lg border-dashed">
                                No teachers assigned yet
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

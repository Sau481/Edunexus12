import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Users, Trash2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Classroom, Subject } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { ManageTeacherAccessDialog } from '@/tasks/teacher-access/ManageTeacherAccessDialog';
import { dashboardService } from '@/tasks/dashboard/service';
import { toast } from 'sonner';

interface ClassroomViewProps {
  classroom: Classroom;
  onBack: () => void;
  onSelectSubject: (subject: Subject) => void;
}

export const ClassroomView = ({ classroom, onBack, onSelectSubject }: ClassroomViewProps) => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  const [accessDialogOpen, setAccessDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const subjects = classroom.subjects || [];

  const openAccessDialog = (e: React.MouseEvent, subject: Subject) => {
    e.stopPropagation();
    setSelectedSubject(subject);
    setAccessDialogOpen(true);
  };

  const handleDeleteSubject = async (e: React.MouseEvent, subjectId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this subject?')) return;
    try {
      await dashboardService.deleteSubject(subjectId);
      toast.success('Subject deleted');
      // Optimistically remove from list? 
      // Since subjects prop comes from parent, we might need a refresh callback.
      // For now, reload window or ignore (parent refresh is better).
      // Let's assume onBack triggers refresh, but here we stay.
      // Actually, we should probably force reload or have an onSubjectDeleted prop.
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete subject');
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showBack onBack={onBack} title={classroom.name} />

      <main className="container px-4 sm:px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold">{classroom.name}</h1>
          <p className="text-muted-foreground mt-1">
            {subjects.length} subjects • {classroom.member_count || 0} members
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {subjects.map((subject) => (
            <motion.div key={subject.id} variants={item}>
              <Card
                className="cursor-pointer hover:border-primary/50 hover:bg-surface-hover transition-all group"
                onClick={() => onSelectSubject(subject)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <span className="text-2xl">📚</span>
                    <span className="flex-1">{subject.name}</span>
                    {isTeacher && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => openAccessDialog(e, subject)}
                          title="Manage teacher access"
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={(e) => handleDeleteSubject(e, subject.id)}
                          title="Delete Subject"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    {subject.description || 'No description'}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {subjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No subjects yet</h3>
            <p className="text-muted-foreground">Subjects will appear here once added by the teacher.</p>
          </motion.div>
        )}
      </main>

      {/* Manage Teacher Access Dialog */}
      {selectedSubject && (
        <ManageTeacherAccessDialog
          isOpen={accessDialogOpen}
          onClose={() => setAccessDialogOpen(false)}
          subjectId={selectedSubject.id}
          subjectName={selectedSubject.name}
        />
      )}
    </div>
  );
};
import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, UserPlus } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Classroom, Subject } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface ClassroomViewProps {
  classroom: Classroom;
  onBack: () => void;
  onSelectSubject: (subject: Subject) => void;
}

export const ClassroomView = ({ classroom, onBack, onSelectSubject }: ClassroomViewProps) => {
  const { user } = useAuth();
  const isClassOwner = user?.role === 'teacher' && classroom.teacherId === 'teacher-1';
  
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [teacherEmail, setTeacherEmail] = useState('');
  const [subjects, setSubjects] = useState(classroom.subjects);

  const handleGiveAccess = () => {
    if (!selectedSubject || !teacherEmail.trim()) return;
    
    setSubjects(subjects.map(s => {
      if (s.id === selectedSubject.id) {
        return {
          ...s,
          subjectTeacherId: `teacher-${Date.now()}`,
          subjectTeacherName: teacherEmail,
        };
      }
      return s;
    }));
    
    setAccessDialogOpen(false);
    setSelectedSubject(null);
    setTeacherEmail('');
  };

  const openAccessDialog = (e: React.MouseEvent, subject: Subject) => {
    e.stopPropagation();
    setSelectedSubject(subject);
    setTeacherEmail('');
    setAccessDialogOpen(true);
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
            {subjects.length} subjects • {classroom.studentCount} students
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
                    <span className="text-2xl">{subject.icon || '📚'}</span>
                    <span className="flex-1">{subject.name}</span>
                    {isClassOwner && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => openAccessDialog(e, subject)}
                        title="Give subject access"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    )}
                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    {subject.chapters.length} chapters
                  </div>
                  {subject.subjectTeacherName && (
                    <p className="text-xs text-primary mt-1">
                      Subject Teacher: {subject.subjectTeacherName}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {subject.chapters.slice(0, 3).map((chapter, idx) => (
                      <span
                        key={chapter.id}
                        className="text-xs px-2 py-1 bg-secondary rounded-full text-secondary-foreground"
                      >
                        Unit {idx + 1}
                      </span>
                    ))}
                    {subject.chapters.length > 3 && (
                      <span className="text-xs px-2 py-1 text-muted-foreground">
                        +{subject.chapters.length - 3} more
                      </span>
                    )}
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

      {/* Give Subject Access Dialog */}
      <Dialog open={accessDialogOpen} onOpenChange={setAccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Give Subject Access</DialogTitle>
            <DialogDescription>
              Assign a teacher to manage "{selectedSubject?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="teacherEmail">Teacher Email</Label>
              <Input
                id="teacherEmail"
                type="email"
                placeholder="teacher@example.com"
                value={teacherEmail}
                onChange={(e) => setTeacherEmail(e.target.value)}
              />
            </div>
            {selectedSubject?.subjectTeacherName && (
              <p className="text-sm text-muted-foreground">
                Current: {selectedSubject.subjectTeacherName}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAccessDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleGiveAccess} 
              disabled={!teacherEmail.trim()}
            >
              Give Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
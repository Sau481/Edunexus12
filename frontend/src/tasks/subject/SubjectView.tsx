import { motion } from 'framer-motion';
import { FileText, ChevronRight, Trash2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Subject, Chapter } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardService } from '@/tasks/dashboard/service';
import { toast } from 'sonner';

interface SubjectViewProps {
  subject: Subject;
  onBack: () => void;
  onSelectChapter: (chapter: Chapter) => void;
}

export const SubjectView = ({ subject, onBack, onSelectChapter }: SubjectViewProps) => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  const handleDeleteChapter = async (e: React.MouseEvent, chapterId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this chapter?')) return;
    try {
      await dashboardService.deleteChapter(chapterId);
      toast.success('Chapter deleted');
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete chapter');
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showBack onBack={onBack} title={subject.name} />

      <main className="container px-4 sm:px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">{subject.icon || '📚'}</span>
            <div>
              <h1 className="text-2xl font-bold">{subject.name}</h1>
              <p className="text-muted-foreground mt-1">
                {subject.chapters?.length || 0} chapters
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {(subject.chapters || []).map((chapter, index) => (
            <motion.div key={chapter.id} variants={item}>
              <Card
                className="cursor-pointer hover:border-primary/50 hover:bg-surface-hover transition-all group"
                onClick={() => onSelectChapter(chapter)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{chapter.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <FileText className="h-3.5 w-3.5" />
                        {chapter.noteCount} notes
                      </div>
                    </div>
                    {isTeacher && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleDeleteChapter(e, chapter.id)}
                        title="Delete Chapter"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </main >
    </div >
  );
};

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, X } from 'lucide-react';
import { NoteCard } from '@/components/common/NoteCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockNotes } from '@/data/mockData';
import { Note } from '@/types';

interface NotesSectionProps {
  chapterId: string;
}

export const NotesSection = ({ chapterId }: NotesSectionProps) => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  
  // Filter approved notes for this chapter (public + teacher notes)
  const notes = mockNotes.filter(
    (n) => n.chapterId === chapterId && (n.status === 'approved' || n.authorRole === 'teacher')
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          All Notes
        </h2>
        <span className="text-sm text-muted-foreground">{notes.length} notes</span>
      </div>

      {selectedNote ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>{selectedNote.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  By {selectedNote.authorName} • {selectedNote.authorRole}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedNote(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{selectedNote.content}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {notes.map((note) => (
            <motion.div key={note.id} variants={item}>
              <NoteCard note={note} onClick={() => setSelectedNote(note)} />
            </motion.div>
          ))}

          {notes.length === 0 && (
            <motion.div variants={item} className="col-span-full">
              <Card className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">No notes yet</h3>
                <p className="text-muted-foreground">
                  Notes will appear here once uploaded and approved.
                </p>
              </Card>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};

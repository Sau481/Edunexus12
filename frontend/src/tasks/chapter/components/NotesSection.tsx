import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, X, Download } from 'lucide-react';
import { NoteCard } from '@/components/common/NoteCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Note } from '@/types';
import { chapterService } from '../service';
import { toast } from 'sonner';

import { PDFViewer } from '@/components/common/PDFViewer';

interface NotesSectionProps {
  chapterId: string;
}

export const NotesSection = ({ chapterId }: NotesSectionProps) => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    if (note.file_url) {
      setViewerOpen(true);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [chapterId]);

  const loadNotes = async () => {
    try {
      const fetchedNotes = await chapterService.listNotes(chapterId);
      // Filter strictly for approved notes (since main view should be for class consumption)
      // The backend returns user's own notes too, but we want them in "My Uploads" not here if pending.
      // So we filter: status === 'approved' OR note is from a teacher (though usually teachers notes are auto-approved)
      // Actually, if a teacher uploads, status might be 'approved' by default.
      // Let's rely on 'approval_status' === 'approved'.

      const approvedNotes = fetchedNotes.filter(n => n.approval_status === 'approved');
      setNotes(approvedNotes);
    } catch (error) {
      console.error('Failed to load notes:', error);
      toast.error('Failed to load notes');
    }
  };

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

      <PDFViewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        url={selectedNote?.file_url || ''}
        title={selectedNote?.title || 'Document'}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {notes.map((note) => (
          <motion.div key={note.id} variants={item}>
            <NoteCard note={note} onClick={() => handleNoteClick(note)} />
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
    </div>
  );
};

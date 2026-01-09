import { motion } from 'framer-motion';
import { FileText, User, Eye, EyeOff } from 'lucide-react';
import { Note } from '@/types';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';

interface NoteCardProps {
  note: Note;
  onClick?: () => void;
  showStatus?: boolean;
  showChapter?: boolean;
  compact?: boolean;
}

export const NoteCard = ({ note, onClick, showStatus = false, showChapter = false, compact = false }: NoteCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        'group cursor-pointer rounded-lg border border-border bg-card p-4 transition-colors hover:bg-surface-hover hover:border-primary/30',
        compact && 'p-3'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className={cn('font-medium text-foreground truncate', compact ? 'text-sm' : 'text-base')}>
            {note.title}
          </h4>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {note.uploader_name || note.authorName}
            </span>
            <span className="text-border">•</span>
            <span className="capitalize">{note.uploader_role || note.authorRole || 'Student'}</span>
            {note.visibility === 'private' ? (
              <span className="flex items-center gap-1 text-muted-foreground">
                <EyeOff className="h-3 w-3" />
                Private
              </span>
            ) : (
              <span className="flex items-center gap-1 text-edu-teal">
                <Eye className="h-3 w-3" />
                Public
              </span>
            )}
          </div>
          {showChapter && note.chapterName && (
            <p className="mt-1 text-xs text-muted-foreground truncate">{note.chapterName}</p>
          )}
          {showStatus && (
            <div className="mt-2">
              <StatusBadge status={note.status || 'pending'} />
            </div>
          )}
          {!compact && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{note.content}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

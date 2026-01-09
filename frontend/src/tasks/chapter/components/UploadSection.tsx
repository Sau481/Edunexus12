import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileUp, Eye, EyeOff, Loader2, CheckCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

import { useAuth } from '@/contexts/AuthContext';
import { NoteVisibility, Note } from '@/types';
import { toast } from 'sonner';
import { chapterService } from '../service';
import { cn } from '@/lib/utils';

interface UploadSectionProps {
  chapterId: string;
}

export const UploadSection = ({ chapterId }: UploadSectionProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<NoteVisibility>('public');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [myNotes, setMyNotes] = useState<Note[]>([]);

  // File selection state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMyNotes();
  }, [chapterId, user]);

  const fetchMyNotes = async () => {
    if (!user) return;
    try {
      // Use listMyNotes to fetch ALL user notes, then filter by this chapter
      // This avoids backend visibility rules for the general list hiding pending/private notes inadvertently
      // or relying on complex client-side filtering of the public list.
      const allMyNotes = await chapterService.listMyNotes();
      setMyNotes(allMyNotes.filter(n => n.chapter_id === chapterId));
    } catch (error) {
      console.error('Failed to fetch my uploads', error);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if ((!title.trim() && !selectedFile) || (selectedFile && !selectedFile.name)) {
      toast.error("Please provide a title or select a file.");
      return;
    }

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      let fileToUpload: File;

      if (selectedFile) {
        fileToUpload = selectedFile;
      } else {
        const blob = new Blob([content], { type: 'text/plain' });
        fileToUpload = new File([blob], `${title || 'untitled'}.txt`, { type: 'text/plain' });
      }

      const noteTitle = title || fileToUpload.name;

      const uploadedNote = await chapterService.uploadNote(chapterId, noteTitle, visibility, fileToUpload);

      // Add to myNotes immediately for instant feedback
      setMyNotes(prev => [uploadedNote, ...prev]);

      setUploadSuccess(true);
      toast.success('Note uploaded successfully!');

      // Reset form after success
      setTitle('');
      setContent('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (error: any) {
      console.error('Upload error:', error);
      const message = error.response?.data?.detail || error.message || 'Failed to publish note.';
      toast.error(message);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadSuccess(false), 2000); // Hide success message after a delay
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Upload Form */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Note
            </CardTitle>
            <CardDescription>
              Share your notes with the class or keep them private
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadSuccess ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-8 text-center"
              >
                <CheckCircle className="h-12 w-12 text-edu-success mx-auto mb-4" />
                <h3 className="text-lg font-medium">Note Uploaded!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {visibility === 'public'
                    ? 'Waiting for teacher approval'
                    : 'Your private note is saved'}
                </p>
              </motion.div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Note Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter a descriptive title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your notes or paste content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[150px] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Or upload a file</Label>
                  <div
                    onClick={handleFileClick}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${selectedFile ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.txt"
                    />
                    <FileUp className={`h-8 w-8 mx-auto mb-2 ${selectedFile ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className={`text-sm ${selectedFile ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {selectedFile ? selectedFile.name : 'Click to upload PDF or text file'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Visibility</Label>
                  <RadioGroup
                    value={visibility}
                    onValueChange={(v) => setVisibility(v as NoteVisibility)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="public" />
                      <Label htmlFor="public" className="flex items-center gap-2 cursor-pointer">
                        <Eye className="h-4 w-4 text-edu-teal" />
                        Public
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="private" />
                      <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer">
                        <EyeOff className="h-4 w-4" />
                        Private
                      </Label>
                    </div>
                  </RadioGroup>
                  {visibility === 'public' && (
                    <p className="text-xs text-muted-foreground">
                      Public notes require teacher approval before being visible to others.
                    </p>
                  )}
                </div>

                <Button
                  className="w-full"
                  onClick={handleUpload}
                  disabled={isUploading || (!title.trim() && !selectedFile)}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Note
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* My Uploads */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">My Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myNotes.length > 0 ? (
                myNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{note.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                        {note.visibility === 'private' ? (
                          <span className="flex items-center gap-1">
                            <EyeOff className="h-3 w-3" /> Private
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-edu-teal">
                            <Eye className="h-3 w-3" /> Public
                          </span>
                        )}
                      </p>
                    </div>
                    <StatusBadge note={note} onDelete={() => setMyNotes(prev => prev.filter(n => n.id !== note.id))} />
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notes uploaded yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div >
    </div >
  );
};

const StatusBadge = ({ note, onDelete }: { note: Note; onDelete: () => void }) => {
  const isPending = note.approval_status === 'pending';

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this pending note?')) return;
    try {
      await chapterService.deleteNote(note.id);
      onDelete(); // Optimistic UI update
      toast.success('Note deleted');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete note');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className={cn(
        "capitalize",
        note.approval_status === 'approved' && "bg-green-500/10 text-green-500 border-green-500/20",
        note.approval_status === 'rejected' && "bg-red-500/10 text-red-500 border-red-500/20",
        note.approval_status === 'pending' && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      )}>
        {note.approval_status}
      </Badge>
      {isPending && (
        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={handleDelete}>
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

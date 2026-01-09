import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileUp, Eye, Loader2, CheckCircle, FolderOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Note } from '@/types';
import { chapterService } from '../service';
import { toast } from 'sonner';

interface TeacherUploadSectionProps {
  chapterId: string;
}

export const TeacherUploadSection = ({ chapterId }: TeacherUploadSectionProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [myNotes, setMyNotes] = useState<Note[]>([]);

  // File selection state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMyNotes = async () => {
    if (!user) return;
    try {
      const notes = await chapterService.listNotes(chapterId);
      // Filter strictly for my uploads
      setMyNotes(notes.filter(n => n.uploaded_by === user.id));
    } catch (error) {
      console.error('Failed to fetch my uploads', error);
    }
  };

  useEffect(() => {
    fetchMyNotes();
  }, [user, chapterId]);

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
      toast.error('Please provide a title or select a file.');
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

      // Teacher notes always 'public' per previous logic
      await chapterService.uploadNote(chapterId, noteTitle, 'public', fileToUpload);

      setUploadSuccess(true);
      toast.success('Note published successfully!');

      await fetchMyNotes(); // Refresh the notes list

      // Reset form after success
      setTimeout(() => {
        setTitle('');
        setContent('');
        setSelectedFile(null);
        setUploadSuccess(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 2000);

    } catch (error: any) {
      console.error('Upload error:', error);
      const message = error.response?.data?.detail || error.message || 'Failed to publish note.';
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Tabs defaultValue="upload" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="upload" className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Notes
        </TabsTrigger>
        <TabsTrigger value="my-uploads" className="gap-2">
          <FolderOpen className="h-4 w-4" />
          My Uploads
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upload" className="mt-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Upload Note (Public)
              </CardTitle>
              <CardDescription>
                Teacher notes are automatically public and don't require approval
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
                  <h3 className="text-lg font-medium">Note Published!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your note is now visible to all students
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
                      className="min-h-[200px] resize-none"
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
                        data-testid="file-input"
                      />
                      <FileUp className={`h-8 w-8 mx-auto mb-2 ${selectedFile ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className={`text-sm ${selectedFile ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                        {selectedFile ? selectedFile.name : 'Click to upload PDF or text file'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-edu-teal/10 rounded-lg flex items-center gap-2">
                    <Eye className="h-4 w-4 text-edu-teal" />
                    <span className="text-sm text-edu-teal">
                      This note will be publicly visible to all students
                    </span>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleUpload}
                    disabled={isUploading || (!title.trim() && !selectedFile)}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Publish Note
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      <TabsContent value="my-uploads" className="mt-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FolderOpen className="h-5 w-5 text-primary" />
                My Uploads in This Chapter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myNotes.length > 0 ? (
                  myNotes.map((note) => (
                    <div
                      key={note.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{note.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 text-edu-teal">
                            <Eye className="h-3 w-3" /> Public
                          </span>
                          <span>•</span>
                          <span>{new Date(note.created_at).toLocaleDateString()}</span>
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-edu-success/20 text-edu-success">
                        Published
                      </span>
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
        </motion.div>
      </TabsContent>
    </Tabs>
  );
};

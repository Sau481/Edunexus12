import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileUp, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/common/StatusBadge';
import { mockNotes } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { NoteVisibility, Note } from '@/types';

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

  // Get user's notes for this chapter
  const myNotes = mockNotes.filter((n) => n.chapterId === chapterId && n.authorId === user?.id);

  const handleUpload = async () => {
    if (!title.trim() || !content.trim()) return;
    
    setIsUploading(true);
    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsUploading(false);
    setUploadSuccess(true);
    
    // Reset form after success
    setTimeout(() => {
      setTitle('');
      setContent('');
      setUploadSuccess(false);
    }, 2000);
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
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <FileUp className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload PDF or text file
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
                  disabled={isUploading || !title.trim() || !content.trim()}
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
            <CardTitle className="text-sm">My Uploads in This Chapter</CardTitle>
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
                    <StatusBadge status={note.status} />
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
    </div>
  );
};

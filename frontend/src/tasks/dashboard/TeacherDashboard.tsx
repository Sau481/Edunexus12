import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, BookOpen, FileText, CheckCircle, XCircle, MessageSquare, Loader2, Trash2, Send } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Textarea } from '@/components/ui/textarea';
import { Classroom, Note, Question, Subject, Chapter } from '@/types';
import { dashboardService } from './service';
import { PDFViewer } from '@/components/common/PDFViewer';

interface TeacherDashboardProps {
  onSelectClassroom: (classroom: Classroom) => void;
  onViewAnnouncements: () => void;
  onViewMyNotes: () => void;
}

// Available subjects to choose from
const availableSubjects = [
  { id: 'set', name: 'Software Engineering & Testing', icon: '🧪' },
  { id: 'cn', name: 'Computer Networks', icon: '🌐' },
  { id: 'dsa', name: 'Data Structures & Algorithms', icon: '📊' },
  { id: 'ml', name: 'Machine Learning', icon: '🤖' },
  { id: 'dbms', name: 'Database Management Systems', icon: '🗄️' },
  { id: 'os', name: 'Operating Systems', icon: '💻' },
];

interface SubjectConfig {
  subjectId: string;
  units: number;
}

export const TeacherDashboard = ({ onSelectClassroom, onViewAnnouncements, onViewMyNotes }: TeacherDashboardProps) => {
  const [createdClassrooms, setCreatedClassrooms] = useState<Classroom[]>([]);
  const [accessedClassrooms, setAccessedClassrooms] = useState<Classroom[]>([]);
  const [pendingNotes, setPendingNotes] = useState<any[]>([]);
  const [pendingQuestions, setPendingQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newClassroomName, setNewClassroomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Subject configuration state
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectConfig[]>([]);
  const [currentSubject, setCurrentSubject] = useState<string>('');
  const [currentUnits, setCurrentUnits] = useState<string>('4');

  // Answer question state
  const [answerDialogOpen, setAnswerDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answerText, setAnswerText] = useState('');

  // Fetch Dashboard Data
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getTeacherDashboard();
      setCreatedClassrooms(data.created_classrooms);
      setAccessedClassrooms(data.accessed_classrooms);
      setPendingNotes(data.pending_notes);
      setPendingQuestions(data.pending_questions);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreateClassroom = async () => {
    if (!newClassroomName.trim()) return;

    try {
      setIsCreating(true);

      // 1. Create the classroom
      const classroom = await dashboardService.createClassroom(newClassroomName);

      // 2. Create subjects and chapters
      for (const subjectConfig of selectedSubjects) {
        // Find subject info
        const subjectInfo = availableSubjects.find(s => s.id === subjectConfig.subjectId);
        if (!subjectInfo) continue;

        // Create subject
        const subject = await dashboardService.createSubject(
          classroom.id,
          subjectInfo.name,
          `${subjectInfo.name} course content`
        );

        // Create chapters for this subject
        for (let i = 1; i <= subjectConfig.units; i++) {
          await dashboardService.createChapter(
            subject.id,
            `Unit ${i}: ${subjectInfo.name} - Part ${i}`,
            `Chapter ${i} content`
          );
        }
      }

      // 3. Success - refresh dashboard and close dialog
      await fetchDashboard();
      setCreateDialogOpen(false);
      setNewClassroomName('');
      setSelectedSubjects([]);

      // Show success notification
      const { toast } = await import('sonner');
      toast.success('Classroom created successfully!');

    } catch (error: any) {
      console.error('Failed to create classroom:', error);
      const { toast } = await import('sonner');
      toast.error(error.response?.data?.detail || 'Failed to create classroom');
    } finally {
      setIsCreating(false);
    }
  };

  // ... (keep helper functions like handleAddSubject, handleRemoveSubject if needed for UI, 
  // but for now focusing on data display removal of mock)

  const handleAddSubject = () => {
    if (!currentSubject || selectedSubjects.some(s => s.subjectId === currentSubject)) return;
    setSelectedSubjects([...selectedSubjects, { subjectId: currentSubject, units: parseInt(currentUnits) || 4 }]);
    setCurrentSubject('');
    setCurrentUnits('4');
  };

  const handleRemoveSubject = (subjectId: string) => {
    setSelectedSubjects(selectedSubjects.filter(s => s.subjectId !== subjectId));
  };

  // PDF Viewer State
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);

  const handleViewPdf = async (url: string | undefined, noteTitle: string) => {
    console.log('Opening PDF for:', noteTitle, 'URL:', url);
    if (url) {
      setPdfUrl(url);
      setPdfViewerOpen(true);
    } else {
      const { toast } = await import('sonner');
      toast.error("No document attached to this note");
    }
  };

  const handleAnswerQuestion = async () => {
    if (!selectedQuestion || !answerText.trim()) return;

    try {
      await dashboardService.answerQuestion(selectedQuestion.id, answerText);
      setPendingQuestions(pendingQuestions.filter(q => q.id !== selectedQuestion.id));
      const { toast } = await import('sonner');
      toast.success("Question answered successfully");

      setAnswerDialogOpen(false);
      setSelectedQuestion(null);
      setAnswerText('');
    } catch (error) {
      console.error("Failed to answer question", error);
      const { toast } = await import('sonner');
      toast.error("Failed to answer question");
    }
  };

  const openAnswerDialog = (question: Question) => {
    setSelectedQuestion(question);
    setAnswerText('');
    setAnswerDialogOpen(true);
  };

  const handleApproveNote = async (noteId: string) => {
    try {
      await dashboardService.approveNote(noteId, 'approved');
      setPendingNotes(pendingNotes.filter(n => n.id !== noteId));
      const { toast } = await import('sonner');
      toast.success('Note approved successfully');
    } catch (error) {
      console.error('Failed to approve note:', error);
      const { toast } = await import('sonner');
      toast.error('Failed to approve note');
    }
  };

  const handleRejectNote = async (noteId: string) => {
    try {
      await dashboardService.approveNote(noteId, 'rejected');
      setPendingNotes(pendingNotes.filter(n => n.id !== noteId));
      const { toast } = await import('sonner');
      toast.success('Note rejected');
    } catch (error) {
      console.error('Failed to reject note:', error);
      const { toast } = await import('sonner');
      toast.error('Failed to reject note');
    }
  };

  const handleDeleteClassroom = async (e: React.MouseEvent, classroomId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this classroom? This will delete all subjects and chapters within it.')) return;

    try {
      await dashboardService.deleteClassroom(classroomId);
      setCreatedClassrooms(createdClassrooms.filter(c => c.id !== classroomId));
      const { toast } = await import('sonner');
      toast.success('Classroom deleted');
    } catch (error) {
      console.error(error);
      const { toast } = await import('sonner');
      toast.error('Failed to delete classroom');
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 sm:px-6 py-6">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Created Classrooms Section */}
          <motion.section variants={item}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5 text-primary" />
                      Created Classrooms
                    </CardTitle>
                    <CardDescription>Classrooms you manage</CardDescription>
                  </div>
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Classroom
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      {/* ... Dialog Content (kept same) ... */}
                      <DialogHeader>
                        <DialogTitle>Create New Classroom</DialogTitle>
                        <DialogDescription>
                          Set up your classroom with subjects and units
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Classroom Name</Label>
                          <Input
                            id="name"
                            placeholder="e.g., Computer Science 2024"
                            value={newClassroomName}
                            onChange={(e) => setNewClassroomName(e.target.value)}
                          />
                        </div>

                        {/* Add Subject Section */}
                        <div className="space-y-3">
                          <Label>Add Subjects</Label>
                          <div className="flex gap-2">
                            <Select value={currentSubject} onValueChange={setCurrentSubject}>
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select a subject" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableSubjects
                                  .filter(s => !selectedSubjects.some(sel => sel.subjectId === s.id))
                                  .map((subject) => (
                                    <SelectItem key={subject.id} value={subject.id}>
                                      {subject.icon} {subject.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <Select value={currentUnits} onValueChange={setCurrentUnits}>
                              <SelectTrigger className="w-24">
                                <SelectValue placeholder="Units" />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                                  <SelectItem key={num} value={num.toString()}>
                                    {num} {num === 1 ? 'Unit' : 'Units'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleAddSubject}
                              disabled={!currentSubject}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Selected Subjects List */}
                        {selectedSubjects.length > 0 && (
                          <div className="space-y-2">
                            <Label>Selected Subjects</Label>
                            <div className="space-y-2">
                              {selectedSubjects.map((config) => {
                                const subjectInfo = availableSubjects.find(s => s.id === config.subjectId);
                                return (
                                  <div
                                    key={config.subjectId}
                                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span>{subjectInfo?.icon}</span>
                                      <span className="text-sm font-medium">{subjectInfo?.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        ({config.units} {config.units === 1 ? 'unit' : 'units'})
                                      </span>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveSubject(config.subjectId)}
                                      className="text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateClassroom} disabled={isCreating || !newClassroomName}>
                          {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {/* Created Classrooms List */}
                {createdClassrooms.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {createdClassrooms.map((classroom) => (
                      <motion.div
                        key={classroom.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className="cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => onSelectClassroom(classroom)}
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">{classroom.name}</CardTitle>
                            {classroom.description && (
                              <CardDescription className="line-clamp-1">{classroom.description}</CardDescription>
                            )}
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <BookOpen className="h-4 w-4" />
                                {classroom.subjects?.length || 0} Subjects
                              </span>
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Users className="h-4 w-4" />
                                {classroom.member_count || 0}
                              </span>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                              <div className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded w-fit">
                                Code: {classroom.code}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                onClick={(e) => handleDeleteClassroom(e, classroom.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No created classrooms. Create one to get started!
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.section>

          {/* Accessed Classrooms Section */}
          <motion.section variants={item}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Accessed Classrooms
                </CardTitle>
                <CardDescription>Classrooms you're assigned to as a subject teacher</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Accessed Classrooms List */}
                {accessedClassrooms.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {accessedClassrooms.map((classroom) => (
                      <motion.div
                        key={classroom.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className="cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => onSelectClassroom(classroom)}
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">{classroom.name}</CardTitle>
                            <CardDescription className="line-clamp-1">
                              Created by: {classroom.creator_name || 'Unknown'}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <BookOpen className="h-4 w-4" />
                                {classroom.subjects?.length || 0} Assigned Subjects
                              </span>
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Users className="h-4 w-4" />
                                {classroom.member_count || 0} Students
                              </span>
                            </div>
                            <div className="mt-3 text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded w-fit">
                              Code: {classroom.code}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    You haven't been assigned to any classrooms yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.section>

          {/* Approval & Questions Tabs */}
          <motion.section variants={item}>
            <Tabs defaultValue="approvals">
              <TabsList>
                <TabsTrigger value="approvals" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Pending Approvals
                  {pendingNotes.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-destructive/20 text-destructive rounded-full">
                      {pendingNotes.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="questions" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Questions
                  {pendingQuestions.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-edu-warning/20 text-edu-warning rounded-full">
                      {pendingQuestions.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="approvals" className="mt-4">
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/50">
                            <th className="text-left p-4 font-medium">Note</th>
                            <th className="text-left p-4 font-medium hidden sm:table-cell">Author</th>
                            <th className="text-left p-4 font-medium hidden md:table-cell">Chapter</th>
                            <th className="text-left p-4 font-medium">Status</th>
                            <th className="text-right p-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingNotes.length > 0 ? (
                            pendingNotes.map((note) => (
                              <tr key={note.id} className="border-b border-border last:border-0">
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="font-medium cursor-pointer hover:text-primary hover:underline"
                                      onClick={() => handleViewPdf(note.file_url, note.title)}
                                    >
                                      {note.title}
                                    </span>
                                    {note.file_url && <FileText className="h-3 w-3 text-muted-foreground" />}
                                  </div>
                                </td>
                                <td className="p-4 hidden sm:table-cell text-muted-foreground">
                                  {note.author_name}
                                </td>
                                <td className="p-4 hidden md:table-cell text-muted-foreground">
                                  {note.chapter_name || 'N/A'}
                                </td>
                                <td className="p-4">
                                  <StatusBadge status={note.status || 'pending'} />
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-edu-success hover:text-edu-success"
                                      onClick={() => handleApproveNote(note.id)}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-destructive hover:text-destructive"
                                      onClick={() => handleRejectNote(note.id)}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                No pending notes to approve.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="questions" className="mt-4">
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {pendingQuestions.length > 0 ? (
                        pendingQuestions.map((question) => (
                          <div key={question.id} className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p className="font-medium">{question.title}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {question.content}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  Asked by {question.author_name} • {question.is_private ? 'Private' : 'Public'}
                                </p>
                              </div>
                              <Button size="sm" onClick={() => openAnswerDialog(question)}>
                                Answer
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-muted-foreground">
                          No unanswered questions.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.section>
        </motion.div>

        {/* Answer Question Dialog */}
        <Dialog open={answerDialogOpen} onOpenChange={setAnswerDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Answer Question</DialogTitle>
              <DialogDescription>
                Provide an answer to the student's question
              </DialogDescription>
            </DialogHeader>
            {selectedQuestion && (
              <div className="space-y-4 py-4">
                <div className="p-3 rounded-lg bg-muted">
                  <p className="font-medium text-sm">{selectedQuestion.title}</p>
                  <div className="text-sm text-muted-foreground mt-1">{selectedQuestion.content}</div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="answer">Your Answer</Label>
                  <Textarea
                    id="answer"
                    placeholder="Type your answer here..."
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setAnswerDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAnswerQuestion}
                disabled={!answerText.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Answer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>

      <PDFViewer
        isOpen={pdfViewerOpen}
        onClose={() => setPdfViewerOpen(false)}
        url={pdfUrl}
        title="Review Note"
      />
    </div>
  );
};

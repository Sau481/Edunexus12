import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, BookOpen, FileText, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { mockClassrooms, mockNotes } from '@/data/mockData';
import { Classroom, Note } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface StudentDashboardProps {
  onSelectClassroom: (classroom: Classroom) => void;
}

export const StudentDashboard = ({ onSelectClassroom }: StudentDashboardProps) => {
  const { user } = useAuth();
  const [classroomCode, setClassroomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinedClassrooms] = useState<Classroom[]>(mockClassrooms);
  const [myNotes] = useState<Note[]>(mockNotes.filter(n => n.authorId === user?.id));

  const handleJoinClassroom = async () => {
    if (!classroomCode.trim()) return;
    setIsJoining(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsJoining(false);
    setClassroomCode('');
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
          {/* Join Classroom Section */}
          <motion.section variants={item}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Join Classroom
                </CardTitle>
                <CardDescription>Enter a classroom code to join</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label htmlFor="code" className="sr-only">Classroom Code</Label>
                    <Input
                      id="code"
                      placeholder="Enter classroom code (e.g., CS2024)"
                      value={classroomCode}
                      onChange={(e) => setClassroomCode(e.target.value.toUpperCase())}
                      className="uppercase"
                    />
                  </div>
                  <Button onClick={handleJoinClassroom} disabled={isJoining || !classroomCode}>
                    {isJoining ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Join'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Joined Classrooms */}
          <motion.section variants={item}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                My Classrooms
              </h2>
              <span className="text-sm text-muted-foreground">
                {joinedClassrooms.length} classrooms
              </span>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {joinedClassrooms.map((classroom) => (
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
                      <CardDescription>{classroom.teacherName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <BookOpen className="h-4 w-4" />
                          {classroom.subjects.length} subjects
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {classroom.studentCount}
                        </span>
                      </div>
                      <div className="mt-3 text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded w-fit">
                        Code: {classroom.code}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* My Notes Section */}
          <motion.section variants={item}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                My Notes
              </h2>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left p-4 font-medium">Note</th>
                        <th className="text-left p-4 font-medium hidden sm:table-cell">Chapter</th>
                        <th className="text-left p-4 font-medium">Visibility</th>
                        <th className="text-left p-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myNotes.length > 0 ? (
                        myNotes.map((note) => (
                          <tr key={note.id} className="border-b border-border last:border-0">
                            <td className="p-4">
                              <span className="font-medium">{note.title}</span>
                            </td>
                            <td className="p-4 hidden sm:table-cell text-muted-foreground">
                              {note.chapterName || 'N/A'}
                            </td>
                            <td className="p-4">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                {note.visibility === 'private' ? (
                                  <>
                                    <EyeOff className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Private</span>
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-3.5 w-3.5 text-edu-teal" />
                                    <span className="hidden sm:inline text-edu-teal">Public</span>
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="p-4">
                              <StatusBadge status={note.status} />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-muted-foreground">
                            You haven't uploaded any notes yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </motion.div>
      </main>
    </div>
  );
};

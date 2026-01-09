import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, BookOpen, FileText, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Classroom, Note } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { classroomService } from '../classroom/service';
import { toast } from 'sonner';

interface StudentDashboardProps {
  onSelectClassroom: (classroom: Classroom) => void;
  onViewAnnouncements: () => void;
  onViewMyNotes: () => void;
}

export const StudentDashboard = ({ onSelectClassroom, onViewAnnouncements, onViewMyNotes }: StudentDashboardProps) => {
  const { user } = useAuth();
  const [classroomCode, setClassroomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinedClassrooms, setJoinedClassrooms] = useState<Classroom[]>([]);
  // const [myNotes, setMyNotes] = useState<Note[]>([]); // Removed - now using dedicated view

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const data = await classroomService.listClassrooms();
      setJoinedClassrooms(data);
    } catch (error) {
      console.error('Failed to fetch classrooms', error);
      toast.error('Failed to load classrooms');
    }
  };

  const handleJoinClassroom = async () => {
    if (!classroomCode.trim()) return;
    setIsJoining(true);
    try {
      const joined = await classroomService.joinClassroom(classroomCode);
      setJoinedClassrooms([...joinedClassrooms, joined]);
      setClassroomCode('');
      toast.success('Successfully joined classroom!');
    } catch (error: any) {
      console.error('Failed to join classroom', error);
      toast.error(error.response?.data?.detail || 'Failed to join classroom');
    } finally {
      setIsJoining(false);
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
                      <CardDescription>{classroom.creator_name || classroom.teacherName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <BookOpen className="h-4 w-4" />
                          {classroom.subjects?.length || 0} subjects
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {classroom.member_count || classroom.studentCount || 0}
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

        </motion.div>
      </main>
    </div>
  );
};

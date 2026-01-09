import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginPage } from '../auth/LoginPage';
import { StudentDashboard } from '../dashboard/StudentDashboard';
import { TeacherDashboard } from '../dashboard/TeacherDashboard';
import { ClassroomView } from '../classroom/ClassroomView';
import { SubjectView } from '../subject/SubjectView';
import { ChapterView } from '../chapter/ChapterView';
import { AnnouncementsView } from '../dashboard/AnnouncementsView';
import { MyNotesView } from '../dashboard/MyNotesView';
import { Classroom, Subject, Chapter } from '@/types';

type AppView = 'dashboard' | 'classroom' | 'subject' | 'chapter' | 'announcements' | 'my-notes';

const Index = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  // Show loading state while checking authentication
  if (loading) {
    console.log("Index: Loading...");
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Show login if not authenticated
  if (!user) {
    console.log("Index: No user, redirecting to login");
    return <LoginPage onSuccess={() => setCurrentView('dashboard')} />;
  }

  console.log("Index: Rendering dashboard for user", user.role);

  const handleSelectClassroom = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setCurrentView('classroom');
  };

  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setCurrentView('subject');
  };

  const handleSelectChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setCurrentView('chapter');
  };

  const handleBackToClassroom = () => {
    setSelectedSubject(null);
    setCurrentView('classroom');
  };

  const handleBackToSubject = () => {
    setSelectedChapter(null);
    setCurrentView('subject');
  };

  const handleBackToDashboard = () => {
    setSelectedClassroom(null);
    setSelectedSubject(null);
    setSelectedChapter(null);
    setCurrentView('dashboard');
  };

  if (currentView === 'chapter' && selectedChapter) {
    return (
      <ChapterView
        chapter={selectedChapter}
        onBack={handleBackToSubject}
        userRole={user?.role || 'student'}
      />
    );
  }

  if (currentView === 'subject' && selectedSubject) {
    return <SubjectView subject={selectedSubject} onBack={handleBackToClassroom} onSelectChapter={handleSelectChapter} />;
  }

  if (currentView === 'classroom' && selectedClassroom) {
    return <ClassroomView classroom={selectedClassroom} onBack={handleBackToDashboard} onSelectSubject={handleSelectSubject} />;
  }

  if (currentView === 'announcements') {
    return (
      <div>
        <div className="p-4 border-b flex items-center gap-4">
          <button onClick={handleBackToDashboard} className="text-sm hover:underline">← Back to Dashboard</button>
        </div>
        <AnnouncementsView />
      </div>
    );
  }

  if (currentView === 'my-notes') {
    return (
      <div>
        <div className="p-4 border-b flex items-center gap-4">
          <button onClick={handleBackToDashboard} className="text-sm hover:underline">← Back to Dashboard</button>
        </div>
        <MyNotesView />
      </div>
    );
  }

  return user?.role === 'teacher'
    ? <TeacherDashboard
      onSelectClassroom={handleSelectClassroom}
      onViewAnnouncements={() => setCurrentView('announcements')}
      onViewMyNotes={() => setCurrentView('my-notes')}
    />
    : <StudentDashboard
      onSelectClassroom={handleSelectClassroom}
      onViewAnnouncements={() => setCurrentView('announcements')}
      onViewMyNotes={() => setCurrentView('my-notes')}
    />;
};

export default Index;

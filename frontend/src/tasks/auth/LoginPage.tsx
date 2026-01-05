import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Users } from 'lucide-react';
import { UserRole } from '@/types';
import { LoginForm } from './components/LoginForm';
import { SignupForm } from './components/SignupForm';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { cn } from '@/lib/utils';

interface LoginPageProps {
  onSuccess: () => void;
}

export const LoginPage = ({ onSuccess }: LoginPageProps) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSignup, setIsSignup] = useState(false);

  const roles = [
    {
      id: 'student' as UserRole,
      title: 'Student',
      description: 'Join classrooms and learn',
      icon: GraduationCap,
      color: 'from-edu-indigo to-blue-600',
    },
    {
      id: 'teacher' as UserRole,
      title: 'Teacher',
      description: 'Create and manage classrooms',
      icon: Users,
      color: 'from-edu-teal to-emerald-600',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-edu-teal mb-4"
            >
              <GraduationCap className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground">EduNexus</h1>
            <p className="text-muted-foreground mt-1">Smart Collaborative Classroom</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
            <AnimatePresence mode="wait">
              {!selectedRole ? (
                <motion.div
                  key="role-selection"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h2 className="text-lg font-semibold text-center mb-4">
                    Choose your role
                  </h2>
                  <div className="grid gap-3">
                    {roles.map((role) => (
                      <motion.button
                        key={role.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedRole(role.id)}
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-lg border border-border bg-secondary/50',
                          'hover:border-primary/50 hover:bg-secondary transition-all text-left'
                        )}
                      >
                        <div className={cn('p-3 rounded-lg bg-gradient-to-br', role.color)}>
                          <role.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{role.title}</h3>
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : isSignup ? (
                <motion.div key="signup">
                  <button
                    onClick={() => setSelectedRole(null)}
                    className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1"
                  >
                    ← Change role
                  </button>
                  <h2 className="text-lg font-semibold mb-4">
                    Create {selectedRole === 'student' ? 'Student' : 'Teacher'} Account
                  </h2>
                  <SignupForm
                    role={selectedRole}
                    onSuccess={onSuccess}
                    onSwitchToLogin={() => setIsSignup(false)}
                  />
                </motion.div>
              ) : (
                <motion.div key="login">
                  <button
                    onClick={() => setSelectedRole(null)}
                    className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1"
                  >
                    ← Change role
                  </button>
                  <h2 className="text-lg font-semibold mb-4">
                    Sign in as {selectedRole === 'student' ? 'Student' : 'Teacher'}
                  </h2>
                  <LoginForm
                    role={selectedRole}
                    onSuccess={onSuccess}
                    onSwitchToSignup={() => setIsSignup(true)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

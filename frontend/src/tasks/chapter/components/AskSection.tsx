import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Send, Eye, EyeOff, Loader2, MessageCircle, User, Search, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { QuestionVisibility, Question } from '@/types';
import { cn } from '@/lib/utils';
import { chapterService } from '../service';
import { toast } from 'sonner';

interface AskSectionProps {
  chapterId: string;
}

export const AskSection = ({ chapterId }: AskSectionProps) => {
  const { user } = useAuth();
  const [questionText, setQuestionText] = useState('');
  const [visibility, setVisibility] = useState<QuestionVisibility>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [communityQuestions, setCommunityQuestions] = useState<Question[]>([]);
  const [myQuestions, setMyQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadQuestions();
  }, [chapterId]);

  const loadQuestions = async () => {
    try {
      const community = await chapterService.listCommunityQuestions(chapterId);
      setCommunityQuestions(community);

      // fetchAll my questions (backend filters by user, no need to filter by chapter strictly if we want global "My Questions", 
      // but usually context is this chapter. The backend route "list_my_questions" returns ALL. 
      // We might want to filter client-side for this chapter OR show all? 
      // User said "My Question section... remove the section in image from ask section". 
      // Let's filter by chapter to keep it relevant to the current view)
      const allMy = await chapterService.listMyQuestions();
      setMyQuestions(allMy.filter(q => q.chapter_id === chapterId));

    } catch (error) {
      console.error('Failed to load questions:', error);
      toast.error('Failed to load questions');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredCommunityQuestions = communityQuestions.filter(q =>
    q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMyQuestions = myQuestions.filter(q =>
    q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!questionText.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await chapterService.createQuestion(
        chapterId,
        "Question", // Title is hardcoded for now as per UI
        questionText,
        visibility === 'private'
      );

      // Add to myQuestions immediately
      setMyQuestions(prev => [created, ...prev]);

      setQuestionText('');
      toast.success('Question submitted successfully!');

      // OPTIONAL: Switch tab to 'my-questions' to show the user their new question
      // This requires controlling the Tabs value state
    } catch (error) {
      console.error('Failed to submit question:', error);
      toast.error('Failed to submit question');
    } finally {
      setIsSubmitting(false);
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

  const QuestionCard = ({ question, isCommunityView = false }: { question: Question, isCommunityView?: boolean }) => {
    const handleDelete = async () => {
      if (!confirm('Are you sure you want to delete this question?')) return;
      try {
        await chapterService.deleteQuestion(question.id);
        setMyQuestions(myQuestions.filter(q => q.id !== question.id));
        setCommunityQuestions(communityQuestions.filter(q => q.id !== question.id));
        toast.success('Question deleted');
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete question');
      }
    };

    return (
      <motion.div variants={item}>
        <Card className={cn(
          question.is_private && 'border-edu-warning/30'
        )}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{question.user_name}</span>
                    {question.is_private ? (
                      <span className="flex items-center gap-1 text-xs text-edu-warning">
                        <EyeOff className="h-3 w-3" />
                        Private
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-edu-teal">
                        <Eye className="h-3 w-3" />
                        Public
                      </span>
                    )}
                  </div>
                  {question.user_id === user?.id && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={handleDelete}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-foreground">{question.content}</p>

                {question.answer ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-3 bg-secondary rounded-lg"
                  >
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Answer by {question.answerer_name || 'Teacher'}
                    </p>
                    <p className="text-sm">{question.answer}</p>
                  </motion.div>
                ) : (
                  // Only show "Awaiting response" in "My Questions" view, 
                  // because Community view should filtering out unanswered ones anyway.
                  !isCommunityView && (
                    <p className="mt-2 text-sm text-muted-foreground italic">
                      Awaiting response...
                    </p>
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search questions..."
          className="pl-10"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <Tabs defaultValue="ask" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="ask" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            Ask Question
          </TabsTrigger>
          <TabsTrigger value="my-questions" className="gap-2">
            <User className="h-4 w-4" />
            My Questions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ask" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            {/* Community Questions List (Answered & Public) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Community Q&A
                </h2>
              </div>

              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                {filteredCommunityQuestions.length > 0 ? (
                  filteredCommunityQuestions.map((question) => (
                    <QuestionCard key={question.id} question={question} isCommunityView={true} />
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium">No community questions match</h3>
                    <p className="text-muted-foreground">
                      {searchQuery ? 'Try a different search term.' : 'Be the first to ask a public question!'}
                    </p>
                  </Card>
                )}
              </motion.div>
            </motion.div>

            {/* Ask Question Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    Ask a Question
                  </CardTitle>
                  <CardDescription>
                    Get help from your teacher
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question">Your Question</Label>
                    <Textarea
                      id="question"
                      placeholder="What would you like to know about this chapter?"
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      className="min-h-[100px] resize-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Visibility</Label>
                    <RadioGroup
                      value={visibility}
                      onValueChange={(v) => setVisibility(v as QuestionVisibility)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="public" id="q-public" />
                        <Label htmlFor="q-public" className="flex items-center gap-2 cursor-pointer">
                          <Eye className="h-4 w-4 text-edu-teal" />
                          Public
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="private" id="q-private" />
                        <Label htmlFor="q-private" className="flex items-center gap-2 cursor-pointer">
                          <EyeOff className="h-4 w-4" />
                          Private
                        </Label>
                      </div>
                    </RadioGroup>
                    <p className="text-xs text-muted-foreground">
                      {visibility === 'public'
                        ? 'Everyone can see this question and the answer.'
                        : 'Only you and the teacher will see this question.'}
                    </p>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !questionText.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Question
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="my-questions" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                My Questions
              </h2>
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-4 max-w-3xl"
            >
              {filteredMyQuestions.length > 0 ? (
                filteredMyQuestions.map((question) => (
                  <QuestionCard key={question.id} question={question} />
                ))
              ) : (
                <Card className="p-8 text-center">
                  <User className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium">No questions found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? 'Try a different search term.' : "You haven't asked any questions in this chapter."}
                  </p>
                </Card>
              )}
            </motion.div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

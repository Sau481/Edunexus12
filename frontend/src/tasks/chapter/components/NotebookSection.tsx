import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { BookOpen, Send, RefreshCw, Youtube, FileText as ArticleIcon, Sparkles, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NoteCard } from '@/components/common/NoteCard';
import { AIMessage, Note, Recommendation } from '@/types';
import { cn } from '@/lib/utils';
import { chapterService } from '../service';
import { toast } from 'sonner';

interface NotebookSectionProps {
  chapterId: string;
}

export const NotebookSection = ({ chapterId }: NotebookSectionProps) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Placeholder for unavailable features
  const pyqs: any[] = [];

  useEffect(() => {
    loadNotes();
    loadRecommendations();
  }, [chapterId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const loadNotes = async () => {
    try {
      const fetchedNotes = await chapterService.listNotes(chapterId);
      // Filter to show only approved notes in the public Notebook view
      // Students' own pending notes should only appear in "My Uploads" section
      const approvedNotes = fetchedNotes.filter(n => n.approval_status === 'approved');
      setNotes(approvedNotes);
    } catch (error) {
      console.error('Failed to load notes', error);
    }
  };

  const loadRecommendations = async (query?: string) => {
    setIsLoadingRecommendations(true);
    setRecommendationsError(false);
    try {
      const fetchedRecommendations = await chapterService.getRecommendations(chapterId, query);
      setRecommendations(fetchedRecommendations);
      setRecommendationsError(false);
    } catch (error) {
      console.error('Failed to load recommendations', error);
      toast.error('Failed to load recommendations');
      setRecommendationsError(true);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const { answer, sources } = await chapterService.queryNotebook(chapterId, userMessage.content);

      const aiResponse: AIMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: answer,
        sources: sources,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiResponse]);

      // Trigger dynamic recommendations
      loadRecommendations(userMessage.content);
    } catch (error) {
      console.error('Failed to query notebook', error);
      toast.error('Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePYQClick = (question: string) => {
    setInputValue(question);
  };

  const handleRefreshRecommendations = () => {
    loadRecommendations();
  };

  return (
    <div className="space-y-4">
      {/* Important Notice */}
      <Card className="border-edu-warning/30 bg-edu-warning/5">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-edu-warning shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            <strong>Note:</strong> AI answers are generated only from notes of this chapter.
          </p>
        </CardContent>
      </Card>

      {/* 3-Column Layout */}
      <div className="grid gap-4 lg:grid-cols-[280px_1fr_280px]">
        {/* Left Column - Notes */}
        <div className="lg:order-1 order-2">
          <Card className="h-fit lg:h-[600px] lg:overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Chapter Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-auto lg:h-[520px]">
                <div className="space-y-2 pr-2">
                  {notes.map((note) => (
                    <NoteCard key={note.id} note={note} compact />
                  ))}
                  {notes.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No notes available
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - AI Chat & PYQs */}
        <div className="lg:order-2 order-1">
          <Card className="h-[600px] flex flex-col overflow-hidden">
            <CardHeader className="pb-3 border-b shrink-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Notebook
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
              {/* PYQs */}
              {pyqs.length > 0 && (
                <div className="mb-4 shrink-0">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Previous Year Questions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pyqs.slice(0, 4).map((pyq) => (
                      <Button
                        key={pyq.id}
                        variant="outline"
                        size="sm"
                        className="text-xs h-auto py-1.5 px-3 whitespace-normal text-left"
                        onClick={() => handlePYQClick(pyq.question)}
                      >
                        {pyq.question.length > 40 ? pyq.question.slice(0, 40) + '...' : pyq.question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              <div
                ref={scrollRef}
                className="flex-1 min-h-0 overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent pr-2"
              >
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'p-3 rounded-lg max-w-[90%]',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-secondary mr-auto'
                      )}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="prose dark:prose-invert prose-sm max-w-none text-sm leading-relaxed break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      )}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-border/50">
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-foreground/50 mb-1.5 ml-1">Sources</p>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.sources.map((source, idx) => (
                              <span key={idx} className="text-[10px] px-2 py-0.5 bg-background/40 rounded-full border border-border/50 text-foreground/80 shadow-sm transition-colors hover:bg-background/60">
                                {source}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-secondary p-3 rounded-lg mr-auto max-w-[90%]"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-75" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150" />
                      </div>
                    </motion.div>
                  )}
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground opacity-50">
                      <Sparkles className="h-12 w-12 mb-4" />
                      <p className="text-sm">Ask any question from the chapter notes!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Input */}
              <div className="flex gap-2 shrink-0 pt-2 border-t">
                <Input
                  placeholder="Ask about this chapter..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isLoading}
                />
                <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Recommendations */}
        <div className="lg:order-3 order-3">
          <Card className="h-fit lg:h-[600px] lg:overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Recommendations</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleRefreshRecommendations}
                  disabled={isLoadingRecommendations}
                >
                  <RefreshCw className={cn("h-4 w-4", isLoadingRecommendations && "animate-spin")} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-auto lg:h-[520px]">
                <div className="space-y-3 pr-2">
                  {isLoadingRecommendations || recommendationsError ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading recommendations...</span>
                      </div>
                    </div>
                  ) : recommendations.length > 0 ? (
                    recommendations.map((rec) => (
                      <motion.a
                        key={rec.id}
                        href={rec.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02 }}
                        className="block p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-surface-hover transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'p-2 rounded-lg shrink-0',
                            rec.type === 'video' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'
                          )}>
                            {rec.type === 'video' ? (
                              <Youtube className="h-4 w-4" />
                            ) : (
                              <ArticleIcon className="h-4 w-4" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium line-clamp-2">{rec.title}</p>
                            <p className="text-xs text-muted-foreground capitalize mt-1">{rec.type}</p>
                            {rec.description && (
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                {rec.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.a>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recommendations available
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Send, RefreshCw, Youtube, FileText as ArticleIcon, Sparkles, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NoteCard } from '@/components/common/NoteCard';
import { mockNotes, mockPYQs, mockRecommendations, mockAIMessages } from '@/data/mockData';
import { AIMessage } from '@/types';
import { cn } from '@/lib/utils';

interface NotebookSectionProps {
  chapterId: string;
}

export const NotebookSection = ({ chapterId }: NotebookSectionProps) => {
  const [messages, setMessages] = useState<AIMessage[]>(mockAIMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const notes = mockNotes.filter(
    (n) => n.chapterId === chapterId && (n.status === 'approved' || n.authorRole === 'teacher')
  );
  const pyqs = mockPYQs.filter((p) => p.chapterId === chapterId);
  const recommendations = mockRecommendations;

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

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const aiResponse: AIMessage = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: `Based on the notes in this chapter, here's what I found:\n\n${inputValue.includes('SDLC') || inputValue.includes('software') 
        ? 'The Software Development Life Cycle (SDLC) consists of several phases including Planning, Analysis, Design, Implementation, Testing, Deployment, and Maintenance. Each phase has specific deliverables and objectives that contribute to the overall success of the software project.'
        : 'I can help you understand concepts from the chapter notes. The available notes cover topics like SDLC, Agile methodologies, Scrum framework, and software development best practices. Feel free to ask specific questions!'}`,
      sources: ['Complete SDLC Overview', 'Agile vs Waterfall Comparison'],
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, aiResponse]);
    setIsLoading(false);
  };

  const handlePYQClick = (question: string) => {
    setInputValue(question);
  };

  const handleRefreshRecommendations = () => {
    // Simulate refresh
  };

  return (
    <div className="space-y-4">
      {/* Important Notice */}
      <Card className="border-edu-warning/30 bg-edu-warning/5">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-edu-warning shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            <strong>Note:</strong> AI answers are generated only from notes of this chapter. No external information is used.
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
          <Card className="h-fit lg:h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Notebook
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4 pt-0">
              {/* PYQs */}
              <div className="mb-4">
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

              {/* Chat Messages */}
              <ScrollArea className="flex-1 min-h-[250px] lg:min-h-0">
                <div className="space-y-4 pr-4">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'p-3 rounded-lg',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-8'
                          : 'bg-secondary mr-8'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <p className="text-xs opacity-70">
                            Sources: {msg.sources.join(', ')}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-secondary p-3 rounded-lg mr-8"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-75" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150" />
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="mt-4 flex gap-2">
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
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefreshRecommendations}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-auto lg:h-[520px]">
                <div className="space-y-3 pr-2">
                  {recommendations.map((rec) => (
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
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{rec.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">{rec.type}</p>
                        </div>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

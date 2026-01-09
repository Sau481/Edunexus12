import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle2, XCircle, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Note } from '@/types';
import { chapterService } from '../chapter/service';
import { NoteCard } from '@/components/common/NoteCard';
import { PDFViewer } from '@/components/common/PDFViewer';
import { toast } from 'sonner';

export const MyNotesView = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewerOpen, setViewerOpen] = useState(false);

    useEffect(() => {
        loadNotes();
    }, []);

    const handleNoteClick = (note: Note) => {
        setSelectedNote(note);
        if (note.file_url) {
            setViewerOpen(true);
        }
    };

    const loadNotes = async () => {
        try {
            const data = await chapterService.listMyNotes();
            setNotes(data);
        } catch (error) {
            console.error('Failed to load notes:', error);
            toast.error('Failed to load notes');
        } finally {
            setLoading(false);
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-yellow-500" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'approved':
                return <span className="text-green-600 font-medium">Approved</span>;
            case 'rejected':
                return <span className="text-red-600 font-medium">Rejected</span>;
            default:
                return <span className="text-yellow-600 font-medium">Pending Approval</span>;
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading notes...</div>;
    }



    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    My Notes
                </h1>
                <p className="text-muted-foreground mt-1">
                    Manage and track status of all your uploaded notes
                </p>
            </div>

            <PDFViewer
                isOpen={viewerOpen}
                onClose={() => setViewerOpen(false)}
                url={selectedNote?.file_url || ''}
                title={selectedNote?.title || 'Document'}
            />

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="hidden md:grid gap-3 grid-cols-1"
            >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {notes.length > 0 ? (
                        notes.map((note) => (
                            <motion.div key={note.id} variants={item} className="relative group">
                                <div className="absolute top-2 right-2 z-10 bg-background/90 backdrop-blur px-2 py-1 rounded-full border shadow-sm flex items-center gap-1.5 text-xs">
                                    {getStatusIcon(note.approval_status)}
                                    {getStatusText(note.approval_status)}
                                </div>
                                <NoteCard note={note} onClick={() => handleNoteClick(note)} />
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full">
                            <Card className="p-12 text-center bg-muted/50 border-dashed">
                                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-medium">No notes uploaded</h3>
                                <p className="text-muted-foreground">
                                    You haven't uploaded any notes yet.
                                </p>
                            </Card>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};



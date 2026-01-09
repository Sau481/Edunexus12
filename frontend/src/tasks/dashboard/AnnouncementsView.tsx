import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Announcement } from '@/types';
import { chapterService } from '../chapter/service';
import { toast } from 'sonner';

export const AnnouncementsView = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const loadAnnouncements = async () => {
        try {
            const data = await chapterService.listAllAnnouncements();
            setAnnouncements(data);
        } catch (error) {
            console.error('Failed to load announcements:', error);
            toast.error('Failed to load announcements');
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

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return <div className="p-8 text-center">Loading announcements...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Megaphone className="h-6 w-6 text-primary" />
                    All Announcements
                </h1>
                <p className="text-muted-foreground mt-1">
                    Recent updates from all your classrooms
                </p>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-4"
            >
                {announcements.length > 0 ? (
                    announcements.map((announcement) => (
                        <motion.div key={announcement.id} variants={item}>
                            <Card className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold">{announcement.title}</h3>
                                            <p className="text-foreground/90 mt-2 whitespace-pre-wrap">
                                                {announcement.content}
                                            </p>
                                            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {formatDate(announcement.created_at)}
                                                </span>
                                                <span className="px-2 py-0.5 bg-secondary rounded-full text-xs font-medium">
                                                    By {announcement.creator_name}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <Card className="p-12 text-center bg-muted/50 border-dashed">
                        <Megaphone className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium">No announcements yet</h3>
                        <p className="text-muted-foreground">
                            You're all caught up! Check back later for updates.
                        </p>
                    </Card>
                )}
            </motion.div>
        </div>
    );
};

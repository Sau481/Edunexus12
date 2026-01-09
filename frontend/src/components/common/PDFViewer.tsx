import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Printer, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PDFViewerProps {
    url: string;
    title: string;
    isOpen: boolean;
    onClose: () => void;
}

export const PDFViewer = ({ url, title, isOpen, onClose }: PDFViewerProps) => {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && url) {
            fetchPdf();
        }
        return () => {
            // Cleanup blob URL to avoid memory leaks
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
                setBlobUrl(null);
            }
        };
    }, [isOpen, url]);

    const fetchPdf = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch PDF');

            const blob = await response.blob();
            const pdfBlob = new Blob([blob], { type: 'application/pdf' });
            const objectUrl = URL.createObjectURL(pdfBlob);
            setBlobUrl(objectUrl);
        } catch (err) {
            console.error('Error loading PDF:', err);
            setError('Failed to load PDF document.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = url; // Use original URL for download to ensure correct filename/headers if applicable, or blobUrl
        link.download = title || 'document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        if (blobUrl) {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = blobUrl;
            document.body.appendChild(iframe);
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            // Cleanup happens automatically when iframe is removed? Not really, but good enough for now.
            setTimeout(() => document.body.removeChild(iframe), 1000); // Give it a sec
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-black/50 border-b border-white/10 text-white z-10">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10 hover:text-white"
                            onClick={onClose}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-red-500" />
                            <h2 className="text-sm font-medium truncate max-w-[300px] md:max-w-md" title={title}>
                                {title}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10 hover:text-white hidden sm:flex"
                            onClick={handlePrint}
                            title="Print"
                        >
                            <Printer className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10 hover:text-white"
                            onClick={handleDownload}
                            title="Download"
                        >
                            <Download className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden relative w-full h-full flex items-center justify-center bg-zinc-900">
                    {loading ? (
                        <div className="flex flex-col items-center gap-3 text-zinc-400">
                            <Loader2 className="h-10 w-10 animate-spin" />
                            <p>Loading document...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center gap-3 text-red-400">
                            <FileText className="h-12 w-12 opacity-50" />
                            <p>{error}</p>
                            <Button variant="outline" onClick={fetchPdf} className="text-white border-white/20 hover:bg-white/10">
                                Retry
                            </Button>
                        </div>
                    ) : blobUrl ? (
                        // Use iframe with #toolbar=0 to try and mimic a cleaner view, though Chrome's PDF viewer is standard
                        <iframe
                            src={`${blobUrl}#toolbar=0`}
                            className="w-full h-full border-none shadow-2xl"
                            title={title}
                        />
                    ) : null}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

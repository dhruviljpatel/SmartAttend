import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Copy, Check, Download, QrCode } from 'lucide-react';
import { Icons8QrCode } from '@/components/ui/Icons';

interface ShareSubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    subject: {
        id?: number;
        name: string;
        code: string;
        section: string;
    };
}

export function ShareSubjectModal({ isOpen, onClose, subject }: ShareSubjectModalProps) {
    const [qrDataUrl, setQrDataUrl] = useState<string>('');
    const [hasCopiedLink, setHasCopiedLink] = useState(false);
    const [hasCopiedCode, setHasCopiedCode] = useState(false);

    // Build the shareable student enrollment link
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareableUrl = `${origin}/student-login?enroll=${encodeURIComponent(subject.code)}`;

    // Generate high-resolution QR code whenever the subject changes or modal opens
    useEffect(() => {
        if (!isOpen) return;

        QRCode.toDataURL(shareableUrl, {
            width: 320,
            margin: 2,
            color: {
                dark: '#1e1b4b', // deep indigo
                light: '#ffffff',
            },
            errorCorrectionLevel: 'H',
        })
            .then((url) => {
                setQrDataUrl(url);
            })
            .catch((err) => {
                console.error('Failed to generate QR code:', err);
            });
    }, [isOpen, shareableUrl]);

    if (!isOpen) return null;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareableUrl);
            setHasCopiedLink(true);
            setTimeout(() => setHasCopiedLink(false), 2000);
        } catch {
            // fallback
        }
    };

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(subject.code);
            setHasCopiedCode(true);
            setTimeout(() => setHasCopiedCode(false), 2000);
        } catch {
            // fallback
        }
    };

    const handleDownloadQr = () => {
        if (!qrDataUrl) return;
        const link = document.createElement('a');
        link.download = `SmartAttend_QR_${subject.code}.png`;
        link.href = qrDataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div
                    className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* MODAL HEADER */}
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50/80 via-blue-50/50 to-white shrink-0">
                            <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
                                        <Icons8QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">Share Subject Enrollment</h3>
                                        <p className="text-xs text-gray-500">Scan or click to enroll instantly</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="rounded-full text-gray-400 hover:text-gray-700 h-8 w-8"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
                                    {/* SUBJECT BADGE */}
                                        <div className="text-center bg-slate-50 border border-slate-200/80 rounded-2xl p-3 sm:p-4">
                                            <h4 className="font-bold text-gray-900 text-base sm:text-lg leading-snug">{subject.name}</h4>
                                            <div className="flex items-center justify-center gap-2 mt-2">
                                                <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white font-mono text-xs px-2.5 py-0.5 rounded-lg">
                                                    Code: {subject.code}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs font-semibold">
                                                    Section {subject.section}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* QR CODE CARD */}
                                        <div className="flex flex-col items-center">
                                                <div className="relative p-2.5 sm:p-3 bg-white rounded-2xl border-2 border-indigo-100 shadow-lg shadow-indigo-500/5 group">
                                                    {qrDataUrl ? (
                                                        <img
                                                            src={qrDataUrl}
                                                            alt={`QR Code for ${subject.name}`}
                                                            className="w-44 h-44 sm:w-56 sm:h-56 rounded-xl object-contain"
                                                        />
                                                    ) : (
                                <div className="w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center text-gray-400">
                                    <QrCode className="w-10 h-10 animate-pulse text-indigo-400" />
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-center">
                            Students scan this QR code with their phone camera to join
                        </p>
                    </div>

                                                {/* SHARE ACTIONS */}
                                                <div className="space-y-3 pt-2">
                                                    {/* LINK COPY BOX */}
                                                    <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs">
                                                        <span className="truncate flex-1 font-mono text-gray-600 pl-1">
                                                            {shareableUrl}
                                                        </span>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={handleCopyLink}
                                                            className="h-8 px-3 rounded-lg text-xs font-semibold shrink-0"
                                                        >
                                                            {hasCopiedLink ? (
                                                                <>
                                                                    <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                                                                    Copied
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy className="w-3.5 h-3.5 mr-1" />
                                                                    Copy Link
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>

                                                    {/* BUTTONS ROW */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <Button
                                                            variant="outline"
                                                            onClick={handleCopyCode}
                                                            className="h-10 rounded-xl text-xs font-semibold border-gray-200"
                                                        >
                                                            {hasCopiedCode ? (
                                                                <>
                                                                    <Check className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                                                                    Code Copied
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                                                                    Copy Code ({subject.code})
                                                                </>
                                                            )}
                                                        </Button>

                                                        <Button
                                                            variant="secondary"
                                                            onClick={handleDownloadQr}
                                                            className="h-10 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80"
                                                        >
                                                            <Download className="w-3.5 h-3.5 mr-1.5" />
                                                            Download QR
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                                                <Button onClick={onClose} className="rounded-xl px-5 h-10 text-xs font-semibold">
                                                    Done
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    );
}

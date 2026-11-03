import { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Camera,
    Mic,
    Upload,
    X,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    Loader2,
    Check,
    SwitchCamera,
    ImagePlus,
    UserX,
} from 'lucide-react';
import { HoverLottieIcon } from '@/components/ui/HoverLottieIcon';
import deleteIconData from '../../assets/animated-icons/icons8-delete.json';
import { api } from '@/lib/api';

interface SubjectOption {
    id: number;
    name: string;
    code: string;
    section: string;
}

interface AttendanceResult {
    subject: {
        id: number;
        name: string;
        code: string;
    };
    timestamp: string;
    totalPhotosAnalyzed: number;
    totalFacesDetected: number;
    markedPresent: { id: number; name: string }[];
    markedAbsent: { id: number; name: string }[];
    presentCount: number;
    absentCount: number;
    totalStudents: number;
    message: string;
}

export function TakeAttendance() {
    const [subjects, setSubjects] = useState<SubjectOption[]>([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

    // Photos state
    const [photos, setPhotos] = useState<string[]>([]);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const webcamRef = useRef<Webcam>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Face analysis state
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AttendanceResult | null>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    // Voice attendance dropdown notice state
    const [showVoiceNotice, setShowVoiceNotice] = useState(false);

    // Load available subjects
    useEffect(() => {
        setIsLoadingSubjects(true);
        api.get('/subjects')
            .then((res) => {
                if (res.data && Array.isArray(res.data)) {
                    setSubjects(res.data);
                }
            })
            .catch((err) => {
                console.warn('Could not load subjects for attendance:', err);
            })
            .finally(() => {
                setIsLoadingSubjects(false);
            });
    }, []);

    // Handle file upload from files / mobile gallery
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    setPhotos((prev) => [...prev, reader.result as string]);
                }
            };
            reader.readAsDataURL(file);
        });

        // Reset input value so same files can be reselected if needed
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Capture photo from webcam or mobile camera
    const handleCaptureFromCamera = () => {
        const screenshot = webcamRef.current?.getScreenshot();
        if (screenshot) {
            setPhotos((prev) => [...prev, screenshot]);
        }
    };

    // Switch between front and back camera (especially useful on mobile)
    const toggleFacingMode = () => {
        setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    };

    // Remove single photo
    const handleRemovePhoto = (index: number) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    // Clear all photos
    const handleClearPhotos = () => {
        setPhotos([]);
        setAnalysisResult(null);
        setAnalysisError(null);
    };

    // Trigger Voice Attendance dropdown message
    const handleVoiceAttendanceClick = () => {
        setShowVoiceNotice(true);
        setTimeout(() => {
            setShowVoiceNotice(false);
        }, 4000);
    };

    // Run Face Analysis API call
    const handleRunFaceAnalysis = async () => {
        if (!selectedSubject) {
            setAnalysisError('Please select a subject before running face analysis.');
            return;
        }

        if (photos.length === 0) {
            setAnalysisError('Please add or snap at least one photo of the classroom.');
            return;
        }

        setIsAnalyzing(true);
        setAnalysisError(null);
        setAnalysisResult(null);

        try {
            const res = await api.post('/attendance/take', {
                subjectId: Number(selectedSubject),
                images: photos,
            });

            if (res.data && res.data.success) {
                setAnalysisResult(res.data);
            }
        } catch (err: any) {
            console.error('Error running face analysis:', err);
            setAnalysisError(
                err.response?.data?.error || 'Failed to process face analysis. Please verify the ML service.'
            );
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm relative">
            {/* SECTION HEADER */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 flex-wrap gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                        Take AI Attendance
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                        Upload or snap classroom photos to detect students and log attendance
                    </p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    {/* Hidden file input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        multiple
                        className="hidden"
                    />

                    {/* Upload File Button */}
                    <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-700 font-semibold rounded-xl h-10 px-3 sm:px-4 flex-1 sm:flex-initial justify-center text-xs sm:text-sm"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Photos
                    </Button>

                    {/* Open Camera Button */}
                    <Button
                        onClick={() => setIsCameraOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl h-10 px-3 sm:px-4 shadow-sm flex-1 sm:flex-initial justify-center text-xs sm:text-sm"
                    >
                        <Camera className="w-4 h-4 mr-2" />
                        Open Camera
                    </Button>
                </div>
            </div>

            {/* SUBJECT SELECTION */}
            <div className="flex flex-col gap-2 w-full sm:max-w-md">
                <Label htmlFor="subject-select" className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                    Select Subject <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedSubject} onValueChange={(val) => setSelectedSubject(val || '')}>
                    <SelectTrigger id="subject-select" className="h-12 rounded-xl text-sm font-medium">
                        <SelectValue placeholder="Select a subject..." />
                    </SelectTrigger>
                    <SelectContent>
                        {subjects.length === 0 ? (
                            <SelectItem value="none" disabled>
                                {isLoadingSubjects ? 'Loading subjects...' : 'No subjects available'}
                            </SelectItem>
                        ) : (
                            subjects.map((sub) => (
                                <SelectItem key={sub.id} value={String(sub.id)}>
                                    {sub.name} ({sub.code} - Sec {sub.section})
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
            </div>

            {/* LIVE CAMERA CAPTURE DRAWER / MODAL */}
            {isCameraOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-slate-50">
                            <div className="flex items-center gap-2">
                                <Camera className="w-5 h-5 text-indigo-600" />
                                <span className="font-bold text-gray-900 text-sm">Classroom Camera</span>
                                <Badge variant="outline" className="text-[11px] capitalize">
                                    {facingMode === 'user' ? 'Front Camera' : 'Back Camera'}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={toggleFacingMode}
                                    className="h-8 px-2.5 rounded-lg text-xs"
                                    title="Switch Camera (Front / Back)"
                                >
                                    <SwitchCamera className="w-3.5 h-3.5 mr-1" />
                                    Flip Cam
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsCameraOpen(false)}
                                    className="h-8 w-8 rounded-full"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="p-4 bg-black flex flex-col items-center justify-center relative aspect-video">
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={{ facingMode }}
                                className="w-full h-full object-cover rounded-xl"
                            />
                        </div>

                        <div className="p-4 bg-white flex items-center justify-between gap-3 border-t border-gray-100">
                            <span className="text-xs text-gray-500 font-medium">
                                Snapped: <span className="font-bold text-indigo-600">{photos.length}</span> photos
                            </span>
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={handleCaptureFromCamera}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl h-11 px-5 shadow-md shadow-indigo-600/20"
                                >
                                    <Camera className="w-4 h-4 mr-2" />
                                    Snap Photo
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsCameraOpen(false)}
                                    className="rounded-xl h-11 px-4"
                                >
                                    Done
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* PHOTOS PREVIEW GALLERY */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                        Classroom Photos ({photos.length})
                    </Label>
                    {photos.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClearPhotos}
                            className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                        >
                            Clear All
                        </button>
                    )}
                </div>

                {photos.length === 0 ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 group"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <ImagePlus className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-semibold text-gray-700">
                            No photos added yet
                        </p>
                        <p className="text-xs text-gray-400 max-w-sm">
                            Click here to upload photos, or use the camera button to snap classroom pictures
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 p-3 bg-slate-50 rounded-2xl border border-gray-200/80">
                        {photos.map((src, index) => (
                            <div
                                key={index}
                                className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 shadow-xs group bg-black"
                            >
                                <img
                                    src={src}
                                    alt={`Classroom shot ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemovePhoto(index)}
                                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-700"
                                    title="Remove this photo"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] bg-black/60 text-white font-mono">
                                    #{index + 1}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ERROR ALERT */}
            {analysisError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm animate-in fade-in duration-200">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{analysisError}</span>
                </div>
            )}

            {/* RESULTS CARD (AFTER ANALYSIS) */}
            {analysisResult && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-white to-blue-50/50 border border-emerald-200/80 shadow-md animate-in fade-in zoom-in-95 duration-300 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-emerald-100 gap-3">
                        <div>
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full mb-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Attendance Saved to Database
                            </div>
                            <h3 className="text-xl font-extrabold text-gray-900">
                                {analysisResult.subject.name} ({analysisResult.subject.code})
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Logged at {new Date(analysisResult.timestamp).toLocaleString()} • {analysisResult.totalPhotosAnalyzed} photo(s) analyzed
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white font-semibold px-3 py-1 text-xs rounded-lg">
                                {analysisResult.totalFacesDetected} Faces Detected
                            </Badge>
                        </div>
                    </div>

                    {/* STATS BREAKDOWN */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="p-3 bg-emerald-100/50 rounded-xl border border-emerald-200 flex flex-col items-center text-center">
                            <span className="text-2xl font-black text-emerald-700">
                                {analysisResult.presentCount}
                            </span>
                            <span className="text-xs font-semibold text-emerald-800">Present</span>
                        </div>

                        <div className="p-3 bg-red-50 rounded-xl border border-red-200 flex flex-col items-center text-center">
                            <span className="text-2xl font-black text-red-600">
                                {analysisResult.absentCount}
                            </span>
                            <span className="text-xs font-semibold text-red-700">Absent</span>
                        </div>

                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex flex-col items-center text-center col-span-2 sm:col-span-1">
                            <span className="text-2xl font-black text-blue-700">
                                {analysisResult.totalStudents}
                            </span>
                            <span className="text-xs font-semibold text-blue-800">Total Enrolled</span>
                        </div>
                    </div>

                    {/* PRESENT STUDENTS LIST */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Recognized Present ({analysisResult.markedPresent.length})
                        </Label>
                        {analysisResult.markedPresent.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">No recognized students matched.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {analysisResult.markedPresent.map((st) => (
                                    <Badge
                                        key={st.id}
                                        className="bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        {st.name} <span className="text-[10px] opacity-60">#{st.id}</span>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ABSENT STUDENTS LIST */}
                    {analysisResult.markedAbsent.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-emerald-100/60">
                            <Label className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                                <UserX className="w-3.5 h-3.5 text-red-500" />
                                Marked Absent ({analysisResult.markedAbsent.length})
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {analysisResult.markedAbsent.map((st) => (
                                    <Badge
                                        key={st.id}
                                        variant="outline"
                                        className="text-red-700 border-red-200 bg-red-50/50 px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5"
                                    >
                                        <X className="w-3.5 h-3.5 text-red-400" />
                                        {st.name} <span className="text-[10px] opacity-60">#{st.id}</span>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ACTION BUTTONS & VOICE NOTICE */}
            <div className="relative flex flex-wrap gap-4 mt-4 pt-6 border-t border-gray-100 items-center">
                <Button
                    variant="destructive"
                    size="lg"
                    onClick={handleClearPhotos}
                    disabled={photos.length === 0}
                    className="w-full sm:w-auto h-12 px-6 rounded-xl font-semibold shadow-xs"
                >
                    <HoverLottieIcon animationData={deleteIconData} className="w-5 h-5 mr-2 fill-current" />
                    Clear Photos
                </Button>

                <Button
                    size="lg"
                    onClick={handleRunFaceAnalysis}
                    disabled={isAnalyzing || photos.length === 0 || !selectedSubject}
                    className="w-full sm:w-auto h-12 px-7 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-600/20"
                >
                    {isAnalyzing ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Analyzing Faces in Class...</span>
                        </div>
                    ) : (
                        <>
                            <Camera className="w-5 h-5 mr-2" />
                            Run Face Analysis
                        </>
                    )}
                </Button>

                <div className="relative w-full sm:w-auto">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handleVoiceAttendanceClick}
                        className="w-full sm:w-auto h-12 px-6 border-2 rounded-xl font-semibold text-gray-700 hover:bg-slate-50"
                    >
                        <Mic className="w-5 h-5 mr-2 text-indigo-600" />
                        Voice Attendance
                    </Button>

                    {/* RECTANGULAR DROPDOWN NOTICE (FADES AFTER A FEW SECONDS) */}
                    {showVoiceNotice && (
                        <div className="absolute left-0 sm:left-auto sm:right-0 bottom-full mb-3 z-30 w-[calc(100vw-3rem)] max-w-sm sm:w-80 p-3.5 bg-gray-900 text-white rounded-2xl shadow-xl border border-gray-800 text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <div className="flex items-start gap-2.5">
                                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-amber-300">Feature Coming Soon!</p>
                                    <p className="text-gray-300 mt-0.5 leading-snug">
                                        Voice attendance via acoustic biometric recognition will be available in an upcoming update.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowVoiceNotice(false)}
                                    className="text-gray-400 hover:text-white ml-auto"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="absolute -bottom-1.5 left-8 sm:left-auto sm:right-8 w-3 h-3 bg-gray-900 rotate-45 border-r border-b border-gray-800" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

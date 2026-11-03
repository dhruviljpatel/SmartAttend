import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { Icons8BookStack, Icons8ShieldCheck, Icons8UserCheck } from '@/components/ui/Icons';
import { getAuthSession } from '@/lib/auth';
import { StudentSubjectCard } from '@/components/student/StudentSubjectCard';
import {
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    XCircle,
    Plus,
    X,
    Sparkles,
    AlertCircle,
    Loader2,
} from 'lucide-react';

interface EnrichedSubject {
    id: number;
    subjectCode: string;
    code: string;
    name: string;
    section: string;
    teacherName?: string;
    students: number;
    classes: number;
    presentClasses: number;
    attendanceRate: number;
}

interface AttendanceRecord {
    id: number;
    timestamp: string;
    isPresent: boolean;
    subject?: {
        name: string;
        subjectCode: string;
    };
}

interface StudentData {
    id: number;
    student_id?: number;
    name: string;
    subjects?: EnrichedSubject[];
    attendanceLogs?: AttendanceRecord[];
}

export const StudentDashboard = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Notification if auto-enrolled via link / QR scan
    const enrolledCodeQuery = searchParams.get('enrolled');
    const [enrolledBanner, setEnrolledBanner] = useState<string | null>(
        enrolledCodeQuery ? `You are successfully enrolled in subject ${enrolledCodeQuery}!` : null
    );

    const [student, setStudent] = useState<StudentData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Enroll with Code Modal State
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [subjectCodeInput, setSubjectCodeInput] = useState('');
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [enrollError, setEnrollError] = useState<string | null>(null);
    const [enrollSuccess, setEnrollSuccess] = useState<string | null>(null);

    // Refresh student data from backend
    const refreshProfile = (studentId: number) => {
        setIsLoading(true);
        api.get(`/students/${studentId}`)
            .then((res) => {
                if (res.data) {
                    setStudent(res.data);
                    localStorage.setItem('student', JSON.stringify(res.data));
                }
            })
            .catch((err) => {
                console.warn('Could not refresh student profile from backend:', err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        const { role } = getAuthSession();
        if (role === 'teacher') {
            navigate('/teacher/dashboard', { replace: true });
            return;
        }

        const studentRaw = localStorage.getItem('student');
        if (!studentRaw || role !== 'student') {
            navigate('/student-login', { replace: true });
            return;
        }

        try {
            const parsedStudent: StudentData = JSON.parse(studentRaw);
            setStudent(parsedStudent);
            refreshProfile(parsedStudent.id);
        } catch (e) {
            console.error('Error parsing student session:', e);
            navigate('/student-login');
        }
    }, [navigate]);

    // Handle Manual Subject Enrollment with Code
    const handleEnrollSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEnrollError(null);
        setEnrollSuccess(null);

        const cleanCode = subjectCodeInput.trim().toUpperCase();
        if (!cleanCode) {
            setEnrollError('Please enter a valid subject code.');
            return;
        }

        if (!student?.id) return;

        setIsEnrolling(true);

        try {
            const res = await api.post('/students/enroll', {
                studentId: student.id,
                subjectCode: cleanCode,
            });

            const data = res.data;
            setEnrollSuccess(data.message || `Successfully enrolled in ${cleanCode}!`);
            setSubjectCodeInput('');

            // Reload updated subjects & attendance stats
            refreshProfile(student.id);

            setTimeout(() => {
                setIsEnrollModalOpen(false);
                setEnrollSuccess(null);
            }, 1200);
        } catch (err: any) {
            console.error('Enrollment error:', err);
            setEnrollError(
                err.response?.data?.error || 'Failed to enroll. Please verify the subject code.'
            );
        } finally {
            setIsEnrolling(false);
        }
    };

    // Handle Unenrollment
    const handleUnenroll = async (subjectId: number, subjectName: string) => {
        if (!confirm(`Are you sure you want to unenroll from "${subjectName}"?`)) {
            return;
        }

        if (!student?.id) return;

        try {
            await api.post('/students/unenroll', {
                studentId: student.id,
                subjectId,
            });

            // Optimistically update subjects list
            setStudent((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    subjects: prev.subjects?.filter((s) => s.id !== subjectId),
                };
            });

            refreshProfile(student.id);
        } catch (err: any) {
            console.error('Unenrollment error:', err);
            alert(err.response?.data?.error || 'Failed to unenroll from subject.');
        }
    };

    if (!student && isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-sm text-gray-500 font-medium">Loading student dashboard...</p>
                </div>
            </div>
        );
    }

    const enrolledSubjects = student?.subjects || [];
    const attendanceRecords = student?.attendanceLogs || [];
    const presentCount = attendanceRecords.filter((r) => r.isPresent).length;
    const totalCount = attendanceRecords.length;
    const overallAttendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

                <main className="flex-1 max-w-6xl w-full mx-auto p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                    {/* SUCCESS NOTIFICATION BANNER (from QR scan / auto enrollment) */}
                    {enrolledBanner && (
                            <div className="p-3.5 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 text-sm animate-in fade-in duration-300">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                    <span className="font-semibold text-xs sm:text-sm">{enrolledBanner}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setEnrolledBanner(null);
                                        searchParams.delete('enrolled');
                                        setSearchParams(searchParams, { replace: true });
                                    }}
                                    className="h-8 w-8 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100/50 rounded-full"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                )}

                            {/* WELCOME BANNER */}
                                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-5 sm:p-8 shadow-xl">
                                    <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none" />
                                    <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-blue-100 mb-2.5 sm:mb-3 border border-white/10">
                                                    <Icons8ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                                    Facial Verification Active
                                                </div>
                                                    <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
                                                        Welcome back, {student?.name}!
                                                    </h1>
                                                        <p className="text-xs sm:text-sm text-blue-100 mt-1">
                                                            Student ID: #{student?.id} • SmartAttend Portal
                                                        </p>
                                                    </div>

                                                        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                                                            <Button
                                                                onClick={() => {
                                                                    setEnrollError(null);
                                                                    setEnrollSuccess(null);
                                                                    setIsEnrollModalOpen(true);
                                                                }}
                                                                className="bg-white text-indigo-900 hover:bg-blue-50 font-semibold shadow-md rounded-2xl h-11 px-5 w-full sm:w-auto justify-center"
                                                            >
                                                                <Plus className="w-4 h-4 mr-2" />
                                                                Enroll in Subject
                                                            </Button>
                                                            <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                                                <Icons8UserCheck className="w-4 h-4 text-emerald-400" />
                                                                Authenticated
                                                            </Badge>
                                                        </div>
                                                    </div>
                                            </div>

                                            {/* STATS OVERVIEW */}
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <Card className="border-0 shadow-sm rounded-2xl bg-white">
                                                    <CardHeader className="pb-2">
                                                        <CardDescription className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                            Overall Attendance Rate
                                                        </CardDescription>
                                                        <CardTitle className="text-3xl font-bold text-gray-900">
                                                            {overallAttendanceRate}%
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                                            <div
                                                                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                                                style={{ width: `${overallAttendanceRate}%` }}
                                                            />
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <Card className="border-0 shadow-sm rounded-2xl bg-white">
                                                    <CardHeader className="pb-2">
                                                        <CardDescription className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                            Total Sessions Attended
                                                        </CardDescription>
                                                        <CardTitle className="text-3xl font-bold text-gray-900">
                                                            {presentCount} / {totalCount}
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p className="text-xs text-gray-500">Verified by camera face detection</p>
                                                    </CardContent>
                                                </Card>

                                                <Card className="border-0 shadow-sm rounded-2xl bg-white">
                                                    <CardHeader className="pb-2">
                                                        <CardDescription className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                            Enrolled Courses
                                                        </CardDescription>
                                                        <CardTitle className="text-3xl font-bold text-gray-900">
                                                            {enrolledSubjects.length}
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p className="text-xs text-gray-500">Active classroom enrollments</p>
                                                    </CardContent>
                                                </Card>
                                            </div>

                                            {/* ENROLLED SUBJECTS SECTION (SIMILAR TO TEACHER MANAGE SUBJECTS) */}
                                                    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5 sm:space-y-6">
                                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-100 gap-3 sm:gap-4">
                                                            <div>
                                                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                                                        <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                                                                        My Enrolled Subjects
                                                                    </h2>
                                                                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                                                        Your enrolled courses with attendance stats and course details
                                                                    </p>
                                                            </div>

                                                            <Button
                                                                onClick={() => {
                                                                    setEnrollError(null);
                                                                    setEnrollSuccess(null);
                                                                    setIsEnrollModalOpen(true);
                                                                }}
                                                                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-5 shadow-md shadow-indigo-600/20 w-full sm:w-auto justify-center"
                                                            >
                                                                <Plus className="w-4 h-4 mr-2" />
                                                                Enroll with Subject Code
                                                            </Button>
                                                        </div>

                                                        {enrolledSubjects.length === 0 ? (
                                                            /* EMPTY ENROLLED SUBJECTS STATE */
                                                            <div className="py-16 px-4 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 flex flex-col items-center">
                                                                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-sm">
                                                                    <Icons8BookStack className="w-9 h-9" />
                                                                </div>
                                                                <h3 className="text-lg font-bold text-gray-900 mb-1">Not enrolled in any subjects yet</h3>
                                                                <p className="text-sm text-gray-500 max-w-sm mb-6">
                                                                    Ask your teacher for the subject code or scan their QR code to automatically enroll in class.
                                                                </p>
                                                                <Button
                                                                    onClick={() => {
                                                                        setEnrollError(null);
                                                                        setEnrollSuccess(null);
                                                                        setIsEnrollModalOpen(true);
                                                                    }}
                                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md rounded-xl"
                                                                >
                                                                    <Plus className="w-4 h-4 mr-2" />
                                                                    Enter Subject Code
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            /* SUBJECT CARDS GRID */
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                                {enrolledSubjects.map((sub) => (
                                                                    <StudentSubjectCard
                                                                        key={sub.id}
                                                                        id={sub.id}
                                                                        name={sub.name}
                                                                        code={sub.code || sub.subjectCode}
                                                                        section={sub.section}
                                                                        teacherName={sub.teacherName}
                                                                        students={sub.students}
                                                                        classes={sub.classes}
                                                                        presentClasses={sub.presentClasses}
                                                                        attendanceRate={sub.attendanceRate}
                                                                        onUnenroll={handleUnenroll}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* RECENT ATTENDANCE HISTORY LOGS */}
                                                    <Card className="border-0 shadow-sm rounded-2xl bg-white overflow-hidden">
                                                        <CardHeader className="border-b border-gray-100 pb-4">
                                                            <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-900">
                                                                <Calendar className="w-4 h-4 text-blue-600" />
                                                                Recent Facial Attendance Logs
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="pt-4">
                                                            {attendanceRecords.length === 0 ? (
                                                                <div className="text-center py-12 text-gray-400">
                                                                    <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                                                    <p className="text-sm font-medium">No attendance logs recorded yet.</p>
                                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                                        Your attendance will appear here automatically when your face is scanned during lectures.
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <div className="divide-y divide-gray-100">
                                                                    {attendanceRecords.map((log) => (
                                                                        <div
                                                                            key={log.id}
                                                                            className="py-3 flex items-center justify-between gap-4"
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                <div
                                                                                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${log.isPresent
                                                                                            ? 'bg-emerald-100 text-emerald-600'
                                                                                            : 'bg-red-100 text-red-600'
                                                                                        }`}
                                                                                >
                                                                                    {log.isPresent ? (
                                                                                        <CheckCircle2 className="w-4 h-4" />
                                                                                    ) : (
                                                                                        <XCircle className="w-4 h-4" />
                                                                                    )}
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-sm font-medium text-gray-900">
                                                                                        {log.subject?.name || 'Class Attendance'}
                                                                                    </p>
                                                                                    <p className="text-xs text-gray-400">
                                                                                        {new Date(log.timestamp).toLocaleString()}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <Badge
                                                                                className={
                                                                                    log.isPresent
                                                                                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0'
                                                                                        : 'bg-red-100 text-red-700 hover:bg-red-100 border-0'
                                                                                }
                                                                            >
                                                                                {log.isPresent ? 'Present' : 'Absent'}
                                                                            </Badge>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                </main>

                                                {/* ENROLL WITH SUBJECT CODE MODAL DIALOG */}
                                                {isEnrollModalOpen && (
                                                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                                                        <div
                                                            className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            {/* MODAL HEADER */}
                                                            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-slate-50/60">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                                                        <Sparkles className="w-5 h-5 text-indigo-600" />
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="text-lg font-bold text-gray-900">Enroll in a Subject</h3>
                                                                        <p className="text-xs text-gray-500">Enter the subject code from your teacher</p>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => setIsEnrollModalOpen(false)}
                                                                    className="rounded-full text-gray-400 hover:text-gray-700 h-8 w-8"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            </div>

                                                            {/* MODAL FORM */}
                                                            <form onSubmit={handleEnrollSubmit} className="p-6 space-y-4">
                                                                {enrollError && (
                                                                    <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                                                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                                                        <span>{enrollError}</span>
                                                                    </div>
                                                                )}

                                                                {enrollSuccess && (
                                                                    <div className="p-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
                                                                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                                                                        <span>{enrollSuccess}</span>
                                                                    </div>
                                                                )}

                                                                <div className="space-y-1.5">
                                                                    <Label htmlFor="enrollSubjectCode" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                                        Subject Code <span className="text-red-500">*</span>
                                                                    </Label>
                                                                    <Input
                                                                        id="enrollSubjectCode"
                                                                        type="text"
                                                                        placeholder="e.g. CS-401"
                                                                        value={subjectCodeInput}
                                                                        onChange={(e) => setSubjectCodeInput(e.target.value.toUpperCase())}
                                                                        className="h-12 rounded-xl text-base font-mono tracking-wider uppercase text-indigo-900 font-bold"
                                                                        autoFocus
                                                                        required
                                                                    />
                                                                    <p className="text-xs text-gray-400 mt-1">
                                                                        Example: <span className="font-mono font-medium text-gray-600">CS-401</span> or <span className="font-mono font-medium text-gray-600">CS-501</span>
                                                                    </p>
                                                                </div>

                                                                    <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-gray-100 mt-6">
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            onClick={() => setIsEnrollModalOpen(false)}
                                                                            disabled={isEnrolling}
                                                                            className="w-full sm:w-auto h-11 rounded-xl px-5 border-gray-200"
                                                                        >
                                                                            Cancel
                                                                        </Button>
                                                                        <Button
                                                                            type="submit"
                                                                            disabled={isEnrolling || !subjectCodeInput.trim()}
                                                                            className="w-full sm:w-auto h-11 rounded-xl px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-500/20"
                                                                        >
                                                                            {isEnrolling ? (
                                                                                    <div className="flex items-center justify-center gap-2">
                                                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                                                        <span>Enrolling...</span>
                                                                                    </div>
                                                                                    ) : (
                                                                                    "Enroll in Subject"
                                    )}
                                                                                </Button>
                            </div>
                                                            </form>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            );
};

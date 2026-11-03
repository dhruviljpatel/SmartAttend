import { useState, useEffect } from 'react';
import { ChevronLeft, AlertCircle, Sparkles, CheckCircle2, QrCode } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CameraCapture } from '../../components/student/CameraCapture';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { Icons8FaceScan, Icons8UserAdd, Icons8UserCheck } from '@/components/ui/Icons';
import { getAuthSession } from '@/lib/auth';

type AuthStep = 'capture' | 'analyzing' | 'recognized' | 'register' | 'error';

interface RecognizedStudent {
    id: number;
    student_id?: number;
    name: string;
    subjects?: any[];
    recentAttendance?: any[];
}

export const StudentLogin = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Subject enrollment code passed via query params (e.g. from QR scan or shared link)
    const enrollCode = (searchParams.get('enroll') || searchParams.get('code') || '').trim().toUpperCase();

    // Route guard: Teachers cannot enter student login; logged-in students handle enrollment or go to dashboard
    useEffect(() => {
        const { role, user } = getAuthSession();
        if (role === 'teacher') {
            navigate('/teacher/dashboard', { replace: true });
            return;
        }

        if (role === 'student' && user) {
            if (enrollCode) {
                // Student is already logged in and opened an enrollment link -> enroll directly!
                api.post('/students/enroll', {
                    studentId: user.id,
                    subjectCode: enrollCode,
                })
                    .then(() => {
                        navigate(`/student/dashboard?enrolled=${encodeURIComponent(enrollCode)}`, { replace: true });
                    })
                    .catch(() => {
                        navigate('/student/dashboard', { replace: true });
                    });
            } else {
                navigate('/student/dashboard', { replace: true });
            }
        }
    }, [navigate, enrollCode]);

    const [step, setStep] = useState<AuthStep>('capture');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [recognizedStudent, setRecognizedStudent] = useState<RecognizedStudent | null>(null);
    const [faceEmbedding, setFaceEmbedding] = useState<number[] | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Registration Form State
    const [studentName, setStudentName] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [registerError, setRegisterError] = useState<string | null>(null);

    // Helper to auto-enroll after login/registration
    const autoEnrollIfRequested = async (studentId: number) => {
        if (!enrollCode) return;
        try {
            await api.post('/students/enroll', {
                studentId,
                subjectCode: enrollCode,
            });
        } catch (err) {
            console.warn('Auto enrollment error:', err);
        }
    };

    // Triggered when student captures photo and clicks "Continue"
    const handleCaptureContinue = async (imageSrc: string) => {
        setCapturedImage(imageSrc);
        setStep('analyzing');
        setErrorMessage(null);

        try {
            const response = await api.post('/students/face-login', { image: imageSrc });
            const data = response.data;

            if (data.exists && data.student) {
                // Student exists!
                setRecognizedStudent(data.student);
                setStep('recognized');

                // Store session info
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }
                localStorage.setItem('student', JSON.stringify(data.student));

                // Auto enroll if student arrived via link/QR code
                await autoEnrollIfRequested(data.student.id);

                // Auto redirect to student dashboard after 1.5 seconds
                setTimeout(() => {
                    navigate(
                        enrollCode
                            ? `/student/dashboard?enrolled=${encodeURIComponent(enrollCode)}`
                            : '/student/dashboard'
                    );
                }, 1500);
            } else {
                // New Student! Needs registration
                setFaceEmbedding(data.faceEmbedding || null);
                setStep('register');
            }
        } catch (err: any) {
            console.error('Face authentication error:', err);
            const msg =
                err.response?.data?.error ||
                err.response?.data?.message ||
                'Unable to process facial authentication. Please try again.';
            setErrorMessage(msg);
            setStep('error');
        }
    };

    // Submits new student registration
    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!studentName.trim()) {
            setRegisterError('Please enter your full name.');
            return;
        }

        setIsRegistering(true);
        setRegisterError(null);

        try {
            const response = await api.post('/students/register', {
                name: studentName.trim(),
                faceEmbedding: faceEmbedding,
                image: capturedImage,
            });

            const data = response.data;
            if (data.student) {
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }
                localStorage.setItem('student', JSON.stringify(data.student));
                setRecognizedStudent(data.student);
                setStep('recognized');

                // Auto enroll if student arrived via link/QR code
                await autoEnrollIfRequested(data.student.id);

                setTimeout(() => {
                    navigate(
                        enrollCode
                            ? `/student/dashboard?enrolled=${encodeURIComponent(enrollCode)}`
                            : '/student/dashboard'
                    );
                }, 1500);
            }
        } catch (err: any) {
            console.error('Student registration error:', err);
            setRegisterError(
                err.response?.data?.error || 'Registration failed. Please try again.'
            );
        } finally {
            setIsRegistering(false);
        }
    };

    const handleReset = () => {
        setCapturedImage(null);
        setRecognizedStudent(null);
        setFaceEmbedding(null);
        setErrorMessage(null);
        setRegisterError(null);
        setStudentName('');
        setStep('capture');
    };

    return (
        <div className="min-h-[100dvh] bg-slate-50 flex items-center justify-center p-2 sm:p-6 py-4">
            <Card className="w-full max-w-md md:max-w-xl lg:max-w-2xl relative shadow-2xl border-0 overflow-hidden rounded-3xl bg-white transition-all duration-300">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-3 top-3 sm:left-4 sm:top-4 rounded-full text-gray-500 hover:text-gray-900 z-10"
                    onClick={() => navigate('/')}
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>

                <CardHeader className="text-center pb-2 pt-5 sm:pt-6 relative px-4">
                    <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-blue-50/80 to-transparent -z-10" />
                    <div className="mx-auto mb-2 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-sm">
                        <Icons8FaceScan className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                        SmartAttend Student Portal
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-gray-500 mt-1">
                        {step === 'capture' && 'Position your face in the center of the frame to log in'}
                        {step === 'analyzing' && 'Matching your face with enrolled students...'}
                        {step === 'recognized' && 'Facial verification successful!'}
                        {step === 'register' && 'New student detected! Complete your quick profile'}
                        {step === 'error' && 'Authentication assistance needed'}
                    </CardDescription>

                    {/* ENROLLMENT BADGE IF SCANNED/ARRIVED VIA LINK */}
                    {enrollCode && (
                        <div className="mt-2.5 mx-auto inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold shadow-xs">
                            <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Auto-enrolling in:</span>
                            <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white font-mono text-[11px] px-2 py-0">
                                {enrollCode}
                            </Badge>
                        </div>
                    )}
                </CardHeader>

                <CardContent className="p-3 sm:p-6">
                    {/* STEP 1: CAMERA CAPTURE */}
                    {step === 'capture' && (
                        <div className="bg-slate-50 rounded-2xl p-1.5 sm:p-2 border border-gray-100 shadow-inner">
                            <CameraCapture
                                onContinue={handleCaptureContinue}
                                isAuthenticating={false}
                            />
                        </div>
                    )}

                    {/* STEP 2: ANALYZING STATE */}
                    {step === 'analyzing' && (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <div className="relative mb-6">
                                {capturedImage && (
                                    <img
                                        src={capturedImage}
                                        alt="Face scan"
                                        className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-blue-500/20"
                                    />
                                )}
                                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
                                Processing Facial Embedding
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 max-w-sm">
                                Running Euclidean face similarity check against database records...
                            </p>
                        </div>
                    )}

                    {/* STEP 3: RECOGNIZED / LOGGED IN */}
                    {step === 'recognized' && recognizedStudent && (
                        <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in duration-300">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-sm">
                                <Icons8UserCheck className="w-9 h-9 text-emerald-600" />
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Face Verified
                            </span>
                            <h3 className="text-2xl font-bold text-gray-900">
                                Welcome, {recognizedStudent.name}!
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Student ID: #{recognizedStudent.id}
                            </p>
                            {enrollCode && (
                                <p className="text-xs font-medium text-indigo-600 mt-2 bg-indigo-50 px-3 py-1 rounded-full inline-block">
                                    Enrolled in course: {enrollCode}
                                </p>
                            )}
                            <p className="text-xs text-gray-400 mt-3">
                                Redirecting to your dashboard...
                            </p>
                            <Button
                                onClick={() =>
                                    navigate(
                                        enrollCode
                                            ? `/student/dashboard?enrolled=${encodeURIComponent(enrollCode)}`
                                            : '/student/dashboard'
                                    )
                                }
                                className="mt-6 w-full max-w-xs rounded-xl shadow-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                            >
                                Proceed to Dashboard
                            </Button>
                        </div>
                    )}

                    {/* STEP 4: REGISTER NEW STUDENT */}
                    {step === 'register' && (
                        <div className="py-2 animate-in fade-in duration-300">
                            <div className="flex items-center gap-4 bg-blue-50/70 border border-blue-100 rounded-2xl p-3 mb-6">
                                {capturedImage ? (
                                    <img
                                        src={capturedImage}
                                        alt="Captured preview"
                                        className="w-16 h-16 rounded-xl object-cover shadow-sm border border-blue-200"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-xl bg-blue-200 flex items-center justify-center text-blue-700">
                                        <Icons8FaceScan className="w-8 h-8" />
                                    </div>
                                )}
                                <div>
                                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-800 bg-blue-100/80 px-2.5 py-0.5 rounded-full mb-1">
                                        <Icons8UserAdd className="w-3.5 h-3.5" />
                                        New Student Profile
                                    </div>
                                    <p className="text-xs text-blue-900 leading-snug">
                                        Face embedding captured! Enter your name to register and complete your login.
                                    </p>
                                    {enrollCode && (
                                        <p className="text-[11px] text-indigo-700 font-semibold mt-1">
                                            Will automatically enroll in: {enrollCode}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <form onSubmit={handleRegisterSubmit} className="space-y-4">
                                <div className="space-y-1.5 text-left">
                                    <Label htmlFor="studentName" className="text-sm font-semibold text-gray-700">
                                        Your Full Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="studentName"
                                        type="text"
                                        value={studentName}
                                        onChange={(e) => setStudentName(e.target.value)}
                                        placeholder="e.g. Alex Johnson"
                                        className="h-11 rounded-xl text-base"
                                        autoFocus
                                        required
                                    />
                                </div>

                                {registerError && (
                                    <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 rounded-xl border border-red-200">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{registerError}</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleReset}
                                        className="w-full h-12 rounded-2xl border-2 border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold text-sm sm:text-base order-2 sm:order-1 transition-all active:scale-[0.98]"
                                    >
                                        Retake Photo
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isRegistering || !studentName.trim()}
                                        className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all active:scale-[0.98] order-1 sm:order-2"
                                    >
                                        {isRegistering ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Registering...</span>
                                            </div>
                                        ) : (
                                            'Register & Sign In'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* STEP 5: ERROR STATE */}
                    {step === 'error' && (
                        <div className="py-6 text-center animate-in fade-in duration-300">
                            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-7 h-7" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                                Verification Note
                            </h3>
                            <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
                                {errorMessage || 'Could not verify face. Please ensure proper camera alignment.'}
                            </p>
                            <Button
                                onClick={handleReset}
                                className="w-full max-w-xs mx-auto h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
                            >
                                Try Again
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

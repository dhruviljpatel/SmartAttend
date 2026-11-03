import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, LogOut, ArrowRight, AlertTriangle } from 'lucide-react';
import { getAuthSession, logout } from '@/lib/auth';

export function HomePage() {
    const navigate = useNavigate();
    const { role, user } = getAuthSession();
    const [switchNotice, setSwitchNotice] = useState<string | null>(null);

    const handleTeacherPortalClick = () => {
        if (role === 'student') {
            setSwitchNotice('You are currently logged in as a Student. Please log out first before accessing the Teacher Portal.');
            return;
        }
        if (role === 'teacher') {
            navigate('/teacher/dashboard');
            return;
        }
        navigate('/teacher-login');
    };

    const handleStudentPortalClick = () => {
        if (role === 'teacher') {
            setSwitchNotice('You are currently logged in as a Teacher. Please log out first before accessing the Student Portal.');
            return;
        }
        if (role === 'student') {
            navigate('/student/dashboard');
            return;
        }
        navigate('/student-login');
    };

    const handleLogout = () => {
        logout();
        setSwitchNotice(null);
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-900 flex flex-col justify-center items-center text-center px-4 sm:px-8 pb-[15vh] pt-20 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-200/50 blur-[120px]" />
            <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-purple-200/50 blur-[120px]" />

            <div className="relative z-10 flex flex-col items-center max-w-3xl w-full">
                <div className="mb-6 flex items-center justify-center h-20 w-20 bg-black text-white rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300">
                    <GraduationCap size={40} />
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                    Smart Attend
                </h1>
                <p className="text-xl md:text-2xl text-gray-500 mb-8 max-w-2xl font-light">
                    Streamlining attendance management for modern educational institutions.
                </p>

                {/* ACTIVE SESSION BADGE IF LOGGED IN */}
                {role && user && (
                    <div className="mb-8 p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-md animate-in fade-in duration-300">
                        <div className="text-left">
                            <span className="text-xs uppercase font-bold tracking-wider text-indigo-600">
                                Active Session
                            </span>
                            <p className="text-sm font-semibold text-gray-900">
                                Logged in as {role === 'teacher' ? 'Teacher' : 'Student'}:{' '}
                                <span className="text-indigo-700">{user.name}</span>
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-semibold"
                        >
                            <LogOut className="w-3.5 h-3.5 mr-1" />
                            Log Out
                        </Button>
                    </div>
                )}

                {/* ROLE SWITCH NOTICE */}
                {switchNotice && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-left max-w-md w-full flex items-start gap-3 text-amber-900 animate-in fade-in duration-200">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-xs sm:text-sm font-medium">{switchNotice}</p>
                            <div className="flex items-center gap-3 mt-3">
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={handleLogout}
                                    className="h-8 text-xs font-medium"
                                >
                                    Log Out & Switch
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setSwitchNotice(null)}
                                    className="h-8 text-xs text-amber-800"
                                >
                                    Dismiss
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* PORTAL ACTIONS */}
                <div className="flex gap-4 md:gap-6 flex-col sm:flex-row w-full max-w-md md:max-w-xl justify-center">
                    <Button
                        size="lg"
                        className={`w-full sm:w-auto text-lg h-14 px-8 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 ${
                            role === 'teacher'
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white ring-4 ring-indigo-200'
                                : ''
                        }`}
                        onClick={handleTeacherPortalClick}
                    >
                        <Users className="mr-2 h-5 w-5" />
                        {role === 'teacher' ? 'Open Teacher Dashboard' : 'Teacher Portal'}
                        {role === 'teacher' && <ArrowRight className="ml-2 h-5 w-5" />}
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className={`w-full sm:w-auto text-lg h-14 px-8 rounded-full border-2 hover:bg-gray-50 transition-all hover:-translate-y-1 bg-white/50 backdrop-blur-sm ${
                            role === 'student'
                                ? 'border-blue-500 bg-blue-50/50 ring-4 ring-blue-100'
                                : ''
                        }`}
                        onClick={handleStudentPortalClick}
                    >
                        <GraduationCap className="mr-2 h-5 w-5 text-gray-700" />
                        {role === 'student' ? 'Open Student Dashboard' : 'Student Portal'}
                        {role === 'student' && <ArrowRight className="ml-2 h-5 w-5" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}

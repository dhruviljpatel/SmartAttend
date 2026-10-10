import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users } from 'lucide-react';

export function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-900 flex flex-col justify-center items-center text-center px-4 sm:px-8 pb-[15vh] pt-24 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-200/50 blur-[120px]" />
            <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-purple-200/50 blur-[120px]" />

            <div className="relative z-10 flex flex-col items-center">
                <div className="mb-8 flex items-center justify-center h-20 w-20 bg-black text-white rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300">
                    <GraduationCap size={40} />
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                    Smart Attend
                </h1>
                <p className="text-xl md:text-2xl text-gray-500 mb-16 max-w-2xl font-light">
                    Streamlining attendance management for modern educational institutions.
                </p>
                <div className="flex gap-4 md:gap-6 flex-col sm:flex-row w-full max-w-md md:max-w-xl justify-center">
                    <Button
                        size="lg"
                        className="w-full sm:w-auto text-lg h-14 px-8 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                        onClick={() => navigate('/teacher-login')}
                    >
                        <Users className="mr-2 h-5 w-5" />
                        Teacher Portal
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto text-lg h-14 px-8 rounded-full border-2 hover:bg-gray-50 transition-all hover:-translate-y-1 bg-white/50 backdrop-blur-sm"
                        onClick={() => navigate('/student-login')}
                    >
                        <GraduationCap className="mr-2 h-5 w-5 text-gray-700" />
                        Student Portal
                    </Button>
                </div>
            </div>
        </div>
    );
}
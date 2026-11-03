import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, GraduationCap } from 'lucide-react';
import { logout } from '@/lib/auth';

export function Header() {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className='flex justify-between items-center px-4 sm:px-6 lg:px-10 py-3 sm:py-4 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50'>
            {/* Static Brand Logo & Title */}
            <div className='flex items-center gap-2.5 sm:gap-3.5 select-none'>
                <div className="flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 bg-black text-white rounded-xl shadow-md shrink-0">
                    <GraduationCap className="w-5 h-5" />
                </div>
                <div className="text-lg sm:text-xl font-bold leading-tight text-gray-900">
                    Smart<br /><span className="text-gray-500">Attend</span>
                </div>
            </div>

            <div className='flex items-center'>
                <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 font-medium text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4 transition-colors"
                >
                    <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    Logout
                </Button>
            </div>
        </header>
    );
}

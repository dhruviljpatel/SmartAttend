import logo from '../assets/logo.svg';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function Header() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear any authentication state, tokens, or local storage data
        localStorage.clear();
        sessionStorage.clear();

        // Navigate back to the home page or login page
        navigate('/');
    };

    return (
        <header className='flex justify-between items-center px-6 lg:px-10 py-4 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50'>
            <div className='flex items-center gap-4 cursor-pointer group' onClick={() => navigate('/')}>
                <div className="bg-black p-2 rounded-xl group-hover:scale-105 transition-transform duration-300">
                    <img src={logo} alt="Smart Attend Logo" className="h-8 w-auto invert" />
                </div>
                <div className="text-xl font-bold leading-tight text-gray-900">
                    Smart<br /><span className="text-gray-500">Attend</span>
                </div>
            </div>

            <div className='flex items-center'>
                <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 font-medium transition-colors"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </Button>
            </div>
        </header>
    );
}
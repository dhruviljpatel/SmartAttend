import logo from '../assets/logo.svg';
import { useNavigate } from 'react-router-dom';

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
        <header className='flex justify-between items-center px-8 py-4 bg-white border-b border-gray-200'>
            <div className='flex items-center gap-4'>
                <img src={logo} alt="Smart Attend Logo" className="h-10 w-auto" />
                <div className="text-xl font-bold leading-tight text-black">
                    Smart<br />Attend
                </div>
            </div>

            <div className='flex items-center'>
                <button
                    onClick={handleLogout}
                    className='px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border-none cursor-pointer'
                >
                    Logout
                </button>
            </div>
        </header>
    );
}
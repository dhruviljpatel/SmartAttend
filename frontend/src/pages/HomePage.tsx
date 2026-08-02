import { useNavigate } from 'react-router-dom';

export function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white text-black flex flex-col justify-center items-center text-center px-8 pb-[15vh] pt-40">
            <h1 className="text-5xl font-bold mb-4">Smart Attend</h1>
            <p className="text-xl text-gray-600 mb-24">Streamlining attendance for teachers and students.</p>
            <div className="flex gap-4 md:gap-16 flex-col md:flex-row w-full max-w-2xl justify-center">
                <button
                    className="px-6 py-3 text-base font-medium cursor-pointer bg-black text-white border-none rounded-full transition-colors duration-200 flex items-center justify-center gap-2 hover:bg-gray-800"
                    onClick={() => navigate('/teacher-login')}>
                    Teacher Login <i className="fa-solid fa-arrow-up-right-from-square"></i>
                </button>
                <button
                    className="px-6 py-3 text-base font-medium cursor-pointer bg-black text-white border-none rounded-full transition-colors duration-200 flex items-center justify-center gap-2 hover:bg-gray-800"
                    onClick={() => navigate('/student-login')}>
                    Student Login <i className="fa-solid fa-arrow-up-right-from-square"></i>
                </button>
            </div>
        </div>
    );
}
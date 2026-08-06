import { useState } from 'react';
import { ScanFace } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CameraCapture } from '../../components/student/CameraCapture';

export const StudentLogin = () => {
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (imageSrc: string) => {
        setIsAuthenticating(true);
        // Simulate network request for face recognition login/registration
        setTimeout(() => {
            setIsAuthenticating(false);
            console.log("Captured Base64 Image string (to send to backend):", imageSrc.substring(0, 100) + '...');
            alert("Image captured successfully! In the future, this will be sent to the backend for processing.");
            // navigate('/student/dashboard'); // Navigate upon success
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md flex flex-col items-center">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-4">
                        <ScanFace size={40} className="text-black" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Student Portal</h2>
                    <p className="text-gray-600 text-sm">Center your face in the frame to continue</p>
                </div>

                <CameraCapture
                    onContinue={handleLogin}
                    isAuthenticating={isAuthenticating}
                />

                <div className="text-center mt-12">
                    <button onClick={() => navigate('/')} className="text-gray-500 hover:text-black transition-colors text-sm font-medium cursor-pointer bg-transparent border-none">
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};
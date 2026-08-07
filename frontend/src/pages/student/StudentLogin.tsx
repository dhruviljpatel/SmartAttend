import { useState } from 'react';
import { ScanFace, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CameraCapture } from '../../components/student/CameraCapture';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md md:max-w-2xl lg:max-w-4xl relative shadow-xl border-0 overflow-hidden transition-all duration-300">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute left-4 top-4 rounded-full text-gray-500 hover:text-gray-900 z-10"
                    onClick={() => navigate('/')}
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                
                <CardHeader className="text-center pb-6 pt-12 relative">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-50 to-transparent -z-10" />
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-inner">
                        <ScanFace size={32} />
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight">Student Portal</CardTitle>
                    <CardDescription className="text-md mt-2">Center your face in the frame to continue</CardDescription>
                </CardHeader>
                
                <CardContent className="px-6 pb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 overflow-hidden">
                        <CameraCapture
                            onContinue={handleLogin}
                            isAuthenticating={isAuthenticating}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
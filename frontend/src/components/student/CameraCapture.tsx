import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraCaptureProps {
    onContinue: (imageSrc: string) => void;
    isAuthenticating: boolean;
}

const videoConstraints = {
    facingMode: "user"
};

export const CameraCapture = ({ onContinue, isAuthenticating }: CameraCaptureProps) => {
    const webcamRef = useRef<Webcam>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);

    const capture = useCallback(() => {
        const image = webcamRef.current?.getScreenshot();
        if (image) {
            setImageSrc(image);
        }
    }, [webcamRef]);

    const retake = () => {
        setImageSrc(null);
        setCameraError(null);
    };

    const handleContinue = () => {
        if (imageSrc) {
            onContinue(imageSrc);
        }
    };

    return (
        <>
            <div className="relative w-full aspect-[3/4] md:aspect-video bg-gray-100 rounded-xl overflow-hidden mb-4 border border-gray-200 transition-all duration-300">
                {cameraError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 p-6 text-center">
                        <span className="mb-2 text-2xl">⚠️</span>
                        <p className="text-sm">{cameraError}</p>
                        <Button onClick={retake} variant="default" className="mt-4">
                            Try Again
                        </Button>
                    </div>
                ) : !imageSrc ? (
                    <>
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                            onUserMediaError={() => setCameraError("Unable to access camera. Please check permissions.")}
                            className="w-full h-full object-cover"
                            mirrored={true}
                        />
                        {/* Face Guide Overlay */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-[70%] h-[70%] border-2 border-black rounded-full border-dashed opacity-50"></div>
                        </div>
                    </>
                ) : (
                    <img
                        src={imageSrc}
                        alt="Captured Face"
                        className="w-full h-full object-cover"
                        style={{ transform: 'scaleX(-1)' }}
                    />
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
                {!imageSrc ? (
                    <Button
                        onClick={capture}
                        className="w-full h-12 text-base rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                    >
                        <Camera size={20} className="mr-2" />
                        Capture
                    </Button>
                ) : (
                    <>
                        <Button
                            onClick={retake}
                            variant="outline"
                            className="flex-1 h-12 rounded-full border-2 hover:bg-gray-50"
                        >
                            <RefreshCw size={20} className="mr-2" />
                            Retake
                        </Button>
                        <Button
                            onClick={handleContinue}
                            disabled={isAuthenticating}
                            className="flex-[2] h-12 rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                        >
                            {isAuthenticating ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Continue
                                    <ArrowRight size={20} className="ml-2" />
                                </>
                            )}
                        </Button>
                    </>
                )}
            </div>
        </>
    );
};

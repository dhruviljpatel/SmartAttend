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
                <div className="relative w-full aspect-[4/3] sm:aspect-video max-h-[50vh] bg-gray-900 rounded-2xl overflow-hidden mb-4 border border-gray-200 shadow-inner transition-all duration-300">
                    {cameraError ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 p-6 text-center bg-gray-50">
                                <span className="mb-2 text-2xl">⚠️</span>
                                    <p className="text-sm font-medium">{cameraError}</p>
                                    <Button onClick={retake} variant="default" className="mt-4 rounded-xl">
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
                                    onUserMediaError={() => setCameraError("Unable to access camera. Please check camera permissions.")}
                                    className="w-full h-full object-cover"
                                    mirrored={true}
                                />
                                {/* Face Guide Overlay */}
                                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
                                        <div className="w-[65%] h-[80%] max-w-[260px] max-h-[300px] border-2 border-white/80 rounded-full border-dashed shadow-[0_0_15px_rgba(0,0,0,0.4)]"></div>
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

                                <div className="w-full">
                                    {!imageSrc ? (
                                        <Button
                                            type="button"
                                            onClick={capture}
                                            className="w-full h-12 text-sm sm:text-base font-semibold rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                                        >
                                            <Camera size={18} className="mr-2 shrink-0" />
                                            Capture Photo
                                        </Button>
                                    ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                                                <Button
                                                    type="button"
                                                    onClick={retake}
                                                    variant="outline"
                                                    className="w-full h-12 rounded-2xl border-2 border-gray-200 hover:bg-gray-100 hover:border-gray-300 font-semibold text-gray-700 text-sm sm:text-base order-2 sm:order-1 transition-all active:scale-[0.98]"
                                                >
                                                    <RefreshCw size={18} className="mr-2 shrink-0" />
                                                    Retake Photo
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={handleContinue}
                                                    disabled={isAuthenticating}
                                                    className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all active:scale-[0.98] order-1 sm:order-2"
                                                >
                                                    {isAuthenticating ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Verifying...</span>
                                </div>
                                                    ) : (
                                                        <>
                                                            <span>Continue</span>
                                                            <ArrowRight size={18} className="ml-2 shrink-0" />
                                                        </>
                                                    )}
                                                </Button>
                                        </div>
                )}
                                </div>
                            </>
                            );
};

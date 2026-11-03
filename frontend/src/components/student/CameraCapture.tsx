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
        <div className="w-full flex flex-col">
            {/* Camera / Captured Face Viewport */}
            <div className="relative w-full aspect-[4/3] sm:aspect-video max-h-[35vh] sm:max-h-[46vh] min-h-[190px] bg-gray-900 rounded-2xl overflow-hidden mb-3 sm:mb-4 border border-gray-200 shadow-inner transition-all duration-300">
                {cameraError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 p-4 sm:p-6 text-center bg-gray-50">
                        <span className="mb-2 text-2xl">⚠️</span>
                        <p className="text-xs sm:text-sm font-medium">{cameraError}</p>
                        <Button 
                            onClick={retake} 
                            variant="default" 
                            size="xl"
                            className="mt-3 rounded-xl min-h-[44px]"
                        >
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
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-3">
                            <div className="w-[60%] h-[75%] max-w-[240px] max-h-[280px] border-2 border-white/80 rounded-full border-dashed shadow-[0_0_15px_rgba(0,0,0,0.4)]"></div>
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

            {/* Action Buttons: Spacious, Touch-Friendly, Never Vertically Squeezed */}
            <div className="w-full pt-0.5">
                {!imageSrc ? (
                    <Button
                        type="button"
                        onClick={capture}
                        size="xl"
                        className="w-full min-h-[50px] sm:min-h-[52px] h-auto py-3.5 px-4 text-sm sm:text-base font-semibold rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <Camera className="w-5 h-5 shrink-0" />
                        <span>Capture Photo</span>
                    </Button>
                ) : (
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 w-full">
                        <Button
                            type="button"
                            onClick={retake}
                            variant="outline"
                            size="xl"
                            className="w-full min-h-[50px] sm:min-h-[52px] h-auto py-3 px-2 sm:px-4 rounded-2xl border-2 border-gray-200 hover:bg-gray-100 hover:border-gray-300 font-semibold text-gray-700 text-xs sm:text-sm md:text-base transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 sm:gap-2 shadow-xs"
                        >
                            <RefreshCw className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
                            <span>Retake<span className="hidden min-[380px]:inline">&nbsp;Photo</span></span>
                        </Button>
                        <Button
                            type="button"
                            onClick={handleContinue}
                            disabled={isAuthenticating}
                            size="xl"
                            className="w-full min-h-[50px] sm:min-h-[52px] h-auto py-3 px-2 sm:px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm md:text-base shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 sm:gap-2"
                        >
                            {isAuthenticating ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span className="text-xs sm:text-sm">Verifying...</span>
                                </div>
                            ) : (
                                <>
                                    <span>Continue</span>
                                    <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

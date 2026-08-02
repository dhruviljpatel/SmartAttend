import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, ArrowRight } from 'lucide-react';

interface CameraCaptureProps {
    onContinue: (imageSrc: string) => void;
    isAuthenticating: boolean;
}

const videoConstraints = {
    width: 1280,
    height: 720,
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
            <div className="relative w-full aspect-[3/4] sm:aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-8 border border-gray-200">
                {cameraError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 p-6 text-center">
                        <span className="mb-2 text-2xl">⚠️</span>
                        <p className="text-sm">{cameraError}</p>
                        <button onClick={retake} className="mt-4 px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors text-sm font-medium cursor-pointer">
                            Try Again
                        </button>
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

            <div className="flex gap-4 w-full">
                {!imageSrc ? (
                    <button
                        onClick={capture}
                        className="w-full py-3 bg-black text-white hover:bg-gray-800 text-base font-medium rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer border-none"
                    >
                        <Camera size={20} />
                        Capture
                    </button>
                ) : (
                    <>
                        <button
                            onClick={retake}
                            className="flex-1 py-3 bg-transparent text-black border border-gray-300 hover:border-black rounded-full font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <RefreshCw size={20} />
                            Retake
                        </button>
                        <button
                            onClick={handleContinue}
                            disabled={isAuthenticating}
                            className="flex-[2] py-3 bg-black text-white hover:bg-gray-800 disabled:opacity-70 rounded-full font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer border-none"
                        >
                            {isAuthenticating ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Continue
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </>
                )}
            </div>
        </>
    );
};

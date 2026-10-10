import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import type { DotLottie } from '@lottiefiles/dotlottie-react';
import { useRef, useEffect } from 'react';

interface HoverDotLottieIconProps {
    src: string;
    className?: string;
}

export function HoverDotLottieIcon({ src, className = "" }: HoverDotLottieIconProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const lottieRef = useRef<DotLottie | null>(null);

    useEffect(() => {
        const parent = containerRef.current?.parentElement;
        if (!parent) return;

        const handleMouseEnter = () => {
            if (lottieRef.current) {
                lottieRef.current.setMode("forward");
                lottieRef.current.play();
            }
        };

        const handleMouseLeave = () => {
            if (lottieRef.current) {
                lottieRef.current.stop();
            }
        };

        parent.addEventListener("mouseenter", handleMouseEnter);
        parent.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            parent.removeEventListener("mouseenter", handleMouseEnter);
            parent.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    return (
        <div ref={containerRef} className={`inline-flex items-center justify-center ${className}`}>
            <DotLottieReact
                src={src}
                dotLottieRefCallback={(ref) => { lottieRef.current = ref; }}
                loop={false}
                autoplay={false}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
}

import { useLottie } from "lottie-react";
import { useEffect, useRef } from "react";

interface HoverLottieIconProps {
  animationData: unknown;
  className?: string;
}

export function HoverLottieIcon({ animationData, className = "" }: HoverLottieIconProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const options = {
    animationData,
    loop: false,
    autoplay: false,
  };

  const { View, setDirection, play, stop } = useLottie(options);

  useEffect(() => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    const handleMouseEnter = () => {
      setDirection(1);
      play();
    };

    const handleMouseLeave = () => {
      stop();
    };

    parent.addEventListener("mouseenter", handleMouseEnter);
    parent.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      parent.removeEventListener("mouseenter", handleMouseEnter);
      parent.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [play, setDirection, stop]);

  return (
    <div ref={containerRef} className={`inline-flex items-center justify-center ${className}`}>
      {View}
    </div>
  );
}

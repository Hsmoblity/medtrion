import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface CarouselProps {
  children: React.ReactNode[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}

export function Carousel({ children, autoPlay = true, interval = 4500, className = '' }: CarouselProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = React.useState(autoPlay);

  React.useEffect(() => {
    if (!isAutoPlaying || children.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % children.length);
    }, interval);

    return () => window.clearInterval(timer);
  }, [isAutoPlaying, children.length, interval]);

  React.useEffect(() => {
    if (children.length === 0) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex((current) => current % children.length);
  }, [children.length]);

  return (
    <div className={className}>
      <div
        className="relative overflow-hidden rounded-[24px]"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(autoPlay)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="w-full py-3"
          >
            {children[activeIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {children.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {children.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 w-2.5 rounded-full border border-[#3fa2a3]/40 transition-all duration-300 ${
                index === activeIndex ? 'scale-125 bg-[#3fa2a3]' : 'bg-white/80 hover:bg-[#3fa2a3]/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Carousel;

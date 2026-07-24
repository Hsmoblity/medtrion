'use client';
import { useState } from 'react';
import { cn } from 'lib/utils';

type InfiniteSliderProps = {
    children: React.ReactNode;
    gap?: number;
    duration?: number;
    direction?: 'horizontal' | 'vertical';
    reverse?: boolean;
    className?: string;
};

export function InfiniteSlider({
    children,
    gap = 16,
    duration = 22,
    direction = 'horizontal',
    reverse = false,
    className,
}: InfiniteSliderProps) {
    const [isPaused, setIsPaused] = useState(false);
    const animationName = direction === 'horizontal' ? 'scrollX' : 'scrollY';
    const animationDirection = reverse ? 'reverse' : 'normal';

    return (
        <>
            <div className={cn('overflow-hidden', className)}>
                <div
                    className='flex w-fit p-8'
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    style={{
                        display: 'flex',
                        flexDirection: direction === 'horizontal' ? 'row' : 'column',
                        gap: `${gap}px`,
                        willChange: 'transform',
                        animationName,
                        animationDuration: `${duration}s`,
                        animationTimingFunction: 'linear',
                        animationIterationCount: 'infinite',
                        animationPlayState: isPaused ? 'paused' : 'running',
                        animationDirection,
                    }}
                >
                    {children}
                    {children}
                </div>
            </div>

            <style jsx>{`
                @keyframes scrollX {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }

                @keyframes scrollY {
                    from { transform: translateY(0); }
                    to { transform: translateY(-50%); }
                }
            `}</style>
        </>
    );
}

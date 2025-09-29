'use client';
import React, { useEffect, useState, useRef } from 'react';
import {
    motion,
    SpringOptions,
    useMotionValue,
    useSpring,
    AnimatePresence,
    Transition,
    Variant,
} from 'framer-motion';
import { cn } from 'lib/utils';


type CursorProps = {
    children: React.ReactNode;
    className?: string;
    springConfig?: SpringOptions;
    attachToParent?: boolean;
    transition?: Transition;
    variants?: {
        initial: Variant;
        animate: Variant;
        exit: Variant;
    };
    onPositionChange?: (x: number, y: number) => void;
};

export function Cursor({
    children,
    className,
    springConfig,
    attachToParent = false,
    variants,
    transition,
    onPositionChange,
}: CursorProps) {
    const cursorX = useMotionValue(
        typeof window !== 'undefined' ? window.innerWidth / 2 : 0
    );
    const cursorY = useMotionValue(
        typeof window !== 'undefined' ? window.innerHeight / 2 : 0
    );
    const cursorRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (!attachToParent) {
            document.body.style.cursor = 'none';
        } else {
            document.body.style.cursor = 'auto';
        }

        const updatePosition = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            onPositionChange?.(e.clientX, e.clientY);
        };

        document.addEventListener('mousemove', updatePosition);

        return () => {
            document.removeEventListener('mousemove', updatePosition);
            // Restore default cursor when component unmounts
            document.body.style.cursor = 'auto';
        };
    }, [cursorX, cursorY, onPositionChange, attachToParent]);

    const cursorXSpring = useSpring(cursorX, springConfig || { duration: 0 });
    const cursorYSpring = useSpring(cursorY, springConfig || { duration: 0 });

    useEffect(() => {
        const node = cursorRef.current;
        if (!attachToParent || !node) return;

        const parent = node.parentElement;
        if (!parent) return;

        const handleMouseEnter = () => {
            parent.style.cursor = 'none';
            setIsVisible(true);
        };
        const handleMouseLeave = () => {
            parent.style.cursor = 'auto';
            setIsVisible(false);
        };

        parent.addEventListener('mouseenter', handleMouseEnter);
        parent.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            parent.removeEventListener('mouseenter', handleMouseEnter);
            parent.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [attachToParent]);

    return (
        <motion.div
            ref={cursorRef}
            className={cn('pointer-events-none fixed left-0 top-0 z-50', className)}
            style={{
                x: cursorXSpring,
                y: cursorYSpring,
                translateX: '-50%',
                translateY: '-50%',
            }}
        >
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={variants?.initial || { opacity: 0, scale: 0.8 }}
                        animate={variants?.animate || { opacity: 1, scale: 1 }}
                        exit={variants?.exit || { opacity: 0, scale: 0.8 }}
                        transition={transition || { duration: 0.2 }}
                        className="w-6 h-6"
                    >
                        {children || (
                            <img 
                                src="/cursor-click.svg" 
                                alt="Custom cursor" 
                                className="w-full h-full"
                                style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.3))' }}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

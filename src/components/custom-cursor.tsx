"use client";

import { motion, useMotionValue } from "framer-motion";
import { useEffect } from "react";

interface CursorProps {
  children: React.ReactNode;
}

export const Cursor: React.FC<CursorProps> = ({ children }) => {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    window.addEventListener("mousemove", moveCursor);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="fixed top-0 left-0 z-50 pointer-events-none mix-blend-difference"
      style={{
        x: cursorX,
        y: cursorY,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      <div className="w-8 h-8 bg-white rounded-full opacity-80">{children}</div>
    </motion.div>
  );
};

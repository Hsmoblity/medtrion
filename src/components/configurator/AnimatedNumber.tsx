import React, { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';

interface AnimatedNumberProps {
  from: number;
  to: number;
  duration?: number;
  prefix?: string;
  postfix?: string;
  className?: string;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ from, to, duration = 0.5, prefix = '', postfix = '', className }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const controls = animate(from, to, {
      duration,
      onUpdate(value) {
        node.textContent = `${prefix}${value.toFixed(2)}${postfix}`;
      }
    });

    return () => controls.stop();
  }, [from, to, duration, prefix, postfix]);

  return <span ref={nodeRef} className={className} />;
};

export default AnimatedNumber;

"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface AnimatedSubscribeButtonProps {
    buttonColor: string;
    buttonTextColor?: string;
    subscribeStatus: boolean;
    initialText: React.ReactElement | string;
    changeText: React.ReactElement | string;
}

export const AnimatedSubscribeButton: React.FC<
    AnimatedSubscribeButtonProps
> = ({
    buttonColor,
    subscribeStatus,
    buttonTextColor,
    changeText,
    initialText,
}) => {
        const [isSubscribed, setIsSubscribed] = useState<boolean>(subscribeStatus);

        return (
            <AnimatePresence mode="wait">
                {isSubscribed ? (
                    <motion.button
                        className="relative flex w-48 items-center justify-center overflow-hidden rounded-lg bg-white p-2.5 outline outline-2 outline-[#3fa2a3] transition-all duration-200 hover:shadow-lg hover:outline-[#2d8687]"
                        onClick={() => setIsSubscribed(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.span
                            key="action"
                            className="relative block h-full w-full font-semibold text-sm"
                            initial={{ y: -50 }}
                            animate={{ y: 0 }}
                            style={{ color: buttonColor }}
                        >
                            {changeText}
                        </motion.span>
                    </motion.button>
                ) : (
                    <motion.button
                        className="relative flex w-48 cursor-pointer items-center justify-center rounded-lg border-none p-2.5 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 shadow-md"
                        style={{ backgroundColor: buttonColor || '#3fa2a3', color: buttonTextColor || '#ffffff' }}
                        onClick={() => setIsSubscribed(true)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.span
                            key="reaction"
                            className="relative block font-semibold text-sm"
                            initial={{ x: 0 }}
                            exit={{ x: 50, transition: { duration: 0.1 } }}
                        >
                            {initialText}
                        </motion.span>
                    </motion.button>
                )}
            </AnimatePresence>
        );
    };


export const DrawOutlineButton = ({ children, ...rest }: any) => {
    return (
        <button
            {...rest}
            className="group relative px-4 py-2 font-primary font-semibold text-[#0d163c] transition-colors duration-300 hover:text-[#3fa2a3] rounded-none focus:outline-none"
        >
            <span className="relative z-10">{children}</span>

            {/* BOTTOM UNDERLINE EFFECT */}
            <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#3fa2a3] transition-all duration-300 ease-out group-hover:w-full" />
        </button>
    );
};
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
                        className="relative flex w-[200px] items-center justify-center overflow-hidden rounded-md bg-white p-[10px] outline outline-1 outline-black"
                        onClick={() => setIsSubscribed(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.span
                            key="action"
                            className="relative block h-full w-full font-semibold"
                            initial={{ y: -50 }}
                            animate={{ y: 0 }}
                            style={{ color: buttonColor }}
                        >
                            {changeText}
                        </motion.span>
                    </motion.button>
                ) : (
                    <motion.button
                        className="relative flex w-[200px] cursor-pointer items-center justify-center rounded-md border-none p-[10px]"
                        style={{ backgroundColor: buttonColor, color: buttonTextColor }}
                        onClick={() => setIsSubscribed(true)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.span
                            key="reaction"
                            className="relative block font-semibold"
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
            className="group relative px-4 py-1 font-bold text-black transition-colors duration-[400ms] hover:text-gray-800"
        >
            <span>{children}</span>

            {/* TOP */}
            {/* <span className="absolute left-0 top-0 h-[2px] w-0 bg-black transition-all duration-200 group-hover:w-full" /> */}

            {/* RIGHT */}
            {/* <span className="absolute right-0 top-0 h-0 w-[2px] bg-black transition-all delay-100 duration-100 group-hover:h-full" /> */}

            {/* BOTTOM */}
            <span className="absolute bottom-1 left-2 h-[3px] w-0 bg-black transition-all delay-300 duration-400 group-hover:w-[90%]" />

            {/* LEFT */}
            {/* <span className="absolute bottom-0 left-0 h-0 w-[2px] bg-black transition-all delay-300 duration-100 group-hover:h-full" /> */}
        </button>
    );
};
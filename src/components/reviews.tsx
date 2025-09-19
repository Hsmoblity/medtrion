import * as React from "react";
import { RiChatQuoteFill, RiChatQuoteLine } from "react-icons/ri";
import { AnimatedSubscribeButton } from "./btn";
import { MdCheckCircleOutline } from "react-icons/md";
import { FaChevronRight, FaQuoteLeft } from "react-icons/fa";
import { InfiniteSlider } from "./marqee";

export function Reviews() {
    return (
        <div id="reviews" className="mt-10 py-8 px-5">

            <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row gap-5">
                {/* Text Section */}
                <div className="flex-1">
                    <div className="text-4xl text-black mb-8">
                        Some of the nice things
                        <br />
                        others have said about our
                        products
                    </div>
                    <div className="border-[var(--your-border-color)] rounded mb-4">
                        {/* Placeholder for border */}
                    </div>
                    <button className="relative inline-flex h-12 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-50">
                        <span className="absolute  inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#a2aeff_0%,#3749be_50%,#a2aeff_100%)] " />
                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-black px-8 py-1 text-md uppercase font-medium  text-white backdrop-blur-3xl">
                            Get a FREE Quote
                        </span>
                    </button>
                </div>

                {/* Review Section */}

                <div className="justify-end max-w-[800px] max-h-[500px] overflow-hidden ">

                    <InfiniteSlider direction='vertical' gap={40} className="drop-shadow-2xl">

                        {/* Review 1 */}

                        <div className="flex relative gap-4 bg-slate-100 md:p-4 p-1 rounded-lg border-2 border-slate-400 shadow-xl">
                            <div className="relative -top-20 -left-10">
                                <FaQuoteLeft
                                    color="black"

                                    size={80}
                                />
                            </div>

                            <div className="flex flex-col">
                                <div className="relative -left-10 text-black font-bold md:text-xl text-base">
                                    &quot;When he went downstairs for the first time in 15 months - he cried - it was a touching moment for both of us.&quot;
                                </div>

                            </div>
                        </div>
                        {/* Review 2 */}
                        <div className="flex relative gap-4 bg-slate-100 md:p-4 p-1 rounded-lg border-b-2 border-l-[0.1px] border-r-[0.1px] border-slate-400 shadow-xl">
                            <div className="relative -top-20 -left-10">
                                <FaQuoteLeft
                                    color="black"

                                    size={80}
                                />
                            </div>

                            <div className="flex flex-col">
                                <div className="relative -left-10 text-black font-bold md:text-xl text-base">
                                    &quot;Just wanted you to know how happy and satisfied we are with our Acorn chairlift. It fits into our decor beautifully and does all it is supposed to do. The installer was excellent. Efficient and pleasant and spent the time instructing us on how to use the chair.&quot;
                                </div>

                            </div>
                        </div>

                        <div className="flex relative gap-4 bg-slate-100 md:p-4 p-1 rounded-lg border-b-2 border-l-[0.1px] border-r-[0.1px] border-slate-400 shadow-xl">
                            <div className="relative -top-20 -left-10">
                                <FaQuoteLeft
                                    color="black"

                                    size={80}
                                />
                            </div>

                            <div className="flex flex-col">
                                <div className="relative -left-10 text-black font-bold md:text-xl text-base">
                                    &quot;It has taken great strain off of my husband trying to go up and down the stairs with COPD. Thank you!&quot;
                                </div>

                            </div>
                        </div>

                        {/* Review 3 (example structure) */}
                        <div className="flex relative gap-4 bg-slate-100 md:p-4 p-1 rounded-lg border-b-2 border-l-[0.1px] border-r-[0.1px] border-slate-400 shadow-xl">
                            <div className="relative -top-20 -left-10">
                                <FaQuoteLeft
                                    color="black"

                                    size={80}
                                />
                            </div>

                            <div className="flex flex-col">
                                <div className="relative -left-10 text-black font-bold md:text-xl text-base">
                                    &quot;I thought I&apos;d lose my independence once I had a stairlift fitted. In fact, it&apos;s the total opposite. I have more confidence and wish I&apos;d had one installed sooner in my home!&quot;
                                </div>

                            </div>
                        </div>

                    </InfiniteSlider>
                </div>


            </div>
        </div >
    );
}

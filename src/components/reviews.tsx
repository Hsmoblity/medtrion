import * as React from "react";
import { RiChatQuoteFill, RiChatQuoteLine } from "react-icons/ri";
import { AnimatedSubscribeButton } from "./btn";
import { MdCheckCircleOutline } from "react-icons/md";
import { FaChevronRight, FaQuoteLeft } from "react-icons/fa";
import { InfiniteSlider } from "./marqee";

export function Reviews() {
    return (
        <div id="reviews" className="mt-10 py-16 md:py-20 bg-gradient-to-br from-white to-[#f9f7f3] px-4 sm:px-6 lg:px-8">

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
                {/* Text Section */}
                <div className="flex-1">
                    <div className="text-4xl md:text-5xl font-primary font-bold text-[#0d163c] mb-8">
                        Some of the nice things
                        <br />
                        others have said about our
                        products
                    </div>
                    <div className="border-b-2 border-[#3fa2a3] rounded mb-6 w-16"></div>
                    <a href="/consultation/google-form" className="relative inline-flex h-12 overflow-hidden rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-[#3fa2a3] focus:ring-offset-2 transition-all duration-200 hover:scale-105">
                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#3fa2a3_0%,#f7a236_50%,#3fa2a3_100%)]" />
                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-[35px] bg-[#3fa2a3] hover:bg-[#f7a236] px-6 py-3 text-sm uppercase font-primary font-semibold text-white backdrop-blur-3xl transition-all duration-300">
                            Get a FREE Quote
                        </span>
                    </a>
                </div>

                {/* Review Section */}

                <div className="justify-end max-w-[800px] max-h-[500px] overflow-hidden ">

                    <InfiniteSlider direction='vertical' gap={40} className="drop-shadow-2xl">

                        {/* Review 1 */}

                        <div className="flex relative gap-4 bg-gradient-to-br from-white to-[#f9f7f3] md:p-6 p-4 rounded-lg border-2 border-[#3fa2a3]/30 shadow-lg hover:shadow-xl hover:border-[#3fa2a3] transition-all duration-300">
                            <div className="relative -top-20 -left-10">
                                <FaQuoteLeft
                                    color="#3fa2a3"
                                    size={80}
                                    className="opacity-60"
                                />
                            </div>

                            <div className="flex flex-col">
                                <div className="relative -left-10 text-[#0d163c] font-primary font-semibold md:text-xl text-base leading-relaxed">
                                    &quot;When he went downstairs for the first time in 15 months - he cried - it was a touching moment for both of us.&quot;
                                </div>
                            </div>
                        </div>
                        {/* Review 2 */}
                        <div className="flex relative gap-4 bg-gradient-to-br from-white to-[#f9f7f3] md:p-6 p-4 rounded-lg border-2 border-[#f7a236]/30 shadow-lg hover:shadow-xl hover:border-[#f7a236] transition-all duration-300">
                            <div className="relative -top-20 -left-10">
                                <FaQuoteLeft
                                    color="#f7a236"
                                    size={80}
                                    className="opacity-60"
                                />
                            </div>

                            <div className="flex flex-col">
                                <div className="relative -left-10 text-[#0d163c] font-primary font-semibold md:text-xl text-base leading-relaxed">
                                    &quot;Just wanted you to know how happy and satisfied we are with our Acorn chairlift. It fits into our decor beautifully and does all it is supposed to do. The installer was excellent. Efficient and pleasant and spent the time instructing us on how to use the chair.&quot;
                                </div>
                            </div>
                        </div>

                        <div className="flex relative gap-4 bg-gradient-to-br from-white to-[#f9f7f3] md:p-6 p-4 rounded-lg border-2 border-[#f7a236]/30 shadow-lg hover:shadow-xl hover:border-[#f7a236] transition-all duration-300">
                            <div className="relative -top-20 -left-10">
                                <FaQuoteLeft
                                    color="#f7a236"
                                    size={80}
                                    className="opacity-60"
                                />
                            </div>

                            <div className="flex flex-col">
                                <div className="relative -left-10 text-[#0d163c] font-primary font-semibold md:text-xl text-base leading-relaxed">
                                    &quot;It has taken great strain off of my husband trying to go up and down the stairs with COPD. Thank you!&quot;
                                </div>

                            </div>
                        </div>

                        {/* Review 3 (example structure) */}
                        <div className="flex relative gap-4 bg-gradient-to-br from-white to-[#f9f7f3] md:p-6 p-4 rounded-lg border-2 border-[#3fa2a3]/30 shadow-lg hover:shadow-xl hover:border-[#3fa2a3] transition-all duration-300">
                            <div className="relative -top-20 -left-10">
                                <FaQuoteLeft
                                    color="#3fa2a3"
                                    size={80}
                                    className="opacity-60"
                                />
                            </div>

                            <div className="flex flex-col">
                                <div className="relative -left-10 text-[#0d163c] font-primary font-semibold md:text-xl text-base leading-relaxed">
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

export default Reviews;

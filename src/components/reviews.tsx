import * as React from "react";
import { FaQuoteLeft } from "react-icons/fa";
import { Carousel } from "./Carousel";

export function Reviews() {
    return (
        <section id="reviews" className="relative mt-10 overflow-hidden bg-[linear-gradient(135deg,#f8fcff_0%,#ffffff_45%,#fff8ed_100%)] px-4 py-10 sm:px-6 md:py-14 lg:px-8 lg:py-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(63,162,163,0.14),transparent_35%)]" />

            <div className="relative mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
                {/* Text Section */}
                <div className="w-full self-center pt-2 text-left lg:w-[50%] lg:pt-0">
                    <div className="inline-flex items-center rounded-full border border-[#3fa2a3]/20 bg-white/80 px-3 py-1 text-sm font-semibold uppercase tracking-[0.25em] text-[#3fa2a3] shadow-sm">
                        Loved by customers
                    </div>

                    <h2 className="mt-2 text-2xl font-primary font-bold leading-tight text-[#0d163c] sm:text-3xl md:text-4xl">
                        Some of the nice things
                        <br />
                        <span className="text-[#3fa2a3]">others have said</span> about our products
                    </h2>

                    <div className="mt-3 h-1.5 w-24 rounded-full bg-gradient-to-r from-[#f7a236] to-[#3fa2a3]" />

                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#4b5563] sm:text-base">
                        Real experiences from customers who chose comfort, independence, and quality for their homes.
                    </p>
                </div>

                {/* Review Section */}
                <div className="w-full overflow-hidden rounded-[32px] border border-white/70 bg-white p-2 shadow-[0_25px_80px_rgba(13,22,60,0.11)] sm:p-3 md:p-4 lg:w-[50%] lg:flex lg:items-center lg:justify-center">
                    <div className="flex h-[330px] items-center justify-center sm:h-[350px] md:h-[370px] lg:h-[390px]">
                        <div className="w-full max-w-[620px]">
                            <Carousel className="h-full w-full" autoPlay interval={4500}>
                                <div className="relative flex h-full min-h-0 w-full flex-col items-center justify-center gap-3 rounded-[20px] bg-white p-4">
                                    <FaQuoteLeft color="#3fa2a3" size={34} className="opacity-80" />
                                    <p className="max-w-[28rem] text-center text-[#0d163c] font-primary text-sm font-semibold leading-relaxed md:text-base">
                                        &quot;When he went downstairs for the first time in 15 months - he cried - it was a touching moment for both of us.&quot;
                                    </p>
                                </div>

                                <div className="relative flex h-full min-h-0 w-full flex-col items-center justify-center gap-3 rounded-[20px] bg-white p-4">
                                    <FaQuoteLeft color="#f7a236" size={34} className="opacity-80" />
                                    <p className="max-w-[28rem] text-center text-[#0d163c] font-primary text-sm font-semibold leading-relaxed md:text-base">
                                        &quot;Just wanted you to know how happy and satisfied we are with our Acorn chairlift. It fits into our decor beautifully and does all it is supposed to do. The installer was excellent. Efficient and pleasant and spent the time instructing us on how to use the chair.&quot;
                                    </p>
                                </div>

                                <div className="relative flex h-full min-h-0 w-full flex-col items-center justify-center gap-3 rounded-[20px] bg-white p-4">
                                    <FaQuoteLeft color="#3fa2a3" size={34} className="opacity-80" />
                                    <p className="max-w-[28rem] text-center text-[#0d163c] font-primary text-sm font-semibold leading-relaxed md:text-base">
                                        &quot;It has taken great strain off of my husband trying to go up and down the stairs with COPD. Thank you!&quot;
                                    </p>
                                </div>

                                <div className="relative flex h-full min-h-0 w-full flex-col items-center justify-center gap-3 rounded-[20px] bg-white p-4">
                                    <FaQuoteLeft color="#f7a236" size={34} className="opacity-80" />
                                    <p className="max-w-[28rem] text-center text-[#0d163c] font-primary text-sm font-semibold leading-relaxed md:text-base">
                                        &quot;I thought I&apos;d lose my independence once I had a stairlift fitted. In fact, it&apos;s the total opposite. I have more confidence and wish I&apos;d had one installed sooner in my home!&quot;
                                    </p>
                                </div>
                            </Carousel>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Reviews;

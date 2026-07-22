import Link from "next/link";
import * as React from "react";
import { useRouter } from 'next/router';
import { handleAnchorNavigation } from "lib/utils/navigation";
import { PrimaryButton } from 'components/ui';

function Banner() {
    const router = useRouter();
    return (

        <div className="w-full max-w-7xl mx-auto my-8 md:my-12 px-4 md:px-0">
            <div className="relative overflow-hidden rounded-[28px] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(240,247,246,0.9)_45%,rgba(247,237,221,0.9))] p-[1px] shadow-[0_20px_60px_rgba(13,22,60,0.12)] backdrop-blur-xl">
                <div className="rounded-[27px] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.98),_rgba(245,241,232,0.92)_45%,_rgba(234,247,246,0.9))] p-8 md:p-10">

                <div className="container-center flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Image Section */}
                    <div className="flex flex-col w-full md:w-1/4 mb-4 md:mb-0">
                        <img
                            loading="lazy"
                            src="/shop-stairlifts-canada.png"
                            className="object-contain rounded-lg aspect-[1.1] w-full shadow-md"
                        />
                    </div>

                    {/* Text Section */}
                    <div className="flex flex-col w-full md:w-2/4 text-center md:text-left">
                        <div className="inline-flex w-fit items-center rounded-full border border-[#3fa2a3]/20 bg-white/70 px-3 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-[#3fa2a3] shadow-sm mb-4">
                            New arrivals
                        </div>
                        <div className="md:text-4xl text-2xl font-primary font-bold leading-tight text-[#0d163c] mb-4">
                            New Products are here!
                        </div>
                        <div className="flex flex-col pt-3 w-full">
                            <div className="flex gap-1">
                                <p className="text-base font-primary font-medium text-[#4b5563] leading-relaxed">Explore our latest arrivals designed to enhance your mobility and support your well-being. From advanced mobility aids to home health solutions, we have everything you need to improve your quality of life. Don't miss out on these exciting new additions to our collection!</p>

                            </div>
                        </div>
                    </div>

                    {/* Call to Action Section */}
                    <PrimaryButton 
                        size="lg"
                        onClick={(e) => {
                            e.preventDefault();
                            handleAnchorNavigation("/#shop", router);
                        }}
                        className="bg-[#3fa2a3] hover:bg-[#f7a236] text-white font-primary font-semibold px-6 py-3 rounded-[35px] transition-all duration-300 transform hover:-translate-y-1 shadow-md"
                    >
                        Check out
                    </PrimaryButton>
                </div>
                </div>
            </div>
        </div>
    );
}

export default Banner;

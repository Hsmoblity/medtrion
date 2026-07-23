import { getFeatureFlag } from "lib/featureFlags";
import EnhancedHero from "./Hero/EnhancedHero";

function Hero() {
    // Check if enhanced hero is enabled via feature flag
    const enhancedHeroEnabled = getFeatureFlag('homepage_enhanced_hero');
    
    if (enhancedHeroEnabled) {
        return <EnhancedHero />;
    }

    // Fallback to original hero for backward compatibility
    return (
        <section className="relative z-10 overflow-hidden bg-gradient-to-br from-[#07162d] via-[#0f2d4c] to-[#2f8f8f] px-4 pt-10 pb-12 md:pt-16 md:pb-20 flex flex-col min-h-[550px]">
            <div className="absolute inset-0 opacity-30">
                <div className="absolute left-[-8%] top-[-10%] h-56 w-56 rounded-full bg-[#f7a236]/35 blur-3xl" />
                <div className="absolute bottom-[-8%] right-[-6%] h-64 w-64 rounded-full bg-[#3fa2a3]/30 blur-3xl" />
            </div>
            <div className="container-center relative text-center flex flex-col justify-center flex-1 w-full">
                <div className="mx-auto max-w-3xl rounded-[32px] border border-white/20 bg-white/10 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:p-10">
                    <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#f7a236]">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#f7a236]" />
                        Trusted mobility solutions
                    </span>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-primary font-bold text-white mb-6 leading-tight">
                        Express Your Freedom with Medtrion
                    </h1>
                    <p className="text-lg md:text-xl text-blue-50/90 mb-8 max-w-3xl mx-auto font-primary leading-relaxed">
                        Empowering 1000+ Satisfied Customers to Stay Independent with Exceptional mobility products
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/#shop" className="inline-flex items-center justify-center rounded-[35px] bg-[#3fa2a3] px-7 py-3 font-primary font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-[#f7a236]">
                            Shop Now
                        </a>
                        <a href="/consultation/google-form" className="inline-flex items-center justify-center rounded-[35px] border border-white/20 bg-white/10 px-7 py-3 font-primary font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-white/20">
                            Get Free Quote
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Hero;

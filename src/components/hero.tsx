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
        <section className="relative z-10 w-full bg-white px-4 pt-8 md:pt-16 pb-12 md:pb-20 flex flex-col min-h-[550px]">
            <div className="container-center text-center flex flex-col justify-center flex-1 w-full">
                <h1 className="text-5xl md:text-7xl font-primary font-bold text-[#0d163c] mb-6">
                    Express Your Freedom with Medtrion
                </h1>
                <p className="text-lg md:text-xl text-[#4b5563] mb-8 max-w-3xl mx-auto font-primary">
                    Empowering 1000+ Satisfied Customers to Stay Independent with Exceptional mobility products
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="/#shop" className="bg-[#3fa2a3] hover:bg-[#f7a236] text-white px-6 py-3 rounded-[35px] font-primary font-semibold transition-all duration-300 inline-block transform hover:-translate-y-1 shadow-md">
                        Shop Now
                    </a>
                    <a href="/consultation/google-form" className="bg-[#f7a236] hover:bg-[#3fa2a3] text-white px-6 py-3 rounded-[35px] font-primary font-semibold transition-all duration-300 inline-block transform hover:-translate-y-1 shadow-md">
                        Get Free Quote
                    </a>
                </div>
            </div>
        </section>
    );
}

export default Hero;

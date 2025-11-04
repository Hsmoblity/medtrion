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
        <section className="relative z-10 w-full bg-[url('/nnnoise.svg')] bg-cover bg-repeat px-4 pt-20 md:pt-32 pb-12 md:pb-16 flex flex-col min-h-[500px]">
            <div className="container mx-auto text-center flex flex-col justify-center flex-1">
                <h1 className="text-4xl md:text-6xl font-poppins font-semibold text-black mb-6">
                    Express Your Freedom with Health Supply & Mobility Inc
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
                    Empowering 1000+ Satisfied Customers to Stay Independent with Exceptional mobility products
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="/#shop" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200 inline-block">
                        Shop Now
                    </a>
                    <a href="/#contact-us" className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200 inline-block">
                        Get Free Quote
                    </a>
                </div>
            </div>
        </section>
    );
}

export default Hero;

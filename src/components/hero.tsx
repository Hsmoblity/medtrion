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
        <section className="relative z-10 w-full bg-[url('/nnnoise.svg')] bg-cover bg-repeat px-4 py-24 flex flex-col">
            <div className="container mx-auto text-center">
                <h1 className="text-4xl md:text-6xl font-poppins font-semibold text-black mb-6">
                    Express Your Freedom with HS Mobility
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                    Empowering 1000+ Satisfied Customers to Stay Independent with Exceptional mobility products
                </p>
            </div>
        </section>
    );
}

export default Hero;

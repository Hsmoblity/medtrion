import { motion } from "framer-motion";
import { useRouter } from "next/router";
import Link from "next/link";

interface HeroProps {
  badge?: string;
  title: string;
  description?: string;
  breadcrumbs: {
    label: string;
    href?: string;
  }[];
}

const Hero = ({ badge, title, description, breadcrumbs }: HeroProps) => {
  const router = useRouter();

  return (
    <section className="bg-gradient-to-r from-[#0b1f3a] via-[#153a5f] to-[#3fa2a3] text-white pt-[155px] pb-12 sm:pt-20 sm:pb-12 md:pt-[150px] md:pb-10">
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
        {/* Hero Content */}
        <div className="mx-auto max-w-3xl text-center">
          {badge && (
            <span className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#f7a236]">
              {badge}
            </span>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-2xl md:text-5xl font-bold"
          >
            {title}
          </motion.h1>

          {description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 text-lg leading-8 text-blue-100 md:text-xl"
            >
              {description}
            </motion.p>
          )}
        </div>

        {/* Breadcrumb */}
        <nav className="mt-10 flex justify-center" aria-label="Breadcrumb">
          <ol className="flex items-center gap-3 text-sm">
            {breadcrumbs.map((item, index) => (
              <li key={index} className="flex items-center">
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-white hover:text-[#f7a236] transition"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-[#f7a236]">{item.label}</span>
                )}

                {index !== breadcrumbs.length - 1 && (
                  <svg
                    className="mx-3 h-4 w-4 text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  );
};

export default Hero;

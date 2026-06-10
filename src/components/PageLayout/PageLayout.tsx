import Header from "./Header";
import Footer from "./Footer";
import { motion } from "framer-motion";
import Link from "next/link";
import { SiteLogo } from "../../lib/fetchSiteLogo";

interface ContactPhone {
  name: string;
  number: string;
}

interface PageLayoutProps {
  children: React.ReactNode;
  logo?: SiteLogo | null;
  contactPhone?: ContactPhone[];
  hideFooter?: boolean;  // Optional prop to hide footer on specific pages
}
const fadeInVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
};
const PageLayout: React.FC<PageLayoutProps> = ({ children, logo, contactPhone, hideFooter = false }) => {

  return (
    <div>
      <Link href="https://harbourfrontwebdesigns.com" className="absolute top-[-9999] left-[-9999] -z-50">Website Designer and Developer</Link>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInVariant}
        id="header" className="fixed top-0 left-0 right-0 z-50 "
      >
        <Header logo={logo} />

      </motion.div>
      <div className="z-10 relative min-h-[75vh] bg-gray-50 dark:bg-gray-900 pt-20 md:pt-24">
        {children}
      </div>

      {!hideFooter && <Footer logo={logo} contactPhone={contactPhone} />}
    </div>
  );
};

export default PageLayout;

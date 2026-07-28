import Header from "./Header";
import Footer from "./Footer";
import { motion } from "framer-motion";
import Link from "next/link";
import { SiteLogo } from "../../lib/fetchSiteLogo";

interface ContactPhone {
  name: string;
  number: string;
}

interface ContactInfo {
  contactAddress: string;
  contactEmail: string;
  contactPhone: ContactPhone[];
}

interface PageLayoutProps {
  children: React.ReactNode;
  logo?: SiteLogo | null;
  contactInfo?: ContactInfo | null;
  hideFooter?: boolean;  // Optional prop to hide footer on specific pages
}
const fadeInVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
};
const PageLayout: React.FC<PageLayoutProps> = ({ children, logo, contactInfo, hideFooter = false }) => {

  return (
    <div>
      <Link href="https://markitme.ca/" className="absolute top-[-9999] left-[-9999] -z-50">Website Designer and Developer</Link>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInVariant}
        id="header" className="fixed top-0 left-0 right-0 z-50 "
      >
        <Header logo={logo} contactInfo={contactInfo} />

      </motion.div>
      <div className="relative z-10 min-h-[75vh] ">
        {children}
      </div>

      {!hideFooter && <Footer logo={logo} contactInfo={contactInfo} />}
    </div>
  );
};

export default PageLayout;

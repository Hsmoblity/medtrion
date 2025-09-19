import Header from "./Header";
import Footer from "./Footer";
import { motion } from "framer-motion";
import Link from "next/link";

interface PageLayoutProps {
  children: React.ReactNode;
}
const fadeInVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
};
const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {

  return (
    <div>
      <Link href="https://harbourfrontwebdesigns.com" className="absolute top-[-9999] left-[-9999] -z-50">Website Designer and Developer</Link>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInVariant}
        id="header" className="fixed top-0 left-0 right-0 z-50 "
      >
        <Header />

      </motion.div>
      <div className=" z-10 relative min-h-[75vh] bg-[#f6f2f0] ">
        {children}
      </div>

      <Footer />
    </div>
  );
};

export default PageLayout;

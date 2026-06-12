import Cart from "./Cart/Cart";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { MdShoppingCart } from "react-icons/md";
import { DrawOutlineButton } from "components/btn";
import Drawer from "components/drawer";
import Link from "next/link";
import { useCartStore, useCartCount, useIsHydrated } from "stores/cartStore";
import { handleAnchorNavigation } from "lib/utils/navigation";
import ClientOnly from 'components/ClientOnly';
import { Typography } from '../typography';
import { SiteLogo, getLogoUrl, getLogoAlt } from "../../lib/fetchSiteLogo";

interface ContactPhone {
  name: string;
  number: string;
}

interface ContactInfo {
  contactAddress: string;
  contactEmail: string;
  contactPhone: ContactPhone[];
}

interface HeaderProps {
  logo?: SiteLogo | null;
  contactInfo?: ContactInfo | null;
}

const Header: React.FC<HeaderProps> = ({ logo, contactInfo }) => {
  const toggleCartVisibility = useCartStore(state => state.toggleCartVisibility);
  const cartLength = useCartCount();
  const isHydrated = useIsHydrated();
  const router = useRouter();
  const menuItems = [
    { name: "Shop All", href: "/products" },
    // { name: "Acorn Stairlifts", href: "/product/acorn-stairlifts-acorn-180-curved-stairlift" },
    { name: "Contact Us", href: "/contact" },
    { name: "Reviews", href: "/#reviews" },
    { name: "FAQs", href: "/#faq" },
    { name: "Blogs", href: "/blogs" },
  ];
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);



  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY) {
      setScrollDirection("down");
    } else {
      setScrollDirection("up");
    }
    setLastScrollY(currentScrollY);

    if (currentScrollY > 50) { // Adjust this value based on when you want the background to appear
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  }, [lastScrollY]);

  useEffect(() => {
    const onScroll = () => {
      requestAnimationFrame(handleScroll);
    };
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []); // Remove handleScroll from dependencies to prevent infinite loop

  return (
    <>
      <Cart />
      <div className={`md:hidden transition-transform duration-500 ${isScrolled ? `bg-[#f1ebe0]` : `bg-[url('/nnnoise.svg')] bg-cover bg-repeat`}`}>
        <div className="flex items-center px-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img
              src={getLogoUrl(logo)}
              alt={getLogoAlt(logo)}
              className="h-14 w-auto object-contain"
            />
          </Link>
          {/* Right side: ml-auto pins to far right regardless of logo size */}
          <div className="ml-auto flex flex-row items-center gap-1">
            <button onClick={() => router.push('/cart')} className="relative z-50 p-2 flex items-center justify-center">
              <MdShoppingCart color="black" size={30} />
              <ClientOnly fallback={
                <span className="absolute w-4 h-4 text-black text-xs border border-solid border-gray-500 rounded-full flex flex-row justify-center items-center p-2 right-0 top-0 bg-white opacity-0">
                  0
                </span>
              }>
                {isHydrated && cartLength > 0 && (
                  <span className="absolute w-4 h-4 text-black text-xs border border-solid border-gray-500 rounded-full flex flex-row justify-center items-center p-2 right-0 top-0 bg-white">
                    {cartLength}
                  </span>
                )}
              </ClientOnly>
            </button>
            <Drawer logo={logo} contactInfo={contactInfo} />
          </div>
        </div>
      </div>
      <header className={`md:flex hidden flex-row justify-between z-50 md:px-4 md:pb-2 px-1 font-medium  w-full capitalize transition-transform duration-500  ${isScrolled ? `bg-[#f1ebe0] ` : ` bg-[url('/nnnoise.svg')] bg-cover bg-repeat`}`}>

        <div className="w-full mx-auto flex justify-between  max-w-7xl px-6">
          {/* Logo */}

          <Link href="/" className="flex items-start">
            <img
              src={getLogoUrl(logo)}
              alt={getLogoAlt(logo)}
              className="w-52 object-cover"
            />
          </Link>
          {/* Navigation Menu */}
          <nav className="flex space-x-6 text-lg mt-2">
            {menuItems.map((item, index) => (
              <DrawOutlineButton
                key={index} 
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  handleAnchorNavigation(item.href, router, item.name);
                }}
                className="uppercase font-bold font-poppins tracking-widest"
              >
                {item.name}
              </DrawOutlineButton>
            ))}
          </nav>


          {/* Icons */}
          <div className="flex items-center space-x-4 text-lg">
            {/* <FaSearch className="cursor-pointer hover:text-gray-700" title="Search" />
            <FaHeart className="cursor-pointer hover:text-gray-700" title="Wishlist" />
            <FaUser className="cursor-pointer hover:text-gray-700" title="Account" /> */}


            <button onClick={() => router.push('/cart')} className="relative z-50 outline-0 text-white flex flex-row" >
              <MdShoppingCart
                color="black"
                size={40}
              />
              <ClientOnly fallback={
                <span className="absolute w-4 h-4 text-black text-xs border border-solid border-gray-500 rounded-full flex flex-row justify-center items-center p-2 -left-1 -bottom-1 bg-white opacity-0">
                  0
                </span>
              }>
                {isHydrated && cartLength > 0 && (
                  <span className="absolute w-4 h-4 text-black text-xs border border-solid border-gray-500 rounded-full flex flex-row justify-center items-center p-2 -left-1 -bottom-1 bg-white">
                    {cartLength}
                  </span>
                )}
              </ClientOnly>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;

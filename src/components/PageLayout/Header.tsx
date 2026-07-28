import Cart from "./Cart/Cart";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { MdShoppingCart } from "react-icons/md";
import { DrawOutlineButton } from "components/btn";
import Drawer, { DrawerHandle } from "components/drawer";
import { RiMenu4Line } from 'react-icons/ri';
import { useRef } from 'react';
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
  const drawerRef = useRef<DrawerHandle | null>(null);

  const toggleDrawerFromHeader = () => {
    if (drawerRef.current) drawerRef.current.toggle();
  };



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
    <div className="bg-brand-dark text-white text-[12px] md:text-sm font-medium  w-full h-10 flex justify-center items-center capitalize"> Explore our exclusive deals <Link className="inline-block rounded-full bg-gradient-to-r from-[#3fa2a3] to-[#f7a236] px-4 py-1 text-[12px] md:text-xs font-primary font-semibold text-white ml-2 shadow-md hover:text-white hover:bg-brand-accent" href="/products">Click Now</Link></div>
      <Cart />
      <div className="md:hidden sticky top-0 z-50 bg-white shadow-sm transition-transform duration-500">
        <div className="flex items-center justify-between px-4 py-0 md:py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img
              src="/med-logo.png"
              alt="Medtrion Logo"
              className="h-14 w-auto object-contain"
            />
          </Link>
          {/* Right side: ml-auto pins to far right regardless of logo size */}
          <div className="ml-auto flex flex-row items-center">
            <button onClick={() => router.push('/cart')} className="relative z-50 p-2 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
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
            {/* Drawer controlled from header: render hamburger here */}
            <button
              onClick={toggleDrawerFromHeader}
              className="w-12 h-12 ml-3 rounded-full bg-slate-100 p-2.5 hover:bg-gray-100 transition-colors duration-200 focus:outline-none"
              aria-label="Open menu"
            >
              <RiMenu4Line size={26} className="text-gray-700" />
            </button>
            <Drawer ref={drawerRef} logo={logo} contactInfo={contactInfo} showInternalToggle={false} />
          </div>
        </div>
      </div>
      <header className="z-50 hidden w-full flex-row justify-between bg-gradient-to-r from-white via-[#f8fbff] to-[#fef7eb] px-1 font-medium capitalize text-[#0d163c] transition-transform duration-500 md:flex md:px-4 md:pb-2">

        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-2">
          {/* Logo */}

          <Link href="/" className="flex items-start">
            <img
              src="/med-logo.png"
              alt="Medtrion Logo"
              className="w-20 object-contain pt-1"
            />
          </Link>
          {/* Navigation Menu */}
          <nav className="mt-2 flex items-center space-x-5 text-lg">
            {menuItems.map((item, index) => (
              <DrawOutlineButton
                key={index} 
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  handleAnchorNavigation(item.href, router, item.name);
                }}
                className="rounded-full px-3 py-2 font-poppins font-bold uppercase tracking-[0.2em] text-[#0d163c] transition-all duration-300 hover:bg-[#fef7eb] hover:text-[#3fa2a3]"
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

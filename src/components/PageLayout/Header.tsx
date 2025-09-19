import Cart from "./Cart/Cart";
import { useCallback, useContext, useEffect, useState } from "react";
import CartItemsContext from "contexts/cartItemsContext";
import CartVisibilityContext from "contexts/cartVisibilityContext";
import { CartProduct } from "lib/interfaces";
import { MdShoppingCart } from "react-icons/md";
import { DrawOutlineButton } from "components/btn";
import Drawer from "components/drawer";
import Link from "next/link";

const Header = () => {
  const { cart } = useContext(CartItemsContext);
  const { toggleCartVisibility } = useContext(CartVisibilityContext);
  const cartLength = cart.reduce(
    (count: number, item: CartProduct) =>
      (count += item.quantity ? item.quantity : 1),
    0
  );
  const menuItems = [
    { name: "Shop All", href: "#shop" },
    { name: "Acorn Stairlifts", href: "/product/acorn-stairlifts-acorn-180-curved-stairlift" },
    { name: "Contact Us", href: "#contact-us" },
    { name: "Reviews", href: "#reviews" },
    { name: "FAQs", href: "#faq" },
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
  }, [handleScroll]);

  return (
    <>
      <Cart />
      <div className={`py-2 transition-transform duration-500  ${isScrolled ? `bg-[#f1ebe0] ` : `bg-[url('/nnnoise.svg')] bg-cover bg-repeat`}`}>
        <Link href="/" className="flex md:hidden items-center ml-6 mt-6">
          <img
            src="/Logo.png"
            alt="Logo"
            className="md:h-10 h-8 object-contain"
          />
        </Link>
        <div className="md:hidden absolute top-5 right-5 flex flex-row ">
          <button onClick={toggleCartVisibility} className="relative z-50 outline-0 text-white items-start mt-2 mr-3 rounded-md border-1  flex flex-row" >

            <MdShoppingCart
              color="black"
              className="ml-2"
              size={32}
            />
            {cartLength > 0 && (
              <span className="absolute w-4 h-4 text-black text-xs border border-solid border-gray-500 rounded-full flex flex-row justify-center items-center p-2 -left-1 -bottom-1 bg-white">
                {cartLength}
              </span>
            )}
          </button>
          <Drawer />
        </div>
      </div>
      <header className={`md:flex hidden flex-row justify-between z-50 md:px-4 md:pb-2 px-1 font-medium  w-full capitalize transition-transform duration-500  ${isScrolled ? `bg-[#f1ebe0] ` : ` bg-[url('/nnnoise.svg')] bg-cover bg-repeat`}`}>

        <div className="w-full mx-auto flex justify-between  max-w-7xl px-6">
          {/* Logo */}

          <Link href="/" className="flex items-start">
            <img
              src="/Logo.png"
              alt="Logo"
              className="w-52 object-cover"
            />
          </Link>
          {/* Navigation Menu */}
          <nav className="flex space-x-6 text-lg mt-2">
            {menuItems.map((item, index) => (
              <Link key={index} href={item.href} className="uppercase font-bold font-poppins tracking-widest">
                <DrawOutlineButton>{item.name}</DrawOutlineButton>
              </Link>
            ))}
          </nav>


          {/* Icons */}
          <div className="flex items-center space-x-4 text-lg">
            {/* <FaSearch className="cursor-pointer hover:text-gray-700" title="Search" />
            <FaHeart className="cursor-pointer hover:text-gray-700" title="Wishlist" />
            <FaUser className="cursor-pointer hover:text-gray-700" title="Account" /> */}


            <button onClick={toggleCartVisibility} className="relative z-50 outline-0 text-white flex flex-row" >

              <MdShoppingCart
                color="black"
                size={40}
              />
              {cartLength > 0 && (
                <span className="absolute w-4 h-4 text-black text-xs border border-solid border-gray-500 rounded-full flex flex-row justify-center items-center p-2 -left-1 -bottom-1 bg-white">
                  {cartLength}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;

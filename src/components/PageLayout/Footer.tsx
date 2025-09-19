import Link from "next/link";
import { FaFacebook } from "react-icons/fa";

const Footer = () => {
  const d = new Date();

  return (
    <div className="w-full bg-inherit">
      <div className="bg-[url('/nnnoise.svg')] bg-cover bg-repeat">
        <div className="max-w-screen-xl py-2 px-4 sm:px-6 md:text-left text-center text-gray-800 sm:flex justify-between mx-auto">
          <div className="p-5 sm:w-2/12 border-r hidden md:block">
            <div className="text-xl uppercase md:mt-10 text-black font-black font-poppins ">Menu</div>
            <ul>
              <li className="my-2">
                <Link href="/" className="text-lg leading-6 text-gray-500 hover:text-gray-900">
                  Home
                </Link>
              </li>
              <li className="my-2">
                <Link href="#shop" className="text-base leading-6 text-gray-500 hover:text-gray-900">
                  Shop All
                </Link>
              </li>
              <li className="my-2">
                <Link href="/product/acorn-stairlifts-acorn-180-curved-stairlift" className="text-base leading-6 text-gray-500 hover:text-gray-900">
                  Acorn Stairlifts
                </Link>
              </li>
              <li className="my-2">
                <Link href="#reviews" className="text-base leading-6 text-gray-500 hover:text-gray-900">
                  Reviews
                </Link>
              </li>

              <li className="my-2">
                <Link href="#faq" className="text-base leading-6 text-gray-500 hover:text-gray-900">
                  Faq
                </Link>
              </li>
            </ul>
          </div>
          <div className="p-5 sm:w-7/12 border-r text-center">
            <div className="flex flex-col items-center lg:col-span-1">
              <img src="/Logo.png" alt="Logo" className="w-64 object-contain mb-4" />
            </div>
            <p className="text-gray-500 text-base mb-10">HSMobility is your trusted source for a wide range of health services and mobility products designed to improve your quality of life.

              <br /><br /><br />Please note: We are not manufacturers of <b>Acorn stairlifts</b> but proud affiliate partners.</p>

          </div>
          <div className="px-5 pt-5 sm:w-3/12">
            <div className="text-xl uppercase md:mt-9 text-black font-black font-poppins">Contact Us</div>
            <ul>
              <li className="my-2">
                <div className="hover:text-indigo-600"> 3495 Rebecca St<br /> #207 Oakville, ON<br />L6L 6X9</div>
              </li>
              <li className="my-2">
                <Link className="hover:text-indigo-600" href="mailto:Info@hsmobility.ca">Info@hsmobility.ca</Link>
              </li>
              <li className="my-2">
                <Link className="hover:text-indigo-600" href="tel:+19053301774">
                  +1 (905) 330-1774</Link>
              </li>
              <li className="mt-4 justify-center mx-auto">
                <Link className="hover:text-indigo-600 " href="https://www.facebook.com/profile.php?id=61565518749182"><FaFacebook className="flex justify-center mx-auto" size={25} /></Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex pb-5 m-auto text-gray-800 text-sm flex-col items-center border-t max-w-screen-xl">
          <div className="flex justify-center gap-6">
            <img src="/visa.svg" alt="Visa" className="w-10 h-auto" />
            <img src="/mastercard.svg" alt="MasterCard" className="w-10 h-auto" />
            <img src="/amex.svg" alt="American Express" className="w-10 h-auto" />
            <img src="/discover.svg" alt="Discover" className="w-10 h-auto" />
          </div>
          <div className="my-5">© Copyright 2025. All Rights Reserved.</div>
        </div>
      </div>

    </div>
  );
};

export default Footer;

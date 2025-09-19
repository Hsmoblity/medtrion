import { useState, useEffect } from "react";
import { useAnimate, stagger } from "framer-motion";
import { RiMenu4Line } from "react-icons/ri";
import Link from "next/link";


interface PathProps {
    d: string;
    className?: string;
    variants?: {
        closed: { d: string };
        open: { d: string };
    };
    opacity?: string;
}

const Path: React.FC<PathProps> = (props) => (
    <path
        fill="transparent"
        strokeWidth="3"
        stroke="black"
        strokeLinecap="round"
        {...props}
    />
);

type Segment = [string, any, any];

function useMenuAnimation(isOpen: boolean) {
    const [scope, animate] = useAnimate();

    useEffect(() => {
        const menuAnimations: Segment[] = isOpen
            ? [
                [
                    "nav",
                    { transform: "translateX(0%)" },
                    { ease: [0.08, 0.65, 0.53, 0.96], duration: 0.6 }
                ],
                [
                    "li",
                    { transform: "scale(1)", opacity: 1, filter: "blur(0px)" },
                    { delay: stagger(0.05), at: "-0.1" }
                ]
            ]
            : [
                [
                    "li",
                    { transform: "scale(0.5)", opacity: 0, filter: "blur(10px)" },
                    { delay: stagger(0.05, { from: "last" }), at: "<" }
                ],
                ["nav", { transform: "translateX(-100%)" }, { at: "-0.1" }]
            ];

        animate([
            [
                "path.top",
                { d: isOpen ? "M 3 16.5 L 17 2.5" : "M 2 2.5 L 20 2.5" },
                { at: "<" }
            ],
            ["path.middle", { opacity: isOpen ? 0 : 1 }, { at: "<" }],
            [
                "path.bottom",
                { d: isOpen ? "M 3 2.5 L 17 16.346" : "M 2 16.346 L 20 16.346" },
                { at: "<" }
            ],
            ...menuAnimations
        ]);
    }, [isOpen]);

    return scope;
}

const Drawer: React.FC = () => {
    const toggleDrawer = () => {
        setIsOpen(!isOpen);
    };
    const [isOpen, setIsOpen] = useState(false);
    const scope = useMenuAnimation(isOpen);
    return (
        <div
            ref={scope}
            className="relative bg-transparent z-50 overflow-hidden pb-24"
        >
            <nav className="fixed top-0 -left-10 h-full w-11/12 bg-[#f1ebe0] transform -translate-x-full will-change-transform">
                <div className="flex flex-col relative z-40 pt-4 pl-10 font-poppins text-center  text-stone-400 ">
                    <div className="flex flex-col md:gap-3 gap-2 relative">
                        <div className="flex md:hidden items-center ml-6 mt-4">
                            <img
                                src="/Logo.png"
                                alt="Logo"
                                className="md:h-10 h-8 object-cover"
                            />
                        </div>
                        {/* <Image
                            src="/web-designs.png"
                            alt="web designers near me"
                            width={192} // equivalent to w-48
                            height={192} // adjust this based on the image aspect ratio
                            className="rounded-lg ml-4 -mt-7"
                        /> */}
                    </div>
                </div>
                <ul className="flex flex-col gap-5 pt-8 pl-8 text-black font-bold text-xl border-l-[0.5px] m-5 ">


                    <li className="p-2.5 transform-origin-left-5 will-change-transform-opacity-filter">
                        <Link aria-label="link to how it works section" href="#shop" onClick={toggleDrawer}>Shop All</Link>
                    </li>
                    <li className="p-2.5 transform-origin-left-5 will-change-transform-opacity-filter">
                        <Link aria-label="check designs" href="/product/acorn-stairlifts-acorn-180-curved-stairlift" onClick={toggleDrawer}>Acorn Stairlift</Link>
                    </li>
                    <li className="p-2.5 transform-origin-left-5 will-change-transform-opacity-filter">
                        <Link aria-label="Check out our blogs" href="#reviews" onClick={toggleDrawer}>Reviews</Link>
                    </li>
                    <li className="p-2.5 transform-origin-left-5 will-change-transform-opacity-filter">
                        <Link aria-label="Frequently asked Questions" href="#faq" onClick={toggleDrawer}>FAQs</Link>
                    </li>
                    <li className="p-2.5 transform-origin-left-5 will-change-transform-opacity-filter">
                        <div className="text-left">
                            <h2 className="text-xl font-bold mb-4">Contact Us:</h2>
                            <p className="text-lg ">
                                3495 Rebecca St<br /> #207 Oakville, ON<br />L6L 6X9<br />
                                <br />
                                <Link href="tel:+19053301774" className="text-xl text-sky-400">
                                    +1 (905) 330-1774
                                </Link><br />
                                <Link href="mailto:Info@hsmobility.ca" className="text-xl text-sky-400">Info@hsmobility.ca</Link><br />
                            </p>
                        </div>
                    </li>
                </ul>
            </nav>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className=" w-12 h-12 rounded-full bg-transparent p-2.5"
            >
                <RiMenu4Line size={32} />
            </button>
        </div>
    );
}

export default Drawer;

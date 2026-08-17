import React, { useState, useEffect, useImperativeHandle } from "react";
import { useAnimate, stagger } from "framer-motion";
import { RiMenu4Line } from "react-icons/ri";
import Link from "next/link";
import { useRouter } from 'next/router';
import { handleAnchorNavigation } from "lib/utils/navigation";
import { SiteLogo, getLogoUrl, getLogoAlt } from "../lib/fetchSiteLogo";
import { removeAddressLabels } from "../lib/utils/addressFormatter";


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
    }, [isOpen, animate]);

    return scope;
}

interface ContactPhone {
    name: string;
    number: string;
}

interface ContactInfo {
    contactAddress: string;
    contactEmail: string;
    contactPhone: ContactPhone[];
}

interface DrawerProps {
    logo?: SiteLogo | null;
    contactInfo?: ContactInfo | null;
    /**
     * If true, Drawer will render its internal menu toggle button.
     * Set to false when parent renders the toggle in the header.
     */
    showInternalToggle?: boolean;
}

export interface DrawerHandle {
    toggle: () => void;
    open: () => void;
    close: () => void;
    isOpen: () => boolean;
}

const Drawer = React.forwardRef<DrawerHandle, DrawerProps>(({ logo, contactInfo, showInternalToggle = true }, ref) => {
    const router = useRouter();
    const toggleDrawer = () => {
        setIsOpen(!isOpen);
    };
    const [isOpen, setIsOpen] = useState(false);
    const scope = useMenuAnimation(isOpen);

    useImperativeHandle(ref, () => ({
        toggle: () => setIsOpen(v => !v),
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        isOpen: () => isOpen,
    }), [isOpen]);
    return (
        <div
            ref={scope}
            className="relative bg-transparent z-50 overflow-hidden pb-24"
        >
            <nav className="fixed top-0 -left-10 h-full w-11/12 bg-[#f1ebe0] transform -translate-x-full will-change-transform shadow-2xl overflow-y-auto">
                <div className="flex flex-col relative z-40 pt-4 pl-10 font-poppins text-center text-stone-400">
                    <div className="flex flex-col md:gap-3 gap-2 relative">
                        <div className="flex md:hidden items-center ml-6 mt-4">
                            {/* <img
                                src={getLogoUrl(logo)}
                                alt={getLogoAlt(logo)}
                                className="md:h-10 h-8 object-cover"
                            /> */}
                            {/* Logo */}
                            <Link href="/" className="flex items-center">
                                <img
                                src="/med-logo.png"
                                alt="Medtrion Logo"
                                className="h-14 w-auto object-contain"
                                />
                            </Link>
                        </div>
                    </div>
                </div>
                <ul className="flex flex-col gap-3 pt-4 pl-8 text-black font-medium text-base border-l border-gray-300 m-5">
                    <li className="p-1.5 transform-origin-left-5 will-change-transform-opacity-filter hover:bg-gray-100 rounded-md transition-colors duration-200">
                        <button 
                            aria-label="view all products" 
                            onClick={(e) => {
                                e.preventDefault();
                                toggleDrawer();
                                handleAnchorNavigation("/products", router, "Shop All");
                            }}
                            className="block text-left w-full"
                        >
                            Shop All
                        </button>
                    </li>
                    <li className="p-1.5 transform-origin-left-5 will-change-transform-opacity-filter hover:bg-gray-100 rounded-md transition-colors duration-200">
                        <button 
                            aria-label="Check out our reviews" 
                            onClick={(e) => {
                                e.preventDefault();
                                toggleDrawer();
                                handleAnchorNavigation("/#reviews", router, "Reviews");
                            }}
                            className="block text-left w-full"
                        >
                            Reviews
                        </button>
                    </li>
                    <li className="p-1.5 transform-origin-left-5 will-change-transform-opacity-filter hover:bg-gray-100 rounded-md transition-colors duration-200">
                        <button 
                            aria-label="Frequently asked Questions" 
                            onClick={(e) => {
                                e.preventDefault();
                                toggleDrawer();
                                handleAnchorNavigation("/#faq", router, "FAQs");
                            }}
                            className="block text-left w-full"
                        >
                            FAQs
                        </button>
                    </li>
                    <li className="p-1.5 transform-origin-left-5 will-change-transform-opacity-filter hover:bg-gray-100 rounded-md transition-colors duration-200">
                        <button 
                            aria-label="Read our blogs" 
                            onClick={(e) => {
                                e.preventDefault();
                                toggleDrawer();
                                handleAnchorNavigation("/blogs", router, "Blogs");
                            }}
                            className="block text-left w-full"
                        >
                            Blogs
                        </button>
                    </li>
                    <li className="p-1.5 transform-origin-left-5 will-change-transform-opacity-filter hover:bg-gray-100 rounded-md transition-colors duration-200">
                        <button 
                            aria-label="Contact us" 
                            onClick={(e) => {
                                e.preventDefault();
                                toggleDrawer();
                                handleAnchorNavigation("/#contact-us", router, "Contact Us");
                            }}
                            className="block text-left w-full"
                        >
                            Contact Us
                        </button>
                    </li>
                    <li className="p-1.5 transform-origin-left-5 will-change-transform-opacity-filter">
                        <div className="text-left bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h2 className="text-md font-bold mb-3 text-gray-800 flex items-center gap-2">
                                
                                Contact Info
                            </h2>
                            <div className="text-xs text-gray-700 leading-relaxed space-y-3">
                                {/* Address */}
                                <div className="flex items-start gap-2">
                                    <svg className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>{contactInfo?.contactAddress ? removeAddressLabels(contactInfo.contactAddress) : '3495 Rebecca St Oakville, ON L6L 6X9'}</span>
                                </div>

                                {/* Phone numbers */}
                                <div className="flex items-start gap-2">
                                    <svg className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    {contactInfo?.contactPhone && contactInfo.contactPhone.length > 0 ? (
                                        <div className="space-y-1">
                                            {contactInfo.contactPhone.map((phone, index) => (
                                                <div key={index}>
                                                    <Link 
                                                        href={`tel:${phone.number.replace(/\D/g, '')}`} 
                                                        className="text-xs text-brand-primary hover:text-brand-dark transition-colors duration-200"
                                                    >
                                                        {phone.number}
                                                    </Link>
                                                    {phone.name && <span className="text-xs text-gray-500 ml-2">({phone.name})</span>}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <Link href="tel:+19053301774" className="text-xs text-brand-primary hover:text-brand-dark transition-colors duration-200">
                                            +1 (905) 330-1774
                                        </Link>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-brand-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <Link 
                                        href={`mailto:${contactInfo?.contactEmail || 'Info@medtrion.ca'}`} 
                                        className="text-xs text-brand-primary hover:text-brand-dark transition-colors duration-200"
                                    >
                                        {contactInfo?.contactEmail || 'Info@medtrion.ca'}
                                    </Link>
                                </div>

                                {/* Website */}
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-brand-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.6 9h16.8M3.6 15h16.8M11.5 3a17 17 0 000 18M12.5 3a17 17 0 010 18" />
                                    </svg>
                                    <Link href="https://medtrion.ca" target="_blank" rel="noopener noreferrer" className="text-xs text-brand-primary hover:text-brand-dark transition-colors duration-200">
                                        medtrion.ca
                                    </Link>
                                </div>

                                {/* Social icons */}
                                <div className="flex gap-4 mt-3 pt-3 border-t border-gray-200">
                                    <Link href="https://www.facebook.com/profile.php?id=61565518749182" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:text-brand-dark transition-colors duration-200" aria-label="Follow us on Facebook">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                    </Link>
                                    <Link href="https://www.instagram.com/healthsupplymobility_/?hl=en" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800 transition-colors duration-200" aria-label="Follow us on Instagram">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.328-1.297C4.243 14.794 3.8 13.643 3.8 12.346c0-1.297.443-2.448 1.321-3.328.88-.88 2.031-1.321 3.328-1.321 1.297 0 2.448.441 3.328 1.321.88.88 1.321 2.031 1.321 3.328 0 1.297-.441 2.448-1.321 3.345-.88.807-2.031 1.297-3.328 1.297zm7.718 0c-1.297 0-2.448-.49-3.328-1.297-.879-.897-1.321-2.048-1.321-3.345 0-1.297.442-2.448 1.321-3.328.88-.88 2.031-1.321 3.328-1.321 1.297 0 2.448.441 3.328 1.321.88.88 1.321 2.031 1.321 3.328 0 1.297-.441 2.448-1.321 3.345-.88.807-2.031 1.297-3.328 1.297z"/></svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </nav>
            {showInternalToggle && (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-12 h-12 rounded-full bg-slate-100 p-2.5 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                    aria-label="Toggle navigation menu"
                >
                    <RiMenu4Line size={32} className="text-gray-700" />
                </button>
            )}
        </div>
    );
});

export default Drawer;

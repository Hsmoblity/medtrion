import Link from "next/link";
import * as React from "react";

function Banner() {
    return (

        <div className="bg-gray-800  w-5/6 rounded-lg shadow-xl justify-center mx-auto mt-4">
            <div className={`-translate-x-2 shadow-md shadow-gray-400 -translate-y-2 rounded-lg  bg-[url('/nnnoise.svg')] bg-auto bg-repeat`}>

                <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between ">
                    {/* Image Section */}
                    <div className="flex flex-col w-full md:w-1/4 mb-8 md:mb-0 mx-4">
                        <img
                            loading="lazy"
                            src="/shop-stairlifts-canada.png"
                            className="object-contain rounded-md aspect-[1.1] w-full"
                        />
                    </div>

                    {/* Text Section */}
                    <div className="flex flex-col w-full md:w-1/2 text-center md:text-left mb-8 md:mb-0">
                        <div className=" md:text-4xl text-2xl font-medium font-poppins leading-none ">
                            New Products are here!
                        </div>
                        <div className="flex flex-col pt-3 w-full">
                            <div className="flex gap-1">
                                <div className=" text-base font-light m-4 font-poppins">Explore our latest arrivals designed to enhance your mobility and support your well-being. From advanced mobility aids to home health solutions, we have everything you need to improve your quality of life. Don’t miss out on these exciting new additions to our collection!</div>

                            </div>
                        </div>
                    </div>

                    {/* Call to Action Section */}
                    <button className="relative mb-2 inline-flex text-nowrap h-12  overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-50">
                        <span className="inline-flex text-nowrap h-full w-full cursor-pointer items-center justify-center rounded-full bg-black border-gray-400 border-b-4 border-r-4 px-8 py-1 text-md uppercase font-medium  text-white backdrop-blur-3xl">
                            <Link href="#shop">Check out</Link>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Banner;

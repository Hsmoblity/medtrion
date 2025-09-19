import * as React from "react";
import { FaMinusCircle, FaPlusCircle } from "react-icons/fa";


function FAQ() {

    const [openIndex, setOpenIndex] = React.useState<number | null>(0);

    const toggleOpenIndex = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const faqs = [
        {
            question: "Can others use the stairs?",
            answer: "You can still use the stair when a stairlift is fitted as the seat folds up giving plenty of space to use the stairs."
        },
        {
            question: "How do it get off the stairlift?",
            answer: "You alighn the stairlift at the top by swiveling the seat so you can exit safely."
        },
        {
            question: "Do they look ok??",
            answer: "Many owners are concerned about the ascetics of the stairlift, but modern lifts are compact, the seat can be folded up. You call also have the seat resting upstairs and call down when needed."
        },
        {
            question: "How is the stairlift fitted?",
            answer: "The stairlift track is fitted to the steps not the wall."
        },

        {
            question: "Are stairlifts safe?",
            answer: "Stairlifts are extremely safe, when installed by professionally competent persons. Acorn stairlifts are manufactured to the highest standard and all Acorn employed technicians are trained to the highest standards."
        },
        {
            question: "What happens if there is a power outage?",
            answer: "An Acorn Stairlift is battery-powered and will continue to work even if you have a power cut. Acorn pioneered the use of DC (battery) power in stairlifts."
        },

    ];
    return (
        <div id="faq" className="bg-inherit">

            <div className="max-w-screen-xl mx-auto  py-8 px-5">
                <div className="text-center mb-8">
                    <h2 className="md:text-5xl text-4xl font-bold font-poppins text-gray-800">Frequently Asked Questions</h2>
                </div>

                {/* FAQ Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


                    {/* Side Details Section */}
                    <div className="space-y-2">
                        <div className="flex justify-center w-full max-w-[500px]">
                            <img
                                loading="lazy"
                                src="/180-stairlift-hilary.png"
                                alt="Product"
                                className="object-cover w-full aspect-auto rounded-2xl my-4"
                            />
                        </div>
                        <div className="flex flex-col items-center text-center md:text-left">
                            <div className="bg-gray-300 p-4 rounded-lg">
                                <h3 className="text-xl font-semibold font-poppins text-gray-800">Straight Stairlift Installation</h3>
                                <p className="text-base text-gray-600 mt-2">
                                    All stairlifts fit directly to the staircase, not the wall, so installation is quick and mess-free.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center text-center md:text-left">
                            <div className="bg-gray-300 p-4 rounded-lg">
                                <h3 className="text-xl font-semibold font-poppins text-gray-800">Safety and Convenience</h3>
                                <p className="text-base text-gray-600 mt-2">
                                    Enjoy peace of mind with a Folding foot rest,
                                    Seat belt,
                                    Diagnostic display,
                                    Backup battery,
                                    Remote control, ensuring Safty and Convenience.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center text-center md:text-left">
                            <div className="bg-gray-300 p-4 rounded-lg">
                                <h3 className="text-xl font-semibold font-poppins text-gray-800"> One Year Warrenty </h3>
                                <p className="text-base text-gray-600 mt-2">
                                    Acorn stairlifts comes with Fully comprehensive 12-month warranty. If any component should fail due to faulty manufacture during the first year of ownership, Acorn will send round one of our fully trained service technicians to get your stairlift back to full working order free of charge.
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* FAQ Section */}
                    <div>
                        <div className="flex flex-col  text-xl font-medium  justify-center items-center mx-auto ">

                            {faqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col gap-2 justify-center px-5 py-6 mt-5 w-full rounded-xl bg-white border-b-[0.2px]  border-gray-600 transition-colors duration-300 ease-in-out shadow-lg max-md:flex-wrap max-md:px-5"
                                    onClick={() => toggleOpenIndex(index)}
                                >
                                    <div className="flex justify-between items-center text-gray-800 w-full cursor-pointer">
                                        <div className="flex-auto">{faq.question}</div>
                                        <div className="flex items-center justify-center text-black w-10">
                                            {openIndex === index ? (
                                                <FaMinusCircle size={30} />
                                            ) : (
                                                <FaPlusCircle size={30} />
                                            )}
                                        </div>
                                    </div>
                                    {openIndex === index && (
                                        <div className="mt-4 text-base text-gray-800">{faq.answer}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FAQ;

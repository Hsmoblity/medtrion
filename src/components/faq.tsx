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
        <div id="faq" className="bg-white py-16 md:py-20">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="md:text-5xl text-4xl font-primary font-bold text-[#0d163c]">Frequently Asked Questions</h2>
                </div>

                {/* FAQ Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


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
                            <div className="bg-gradient-to-br from-[#f0f9f8] to-[#fef3e2] p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-[#3fa2a3]/30 hover:border-[#3fa2a3]">
                                <h3 className="text-xl font-primary font-semibold text-[#0d163c] mb-3">Straight Stairlift Installation</h3>
                                <p className="text-base text-[#4b5563] leading-relaxed">
                                    All stairlifts fit directly to the staircase, not the wall, so installation is quick and mess-free.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center text-center md:text-left">
                            <div className="bg-gradient-to-br from-[#fef3e2] to-[#f0f9f8] p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-[#f7a236]/30 hover:border-[#f7a236]">
                                <h3 className="text-xl font-primary font-semibold text-[#0d163c] mb-3">Safety and Convenience</h3>
                                <p className="text-base text-[#4b5563] leading-relaxed">
                                    Enjoy peace of mind with a Folding foot rest,
                                    Seat belt,
                                    Diagnostic display,
                                    Backup battery,
                                    Remote control, ensuring Safety and Convenience.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center text-center md:text-left">
                            <div className="bg-gradient-to-br from-[#f0f9f8] to-[#fef3e2] p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-[#3fa2a3]/30 hover:border-[#3fa2a3]">
                                <h3 className="text-xl font-primary font-semibold text-[#0d163c] mb-3">5 Year Warranty</h3>
                                <p className="text-base text-[#4b5563] leading-relaxed">
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
                                    className="flex flex-col gap-2 justify-center px-5 py-6 mt-5 w-full rounded-xl bg-gradient-to-br from-white to-[#f9f7f3] border border-[#3fa2a3]/20 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl hover:border-[#3fa2a3] cursor-pointer group"
                                    onClick={() => toggleOpenIndex(index)}
                                >
                                    <div className="flex justify-between items-center text-[#0d163c] w-full">
                                        <div className="flex-auto font-primary font-semibold group-hover:text-[#0d163c] transition-colors duration-200">{faq.question}</div>
                                        <div className="flex items-center justify-center text-[#3fa2a3] w-10 group-hover:text-[#3fa2a3] transition-colors duration-200">
                                            {openIndex === index ? (
                                                <FaMinusCircle size={30} className="text-[#3fa2a3]" />
                                            ) : (
                                                <FaPlusCircle size={30} />
                                            )}
                                        </div>
                                    </div>
                                    {openIndex === index && (
                                        <div className="mt-4 text-base text-[#4b5563] font-primary leading-relaxed animate-in slide-in-from-top-2 duration-300\">{faq.answer}</div>
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

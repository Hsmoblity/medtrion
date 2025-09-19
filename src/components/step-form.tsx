'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, SubmitHandler } from 'react-hook-form'
import { BiLeftArrowAlt, BiRightArrowAlt } from 'react-icons/bi'

type Inputs = z.infer<typeof FormDataSchema>

export const FormDataSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    phone: z.string().min(1, 'phone is required'),
    note: z.string(),
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zip: z.string().min(1, 'Zip is required')
})

const steps = [
    {
        id: 'Step 1',
        name: 'Contact Information',
        fields: ['firstName', 'lastName', 'email']
    },
    {
        id: 'Step 2',
        name: 'Address',
        fields: ['state', 'city', 'street', 'zip']
    },
    { id: 'Step 3', name: 'Complete' }
]


export default function Form() {
    const [previousStep, setPreviousStep] = useState(0)
    const [currentStep, setCurrentStep] = useState(0)
    const delta = currentStep - previousStep

    const {
        register,
        handleSubmit,
        watch,
        reset,
        trigger,
        formState: { errors }
    } = useForm<Inputs>({
        resolver: zodResolver(FormDataSchema)
    })
    const processForm: SubmitHandler<Inputs> = async (data) => {
        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    ...data,
                    access_key: "3c01bf6a-1e01-47f6-8337-e2155b97fa50",
                }),

            });
            if (!response.ok) {
                throw new Error("Submission failed");
            }
            const result = await response.json();
            console.log(result);
            reset();

        } catch (error) {
            console.error("Error submitting form:", error);
            alert("There was an error submitting the form.");
        }
    };

    type FieldName = keyof Inputs

    const next = async () => {
        const fields = steps[currentStep].fields
        const output = await trigger(fields as FieldName[], { shouldFocus: true })

        if (!output) return

        if (currentStep < steps.length - 1) {
            if (currentStep === steps.length - 2) {
                await handleSubmit(processForm)()
            }
            setPreviousStep(currentStep)
            setCurrentStep(step => step + 1)
        }
    }

    const prev = () => {
        if (currentStep > 0) {
            setPreviousStep(currentStep)
            setCurrentStep(step => step - 1)
        }
    }

    return (
        <section id="contact-us" className='relative inset-0 flex flex-col  max-w-4xl mx-auto p-10  justify-center'>
            <h2 className="text-6xl text-center font-bold text-gray-800 font-poppins tracking-wide"> Get a FREE Quote</h2>
            <p className="mx-auto text-xl text-center md:px-20 py-2 mt-4 justify-center max-w-2xl">Simply enter your details below and a trusted representative will be in touch to arrange a home survey and provide <b>your FREE no obligation quotation.</b></p>
            <nav aria-label='Progress' className='py-4'>
                <ol role='list' className='space-y-4 md:flex md:space-x-10 md:space-y-0'>
                    {steps.map((step, index) => (
                        <li key={step.name} className='md:flex-1'>
                            {currentStep > index ? (
                                <div className='group flex w-full flex-col border-l-8 border-black py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4'>
                                    <span className='text-xl font-bold font-mono text-black transition-colors '>
                                        {step.id}
                                    </span>
                                    <span className='text-xl font-bold font-mono'>{step.name}</span>
                                </div>
                            ) : currentStep === index ? (
                                <div
                                    className='flex w-full flex-col border-l-8 border-black py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4'
                                    aria-current='step'
                                >
                                    <span className='text-xl font-bold font-mono text-black'>
                                        {step.id}
                                    </span>
                                    <span className='text-xl font-bold font-mono'>{step.name}</span>
                                </div>
                            ) : (
                                <div className='group flex w-full flex-col border-l-4 border-gray-200 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4'>
                                    <span className='text-xl font-bold font-mono text-gray-500 transition-colors'>
                                        {step.id}
                                    </span>
                                    <span className='text-xl font-bold font-mono'>{step.name}</span>
                                </div>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>
            <div className='bg-gray-800  shadow-2xl mt-10 700 rounded-lg'>
                <div className={` p-6  -translate-x-2 shadow-md shadow-gray-400 -translate-y-2 rounded-lg bg-[#f1ebe0]`}>
                    {/* steps */}


                    {/* Form */}
                    <form className={`mt-12 `} onSubmit={handleSubmit(processForm)}>
                        {currentStep === 0 && (
                            <motion.div
                                initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                            >

                                <div className='mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6'>
                                    <div className='sm:col-span-3'>
                                        <label
                                            htmlFor='firstName'
                                            className='block text-xl font-bold font-mono leading-6 tracking-wide  text-gray-900 '
                                        >
                                            First Name
                                        </label>
                                        <div className='mt-2'>
                                            <input
                                                type='text'
                                                id='firstName'
                                                {...register('firstName')}
                                                autoComplete='given-name'
                                                className='block w-full rounded-md border-0 py-1.5 pl-1 text-gray-900  shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-xl sm:leading-6'
                                            />
                                            {errors.firstName?.message && (
                                                <p className='mt-2 text-xl text-red-400'>
                                                    {errors.firstName.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className='sm:col-span-3'>
                                        <label
                                            htmlFor='lastName'
                                            className='block text-xl font-bold font-mono leading-6 tracking-wide text-gray-900 '
                                        >
                                            Last Name
                                        </label>
                                        <div className='mt-2'>
                                            <input
                                                type='text'
                                                id='lastName'
                                                {...register('lastName')}
                                                autoComplete='family-name'
                                                className='block w-full rounded-md border-0 py-1.5 pl-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-xl sm:leading-6'
                                            />
                                            {errors.lastName?.message && (
                                                <p className='mt-2 text-xl text-red-400'>
                                                    {errors.lastName.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className='sm:col-span-3'>
                                        <label
                                            htmlFor='email'
                                            className='block text-xl font-bold font-mono leading-6 tracking-wide text-gray-900 '
                                        >
                                            Email Address
                                        </label>
                                        <div className='mt-2'>
                                            <input
                                                id='email'
                                                type='email'
                                                {...register('email')}
                                                autoComplete='email'
                                                className='block w-full rounded-md border-0 py-1.5 pl-1 text-gray-900  shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-xl sm:leading-6'
                                            />
                                            {errors.email?.message && (
                                                <p className='mt-2 text-xl text-red-400'>
                                                    {errors.email.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className='sm:col-span-3'>
                                        <label
                                            htmlFor='phone'
                                            className='block text-xl font-bold font-mono leading-6 tracking-wide text-gray-900 '
                                        >
                                            Phone Number
                                        </label>
                                        <div className='mt-2'>
                                            <input
                                                id='phone'
                                                type='phone'
                                                {...register('phone')}
                                                autoComplete='phone'
                                                className='block w-full rounded-md border-0 py-1.5 pl-1 text-gray-900  shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-xl sm:leading-6'
                                            />
                                            {errors.phone?.message && (
                                                <p className='mt-2 text-xl text-red-400'>
                                                    {errors.phone.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 1 && (
                            <motion.div
                                initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                            >


                                <div className='mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6'>


                                    <div className='col-span-full'>
                                        <label
                                            htmlFor='street'
                                            className='block text-xl font-bold font-mono leading-6 tracking-wide text-gray-900 '
                                        >
                                            Street address
                                        </label>
                                        <div className='mt-2'>
                                            <input
                                                type='text'
                                                id='street'
                                                {...register('street')}
                                                autoComplete='street-address'
                                                className='block w-full rounded-md border-0 py-1.5 pl-1 text-gray-900  shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-xl sm:leading-6'
                                            />
                                            {errors.street?.message && (
                                                <p className='mt-2 text-xl text-red-400'>
                                                    {errors.street.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className='sm:col-span-2 sm:col-start-1'>
                                        <label
                                            htmlFor='city'
                                            className='block text-xl font-bold font-mono leading-6 tracking-wide text-gray-900 '
                                        >
                                            City
                                        </label>
                                        <div className='mt-2'>
                                            <input
                                                type='text'
                                                id='city'
                                                {...register('city')}
                                                autoComplete='address-level2'
                                                className='block w-full rounded-md border-0 py-1.5 pl-1 text-gray-900  shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-xl sm:leading-6'
                                            />
                                            {errors.city?.message && (
                                                <p className='mt-2 text-xl text-red-400'>
                                                    {errors.city.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className='sm:col-span-2'>
                                        <label
                                            htmlFor='state'
                                            className='block text-xl font-bold font-mono leading-6 tracking-wide text-gray-900 '
                                        >
                                            State / Province
                                        </label>
                                        <div className='mt-2'>
                                            <input
                                                type='text'
                                                id='state'
                                                {...register('state')}
                                                autoComplete='address-level1'
                                                className='block w-full rounded-md border-0 py-1.5 pl-1 text-gray-900  shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-xl sm:leading-6'
                                            />
                                            {errors.state?.message && (
                                                <p className='mt-2 text-xl text-red-400'>
                                                    {errors.state.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className='sm:col-span-2'>
                                        <label
                                            htmlFor='zip'
                                            className='block text-xl font-bold font-mono leading-6 tracking-wide text-gray-900 '
                                        >
                                            ZIP / Postal code
                                        </label>
                                        <div className='mt-2'>
                                            <input
                                                type='text'
                                                id='zip'
                                                {...register('zip')}
                                                autoComplete='postal-code'
                                                className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-xl sm:leading-6'
                                            />
                                            {errors.zip?.message && (
                                                <p className='mt-2 text-xl text-red-400'>
                                                    {errors.zip.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className='col-span-full'>
                                        <label
                                            htmlFor='note'
                                            className='block text-xl font-bold font-mono leading-6 tracking-wide text-gray-900 '
                                        >
                                            Additional Notes:
                                        </label>
                                        <div className='mt-2'>
                                            <input
                                                type='text'
                                                id='note'
                                                {...register('note')}

                                                className='block w-full rounded-md border-0 py-1.5 pl-1 text-gray-900  shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-xl sm:leading-6'
                                            />

                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 2 && (
                            <>
                                <h2 className='text-base font-semibold leading-7 text-gray-900  '>
                                    Complete
                                </h2>
                                <p className='mt-1 text-xl leading-6 tracking-wide text-green-500 '>
                                    Thank you for your submission a trusted representative will be in touch to  provide your FREE no obligation quotation.
                                </p>
                            </>
                        )}
                    </form>

                    {/* Navigation */}
                    <div className='mt-8 pt-5'>
                        <div className='flex justify-between'>
                            <button
                                type='button'
                                onClick={prev}
                                disabled={currentStep === 0}
                                className='rounded bg-black flex flex-row px-2 py-1 text-xl font-semibold text-white   shadow-sm ring-1 ring-inset ring-sky-300 hover:bg-sky-50 hover:text-black disabled:cursor-not-allowed disabled:opacity-50'
                            >
                                <BiLeftArrowAlt size={50} className='hover:-translate-x-1' />
                            </button>
                            <button
                                type='button'
                                onClick={next}
                                disabled={currentStep === steps.length - 1}
                                className='rounded bg-black  px-2 py-1 text-xl font-semibold text-white shadow-sm ring-1 ring-inset ring-sky-300 hover:bg-sky-50 hover:text-black disabled:cursor-not-allowed disabled:opacity-50'
                            >
                                <BiRightArrowAlt size={50} className='hover:translate-x-1' />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

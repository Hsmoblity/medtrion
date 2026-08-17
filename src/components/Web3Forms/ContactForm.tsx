/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ContactForm Component - Web3Forms Implementation
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Replaces Google Form embed with Web3Forms contact form
 * 
 * USAGE:
 * ```tsx
 * <ContactForm onSuccess={() => console.log('Success')} />
 * ```
 */

import React, { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Form validation schema
const ContactFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactFormData = z.infer<typeof ContactFormSchema>

interface ContactFormProps {
  onSuccess?: () => void
  className?: string
}

export default function ContactForm({ 
  onSuccess,
  className = '' 
}: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormData>({
    resolver: zodResolver(ContactFormSchema)
  })

  const onSubmit: SubmitHandler<ContactFormData> = async (data) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage(null)

    try {
      const web3formsUrl = process.env.NEXT_PUBLIC_WEB3FORMS_URL
      const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY

      if (!web3formsUrl || !accessKey) {
        throw new Error("Web3Forms configuration missing. Please contact support.")
      }

      const response = await fetch(web3formsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...data,
          access_key: accessKey,
          subject: `Contact Form: ${data.subject}`,
          from_name: `${data.firstName} ${data.lastName}`,
          reply_to: data.email,  // Set reply-to address to customer's email
          to: 'info@medtrion.ca',  // Send to company email
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Submission failed")
      }

      const result = await response.json()
      console.log('✅ Contact form submitted successfully:', result)
      setSubmitStatus('success')
      reset()

      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 2000)
      }

    } catch (error) {
      console.error("❌ Error submitting contact form:", error)
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit contact form')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-[#0b1f3a]">
              First Name *
            </label>
            <input
              {...register('firstName')}
              type="text"
              id="firstName"
              className="w-full px-4 py-2 border border-[#3fa2a3]/30 rounded-lg focus:ring-2 focus:ring-[#3fa2a3] focus:border-[#3fa2a3]"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-[#0b1f3a]">
              Last Name *
            </label>
            <input
              {...register('lastName')}
              type="text"
              id="lastName"
              className="w-full px-4 py-2 border border-[#3fa2a3]/30 rounded-lg focus:ring-2 focus:ring-[#3fa2a3] focus:border-[#3fa2a3]"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Contact Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-[#0b1f3a]">
              Email *
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              className="w-full px-4 py-2 border border-[#3fa2a3]/30 rounded-lg focus:ring-2 focus:ring-[#3fa2a3] focus:border-[#3fa2a3]"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-[#0b1f3a]">
              Phone *
            </label>
            <input
              {...register('phone')}
              type="tel"
              id="phone"
              className="w-full px-4 py-2 border border-[#3fa2a3]/30 rounded-lg focus:ring-2 focus:ring-[#3fa2a3] focus:border-[#3fa2a3]"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="mb-1 block text-sm font-medium text-[#0b1f3a]">
            Subject *
          </label>
          <input
            {...register('subject')}
            type="text"
            id="subject"
            className="w-full px-4 py-2 border border-[#3fa2a3]/30 rounded-lg focus:ring-2 focus:ring-[#3fa2a3] focus:border-[#3fa2a3]"
          />
          {errors.subject && (
            <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
          )}
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="mb-1 block text-sm font-medium text-[#0b1f3a]">
            Message *
          </label>
          <textarea
            {...register('message')}
            id="message"
            rows={6}
            className="w-full rounded-lg border border-[#0b1f3a]/15 bg-[#f8fbff] px-4 py-2.5 text-gray-700 shadow-sm transition focus:border-[#3fa2a3] focus:outline-none focus:ring-2 focus:ring-[#3fa2a3]"
            placeholder="Tell us how we can help you..."
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
          )}
        </div>

        {/* Error Message */}
        {submitStatus === 'error' && errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Success Message */}
        {submitStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm font-semibold">
              ✅ Message sent successfully! We'll get back to you soon.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-[35px] bg-gradient-to-r from-[#0b1f3a] via-[#153a5f] to-[#3fa2a3] px-6 py-3 font-primary font-semibold text-white transition-all duration-300 hover:from-[#153a5f] hover:via-[#3fa2a3] hover:to-[#f7a236] disabled:bg-gray-400"
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  )
}

// Agent Signature: 160125 - Fullstack - Web3Forms_Contact_Form_Replacement

